/**
 * TechPreneur Extended Routes
 * Sessions, Announcements, Projects, Referrals
 * Mounted at: /api/techpreneur-v2
 */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { authenticate, authorize } = require("../middleware/auth");
const TechPreneurRegistration = require("../models/TechPreneurRegistration");
const TechPreneurSession = require("../models/TechPreneurSession");
const TechPreneurAnnouncement = require("../models/TechPreneurAnnouncement");
const TechPreneurProject = require("../models/TechPreneurProject");
const TechPreneurReferral = require("../models/TechPreneurReferral");
const TechPreneurCertificate = require("../models/TechPreneurCertificate");
const TechPreneurCertificateTemplate = require("../models/TechPreneurCertificateTemplate");
const TechPreneurJoiningLetter = require("../models/TechPreneurJoiningLetter");
const TechPreneurJoiningLetterTemplate = require("../models/TechPreneurJoiningLetterTemplate");
const emailService = require("../services/emailService");
const PDFDocument = require("pdfkit");

const TP_JWT_SECRET = process.env.TP_JWT_SECRET || process.env.JWT_SECRET || "tp_secret_change_me";

// ─── Student JWT Middleware ────────────────────────────────────────────────────
function requireStudent(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Student authentication required." });
  try {
    req.student = jwt.verify(token, TP_JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired student token." });
  }
}

// ─── Helper: Generate unique referral code ─────────────────────────────────────
function generateReferralCode(name) {
  const prefix = name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase();
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}${suffix}`;
}

// ─── Helpers: PDF Generation using PDFKit ──────────────────────────────────────
async function generateCertificatePDF(cert, template, verifyLink) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: [841.89, 595.28], margin: 0 });
      const chunks = [];
      doc.on("data", chunk => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", err => reject(err));

      const bgResponse = await fetch(template.imageUrl);
      if (!bgResponse.ok) throw new Error("Failed to fetch template background image");
      const bgBuffer = Buffer.from(await bgResponse.arrayBuffer());

      doc.image(bgBuffer, 0, 0, { width: 841.89, height: 595.28 });

      const variables = template.variables || [];
      for (const v of variables) {
        const pdfX = (v.x / 100) * 841.89;
        const pdfY = (v.y / 100) * 595.28;

        if (v.name === "qrCode") {
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyLink)}&color=000000&bgcolor=ffffff`;
          const qrResponse = await fetch(qrCodeUrl);
          if (qrResponse.ok) {
            const qrBuffer = Buffer.from(await qrResponse.arrayBuffer());
            const qrSize = (v.fontSize || 70) * (841.89 / 1000) * 1.5;
            doc.image(qrBuffer, pdfX - qrSize / 2, pdfY - qrSize / 2, { width: qrSize, height: qrSize });
          }
          continue;
        }

        let val = "";
        if (v.name === "studentName") val = cert.studentName;
        else if (v.name === "collegeName") val = cert.college;
        else if (v.name === "certificateId") val = cert.certificateId;
        else if (v.name === "issuedDate") {
          val = new Date(cert.issuedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          });
        } else if (v.name === "studentEmail") val = cert.studentEmail;
        else if (v.name === "finalRemarks") val = cert.finalRemarks;
        else if (v.name === "branch") val = cert.studentId?.branch || "";
        else if (v.name === "year") val = cert.studentId?.year || "";
        else if (v.name === "trackPreference" || v.name === "track") val = cert.studentId?.trackPreference || "";
        else val = cert[v.name] || "";

        const pdfFontSize = (v.fontSize || 24) * (841.89 / 1000) * 1.3;
        doc.fillColor(v.fontColor || "#000000")
           .fontSize(pdfFontSize);

        const txtWidth = doc.widthOfString(val);
        const txtHeight = pdfFontSize;
        let drawX = pdfX;
        if (!v.align || v.align === "center") {
          drawX = pdfX - txtWidth / 2;
        } else if (v.align === "right") {
          drawX = pdfX - txtWidth;
        }
        doc.text(val, drawX, pdfY - txtHeight / 2);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function generateJoiningLetterPDF(letter, template, verifyLink) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const chunks = [];
      doc.on("data", chunk => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", err => reject(err));

      const bgResponse = await fetch(template.imageUrl);
      if (!bgResponse.ok) throw new Error("Failed to fetch template background image");
      const bgBuffer = Buffer.from(await bgResponse.arrayBuffer());

      doc.image(bgBuffer, 0, 0, { width: 595.28, height: 841.89 });

      const variables = template.variables || [];
      for (const v of variables) {
        const pdfX = (v.x / 100) * 595.28;
        const pdfY = (v.y / 100) * 841.89;

        if (v.name === "qrCode") {
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyLink)}&color=000000&bgcolor=ffffff`;
          const qrResponse = await fetch(qrCodeUrl);
          if (qrResponse.ok) {
            const qrBuffer = Buffer.from(await qrResponse.arrayBuffer());
            const qrSize = (v.fontSize || 70) * (595.28 / 1000) * 1.5;
            doc.image(qrBuffer, pdfX - qrSize / 2, pdfY - qrSize / 2, { width: qrSize, height: qrSize });
          }
          continue;
        }

        let textContent = (letter.variablesData && letter.variablesData.get) ? letter.variablesData.get(v.name) : (letter.variablesData?.[v.name] || "");
        if (v.name === "studentName") textContent = letter.studentName;
        else if (v.name === "collegeName") textContent = letter.college;
        else if (v.name === "joiningLetterId") textContent = letter.joiningLetterId;
        else if (v.name === "joiningDate") {
          textContent = new Date(letter.joiningDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
          });
        } else if (v.name === "trackPreference") {
          const studentReg = await TechPreneurRegistration.findById(letter.studentId);
          textContent = studentReg?.trackPreference || studentReg?.track || "Track Cohort Access";
        }

        const pdfFontSize = (v.fontSize || 14) * (595.28 / 1000) * 1.3;
        doc.fillColor(v.fontColor || "#1e293b")
           .fontSize(pdfFontSize);

        const txtWidth = doc.widthOfString(textContent);
        const txtHeight = pdfFontSize;
        let drawX = pdfX;
        if (!v.align || v.align === "center") {
          drawX = pdfX - txtWidth / 2;
        } else if (v.align === "right") {
          drawX = pdfX - txtWidth;
        }
        doc.text(textContent, drawX, pdfY - txtHeight / 2);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// =============================================================================
// SESSIONS
// =============================================================================

/**
 * GET /api/techpreneur-v2/sessions
 * Student (JWT) — Get all published sessions
 */
router.get("/sessions", requireStudent, async (req, res) => {
  try {
    const sessions = await TechPreneurSession.find({ isPublished: true })
      .sort({ sessionDate: 1, startTime: 1 })
      .lean();
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sessions." });
  }
});

/**
 * GET /api/techpreneur-v2/sessions/all
 * Admin — Get ALL sessions (published and draft)
 */
router.get("/sessions/all", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const sessions = await TechPreneurSession.find().sort({ sessionDate: 1 }).lean();
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sessions." });
  }
});

/**
 * POST /api/techpreneur-v2/sessions
 * Admin — Create a session
 */
router.post("/sessions", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const session = new TechPreneurSession(req.body);
    await session.save();
    res.status(201).json({ success: true, session });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(". ") });
    }
    res.status(500).json({ error: "Failed to create session." });
  }
});

/**
 * PATCH /api/techpreneur-v2/sessions/:id
 * Admin — Update a session
 */
router.patch("/sessions/:id", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const session = await TechPreneurSession.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { new: true, runValidators: true }
    );
    if (!session) return res.status(404).json({ error: "Session not found." });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ error: "Failed to update session." });
  }
});

/**
 * DELETE /api/techpreneur-v2/sessions/:id
 * Admin — Delete a session
 */
router.delete("/sessions/:id", authenticate, authorize("admin", "founder"), async (req, res) => {
  try {
    await TechPreneurSession.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete session." });
  }
});

// =============================================================================
// ANNOUNCEMENTS
// =============================================================================

/**
 * GET /api/techpreneur-v2/announcements
 * Student (JWT) — Get published announcements for their track
 */
router.get("/announcements", requireStudent, async (req, res) => {
  try {
    const studentId = req.student.studentId;
    const student = await TechPreneurRegistration.findById(studentId).select("trackPreference");
    const track = student?.trackPreference || "all";

    const announcements = await TechPreneurAnnouncement.find({
      isPublished: true,
      $or: [{ targetTrack: "all" }, { targetTrack: track }],
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements." });
  }
});

/**
 * GET /api/techpreneur-v2/announcements/all
 * Admin — Get ALL announcements
 */
router.get("/announcements/all", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const announcements = await TechPreneurAnnouncement.find()
      .sort({ createdAt: -1 }).lean();
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements." });
  }
});

/**
 * POST /api/techpreneur-v2/announcements
 * Admin — Create announcement
 */
router.post("/announcements", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const ann = new TechPreneurAnnouncement({
      ...req.body,
      publishedBy: req.user?.email,
    });
    await ann.save();
    res.status(201).json({ success: true, announcement: ann });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(". ") });
    }
    res.status(500).json({ error: "Failed to create announcement." });
  }
});

/**
 * PATCH /api/techpreneur-v2/announcements/:id
 * Admin — Update announcement
 */
router.patch("/announcements/:id", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const ann = await TechPreneurAnnouncement.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { new: true }
    );
    if (!ann) return res.status(404).json({ error: "Announcement not found." });
    res.json({ success: true, announcement: ann });
  } catch (err) {
    res.status(500).json({ error: "Failed to update announcement." });
  }
});

/**
 * DELETE /api/techpreneur-v2/announcements/:id
 * Admin — Delete announcement
 */
router.delete("/announcements/:id", authenticate, authorize("admin", "founder"), async (req, res) => {
  try {
    await TechPreneurAnnouncement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete announcement." });
  }
});

// =============================================================================
// PROJECTS
// =============================================================================

/**
 * GET /api/techpreneur-v2/projects/my
 * Student (JWT) — Get own project/team submission
 */
router.get("/projects/my", requireStudent, async (req, res) => {
  try {
    const project = await TechPreneurProject.findOne({
      $or: [
        { studentId: req.student.studentId },
        { "teamMembers.email": req.student.email }
      ]
    });
    res.json({ project: project || null });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch project." });
  }
});

/**
 * POST /api/techpreneur-v2/projects/create-team
 * Student (JWT) — Create a team (Day 1)
 */
router.post("/projects/create-team", requireStudent, async (req, res) => {
  try {
    const student = await TechPreneurRegistration.findById(req.student.studentId);
    if (!student) return res.status(404).json({ error: "Student not found." });

    // Check if the current student is already in a team
    const existingProject = await TechPreneurProject.findOne({
      $or: [
        { studentId: student._id },
        { "teamMembers.email": student.email }
      ]
    });
    if (existingProject) {
      return res.status(400).json({ error: "You are already a member of a team." });
    }

    const { teamName, theme, customThemeProblem, members } = req.body;
    if (!teamName || !theme) {
      return res.status(400).json({ error: "Team Name and Project Theme are required." });
    }

    // Verify team name uniqueness (case-insensitive)
    const duplicateTeam = await TechPreneurProject.findOne({
      teamName: { $regex: new RegExp(`^${teamName.trim()}$`, "i") }
    });
    if (duplicateTeam) {
      return res.status(400).json({ error: "This team name is already taken. Please choose another one." });
    }

    // Initialize member list
    const teamMembers = [{
      name: student.name,
      email: student.email,
      techId: student._id.toString().slice(-6).toUpperCase(), // generate short techId if not provided
    }];

    // Add extra members if provided in request
    if (Array.isArray(members)) {
      for (const m of members) {
        if (!m.email) continue;
        const normalizedEmail = m.email.toLowerCase().trim();
        if (normalizedEmail === student.email) continue; // skip duplicates of self
        
        // Strict Check: Teammate must be registered in confirmed list
        const registeredTeammate = await TechPreneurRegistration.findOne({
          email: normalizedEmail,
          paymentVerified: true
        });
        if (!registeredTeammate) {
          return res.status(400).json({ 
            error: `Teammate with email ${normalizedEmail} is not a registered student (or payment is not yet verified).` 
          });
        }

        // Check if this member is already in a team
        const memberInTeam = await TechPreneurProject.findOne({
          $or: [
            { studentEmail: normalizedEmail },
            { "teamMembers.email": normalizedEmail }
          ]
        });
        if (memberInTeam) {
          return res.status(400).json({ error: `Teammate with email ${normalizedEmail} is already in another team.` });
        }

        teamMembers.push({
          name: registeredTeammate.name,
          email: normalizedEmail,
          techId: registeredTeammate._id.toString().slice(-6).toUpperCase()
        });
      }
    }

    if (teamMembers.length > 4) {
      return res.status(400).json({ error: "A team can have at most 4 members." });
    }

    // Generate unique teamCode
    let teamCode;
    let codeUnique = false;
    while (!codeUnique) {
      teamCode = "TEAM_" + Math.random().toString(36).substr(2, 6).toUpperCase();
      const existingCode = await TechPreneurProject.findOne({ teamCode });
      if (!existingCode) codeUnique = true;
    }

    // Create the project
    const project = new TechPreneurProject({
      studentId: student._id,
      studentEmail: student.email,
      studentName: student.name,
      track: student.trackPreference,
      teamName: teamName.trim(),
      teamCode,
      theme,
      customThemeProblem: theme === "other" ? (customThemeProblem || "").trim() : "",
      teamMembers,
      projectTitle: teamName.trim(), // sync to legacy
      description: theme === "other" ? (customThemeProblem || "") : `Theme: ${theme}`,
      status: "submitted",
      submissions: {
        day1: {
          teamName: teamName.trim(),
          theme,
          customThemeProblem: theme === "other" ? (customThemeProblem || "").trim() : "",
          members: teamMembers,
          submittedAt: new Date()
        }
      },
      dailyStatus: {
        day1: "submitted"
      }
    });

    await project.save();
    res.status(201).json({ success: true, project });
  } catch (err) {
    console.error("[Create Team Error]:", err);
    res.status(500).json({ error: "Failed to create team. Please try again." });
  }
});

/**
 * POST /api/techpreneur-v2/projects/join-team
 * Student (JWT) — Join a team using team code
 */
router.post("/projects/join-team", requireStudent, async (req, res) => {
  try {
    const student = await TechPreneurRegistration.findById(req.student.studentId);
    if (!student) return res.status(404).json({ error: "Student not found." });

    // Check if the current student is already in a team
    const existingProject = await TechPreneurProject.findOne({
      $or: [
        { studentId: student._id },
        { "teamMembers.email": student.email }
      ]
    });
    if (existingProject) {
      return res.status(400).json({ error: "You are already a member of a team." });
    }

    const { teamCode } = req.body;
    if (!teamCode) {
      return res.status(400).json({ error: "Team Code is required." });
    }

    const project = await TechPreneurProject.findOne({ teamCode: teamCode.toUpperCase().trim() });
    if (!project) {
      return res.status(404).json({ error: "Team not found. Please check the code." });
    }

    if (project.teamMembers.length >= 4) {
      return res.status(400).json({ error: "This team already has the maximum limit of 4 members." });
    }

    // Add student to the team
    project.teamMembers.push({
      name: student.name,
      email: student.email,
      techId: student._id.toString().slice(-6).toUpperCase()
    });

    // Update day 1 submission data
    if (project.submissions && project.submissions.day1) {
      project.submissions.day1.members = project.teamMembers;
    }

    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    console.error("[Join Team Error]:", err);
    res.status(500).json({ error: "Failed to join team. Please try again." });
  }
});

/**
 * POST /api/techpreneur-v2/projects/leave-team
 * Student (JWT) — Leave their team
 */
router.post("/projects/leave-team", requireStudent, async (req, res) => {
  try {
    const student = await TechPreneurRegistration.findById(req.student.studentId);
    if (!student) return res.status(404).json({ error: "Student not found." });

    const project = await TechPreneurProject.findOne({
      "teamMembers.email": student.email
    });

    if (!project) {
      return res.status(400).json({ error: "You are not a member of any team." });
    }

    const isCreator = project.studentEmail === student.email;

    if (project.teamMembers.length === 1) {
      // Creator is the only member, delete the project record so they can start fresh
      await TechPreneurProject.findByIdAndDelete(project._id);
      return res.json({ success: true, message: "Team disbanded and deleted successfully." });
    }

    // Remove the member from the list
    project.teamMembers = project.teamMembers.filter(m => m.email !== student.email);

    if (isCreator) {
      // Find the new creator from the remaining members
      const newCreatorEmail = project.teamMembers[0].email;
      const newCreator = await TechPreneurRegistration.findOne({ email: newCreatorEmail });
      if (newCreator) {
        project.studentId = newCreator._id;
        project.studentEmail = newCreator.email;
        project.studentName = newCreator.name;
      }
    }

    // Sync Day 1 submissions members list
    if (project.submissions && project.submissions.day1) {
      project.submissions.day1.members = project.teamMembers;
    }

    await project.save();
    res.json({ success: true, message: "Successfully left the team." });
  } catch (err) {
    console.error("[Leave Team Error]:", err);
    res.status(500).json({ error: "Failed to leave the team. Please try again." });
  }
});

/**
 * POST /api/techpreneur-v2/projects/submit-day
 * Student (JWT) — Submit a milestone (Days 1–7)
 */
router.post("/projects/submit-day", requireStudent, async (req, res) => {
  try {
    const student = await TechPreneurRegistration.findById(req.student.studentId);
    if (!student) return res.status(404).json({ error: "Student not found." });

    // Find their team/project
    const project = await TechPreneurProject.findOne({
      $or: [
        { studentId: student._id },
        { "teamMembers.email": student.email }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: "Team not registered yet. Please create or join a team first." });
    }

    const { dayNumber, data } = req.body;
    if (!dayNumber || dayNumber < 1 || dayNumber > 7) {
      return res.status(400).json({ error: "Invalid day number (must be 1-7)." });
    }

    const now = new Date();

    if (dayNumber === 1) {
      if (project.dailyStatus?.day1 === "approved" || project.dailyStatus?.day1 === "reviewed") {
        return res.status(400).json({ error: "Day 1 details are already reviewed and locked." });
      }
      const { teamName, theme, customThemeProblem } = data;
      if (!teamName || !theme) return res.status(400).json({ error: "Team Name and Theme are required." });
      
      project.teamName = teamName.trim();
      project.theme = theme;
      project.customThemeProblem = theme === "other" ? (customThemeProblem || "").trim() : "";
      
      project.submissions.day1 = {
        teamName: teamName.trim(),
        theme,
        customThemeProblem: theme === "other" ? (customThemeProblem || "").trim() : "",
        members: project.teamMembers,
        submittedAt: now
      };
      project.dailyStatus.day1 = "submitted";

    } else if (dayNumber === 2) {
      const { prdUrl } = data;
      if (!prdUrl) return res.status(400).json({ error: "PRD Document URL is required." });
      if (!prdUrl.startsWith("http")) return res.status(400).json({ error: "Must be a valid HTTP/HTTPS URL." });
      
      project.submissions.day2 = { prdUrl, submittedAt: now };
      project.dailyStatus.day2 = "submitted";
      project.driveUrl = prdUrl; // legacy sync

    } else if (dayNumber === 3) {
      const { githubUrl } = data;
      if (!githubUrl) return res.status(400).json({ error: "GitHub Repository URL is required." });
      if (!/^https:\/\/github\.com\/.+/.test(githubUrl)) {
        return res.status(400).json({ error: "Must be a valid GitHub repository link (e.g. https://github.com/user/repo)." });
      }
      
      project.submissions.day3 = { githubUrl, submittedAt: now };
      project.dailyStatus.day3 = "submitted";
      project.githubUrl = githubUrl; // legacy sync

    } else if (dayNumber === 4) {
      const { pitchDeckUrl } = data;
      if (!pitchDeckUrl) return res.status(400).json({ error: "Pitch Deck URL is required." });
      if (!pitchDeckUrl.startsWith("http")) return res.status(400).json({ error: "Must be a valid URL." });

      project.submissions.day4 = { pitchDeckUrl, submittedAt: now };
      project.dailyStatus.day4 = "submitted";

    } else if (dayNumber === 5) {
      const { mvpVideoUrl, midReportUrl } = data;
      if (!mvpVideoUrl || !midReportUrl) {
        return res.status(400).json({ error: "MVP Video URL and Mid-Evaluation Report URL are required." });
      }
      if (!mvpVideoUrl.startsWith("http") || !midReportUrl.startsWith("http")) {
        return res.status(400).json({ error: "Must be valid URLs." });
      }

      project.submissions.day5 = { mvpVideoUrl, midReportUrl, submittedAt: now };
      project.dailyStatus.day5 = "submitted";

    } else if (dayNumber === 6) {
      const { businessSlidesUrl } = data;
      if (!businessSlidesUrl) return res.status(400).json({ error: "Business Presentation Slides URL is required." });
      if (!businessSlidesUrl.startsWith("http")) return res.status(400).json({ error: "Must be a valid URL." });

      project.submissions.day6 = { businessSlidesUrl, submittedAt: now };
      project.dailyStatus.day6 = "submitted";

    } else if (dayNumber === 7) {
      const { finalMvpUrl, finalPitchDeckUrl, finalReportUrl, portfolioUrl } = data;
      if (!finalMvpUrl || !finalPitchDeckUrl || !finalReportUrl) {
        return res.status(400).json({ error: "Final MVP Link, Pitch Deck, and Final Report are required." });
      }
      if (!finalMvpUrl.startsWith("http") || !finalPitchDeckUrl.startsWith("http") || !finalReportUrl.startsWith("http")) {
        return res.status(400).json({ error: "Must be valid URLs." });
      }

      // Day 7 has individual submissions for portfolios
      let portfolios = project.submissions.day7?.portfolios || [];
      if (portfolioUrl) {
        const index = portfolios.findIndex(p => p.email === student.email);
        if (index >= 0) {
          portfolios[index].portfolioUrl = portfolioUrl;
        } else {
          portfolios.push({ email: student.email, portfolioUrl });
        }
      }

      project.submissions.day7 = {
        finalMvpUrl,
        finalPitchDeckUrl,
        finalReportUrl,
        portfolios,
        submittedAt: now
      };
      project.dailyStatus.day7 = "submitted";
      project.status = "submitted"; // sync overall status
    }

    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    console.error("[Submit Day Error]:", err);
    res.status(500).json({ error: "Failed to submit deliverables. Please try again." });
  }
});

/**
 * GET /api/techpreneur-v2/projects
 * Admin — Get all project submissions
 */
router.get("/projects", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const { track, status, search } = req.query;
    const filter = {};
    if (track) filter.track = track;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { teamName: { $regex: search, $options: "i" } },
        { studentName: { $regex: search, $options: "i" } },
        { studentEmail: { $regex: search, $options: "i" } },
      ];
    }
    const projects = await TechPreneurProject.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ projects, total: projects.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects." });
  }
});

/**
 * PATCH /api/techpreneur-v2/projects/:id/review-day
 * Admin — Review milestone and add feedback
 */
router.patch("/projects/:id/review-day", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const { dayNumber, status, feedback } = req.body;
    if (!dayNumber || dayNumber < 1 || dayNumber > 7) {
      return res.status(400).json({ error: "Invalid day number (must be 1-7)." });
    }
    if (!status) return res.status(400).json({ error: "Status is required." });

    const updateObj = {
      $set: {
        [`dailyStatus.day${dayNumber}`]: status,
        [`dailyFeedback.day${dayNumber}`]: feedback || "",
        reviewedBy: req.user?.email,
        reviewedAt: new Date()
      }
    };

    if (dayNumber === 7) {
      updateObj.$set.status = status;
      updateObj.$set.feedback = feedback || "";
    }

    const project = await TechPreneurProject.findByIdAndUpdate(
      req.params.id,
      updateObj,
      { new: true }
    );

    if (!project) return res.status(404).json({ error: "Project not found." });
    res.json({ success: true, project });
  } catch (err) {
    console.error("[Review Day Error]:", err);
    res.status(500).json({ error: "Failed to update project review." });
  }
});

// =============================================================================
// REFERRALS
// =============================================================================

/**
 * GET /api/techpreneur-v2/referrals/validate/:code
 * Public — Check if a referral code is valid (for checkout)
 */
router.get("/referrals/validate/:code", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase().trim();

    // Check if it matches a Promo Code first
    const TechPreneurPromoCode = require("../models/TechPreneurPromoCode");
    const promo = await TechPreneurPromoCode.findOne({ code });
    if (promo) {
      if (promo.isUsed) {
        return res.status(400).json({ valid: false, error: "This promo code has already been used." });
      }
      return res.json({ valid: true, referrerName: "Promo Code", discount: promo.discount });
    }

    // Fallback to Referral Code validation
    const referrer = await TechPreneurRegistration.findOne({
      referralCode: code,
      paymentVerified: true,
    }).select("name referralCode");
    if (!referrer) {
      return res.status(404).json({ valid: false, error: "Invalid or expired code." });
    }
    res.json({ valid: true, referrerName: referrer.name, discount: 100 });
  } catch (err) {
    res.status(500).json({ error: "Failed to validate code." });
  }
});

/**
 * GET /api/techpreneur-v2/referrals/my-stats
 * Student (JWT) — Get own referral stats
 */
router.get("/referrals/my-stats", requireStudent, async (req, res) => {
  try {
    const student = await TechPreneurRegistration.findById(req.student.studentId)
      .select("referralCode name");
    if (!student) return res.status(404).json({ error: "Student not found." });

    const referrals = await TechPreneurReferral.find({
      referrerId: student._id,
    })
      .populate("referredId", "name email")
      .lean();

    const total = referrals.length;
    const successful = referrals.filter(r => r.status === "verified" || r.status === "paid").length;
    const cashbackEarned = referrals.filter(r => r.cashbackStatus === "paid").reduce((s, r) => s + (r.cashbackAmount || 0), 0);
    const cashbackPending = referrals.filter(r => r.cashbackStatus === "eligible").length * 100;

    res.json({
      referralCode: student.referralCode,
      total,
      successful,
      cashbackEarned,
      cashbackPending,
      referrals,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch referral stats." });
  }
});

/**
 * GET /api/techpreneur-v2/referrals
 * Admin — Get all referral records
 */
router.get("/referrals", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const referrals = await TechPreneurReferral.find()
      .sort({ createdAt: -1 })
      .populate("referrerId", "name email")
      .populate("referredId", "name email paymentVerified")
      .lean();
    res.json({ referrals, total: referrals.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch referrals." });
  }
});

/**
 * PATCH /api/techpreneur-v2/referrals/:id/pay-cashback
 * Admin — Mark cashback as paid to referrer
 */
router.patch("/referrals/:id/pay-cashback", authenticate, authorize("admin", "founder"), async (req, res) => {
  try {
    const referral = await TechPreneurReferral.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          cashbackStatus: "paid",
          cashbackAmount: 100,
          cashbackPaidAt: new Date(),
          cashbackPaidBy: req.user?.email,
        },
      },
      { new: true }
    );
    if (!referral) return res.status(404).json({ error: "Referral not found." });
    res.json({ success: true, referral });
  } catch (err) {
    res.status(500).json({ error: "Failed to update cashback." });
  }
});

// =============================================================================
// REFERRAL CODE GENERATION (Internal helper — called when admin confirms payment)
// =============================================================================

/**
 * POST /api/techpreneur-v2/referrals/generate-code/:studentId
 * Admin — Generate and assign a referral code to a student
 */
router.post("/referrals/generate-code/:studentId", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const student = await TechPreneurRegistration.findById(req.params.studentId);
    if (!student) return res.status(404).json({ error: "Student not found." });
    if (student.referralCode) {
      return res.json({ success: true, referralCode: student.referralCode, message: "Code already exists." });
    }
    let code;
    let tries = 0;
    do {
      code = generateReferralCode(student.name);
      const existing = await TechPreneurRegistration.findOne({ referralCode: code });
      if (!existing) break;
      tries++;
    } while (tries < 10);

    student.referralCode = code;
    await student.save();
    console.log(`[TechPreneur] Referral code ${code} assigned to ${student.email}`);
    res.json({ success: true, referralCode: code });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate referral code." });
  }
});

// =============================================================================
// ANALYTICS
// =============================================================================

/**
 * GET /api/techpreneur-v2/analytics
 * Admin — Platform-wide analytics snapshot
 */
router.get("/analytics", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const [
      totalStudents,
      verifiedStudents,
      pendingStudents,
      totalRevenue,
      totalSessions,
      totalAnnouncements,
      totalProjects,
      submittedProjects,
      totalReferrals,
      paidReferrals,
      trackBreakdown,
    ] = await Promise.all([
      TechPreneurRegistration.countDocuments(),
      TechPreneurRegistration.countDocuments({ paymentVerified: true }),
      TechPreneurRegistration.countDocuments({ paymentVerified: false }),
      TechPreneurRegistration.aggregate([
        { $match: { paymentVerified: true } },
        { $group: { _id: null, total: { $sum: "$feeAmount" } } },
      ]),
      TechPreneurSession.countDocuments({ isPublished: true }),
      TechPreneurAnnouncement.countDocuments({ isPublished: true }),
      TechPreneurProject.countDocuments(),
      TechPreneurProject.countDocuments({ status: { $in: ["submitted", "reviewed", "approved"] } }),
      TechPreneurReferral.countDocuments(),
      TechPreneurReferral.countDocuments({ status: "verified" }),
      TechPreneurRegistration.aggregate([
        { $group: { _id: "$trackPreference", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      students: {
        total: totalStudents,
        verified: verifiedStudents,
        pending: pendingStudents,
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
      },
      sessions: { total: totalSessions },
      announcements: { total: totalAnnouncements },
      projects: { total: totalProjects, submitted: submittedProjects },
      referrals: { total: totalReferrals, successful: paidReferrals },
      trackBreakdown: trackBreakdown.map(t => ({ track: t._id, count: t.count })),
    });
  } catch (err) {
    console.error("[TechPreneur] Analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics." });
  }
});

// =============================================================================
// PROMO CODES (Admin Managed)
// =============================================================================

const TechPreneurPromoCode = require("../models/TechPreneurPromoCode");

/**
 * GET /api/techpreneur-v2/promocodes
 * Admin — Get all promo codes
 */
router.get("/promocodes", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const promoCodes = await TechPreneurPromoCode.find().sort({ createdAt: -1 }).lean();
    res.json({ promoCodes, total: promoCodes.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch promo codes." });
  }
});

/**
 * POST /api/techpreneur-v2/promocodes
 * Admin — Generate a new promo code
 */
router.post("/promocodes", authenticate, authorize("admin", "founder", "ops"), async (req, res) => {
  try {
    const { code, discount } = req.body;

    if (!discount || ![300, 500].includes(Number(discount))) {
      return res.status(400).json({ error: "Discount must be either 300 or 500." });
    }

    let finalCode = code?.toUpperCase().trim();

    if (!finalCode) {
      // Auto-generate a unique promo code
      let isUnique = false;
      let tries = 0;
      while (!isUnique && tries < 10) {
        const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
        finalCode = `SAVE${discount}${randomSuffix}`;
        const existing = await TechPreneurPromoCode.findOne({ code: finalCode });
        if (!existing) isUnique = true;
        tries++;
      }
    } else {
      // Check if custom code already exists
      const existing = await TechPreneurPromoCode.findOne({ code: finalCode });
      if (existing) {
        return res.status(409).json({ error: `Promo code '${finalCode}' already exists.` });
      }
    }

    const promo = new TechPreneurPromoCode({
      code: finalCode,
      discount: Number(discount),
      createdBy: req.user?.email || "admin",
    });

    await promo.save();
    res.status(201).json({ success: true, promoCode: promo });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(". ") });
    }
    console.error("[TechPreneur] Promo code creation error:", err);
    res.status(500).json({ error: "Failed to create promo code." });
  }
});

/**
 * DELETE /api/techpreneur-v2/promocodes/:id
 * Admin — Delete a promo code
 */
router.delete("/promocodes/:id", authenticate, authorize("admin", "founder"), async (req, res) => {
  try {
    const promo = await TechPreneurPromoCode.findByIdAndDelete(req.params.id);
    if (!promo) return res.status(404).json({ error: "Promo code not found." });
    res.json({ success: true, message: "Promo code deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete promo code." });
  }
});

// =============================================================================
// CERTIFICATES & REPORTS
// =============================================================================

/**
 * GET /api/techpreneur-v2/projects/certificates/my
 * Student (JWT) — Get own certificate and scorecard
 */
router.get("/projects/certificates/my", requireStudent, async (req, res) => {
  try {
    const certificate = await TechPreneurCertificate.findOne({
      studentId: req.student.studentId
    }).populate("templateId").lean();
    
    let project = null;
    if (certificate) {
      project = await TechPreneurProject.findOne({
        $or: [
          { studentEmail: certificate.studentEmail },
          { "teamMembers.email": certificate.studentEmail }
        ]
      }).lean();
    }
    
    res.json({ certificate: certificate || null, project });
  } catch (err) {
    console.error("[TechPreneur] fetch certificate error:", err);
    res.status(500).json({ error: "Failed to fetch certificate." });
  }
});

/**
 * GET /api/techpreneur-v2/projects/certificates/verification/:id
 * Public — Verify a certificate and get student scorecard details (no auth)
 */
router.get("/projects/certificates/verification/:id", async (req, res) => {
  try {
    const certificate = await TechPreneurCertificate.findOne({
      certificateId: req.params.id.trim()
    })
      .populate("templateId")
      .populate("studentId", "name email college branch year trackPreference")
      .lean();

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found." });
    }

    const project = await TechPreneurProject.findOne({
      $or: [
        { studentEmail: certificate.studentEmail },
        { "teamMembers.email": certificate.studentEmail }
      ]
    }).lean();

    res.json({ certificate, project });
  } catch (err) {
    console.error("[TechPreneur] verify certificate error:", err);
    res.status(500).json({ error: "Failed to verify certificate." });
  }
});


/**
 * GET /api/techpreneur-v2/projects/certificates
 * Admin — List all certificates
 */
router.get(
  "/projects/certificates",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const certificates = await TechPreneurCertificate.find().lean();
      res.json({ success: true, certificates });
    } catch (err) {
      console.error("[TechPreneur] fetch certificates list error:", err);
      res.status(500).json({ error: "Failed to fetch certificates." });
    }
  }
);

/**
 * GET /api/techpreneur-v2/projects/certificates/templates
 * Admin — List all templates
 */
router.get(
  "/projects/certificates/templates",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const templates = await TechPreneurCertificateTemplate.find().sort({ createdAt: -1 });
      res.json({ templates });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch templates." });
    }
  }
);

/**
 * POST /api/techpreneur-v2/projects/certificates/templates
 * Admin — Create or update a certificate template
 */
router.post(
  "/projects/certificates/templates",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const { id, name, imageUrl, variables, isActive } = req.body;
      if (!name || !imageUrl) {
        return res.status(400).json({ error: "Name and image URL are required." });
      }

      if (isActive) {
        // Deactivate other templates if this one is active
        await TechPreneurCertificateTemplate.updateMany({}, { $set: { isActive: false } });
      }

      let template;
      if (id) {
        template = await TechPreneurCertificateTemplate.findByIdAndUpdate(
          id,
          { name, imageUrl, variables, isActive },
          { new: true }
        );
      } else {
        template = new TechPreneurCertificateTemplate({
          name,
          imageUrl,
          variables,
          isActive
        });
        await template.save();
      }

      res.status(201).json({ success: true, template });
    } catch (err) {
      console.error("[TechPreneur] Save template error:", err);
      res.status(500).json({ error: "Failed to save template." });
    }
  }
);

/**
 * POST /api/techpreneur-v2/projects/certificates/issue
 * Admin — Issue or update a certificate/scorecard for a single student
 */
router.post(
  "/projects/certificates/issue",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const { studentId, scores, efforts, finalRemarks, templateId } = req.body;
      if (!studentId) return res.status(400).json({ error: "Student ID is required." });

      const student = await TechPreneurRegistration.findById(studentId);
      if (!student) return res.status(404).json({ error: "Student not found." });

      // Resolve template
      let activeTemplateId = templateId;
      if (!activeTemplateId) {
        const activeTemplate = await TechPreneurCertificateTemplate.findOne({ isActive: true });
        if (activeTemplate) activeTemplateId = activeTemplate._id;
      }

      // Upsert certificate
      let certificate = await TechPreneurCertificate.findOne({ studentId });
      
      if (certificate) {
        certificate.scores = scores || certificate.scores;
        certificate.efforts = efforts || certificate.efforts;
        certificate.finalRemarks = finalRemarks !== undefined ? finalRemarks : certificate.finalRemarks;
        if (activeTemplateId) certificate.templateId = activeTemplateId;
        await certificate.save();
      } else {
        // Generate unique certificate ID
        let certificateId;
        let isUnique = false;
        while (!isUnique) {
          certificateId = "CERT-TP26-" + crypto.randomBytes(3).toString("hex").toUpperCase();
          const existing = await TechPreneurCertificate.findOne({ certificateId });
          if (!existing) isUnique = true;
        }

        certificate = new TechPreneurCertificate({
          studentId: student._id,
          studentEmail: student.email,
          studentName: student.name,
          college: student.college,
          certificateId,
          templateId: activeTemplateId,
          scores: scores || {},
          efforts: efforts || {},
          finalRemarks: finalRemarks || ""
        });
        await certificate.save();
      }

      res.json({ success: true, certificate });
    } catch (err) {
      console.error("[TechPreneur] issue certificate error:", err);
      res.status(500).json({ error: "Failed to issue certificate." });
    }
  }
);

/**
 * POST /api/techpreneur-v2/projects/certificates/issue-bulk
 * Admin — Bulk issue/upload certificates
 */
router.post(
  "/projects/certificates/issue-bulk",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const { csvData, templateId } = req.body;
      
      // Resolve template
      let activeTemplateId = templateId;
      if (!activeTemplateId) {
        const activeTemplate = await TechPreneurCertificateTemplate.findOne({ isActive: true });
        if (activeTemplate) activeTemplateId = activeTemplate._id;
      }

      let count = 0;

      if (Array.isArray(csvData) && csvData.length > 0) {
        // Bulk import via CSV parsed data structure
        for (const row of csvData) {
          const email = row.email?.toLowerCase().trim();
          if (!email) continue;

          const student = await TechPreneurRegistration.findOne({ email, paymentVerified: true });
          if (!student) continue;

          const scores = {
            week1: Number(row.week1Score) || 0,
            week2: Number(row.week2Score) || 0,
            week3: Number(row.week3Score) || 0,
            week4: Number(row.week4Score) || 0,
            projectContribution: Number(row.projectScore) || 0
          };

          const efforts = {
            week1: row.week1Remarks || "",
            week2: row.week2Remarks || "",
            week3: row.week3Remarks || "",
            week4: row.week4Remarks || "",
            projectContribution: row.projectRemarks || ""
          };

          const finalRemarks = row.finalRemarks || "";

          let certificate = await TechPreneurCertificate.findOne({ studentId: student._id });
          if (certificate) {
            certificate.scores = scores;
            certificate.efforts = efforts;
            certificate.finalRemarks = finalRemarks;
            if (activeTemplateId) certificate.templateId = activeTemplateId;
            await certificate.save();
          } else {
            let certificateId;
            let isUnique = false;
            while (!isUnique) {
              certificateId = "CERT-TP26-" + crypto.randomBytes(3).toString("hex").toUpperCase();
              const existing = await TechPreneurCertificate.findOne({ certificateId });
              if (!existing) isUnique = true;
            }

            certificate = new TechPreneurCertificate({
              studentId: student._id,
              studentEmail: student.email,
              studentName: student.name,
              college: student.college,
              certificateId,
              templateId: activeTemplateId,
              scores,
              efforts,
              finalRemarks
            });
            await certificate.save();
          }
          count++;
        }
      } else {
        // Default bulk issue: generate blank certificate slots for all confirmed students who don't have one
        const confirmedStudents = await TechPreneurRegistration.find({ paymentVerified: true });
        for (const student of confirmedStudents) {
          const existing = await TechPreneurCertificate.findOne({ studentId: student._id });
          if (existing) continue;

          let certificateId;
          let isUnique = false;
          while (!isUnique) {
            certificateId = "CERT-TP26-" + crypto.randomBytes(3).toString("hex").toUpperCase();
            const existCheck = await TechPreneurCertificate.findOne({ certificateId });
            if (!existCheck) isUnique = true;
          }

          const certificate = new TechPreneurCertificate({
            studentId: student._id,
            studentEmail: student.email,
            studentName: student.name,
            college: student.college,
            certificateId,
            templateId: activeTemplateId,
            scores: { week1: 0, week2: 0, week3: 0, week4: 0, projectContribution: 0 },
            efforts: { week1: "", week2: "", week3: "", week4: "", projectContribution: "" },
            finalRemarks: ""
          });
          await certificate.save();
          count++;
        }
      }

      res.json({ success: true, count });
    } catch (err) {
      console.error("[TechPreneur] bulk issue error:", err);
      res.status(500).json({ error: "Failed to process bulk issuance." });
    }
  }
);

/**
 * POST /api/techpreneur-v2/projects/certificates/send-emails
 * Admin — Bulk dispatch certificate email notices to selected students
 */
router.post(
  "/projects/certificates/send-emails",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const { studentIds } = req.body;
      if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ error: "No student IDs provided." });
      }

      const certificates = await TechPreneurCertificate.find({
        studentId: { $in: studentIds }
      }).populate("templateId studentId");

      let count = 0;
      for (const cert of certificates) {
        const domain = process.env.FRONTEND_URL || "https://training.gryork.com";
        const verifyLink = `${domain}/verify-certificate/${cert.certificateId}`;
        const dashboardLink = `${domain}/login`;

        let attachments = [];
        let certificateInlineHtml = "";

        if (cert.templateId && cert.templateId.imageUrl) {
          try {
            const pdfBuffer = await generateCertificatePDF(cert, cert.templateId, verifyLink);
            attachments.push({
              filename: `TechPreneur_Certificate_${cert.certificateId}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf"
            });

            const variables = cert.templateId.variables || [];
            certificateInlineHtml = `
              <div style="position:relative; width:100%; max-width:600px; margin:20px auto; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
                <img src="${cert.templateId.imageUrl}" style="width:100%; display:block; border-radius:8px;" />
                ${variables.map(v => {
                  if (v.name === "qrCode") return "";
                  let val = "";
                  if (v.name === "studentName") val = cert.studentName;
                  else if (v.name === "collegeName") val = cert.college;
                  else if (v.name === "certificateId") val = cert.certificateId;
                  else if (v.name === "issuedDate") {
                    val = new Date(cert.issuedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    });
                  } else if (v.name === "studentEmail") val = cert.studentEmail;
                  else if (v.name === "finalRemarks") val = cert.finalRemarks;
                  else if (v.name === "branch") val = cert.studentId?.branch || "";
                  else if (v.name === "year") val = cert.studentId?.year || "";
                  else if (v.name === "trackPreference" || v.name === "track") val = cert.studentId?.trackPreference || "";
                  else val = cert[v.name] || "";

                  return `
                    <div style="position:absolute; left:${v.x}%; top:${v.y}%; font-size:${v.fontSize * 0.45}px; color:${v.fontColor || '#000000'}; font-family:${v.fontFamily || 'sans-serif'}; font-weight:bold; transform:translate(-50%, -50%); -webkit-transform:translate(-50%, -50%); text-align:center; white-space:nowrap;">
                      ${val}
                    </div>
                  `;
                }).join("")}
              </div>
            `;
          } catch (pdfErr) {
            console.error("Failed to generate PDF for certificate", cert.certificateId, pdfErr);
          }
        }

        const emailHtml = `
          <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;">
            <h2 style="color:#1e3a8a;margin-bottom:10px;">Congratulations, ${cert.studentName}! 🎉</h2>
            <p style="color:#475569;font-size:15px;line-height:1.6;">
              We are proud to share your official <strong>TechPreneur 2026 Completion Certificate & Scorecard Report</strong>. 
              You have successfully completed the 4-week industrial startup training and accelerator program.
            </p>
            
            ${certificateInlineHtml}

            <div style="background:#f8fafc;padding:15px;border-radius:12px;margin:20px 0;border:1px solid #f1f5f9;">
              <p style="margin:5px 0;font-size:13px;color:#64748b;"><strong>Certificate ID:</strong> <span style="font-family:monospace;color:#0f172a;font-weight:bold;">${cert.certificateId}</span></p>
              <p style="margin:5px 0;font-size:13px;color:#64748b;"><strong>College:</strong> <span style="color:#0f172a;">${cert.college}</span></p>
              <p style="margin:5px 0;font-size:13px;color:#64748b;"><strong>Evaluation Score:</strong> <span style="color:#10b981;font-weight:bold;">${Object.values(cert.scores).reduce((a,b)=>a+b, 0)} / 100</span></p>
            </div>
            <p style="text-align:center;margin:30px 0;">
              <a href="${verifyLink}" style="background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;box-shadow:0 4px 12px rgba(37,99,235,0.2);">
                Verify & Download Certificate
              </a>
            </p>
            <p style="color:#64748b;font-size:12px;line-height:1.6;margin-top:40px;border-top:1px solid #e2e8f0;padding-top:15px;">
              You can also log into your <a href="${dashboardLink}" style="color:#2563eb;text-decoration:none;">Student Dashboard</a> to download print-ready templates of your selection/joining letter and other evaluation documents.
            </p>
          </div>
        `;

        await emailService.sendEmail(
          cert.studentEmail, 
          "Your TechPreneur 2026 Certificate & Performance Report", 
          emailHtml,
          attachments
        );
        cert.emailSent = true;
        cert.emailSentAt = new Date();
        await cert.save();
        count++;
      }

      res.json({ success: true, count });
    } catch (err) {
      console.error("[TechPreneur] send certificate emails error:", err);
      res.status(500).json({ error: "Failed to send certificate emails." });
    }
  }
);

/**
 * GET /api/techpreneur-v2/projects/joining-letters
 * Admin — List all issued selection letters
 */
router.get(
  "/projects/joining-letters",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const letters = await TechPreneurJoiningLetter.find().lean();
      res.json({ success: true, joiningLetters: letters });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch joining letters." });
    }
  }
);

/**
 * GET /api/techpreneur-v2/projects/joining-letters/templates
 * Admin — List letter templates
 */
router.get(
  "/projects/joining-letters/templates",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const templates = await TechPreneurJoiningLetterTemplate.find().sort({ createdAt: -1 });
      res.json({ templates });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch templates." });
    }
  }
);

/**
 * POST /api/techpreneur-v2/projects/joining-letters/templates
 * Admin — Create or update a joining letter template
 */
router.post(
  "/projects/joining-letters/templates",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const { id, name, imageUrl, variables, isActive } = req.body;
      if (!name || !imageUrl) {
        return res.status(400).json({ error: "Name and template image URL are required." });
      }

      let template;
      if (isActive === true) {
        await TechPreneurJoiningLetterTemplate.updateMany({}, { $set: { isActive: false } });
      }

      if (id) {
        template = await TechPreneurJoiningLetterTemplate.findByIdAndUpdate(
          id,
          { name, imageUrl, variables, isActive: !!isActive },
          { new: true }
        );
      } else {
        template = new TechPreneurJoiningLetterTemplate({
          name,
          imageUrl,
          variables: variables || [],
          isActive: !!isActive
        });
        await template.save();
      }

      res.json({ success: true, template });
    } catch (err) {
      console.error("[TechPreneur] save template error:", err);
      res.status(500).json({ error: "Failed to save template." });
    }
  }
);

/**
 * POST /api/techpreneur-v2/projects/joining-letters/issue
 * Admin — Issue selection letter for a single student
 */
router.post(
  "/projects/joining-letters/issue",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const { studentId, joiningDate, variablesData, templateId } = req.body;
      if (!studentId) {
        return res.status(400).json({ error: "Student ID is required." });
      }

      const student = await TechPreneurRegistration.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: "Student registration not found." });
      }

      let activeTemplateId = templateId;
      if (!activeTemplateId) {
        const activeTemplate = await TechPreneurJoiningLetterTemplate.findOne({ isActive: true });
        if (activeTemplate) activeTemplateId = activeTemplate._id;
      }

      let letter = await TechPreneurJoiningLetter.findOne({ studentId });
      if (letter) {
        letter.joiningDate = joiningDate || letter.joiningDate;
        letter.variablesData = variablesData || letter.variablesData;
        if (activeTemplateId) letter.templateId = activeTemplateId;
        await letter.save();
      } else {
        let joiningLetterId;
        let isUnique = false;
        while (!isUnique) {
          joiningLetterId = "JL-TP26-" + crypto.randomBytes(3).toString("hex").toUpperCase();
          const check = await TechPreneurJoiningLetter.findOne({ joiningLetterId });
          if (!check) isUnique = true;
        }

        letter = new TechPreneurJoiningLetter({
          studentId: student._id,
          studentEmail: student.email,
          studentName: student.name,
          college: student.college,
          joiningLetterId,
          joiningDate: joiningDate || new Date(),
          templateId: activeTemplateId,
          variablesData: variablesData || {}
        });
        await letter.save();
      }

      res.json({ success: true, joiningLetter: letter });
    } catch (err) {
      console.error("[TechPreneur] issue joining letter error:", err);
      res.status(500).json({ error: "Failed to issue joining letter." });
    }
  }
);

/**
 * POST /api/techpreneur-v2/projects/joining-letters/issue-bulk
 * Admin — Bulk issue onboarding joining letters for confirmed registrations
 */
router.post(
  "/projects/joining-letters/issue-bulk",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const { templateId } = req.body;
      let activeTemplateId = templateId;
      if (!activeTemplateId) {
        const activeTemplate = await TechPreneurJoiningLetterTemplate.findOne({ isActive: true });
        if (activeTemplate) activeTemplateId = activeTemplate._id;
      }

      let count = 0;
      const confirmedStudents = await TechPreneurRegistration.find({ paymentVerified: true });
      for (const student of confirmedStudents) {
        const existing = await TechPreneurJoiningLetter.findOne({ studentId: student._id });
        if (existing) continue;

        let joiningLetterId;
        let isUnique = false;
        while (!isUnique) {
          joiningLetterId = "JL-TP26-" + crypto.randomBytes(3).toString("hex").toUpperCase();
          const existCheck = await TechPreneurJoiningLetter.findOne({ joiningLetterId });
          if (!existCheck) isUnique = true;
        }

        const letter = new TechPreneurJoiningLetter({
          studentId: student._id,
          studentEmail: student.email,
          studentName: student.name,
          college: student.college,
          joiningLetterId,
          joiningDate: new Date(),
          templateId: activeTemplateId
        });
        await letter.save();
        count++;
      }

      res.json({ success: true, count });
    } catch (err) {
      console.error("[TechPreneur] bulk issue joining letters error:", err);
      res.status(500).json({ error: "Failed to bulk issue joining letters." });
    }
  }
);

/**
 * POST /api/techpreneur-v2/projects/joining-letters/send-emails
 * Admin — Bulk dispatch onboarding selection letters to selected students
 */
router.post(
  "/projects/joining-letters/send-emails",
  authenticate,
  authorize("admin", "founder", "ops"),
  async (req, res) => {
    try {
      const { studentIds } = req.body;
      if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ error: "No student IDs provided." });
      }

      const letters = await TechPreneurJoiningLetter.find({
        studentId: { $in: studentIds }
      }).populate("templateId studentId");

      let count = 0;
      for (const letter of letters) {
        const domain = process.env.FRONTEND_URL || "https://training.gryork.com";
        const verifyLink = `${domain}/verify-joining-letter/${letter.joiningLetterId}`;
        const dashboardLink = `${domain}/login`;

        let attachments = [];
        if (letter.templateId && letter.templateId.imageUrl) {
          try {
            const pdfBuffer = await generateJoiningLetterPDF(letter, letter.templateId, verifyLink);
            attachments.push({
              filename: `TechPreneur_Selection_Letter_${letter.joiningLetterId}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf"
            });
          } catch (pdfErr) {
            console.error("Failed to generate PDF for selection letter", letter.joiningLetterId, pdfErr);
          }
        }

        const emailHtml = `
          <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;">
            <h2 style="color:#0f172a;margin-bottom:10px;">Official Onboarding & Joining Letter 💼</h2>
            <p style="color:#475569;font-size:15px;line-height:1.6;">
              Dear <strong>${letter.studentName}</strong>,
            </p>
            <p style="color:#475569;font-size:15px;line-height:1.6;">
              Congratulations! We are pleased to issue your official **Selection & Joining Letter** for your program track in the TechPreneur accelerator.
            </p>
            <div style="background:#f8fafc;padding:15px;border-radius:12px;margin:20px 0;border:1px solid #f1f5f9;">
              <p style="margin:5px 0;font-size:13px;color:#64748b;"><strong>Reference Letter ID:</strong> <span style="font-family:monospace;color:#0f172a;font-weight:bold;">${letter.joiningLetterId}</span></p>
              <p style="margin:5px 0;font-size:13px;color:#64748b;"><strong>Joining Date:</strong> <span style="color:#0f172a;">${new Date(letter.joiningDate).toLocaleDateString("en-IN", {day:'numeric', month:'long', year:'numeric'})}</span></p>
              <p style="margin:5px 0;font-size:13px;color:#64748b;"><strong>College:</strong> <span style="color:#0f172a;">${letter.college}</span></p>
            </div>
            <p style="text-align:center;margin:30px 0;">
              <a href="${verifyLink}" style="background:#10b981;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;box-shadow:0 4px 12px rgba(16,185,129,0.2);">
                View & Download Joining Letter
              </a>
            </p>
            <p style="color:#64748b;font-size:12px;line-height:1.6;margin-top:40px;border-top:1px solid #e2e8f0;padding-top:15px;">
              You can also log into the <a href="${dashboardLink}" style="color:#10b981;text-decoration:none;">Student Dashboard</a> to download and print your onboarding materials.
            </p>
          </div>
        `;

        await emailService.sendEmail(
          letter.studentEmail, 
          "Your TechPreneur Onboarding Joining Letter", 
          emailHtml, 
          attachments
        );
        letter.emailSent = true;
        letter.emailSentAt = new Date();
        await letter.save();
        count++;
      }

      res.json({ success: true, count });
    } catch (err) {
      console.error("[TechPreneur] send letter emails error:", err);
      res.status(500).json({ error: "Failed to send letter emails." });
    }
  }
);

/**
 * GET /api/techpreneur-v2/projects/joining-letters/my
 * Student (JWT) — Get own joining letter
 */
router.get("/projects/joining-letters/my", requireStudent, async (req, res) => {
  try {
    const joiningLetter = await TechPreneurJoiningLetter.findOne({
      studentId: req.student.studentId
    }).populate("templateId").lean();

    res.json({ joiningLetter: joiningLetter || null });
  } catch (err) {
    console.error("[TechPreneur] fetch my joining letter error:", err);
    res.status(500).json({ error: "Failed to fetch joining letter." });
  }
});

/**
 * GET /api/techpreneur-v2/projects/joining-letters/verification/:id
 * Public — Verify Selection Letter by ID
 */
router.get("/projects/joining-letters/verification/:id", async (req, res) => {
  try {
    const joiningLetter = await TechPreneurJoiningLetter.findOne({
      joiningLetterId: req.params.id.trim()
    })
      .populate("templateId")
      .populate("studentId", "name email college branch year trackPreference")
      .lean();

    if (!joiningLetter) {
      return res.status(404).json({ error: "Joining letter not found." });
    }

    res.json({ joiningLetter });
  } catch (err) {
    console.error("[TechPreneur] verify joining letter error:", err);
    res.status(500).json({ error: "Failed to verify joining letter." });
  }
});

module.exports = router;
