const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

// Get audit logs with filtering and pagination
router.get('/', authenticate, authorize('admin', 'founder', 'ops'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      category,
      entityType,
      entityId,
      startDate,
      endDate,
      search,
      success,
    } = req.query;

    const query = {};

    // Apply filters
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (category) query.category = category;
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    if (success !== undefined) query.success = success === 'true';

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Text search
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { entityRef: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get audit log statistics
router.get('/stats', authenticate, authorize('admin', 'founder', 'ops'), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const [
      totalLogs,
      byCategory,
      byAction,
      byUser,
      recentFailures,
      dailyActivity,
    ] = await Promise.all([
      // Total logs count
      AuditLog.countDocuments({ createdAt: { $gte: startDate } }),

      // Logs by category
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Logs by action (top 10)
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Most active users
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { userId: '$userId', userName: '$userName' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Recent failures
      AuditLog.find({ success: false, createdAt: { $gte: startDate } })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Daily activity
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      totalLogs,
      byCategory,
      byAction,
      byUser,
      recentFailures,
      dailyActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get audit log by ID
router.get('/:id', authenticate, authorize('admin', 'founder', 'ops'), async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate('userId', 'name email role');
    
    if (!log) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get logs for a specific entity
router.get('/entity/:entityType/:entityId', authenticate, authorize('admin', 'founder', 'ops'), async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find({ entityType, entityId })
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments({ entityType, entityId }),
    ]);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user activity timeline
router.get('/user/:userId/timeline', authenticate, authorize('admin', 'founder', 'ops'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments({ userId }),
    ]);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export audit logs (CSV format)
router.get('/export', authenticate, authorize('admin', 'founder', 'ops'), async (req, res) => {
  try {
    const { startDate, endDate, category, format = 'json' } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (category) query.category = category;

    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10000)
      .lean();

    if (format === 'csv') {
      const csv = [
        ['Timestamp', 'User', 'Role', 'Action', 'Category', 'Description', 'Entity', 'Success'].join(','),
        ...logs.map(log => [
          log.createdAt,
          log.userName || log.userId?.name || 'System',
          log.userRole,
          log.action,
          log.category,
          `"${(log.description || '').replace(/"/g, '""')}"`,
          log.entityRef || log.entityId || '',
          log.success,
        ].join(',')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
      return res.send(csv);
    }

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
