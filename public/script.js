// Global variables
let currentUser = null;
let allProblems = [];
let currentProblem = null;

// API Base URL
const API_BASE = '/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadProblems();
    loadContests();
    loadLeaderboard();
    
    // Load initial section
    showSection('home');
});

// Authentication functions
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        updateAuthUI();
        loadUserSubmissions();
    }
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const userMenu = document.getElementById('userMenu');
    const username = document.getElementById('username');
    
    if (currentUser) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        userMenu.style.display = 'flex';
        username.textContent = currentUser.username;
    } else {
        loginBtn.style.display = 'block';
        signupBtn.style.display = 'block';
        userMenu.style.display = 'none';
    }
}

async function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            updateAuthUI();
            closeLoginModal();
            loadUserSubmissions();
            showNotification('Login successful!', 'success');
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function signup(event) {
    event.preventDefault();
    
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            updateAuthUI();
            closeSignupModal();
            loadUserSubmissions();
            showNotification('Account created successfully!', 'success');
        } else {
            showNotification(data.error || 'Signup failed', 'error');
        }
    } catch (error) {
        showNotification('Signup failed. Please try again.', 'error');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    updateAuthUI();
    showSection('home');
    showNotification('Logged out successfully!', 'success');
}

// Navigation functions
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Update navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Find and activate the corresponding nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.textContent.toLowerCase().includes(sectionName) || 
            (sectionName === 'home' && link.textContent.toLowerCase() === 'home')) {
            link.classList.add('active');
        }
    });
    
    // Load section-specific data
    if (sectionName === 'submissions' && currentUser) {
        loadUserSubmissions();
    }
}

// Problem functions
async function loadProblems() {
    try {
        const response = await fetch(`${API_BASE}/problems`);
        const problems = await response.json();
        allProblems = problems;
        displayProblems(problems);
    } catch (error) {
        showNotification('Failed to load problems', 'error');
    }
}

function displayProblems(problems) {
    const problemsList = document.getElementById('problemsList');
    problemsList.innerHTML = '';
    
    problems.forEach(problem => {
        const problemCard = document.createElement('div');
        problemCard.className = 'problem-card';
        problemCard.onclick = () => openProblem(problem.id);
        
        problemCard.innerHTML = `
            <div class="problem-header">
                <h3 class="problem-title">${problem.title}</h3>
                <span class="difficulty ${problem.difficulty}">${problem.difficulty}</span>
            </div>
            <div class="problem-stats">
                <span><i class="fas fa-users"></i> ${problem.submissions}</span>
                <span><i class="fas fa-check-circle"></i> ${problem.accuracy}%</span>
            </div>
            <div class="problem-tags">
                ${problem.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;
        
        problemsList.appendChild(problemCard);
    });
}

function filterProblems() {
    const difficultyFilter = document.getElementById('difficultyFilter').value;
    const searchTerm = document.getElementById('searchProblems').value.toLowerCase();
    
    let filteredProblems = allProblems;
    
    if (difficultyFilter) {
        filteredProblems = filteredProblems.filter(p => p.difficulty === difficultyFilter);
    }
    
    if (searchTerm) {
        filteredProblems = filteredProblems.filter(p => 
            p.title.toLowerCase().includes(searchTerm) ||
            p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    
    displayProblems(filteredProblems);
}

async function openProblem(problemId) {
    try {
        const response = await fetch(`${API_BASE}/problems/${problemId}`);
        const problem = await response.json();
        currentProblem = problem;
        
        const problemContent = document.getElementById('problemContent');
        problemContent.innerHTML = `
            <h3>${problem.title}</h3>
            <div class="problem-meta">
                <span class="difficulty ${problem.difficulty}">${problem.difficulty}</span>
                <div class="problem-tags">
                    ${problem.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            
            <h4>Problem Description</h4>
            <p>${problem.description}</p>
            
            <h4>Input Format</h4>
            <p>${problem.inputFormat}</p>
            
            <h4>Output Format</h4>
            <p>${problem.outputFormat}</p>
            
            <h4>Constraints</h4>
            <p>${problem.constraints}</p>
            
            <h4>Sample Input</h4>
            <pre>${problem.sampleInput}</pre>
            
            <h4>Sample Output</h4>
            <pre>${problem.sampleOutput}</pre>
        `;
        
        // Clear the code editor
        document.getElementById('codeTextarea').value = '';
        document.getElementById('submissionResult').innerHTML = '';
        
        document.getElementById('problemModal').style.display = 'block';
    } catch (error) {
        showNotification('Failed to load problem details', 'error');
    }
}

function closeProblemModal() {
    document.getElementById('problemModal').style.display = 'none';
    currentProblem = null;
}

async function submitSolution() {
    if (!currentUser) {
        showNotification('Please login to submit solutions', 'error');
        return;
    }
    
    if (!currentProblem) {
        showNotification('No problem selected', 'error');
        return;
    }
    
    const code = document.getElementById('codeTextarea').value.trim();
    const language = document.getElementById('languageSelect').value;
    
    if (!code) {
        showNotification('Please write some code before submitting', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('submitCode');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                problemId: currentProblem.id,
                code,
                language
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            const resultDiv = document.getElementById('submissionResult');
            const isAccepted = result.verdict === 'Accepted';
            
            resultDiv.className = `submission-result ${isAccepted ? 'success' : 'error'}`;
            resultDiv.innerHTML = `
                <strong>Verdict:</strong> ${result.verdict}<br>
                <strong>Runtime:</strong> ${result.runtime}ms<br>
                <strong>Language:</strong> ${language}
            `;
            
            if (isAccepted) {
                showNotification('Solution accepted! 🎉', 'success');
                // Update user stats
                if (currentUser) {
                    currentUser.solved = (currentUser.solved || 0) + 1;
                    currentUser.rating = (currentUser.rating || 1200) + 10;
                    localStorage.setItem('user', JSON.stringify(currentUser));
                }
            } else {
                showNotification('Solution incorrect. Try again!', 'error');
            }
            
            loadUserSubmissions();
        } else {
            showNotification(result.error || 'Submission failed', 'error');
        }
    } catch (error) {
        showNotification('Submission failed. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Contest functions
async function loadContests() {
    try {
        const response = await fetch(`${API_BASE}/contests`);
        const contests = await response.json();
        displayContests(contests);
    } catch (error) {
        showNotification('Failed to load contests', 'error');
    }
}

function displayContests(contests) {
    const contestsList = document.getElementById('contestsList');
    contestsList.innerHTML = '';
    
    contests.forEach(contest => {
        const contestCard = document.createElement('div');
        contestCard.className = 'contest-card';
        
        const startTime = new Date(contest.startTime);
        const endTime = new Date(contest.endTime);
        const now = new Date();
        
        let status = 'upcoming';
        if (now >= startTime && now <= endTime) {
            status = 'live';
        } else if (now > endTime) {
            status = 'ended';
        }
        
        contestCard.innerHTML = `
            <span class="contest-status ${status}">${status.toUpperCase()}</span>
            <h3 class="contest-title">${contest.title}</h3>
            <div class="contest-time">
                <strong>Start:</strong> ${startTime.toLocaleString()}<br>
                <strong>End:</strong> ${endTime.toLocaleString()}
            </div>
            <div class="contest-participants">
                <i class="fas fa-users"></i> ${contest.participants} participants
            </div>
        `;
        
        contestsList.appendChild(contestCard);
    });
}

// Leaderboard functions
async function loadLeaderboard() {
    try {
        const response = await fetch(`${API_BASE}/leaderboard`);
        const leaderboard = await response.json();
        displayLeaderboard(leaderboard);
    } catch (error) {
        showNotification('Failed to load leaderboard', 'error');
    }
}

function displayLeaderboard(leaderboard) {
    const leaderboardBody = document.getElementById('leaderboardBody');
    leaderboardBody.innerHTML = '';
    
    leaderboard.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.username}</td>
            <td>${user.solved}</td>
            <td>${user.rating}</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

// User submissions functions
async function loadUserSubmissions() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/my-submissions`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const submissions = await response.json();
        displayUserSubmissions(submissions);
    } catch (error) {
        showNotification('Failed to load submissions', 'error');
    }
}

function displayUserSubmissions(submissions) {
    const submissionsList = document.getElementById('submissionsList');
    
    if (submissions.length === 0) {
        submissionsList.innerHTML = '<p>No submissions yet. Start solving problems!</p>';
        return;
    }
    
    submissionsList.innerHTML = '';
    
    submissions.forEach(submission => {
        const submissionCard = document.createElement('div');
        submissionCard.className = 'submission-card';
        
        const submitTime = new Date(submission.submittedAt).toLocaleString();
        const verdictClass = submission.verdict === 'Accepted' ? 'Accepted' : 'Wrong';
        
        submissionCard.innerHTML = `
            <div>
                <strong>Problem:</strong> ${allProblems.find(p => p.id === submission.problemId)?.title || 'Unknown'}
            </div>
            <div class="submission-verdict ${verdictClass}">
                ${submission.verdict}
            </div>
            <div>
                <strong>Language:</strong> ${submission.language}
            </div>
            <div>
                <strong>Time:</strong> ${submitTime}
            </div>
        `;
        
        submissionsList.appendChild(submissionCard);
    });
}

// Modal functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('loginForm').reset();
}

function showSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
    document.getElementById('signupForm').reset();
}

// Notification function
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 3000;
        transition: all 0.3s ease;
        ${type === 'success' ? 'background: #10b981;' : 'background: #ef4444;'}
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const problemModal = document.getElementById('problemModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === signupModal) {
        closeSignupModal();
    }
    if (event.target === problemModal) {
        closeProblemModal();
    }
});

// Add some sample template code for different languages
const codeTemplates = {
    python: `def solution():
    # Write your code here
    pass

if __name__ == "__main__":
    solution()`,
    
    java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your code here
    }
}`,
    
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`,
    
    javascript: `function solution() {
    // Write your code here
}

solution();`
};

// Update code template when language changes
document.getElementById('languageSelect').addEventListener('change', function() {
    const language = this.value;
    const codeTextarea = document.getElementById('codeTextarea');
    
    if (codeTextarea.value.trim() === '' || confirm('Replace current code with template?')) {
        codeTextarea.value = codeTemplates[language] || '';
    }
});