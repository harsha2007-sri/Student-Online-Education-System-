const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Submission = require('../models/Submission');
const Exam = require('../models/Exam');
const { authenticate, authorize } = require('../middleware/auth');

// Generate unique ID
const generateReportId = () => {
  return `RPT${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// Generate Report (Admin)
router.get('/exams', authenticate, authorize('admin'), async (req, res) => {
  try {
    const exams = await Exam.find().populate('facultyId', 'name email');
    
    const reports = await Promise.all(exams.map(async (exam) => {
      const submissions = await Submission.find({ examId: exam._id });
      
      if (submissions.length === 0) {
        return {
          examId: exam.examId,
          examTitle: exam.title,
          facultyName: exam.facultyId.name,
          avgScore: 0,
          highestScore: 0,
          totalParticipants: 0
        };
      }

      const scores = submissions.map(s => s.score);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const highestScore = Math.max(...scores);

      // Check if report exists, create or update
      let report = await Report.findOne({ examId: exam._id });
      if (!report) {
        report = new Report({
          reportId: generateReportId(),
          examId: exam._id,
          avgScore,
          highestScore,
          totalParticipants: submissions.length
        });
        await report.save();
      } else {
        report.avgScore = avgScore;
        report.highestScore = highestScore;
        report.totalParticipants = submissions.length;
        await report.save();
      }

      return {
        examId: exam.examId,
        examTitle: exam.title,
        facultyName: exam.facultyId.name,
        avgScore: avgScore.toFixed(2),
        highestScore,
        totalParticipants: submissions.length
      };
    }));

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Report for Single Exam (Faculty)
router.get('/exam/:examId', authenticate, authorize('faculty'), async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submissions = await Submission.find({ examId })
      .populate('studentId', 'name email userId')
      .sort({ score: -1 });

    if (submissions.length === 0) {
      return res.json({
        exam: {
          examId: exam.examId,
          title: exam.title,
          totalMarks: exam.totalMarks
        },
        avgScore: 0,
        highestScore: 0,
        totalParticipants: 0,
        submissions: []
      });
    }

    const scores = submissions.map(s => s.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highestScore = Math.max(...scores);

    // Update or create report
    let report = await Report.findOne({ examId });
    if (!report) {
      report = new Report({
        reportId: generateReportId(),
        examId,
        avgScore,
        highestScore,
        totalParticipants: submissions.length
      });
      await report.save();
    } else {
      report.avgScore = avgScore;
      report.highestScore = highestScore;
      report.totalParticipants = submissions.length;
      await report.save();
    }

    res.json({
      exam: {
        examId: exam.examId,
        title: exam.title,
        totalMarks: exam.totalMarks
      },
      avgScore: avgScore.toFixed(2),
      highestScore,
      totalParticipants: submissions.length,
      submissions: submissions.map(s => ({
        studentName: s.studentId.name,
        studentEmail: s.studentId.email,
        score: s.score,
        submittedAt: s.submittedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

