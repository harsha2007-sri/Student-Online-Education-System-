# 🚀 Quick Run Guide - Online Examination System

## Step-by-Step Instructions to Run in Browser

### Option 1: Using MongoDB Atlas (Cloud - Recommended for Quick Start)

#### Step 1: Get MongoDB Atlas Connection String
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for free account (or login if you have one)
3. Create a new cluster (Free tier M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`)
6. Replace `<password>` with your database password
7. Add database name at the end: `...mongodb.net/online-exam?retryWrites=true&w=majority`

#### Step 2: Update .env File
Create a `.env` file in the project root with:
```
PORT=3000
MONGODB_URI=your-mongodb-atlas-connection-string-here
JWT_SECRET=online-exam-secret-key-2024
```

#### Step 3: Install Dependencies (Already Done ✅)
```bash
npm install
```

#### Step 4: Start the Server
```bash
npm start
```

You should see:
```
Connected to MongoDB
Server running on http://localhost:3000
```

#### Step 5: Open in Browser
Open your web browser and go to:
```
http://localhost:3000
```

---

### Option 2: Using Local MongoDB

#### Step 1: Install MongoDB
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Start MongoDB service:
   - **Windows**: MongoDB usually starts automatically as a service
   - Or run: `net start MongoDB` in Command Prompt (as Administrator)

#### Step 2: Create .env File
Create a `.env` file in the project root:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/online-exam
JWT_SECRET=online-exam-secret-key-2024
```

#### Step 3: Start the Server
```bash
npm start
```

#### Step 4: Open in Browser
```
http://localhost:3000
```

---

## 🎯 Using the Application

### First Time Setup

1. **Register as Faculty:**
   - Click "Register" tab
   - Fill in: Name, Email, Password
   - Select Role: **Faculty**
   - Click "Register"
   - You'll be automatically logged in

2. **Create Your First Exam:**
   - Click "Create New Exam"
   - Fill in:
     - Title: "Sample Math Quiz"
     - Duration: 30 (minutes)
     - Start Time: Select current time or future time
     - End Time: Select time after start time
   - Click "Create Exam"

3. **Add Questions:**
   - Click "Add Questions" on your exam card
   - Click "Add Question"
   - Fill in:
     - Question Text: "What is 2 + 2?"
     - Option A: "3"
     - Option B: "4"
     - Option C: "5"
     - Option D: "6"
     - Correct Answer: Select "B"
   - Click "Add Question" to add more
   - Click "Save All Questions"

4. **Register as Student:**
   - Logout (top right)
   - Click "Register" tab
   - Fill in: Name, Email, Password
   - Select Role: **Student**
   - Click "Register"

5. **Attempt Exam:**
   - Find your exam (should show "Active" in green if within time window)
   - Click "Start Exam"
   - Answer questions
   - Watch the timer
   - Click "Submit Exam"
   - View results immediately!

---

## 🔧 Troubleshooting

### "Cannot connect to MongoDB" Error
- **If using Atlas**: Check your connection string and ensure your IP is whitelisted in Atlas
- **If using local**: Ensure MongoDB service is running

### "Port 3000 already in use"
- Change PORT in `.env` to another port (e.g., 3001)
- Then access: `http://localhost:3001`

### "Module not found" Error
- Run: `npm install` again

### Browser shows "Cannot GET /"
- Make sure server is running
- Check terminal for errors
- Verify you're accessing `http://localhost:3000`

---

## 📝 Quick Test Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] MongoDB connection configured (Atlas or Local)
- [ ] Server running (`npm start`)
- [ ] Browser opens `http://localhost:3000`
- [ ] Can register as Faculty
- [ ] Can create exam
- [ ] Can add questions
- [ ] Can register as Student
- [ ] Can attempt exam
- [ ] Can see results

---

## 🎨 Features to Try

1. **Timer Functionality**: Start an exam and watch the countdown
2. **Auto-Evaluation**: Submit exam and see instant scoring
3. **Status Colors**: 
   - 🔵 Blue = Upcoming
   - 🟢 Green = Active
   - ⚪ Grey = Completed
4. **Reports**: Faculty can view class statistics
5. **Results**: Students see correct answers after submission

---

## 💡 Tips

- Use different browsers/incognito for testing Faculty and Student roles simultaneously
- Set exam times in the future to test "Upcoming" status
- Set exam times to current time to test "Active" status
- Check browser console (F12) for any JavaScript errors

---

**Need Help?** Check the `README.md` file for detailed documentation.

