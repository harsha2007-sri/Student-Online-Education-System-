# Online Examination System

A web-based online examination system that enables faculty to create quizzes/tests, assign them to students, and automatically evaluate responses.

## Features

- **User Authentication**: Register and login for Faculty, Students, and Admin role structure included for future implementation
- **Exam Management**: Faculty can create exams with title, duration, and timing
- **Question Management**: Add multiple-choice questions (MCQs) with 4 options
- **Exam Attempt**: Students can attempt exams within specified time limits
- **Auto Evaluation**: Automatic scoring based on correct answers
- **Timer**: Real-time countdown timer for exams
- **Results & Reports**: View scores, correct answers, and class statistics
- **Status Indicators**: Color-coded exam status (Blue=Upcoming, Green=Active, Grey=Completed)

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment Variables**
   - Copy `.env.example` to `.env`
   - Update MongoDB connection string if needed
   - Change JWT_SECRET for production

3. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017/online-exam`

4. **Run the Application**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open your browser and go to: `http://localhost:3000`

## Usage

### For Faculty:
1. Register/Login as Faculty
2. Create a new exam with title, duration, start time, and end time
3. Add questions to the exam (MCQ format with 4 options)
4. View exam reports with student scores and statistics

### For Students:
1. Register/Login as Student
2. View available exams on the dashboard
3. Start an active exam (within time window)
4. Answer questions within the time limit
5. Submit exam to see instant results with correct answers

### Future Enhancements:
1. Admin Dashboard
2. User Management
3. System-wide reports and Analytics
4. Role-based Administration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Exams
- `POST /api/exams` - Create exam (Faculty)
- `GET /api/exams` - Get all exams
- `GET /api/exams/:id` - Get single exam
- `DELETE /api/exams/:id` - Delete exam (Faculty)

### Questions
- `POST /api/questions` - Add question (Faculty)
- `GET /api/questions/exam/:examId` - Get questions for exam (Student)
- `GET /api/questions/exam/:examId/with-answers` - Get questions with answers (Faculty)

### Submissions
- `POST /api/submissions` - Submit exam (Student)
- `GET /api/submissions/user/:userId` - Get user submissions
- `GET /api/submissions/exam/:examId` - Get exam submissions (Faculty)
- `GET /api/submissions/:submissionId/details` - Get submission details

### Reports
- `GET /api/reports/exams` - Get all exam reports (Admin)
- `GET /api/reports/exam/:examId` - Get exam report (Faculty)

## Project Structure

```
online-exam/
├── models/          # MongoDB models
│   ├── User.js
│   ├── Exam.js
│   ├── Question.js
│   ├── Submission.js
│   └── Report.js
├── routes/          # API routes
│   ├── auth.js
│   ├── exams.js
│   ├── questions.js
│   ├── submissions.js
│   └── reports.js
├── middleware/      # Middleware functions
│   └── auth.js
├── public/          # Frontend files
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── faculty.js
│   │   └── student.js
│   ├── index.html
│   ├── faculty-dashboard.html
│   └── student-dashboard.html
├── server.js        # Main server file
├── package.json
└── README.md
```

## Notes

- The timer is implemented using JavaScript countdown
- Auto-evaluation calculates score by comparing selected answers with correct answers
- Exam access is restricted based on start and end times
- Students can only see questions (not answers) during exam time
- Results show correct answers after submission

## License

ISC

