const Agent = require('../models/Agent');
const Company = require('../models/Company');
const Transaction = require('../models/Transaction');
const ApprovalRequest = require('../models/ApprovalRequest');

// Create new agent
const createAgent = async (data, createdBy) => {
  const existing = await Agent.findOne({ email: data.email.toLowerCase() });
  if (existing) throw new Error('Agent with this email already exists');
  
  const agent = new Agent({
    ...data,
    email: data.email.toLowerCase(),
    createdBy,
  });
  await agent.save();
  return agent;
};

// Get all agents
const getAgents = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  
  return await Agent.find(query)
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
};

// Get agent by ID
const getAgentById = async (agentId) => {
  return await Agent.findById(agentId)
    .populate('introducedEpcs.epcId', 'name')
    .populate('createdBy', 'name');
};

// Register EPC introduction by agent
const registerEpcIntroduction = async (agentId, epcId) => {
  const agent = await Agent.findById(agentId);
  if (!agent) throw new Error('Agent not found');
  
  // Check if EPC already introduced
  const existing = agent.introducedEpcs.find(e => e.epcId.toString() === epcId.toString());
  if (existing) throw new Error('EPC already registered with this agent');
  
  agent.introducedEpcs.push({
    epcId,
    introducedAt: new Date(),
    commissionEligible: true,
  });
  agent.metrics.totalEpcsIntroduced += 1;
  agent.metrics.activeEpcs += 1;
  
  await agent.save();
  
  // Update Company with agent reference
  await Company.findByIdAndUpdate(epcId, { introducedByAgent: agentId });
  
  return agent;
};

// Process commission on first CWC (SOP: Commission only on first CWC)
const processCommission = async (transactionId) => {
  const transaction = await Transaction.findById(transactionId).populate('case');
  if (!transaction) throw new Error('Transaction not found');
  
  const epcId = transaction.buyer;
  
  // Find eligible agent (lifetime eligibility per SOP)
  const agent = await Agent.getEligibleAgent(epcId);
  if (!agent) return null; // No agent for this EPC
  
  // Check if this is first CWC for this EPC
  const epcEntry = agent.introducedEpcs.find(e => e.epcId.toString() === epcId.toString());
  if (epcEntry.firstCwcCompleted) return null; // Commission already paid
  
  // Calculate commission (configurable percentage)
  const commissionPercentage = 1; // 1% default
  const commissionAmount = transaction.fundedAmount * (commissionPercentage / 100);
  
  await agent.recordCommission(epcId, transactionId, commissionAmount, commissionPercentage);
  
  return { agent, commissionAmount };
};

// Mark commission as paid
const markCommissionPaid = async (agentId, commissionIndex, paymentReference) => {
  const agent = await Agent.findById(agentId);
  if (!agent) throw new Error('Agent not found');
  
  const commission = agent.commissions[commissionIndex];
  if (!commission) throw new Error('Commission not found');
  
  commission.status = 'PAID';
  commission.paidAt = new Date();
  commission.paymentReference = paymentReference;
  
  agent.metrics.pendingCommission -= commission.commissionAmount;
  agent.metrics.totalCommissionEarned += commission.commissionAmount;
  
  await agent.save();
  return agent;
};

// Report agent misconduct (SOP Section 11)
const reportMisconduct = async (agentId, misconductData, reportedBy) => {
  const agent = await Agent.findById(agentId);
  if (!agent) throw new Error('Agent not found');
  
  const misconduct = {
    type: misconductData.type,
    description: misconductData.description,
    reportedBy,
    reportedAt: new Date(),
    founderNotified: false,
  };
  
  agent.misconductHistory.push(misconduct);
  
  // Auto-warn on first misconduct
  if (agent.misconductHistory.length === 1) {
    agent.status = 'WARNED';
    misconduct.action = 'WARNING';
  }
  
  await agent.save();
  
  // Create approval request for Founders (as per SOP)
  const approvalRequest = new ApprovalRequest({
    requestType: 'AGENT_MISCONDUCT',
    title: `Agent Misconduct: ${agent.name}`,
    description: `Type: ${misconductData.type}. ${misconductData.description}`,
    entityType: 'agent',
    entityId: agentId,
    entityRef: 'Agent',
    requestedBy: reportedBy,
    priority: 'HIGH',
  });
  await approvalRequest.save();
  
  return { agent, approvalRequest };
};

// Handle founder decision on misconduct
const handleMisconductDecision = async (agentId, misconductIndex, decision, decidedBy) => {
  const agent = await Agent.findById(agentId);
  if (!agent) throw new Error('Agent not found');
  
  const misconduct = agent.misconductHistory[misconductIndex];
  if (!misconduct) throw new Error('Misconduct record not found');
  
  misconduct.founderNotified = true;
  misconduct.founderDecision = decision;
  misconduct.resolvedAt = new Date();
  
  if (decision === 'SUSPEND') {
    agent.status = 'SUSPENDED';
    misconduct.action = 'SUSPENSION';
  } else if (decision === 'BLACKLIST') {
    agent.status = 'BLACKLISTED';
    misconduct.action = 'BLACKLIST';
  } else if (decision === 'WARN') {
    agent.status = 'WARNED';
    misconduct.action = 'WARNING';
  } else if (decision === 'CLEAR') {
    agent.status = 'ACTIVE';
  }
  
  await agent.save();
  return agent;
};

// Get agent dashboard
const getAgentDashboard = async () => {
  const agents = await Agent.find({});
  
  return {
    total: agents.length,
    active: agents.filter(a => a.status === 'ACTIVE').length,
    warned: agents.filter(a => a.status === 'WARNED').length,
    suspended: agents.filter(a => a.status === 'SUSPENDED').length,
    totalCommissionPaid: agents.reduce((sum, a) => sum + a.metrics.totalCommissionEarned, 0),
    pendingCommission: agents.reduce((sum, a) => sum + a.metrics.pendingCommission, 0),
    totalEpcsIntroduced: agents.reduce((sum, a) => sum + a.metrics.totalEpcsIntroduced, 0),
  };
};

module.exports = {
  createAgent,
  getAgents,
  getAgentById,
  registerEpcIntroduction,
  processCommission,
  markCommissionPaid,
  reportMisconduct,
  handleMisconductDecision,
  getAgentDashboard,
};
