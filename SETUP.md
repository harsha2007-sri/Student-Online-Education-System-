# Quick Setup Guide

## Prerequisites
1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - [Download](https://www.mongodb.com/try/download/community)

## Installation Steps

### 1. Extract the ZIP file
Extract `online-exam-system.zip` to your desired location.

### 2. Install Node.js Dependencies
Open terminal/command prompt in the project folder and run:
```bash
npm install
```

### 3. Setup MongoDB
- Install MongoDB if not already installed
- Start MongoDB service:
  - **Windows**: MongoDB should start automatically as a service
  - **Mac/Linux**: Run `mongod` in terminal
- Default connection: `mongodb://localhost:27017/online-exam`

### 4. Configure Environment (Optional)
Create a `.env` file in the root directory:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/online-exam
JWT_SECRET=your-secret-key-change-in-production
```
*Note: The application will work with default values if .env is not created.*

### 5. Start the Server
```bash
npm start
```
Or for development with auto-reload:
```bash
npm run dev
```

### 6. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## First Time Usage

### Create Faculty Account
1. Click "Register" tab
2. Fill in:
   - Name: Your name
   - Email: your-email@example.com
   - Password: your password
   - Role: Select "Faculty"
   - Department: (Optional)
3. Click "Register"
4. You'll be automatically logged in

### Create Student Account
1. Click "Register" tab
2. Fill in:
   - Name: Student name
   - Email: student-email@example.com
   - Password: password
   - Role: Select "Student"
   - Department: (Optional)
3. Click "Register"

### Create an Exam (Faculty)
1. Login as Faculty
2. Click "Create New Exam"
3. Fill in exam details:
   - Title: e.g., "Mathematics Quiz"
   - Duration: e.g., 30 (minutes)
   - Start Time: Select date and time
   - End Time: Select date and time (must be after start time)
4. Click "Create Exam"
5. Click "Add Questions" on the exam card
6. Add questions one by one:
   - Enter question text
   - Enter 4 options (A, B, C, D)
   - Select correct answer
   - Click "Add Question" to add more
7. Click "Save All Questions"

### Attempt Exam (Student)
1. Login as Student
2. Find an "Active" exam (green status)
3. Click "Start Exam"
4. Answer all questions
5. Monitor the timer
6. Click "Submit Exam" when done
7. View results immediately

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check if MongoDB is installed correctly
- Try: `mongod --version` to verify installation

### Port Already in Use
- Change PORT in `.env` file to a different port (e.g., 3001)
- Or stop the application using port 3000

### Module Not Found Errors
- Run `npm install` again
- Delete `node_modules` folder and run `npm install`

### CORS Errors
- Ensure you're accessing from `http://localhost:3000`
- Check browser console for specific errors

## Features Implemented

✅ User Registration & Login (Faculty, Student, Admin)
✅ Exam Creation with Timing
✅ MCQ Question Management
✅ Exam Attempt with Timer
✅ Auto-Evaluation & Scoring
✅ Results Display with Correct Answers
✅ Faculty Reports & Statistics
✅ Status Indicators (Upcoming/Active/Completed)
✅ Responsive UI Design

## Support

For issues or questions, refer to the README.md file for detailed documentation.

