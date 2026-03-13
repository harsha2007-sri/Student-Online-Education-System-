const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const { authenticate, authorize } = require('../middleware/auth');

// Generate unique ID
const generateSubmissionId = () => {
  return `SUB${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// Submit Exam (Student only)
router.post('/', authenticate, authorize('student'), async (req, res) => {
  try {
    const { examId, responses } = req.body;

    if (!examId || !responses) {
      return res.status(400).json({ message: 'Exam ID and responses are required' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if exam time is valid
    const now = new Date();
    if (now < exam.startTime) {
      return res.status(403).json({ message: 'Exam has not started yet' });
    }
    if (now > exam.endTime) {
      return res.status(403).json({ message: 'Exam time has expired' });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      examId,
      studentId: req.user._id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Exam already submitted' });
    }

    // Get all questions for the exam
    const questions = await Question.find({ examId });
    
    // Calculate score
    let score = 0;
    const submissionResponses = responses.map(response => {
      const question = questions.find(q => q._id.toString() === response.questionId);
      if (question && response.selected === question.correctAnswer) {
        score++;
      }
      return {
        questionId: response.questionId,
        selected: response.selected || '',
        correct: question ? question.correctAnswer : ''
      };
    });

    const submissionId = generateSubmissionId();
    const submission = new Submission({
      submissionId,
      examId,
      studentId: req.user._id,
      responses: submissionResponses,
      score,
      submittedAt: now
    });

    await submission.save();

    res.status(201).json({
      message: 'Exam submitted successfully',
      submission: {
        submissionId: submission.submissionId,
        score,
        totalQuestions: questions.length,
        submittedAt: submission.submittedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get My Results (Student)
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Students can only see their own results
    if (req.user.role === 'student' && req.user.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await require('../models/User').findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const submissions = await Submission.find({ studentId: user._id })
      .populate('examId', 'title examId startTime endTime totalMarks')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Exam Results (Faculty)
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

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Single Submission with Details (Student)
router.get('/:submissionId/details', authenticate, async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findOne({ submissionId })
      .populate('examId', 'title examId totalMarks')
      .populate('studentId', 'name email userId');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check access
    if (req.user.role === 'student' && submission.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get questions with answers for result display
    const questions = await Question.find({ examId: submission.examId });

    const detailedResponses = submission.responses.map(response => {
      const question = questions.find(q => q._id.toString() === response.questionId.toString());
      return {
        questionId: response.questionId,
        questionText: question ? question.questionText : '',
        options: question ? question.options : {},
        selected: response.selected,
        correct: response.correct,
        isCorrect: response.selected === response.correct
      };
    });

    res.json({
      submission: {
        submissionId: submission.submissionId,
        exam: submission.examId,
        student: submission.studentId,
        score: submission.score,
        totalQuestions: questions.length,
        submittedAt: submission.submittedAt
      },
      responses: detailedResponses
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

