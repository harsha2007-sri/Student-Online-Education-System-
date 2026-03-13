const API_BASE = 'http://localhost:3000/api';
let currentExamId = null;
let questions = [];

// Get token and user
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Show message
function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';

    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}

// Load exams
async function loadExams() {
    try {
        const response = await fetch(`${API_BASE}/exams`, {
            headers: getAuthHeaders()
        });

        const exams = await response.json();
        displayExams(exams);
    } catch (error) {
        showMessage('Error loading exams', 'error');
    }
}

// Display exams
function displayExams(exams) {
    const container = document.getElementById('exams-list');
    
    if (exams.length === 0) {
        container.innerHTML = '<p>No exams created yet. Create your first exam!</p>';
        return;
    }

    container.innerHTML = exams.map(exam => {
        const now = new Date();
        const startTime = new Date(exam.startTime);
        const endTime = new Date(exam.endTime);
        
        let status = 'completed';
        let statusClass = 'status-completed';
        let statusText = 'Completed';
        
        if (now < startTime) {
            status = 'upcoming';
            statusClass = 'status-upcoming';
            statusText = 'Upcoming';
        } else if (now >= startTime && now <= endTime) {
            status = 'active';
            statusClass = 'status-active';
            statusText = 'Active';
        }

        return `
            <div class="exam-card">
                <h3>${exam.title}</h3>
                <div class="exam-info">Duration: ${exam.duration} minutes</div>
                <div class="exam-info">Start: ${new Date(exam.startTime).toLocaleString()}</div>
                <div class="exam-info">End: ${new Date(exam.endTime).toLocaleString()}</div>
                <div class="exam-info">Total Marks: ${exam.totalMarks}</div>
                <span class="exam-status ${statusClass}">${statusText}</span>
                <div class="exam-actions">
                    <button class="btn btn-primary" onclick="addQuestions('${exam._id}')">Add Questions</button>
                    <button class="btn btn-secondary" onclick="viewReport('${exam._id}')">View Report</button>
                    <button class="btn btn-danger" onclick="deleteExam('${exam._id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Show create exam modal
function showCreateExamModal() {
    document.getElementById('create-exam-modal').style.display = 'block';
    document.getElementById('create-exam-form').reset();
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Create exam
document.getElementById('create-exam-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('exam-title').value;
    const duration = document.getElementById('exam-duration').value;
    const startTime = document.getElementById('exam-start-time').value;
    const endTime = document.getElementById('exam-end-time').value;

    try {
        const response = await fetch(`${API_BASE}/exams`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ title, duration, startTime, endTime })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Exam created successfully!', 'success');
            closeModal('create-exam-modal');
            loadExams();
        } else {
            showMessage(data.message || 'Failed to create exam', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
});

// Add questions
function addQuestions(examId) {
    currentExamId = examId;
    questions = [];
    document.getElementById('questions-container').innerHTML = '';
    addQuestionForm();
    document.getElementById('add-questions-modal').style.display = 'block';
}

// Add question form
function addQuestionForm() {
    const container = document.getElementById('questions-container');
    const questionIndex = questions.length;
    
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    questionDiv.innerHTML = `
        <h4>Question ${questionIndex + 1}</h4>
        <div class="form-group">
            <label>Question Text</label>
            <input type="text" class="question-text" placeholder="Enter question">
        </div>
        <div class="options-group">
            <div class="option-input">
                <input type="text" class="option-A" placeholder="Option A">
            </div>
            <div class="option-input">
                <input type="text" class="option-B" placeholder="Option B">
            </div>
            <div class="option-input">
                <input type="text" class="option-C" placeholder="Option C">
            </div>
            <div class="option-input">
                <input type="text" class="option-D" placeholder="Option D">
            </div>
        </div>
        <div class="form-group">
            <label>Correct Answer</label>
            <select class="correct-answer-select">
                <option value="">Select</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
            </select>
        </div>
        <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">Remove</button>
    `;
    
    container.appendChild(questionDiv);
}

// Save all questions
async function saveAllQuestions() {
    const questionItems = document.querySelectorAll('.question-item');
    const questionsToSave = [];

    for (let item of questionItems) {
        const questionText = item.querySelector('.question-text').value;
        const optionA = item.querySelector('.option-A').value;
        const optionB = item.querySelector('.option-B').value;
        const optionC = item.querySelector('.option-C').value;
        const optionD = item.querySelector('.option-D').value;
        const correctAnswer = item.querySelector('.correct-answer-select').value;

        if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
            showMessage('Please fill all fields for all questions', 'error');
            return;
        }

        questionsToSave.push({
            examId: currentExamId,
            questionText,
            options: { A: optionA, B: optionB, C: optionC, D: optionD },
            correctAnswer
        });
    }

    if (questionsToSave.length === 0) {
        showMessage('Please add at least one question', 'error');
        return;
    }

    try {
        for (let question of questionsToSave) {
            const response = await fetch(`${API_BASE}/questions`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(question)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to save question');
            }
        }

        showMessage('All questions saved successfully!', 'success');
        closeModal('add-questions-modal');
        loadExams();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// View report
async function viewReport(examId) {
    try {
        const response = await fetch(`${API_BASE}/reports/exam/${examId}`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            const reportContent = document.getElementById('report-content');
            reportContent.innerHTML = `
                <h3>${data.exam.title}</h3>
                <div class="result-summary">
                    <div>Average Score: <strong>${data.avgScore}</strong></div>
                    <div>Highest Score: <strong>${data.highestScore}</strong></div>
                    <div>Total Participants: <strong>${data.totalParticipants}</strong></div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Email</th>
                            <th>Score</th>
                            <th>Submitted At</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.submissions.map(s => `
                            <tr>
                                <td>${s.studentName}</td>
                                <td>${s.studentEmail}</td>
                                <td>${s.score}/${data.exam.totalMarks}</td>
                                <td>${new Date(s.submittedAt).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            document.getElementById('exam-report-modal').style.display = 'block';
        } else {
            showMessage(data.message || 'Failed to load report', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

// Delete exam
async function deleteExam(examId) {
    if (!confirm('Are you sure you want to delete this exam?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/exams/${examId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Exam deleted successfully', 'success');
            loadExams();
        } else {
            showMessage(data.message || 'Failed to delete exam', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

// Close modal on outside click
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    if (!user || user.role !== 'faculty') {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-name').textContent = `Welcome, ${user.name}`;
    loadExams();
});

