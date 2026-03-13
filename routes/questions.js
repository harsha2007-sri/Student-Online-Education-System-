const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const { authenticate, authorize } = require('../middleware/auth');

// Generate unique ID
const generateQuestionId = () => {
  return `Q${Date.now()}${Math.floor(Math.random() * 10000)}`;
};

// Add Question (Faculty only)
router.post('/', authenticate, authorize('faculty'), async (req, res) => {
  try {
    const { examId, questionText, options, correctAnswer } = req.body;

    if (!examId || !questionText || !options || !correctAnswer) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only add questions to your own exams' });
    }

    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      return res.status(400).json({ message: 'Correct answer must be A, B, C, or D' });
    }

    const questionId = generateQuestionId();
    const question = new Question({
      questionId,
      examId,
      questionText,
      options: {
        A: options.A,
        B: options.B,
        C: options.C,
        D: options.D
      },
      correctAnswer
    });

    await question.save();

    // Update exam total marks
    const questionCount = await Question.countDocuments({ examId });
    exam.totalMarks = questionCount;
    await exam.save();

    res.status(201).json({ message: 'Question added successfully', question });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Questions by Exam (Student)
router.get('/exam/:examId', authenticate, async (req, res) => {
  try {
    const { examId } = req.params;
    
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Students can only see questions during exam time
    if (req.user.role === 'student') {
      const now = new Date();
      if (now < exam.startTime || now > exam.endTime) {
        return res.status(403).json({ message: 'Exam is not available at this time' });
      }
    }

    const questions = await Question.find({ examId }).select('-correctAnswer');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Questions with Answers (Faculty)
router.get('/exam/:examId/with-answers', authenticate, authorize('faculty'), async (req, res) => {
  try {
    const { examId } = req.params;
    
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const questions = await Question.find({ examId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

