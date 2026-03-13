const API_BASE = 'http://localhost:3000/api';
let currentExam = null;
let currentQuestions = [];
let timerInterval = null;
let timeRemaining = 0;

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
        container.innerHTML = '<p>No exams available at the moment.</p>';
        return;
    }

    container.innerHTML = exams.map(exam => {
        const now = new Date();
        const startTime = new Date(exam.startTime);
        const endTime = new Date(exam.endTime);
        
        let status = 'completed';
        let statusClass = 'status-completed';
        let statusText = 'Completed';
        let actionButton = '';
        
        if (now < startTime) {
            status = 'upcoming';
            statusClass = 'status-upcoming';
            statusText = 'Upcoming';
            actionButton = '<button class="btn btn-secondary" disabled>Not Started</button>';
        } else if (now >= startTime && now <= endTime) {
            status = 'active';
            statusClass = 'status-active';
            statusText = 'Active';
            actionButton = `<button class="btn btn-primary" onclick="startExam('${exam._id}')">Start Exam</button>`;
        } else {
            actionButton = '<button class="btn btn-secondary" disabled>Exam Ended</button>';
        }

        return `
            <div class="exam-card">
                <h3>${exam.title}</h3>
                <div class="exam-info">Duration: ${exam.duration} minutes</div>
                <div class="exam-info">Start: ${startTime.toLocaleString()}</div>
                <div class="exam-info">End: ${endTime.toLocaleString()}</div>
                <div class="exam-info">Total Marks: ${exam.totalMarks}</div>
                <div class="exam-info">Faculty: ${exam.facultyId.name}</div>
                <span class="exam-status ${statusClass}">${statusText}</span>
                <div class="exam-actions">
                    ${actionButton}
                </div>
            </div>
        `;
    }).join('');
}

// Start exam
async function startExam(examId) {
    try {
        // Get exam details
        const examResponse = await fetch(`${API_BASE}/exams/${examId}`, {
            headers: getAuthHeaders()
        });
        currentExam = await examResponse.json();

        // Get questions
        const questionsResponse = await fetch(`${API_BASE}/questions/exam/${examId}`, {
            headers: getAuthHeaders()
        });

        if (!questionsResponse.ok) {
            const error = await questionsResponse.json();
            showMessage(error.message || 'Cannot start exam', 'error');
            return;
        }

        currentQuestions = await questionsResponse.json();

        if (currentQuestions.length === 0) {
            showMessage('No questions available for this exam', 'error');
            return;
        }

        // Calculate time remaining
        const now = new Date();
        const endTime = new Date(currentExam.endTime);
        timeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));

        // Display exam
        displayExam();
        startTimer();
    } catch (error) {
        showMessage('Error starting exam', 'error');
    }
}

// Display exam
function displayExam() {
    document.getElementById('exam-title-attempt').textContent = currentExam.title;
    
    const container = document.getElementById('questions-container');
    container.innerHTML = currentQuestions.map((q, index) => `
        <div class="question-item">
            <h4>Question ${index + 1}: ${q.questionText}</h4>
            <label class="question-option">
                <input type="radio" name="question-${q._id}" value="A">
                A. ${q.options.A}
            </label>
            <label class="question-option">
                <input type="radio" name="question-${q._id}" value="B">
                B. ${q.options.B}
            </label>
            <label class="question-option">
                <input type="radio" name="question-${q._id}" value="C">
                C. ${q.options.C}
            </label>
            <label class="question-option">
                <input type="radio" name="question-${q._id}" value="D">
                D. ${q.options.D}
            </label>
        </div>
    `).join('');

    // Add click handlers for options
    document.querySelectorAll('.question-option').forEach(option => {
        option.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.question-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });

    document.getElementById('exam-attempt-modal').style.display = 'block';
}

// Start timer
function startTimer() {
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            showMessage('Time is up! Submitting exam...', 'error');
            submitExam();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('timer').textContent = timeString;
}

// Submit exam
async function submitExam() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // Collect responses
    const responses = currentQuestions.map(q => {
        const selected = document.querySelector(`input[name="question-${q._id}"]:checked`);
        return {
            questionId: q._id,
            selected: selected ? selected.value : ''
        };
    });

    try {
        const response = await fetch(`${API_BASE}/submissions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                examId: currentExam._id,
                responses
            })
        });

        const data = await response.json();

        if (response.ok) {
            closeModal('exam-attempt-modal');
            showResults(data.submission.submissionId);
        } else {
            showMessage(data.message || 'Failed to submit exam', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

// Show results
async function showResults(submissionId) {
    try {
        const response = await fetch(`${API_BASE}/submissions/${submissionId}/details`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            const resultsContent = document.getElementById('results-content');
            const percentage = ((data.submission.score / data.submission.totalQuestions) * 100).toFixed(1);

            resultsContent.innerHTML = `
                <div class="result-summary">
                    <h3>${data.submission.exam.title}</h3>
                    <div class="score-display">${data.submission.score}/${data.submission.totalQuestions}</div>
                    <p>Percentage: ${percentage}%</p>
                    <p>Submitted at: ${new Date(data.submission.submittedAt).toLocaleString()}</p>
                </div>
                <h4>Question-wise Results:</h4>
                ${data.responses.map((r, index) => `
                    <div class="result-item ${r.isCorrect ? 'correct' : 'incorrect'}">
                        <strong>Question ${index + 1}:</strong> ${r.questionText}
                        <div class="result-answer">
                            Your Answer: ${r.selected || 'Not answered'} 
                            ${r.isCorrect ? '✓ Correct' : `✗ Incorrect (Correct: ${r.correct})`}
                        </div>
                    </div>
                `).join('')}
            `;

            document.getElementById('results-modal').style.display = 'block';
            loadExams(); // Refresh exam list
        } else {
            showMessage('Failed to load results', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

// Show my results
async function showMyResults() {
    const user = getUser();
    try {
        const response = await fetch(`${API_BASE}/submissions/user/${user.userId}`, {
            headers: getAuthHeaders()
        });

        const submissions = await response.json();

        const resultsContent = document.getElementById('my-results-content');
        
        if (submissions.length === 0) {
            resultsContent.innerHTML = '<p>No submissions yet.</p>';
        } else {
            resultsContent.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Exam Title</th>
                            <th>Score</th>
                            <th>Submitted At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${submissions.map(s => `
                            <tr>
                                <td>${s.examId.title}</td>
                                <td>${s.score}/${s.examId.totalMarks}</td>
                                <td>${new Date(s.submittedAt).toLocaleString()}</td>
                                <td>
                                    <button class="btn btn-primary" onclick="viewSubmissionDetails('${s.submissionId}')">
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        document.getElementById('my-results-modal').style.display = 'block';
    } catch (error) {
        showMessage('Error loading results', 'error');
    }
}

// View submission details
async function viewSubmissionDetails(submissionId) {
    closeModal('my-results-modal');
    await showResults(submissionId);
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

// Close modal on outside click
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        }
    });
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    if (!user || user.role !== 'student') {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-name').textContent = `Welcome, ${user.name}`;
    loadExams();
});

