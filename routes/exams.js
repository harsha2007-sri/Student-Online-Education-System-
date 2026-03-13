const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const { authenticate, authorize } = require('../middleware/auth');

// Generate unique ID
const generateExamId = () => {
  return `EXAM${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// Create Exam (Faculty only)
router.post('/', authenticate, authorize('faculty'), async (req, res) => {
  try {
    const { title, duration, startTime, endTime } = req.body;

    if (!title || !duration || !startTime || !endTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const examId = generateExamId();
    const exam = new Exam({
      examId,
      title,
      facultyId: req.user._id,
      duration: parseInt(duration),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      totalMarks: 0
    });

    await exam.save();
    res.status(201).json({ message: 'Exam created successfully', exam });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get All Exams (Student)
router.get('/', authenticate, async (req, res) => {
  try {
    let exams;
    
    if (req.user.role === 'student') {
      exams = await Exam.find().populate('facultyId', 'name email').sort({ startTime: -1 });
    } else if (req.user.role === 'faculty') {
      exams = await Exam.find({ facultyId: req.user._id }).populate('facultyId', 'name email').sort({ startTime: -1 });
    } else {
      exams = await Exam.find().populate('facultyId', 'name email').sort({ startTime: -1 });
    }

    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Single Exam
router.get('/:id', authenticate, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('facultyId', 'name email');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Exam (Faculty only)
router.delete('/:id', authenticate, authorize('faculty'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own exams' });
    }

    // Delete associated questions
    await Question.deleteMany({ examId: exam._id });
    await Exam.findByIdAndDelete(req.params.id);

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

