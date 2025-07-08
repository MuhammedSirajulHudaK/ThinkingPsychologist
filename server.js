const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize data files
const initializeData = async () => {
    const dataDir = './data';
    await fs.ensureDir(dataDir);
    
    const files = ['users.json', 'problems.json', 'submissions.json', 'contests.json', 'leaderboard.json'];
    
    for (const file of files) {
        const filePath = path.join(dataDir, file);
        if (!await fs.pathExists(filePath)) {
            if (file === 'problems.json') {
                await fs.writeJson(filePath, sampleProblems);
            } else if (file === 'contests.json') {
                await fs.writeJson(filePath, sampleContests);
            } else {
                await fs.writeJson(filePath, []);
            }
        }
    }
};

// Sample problems data
const sampleProblems = [
    {
        id: '1',
        title: 'Two Sum',
        difficulty: 'Easy',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        inputFormat: 'First line contains n (number of elements) and target. Second line contains n integers.',
        outputFormat: 'Two space-separated integers representing indices (0-based).',
        constraints: '2 <= n <= 10^4, -10^9 <= nums[i] <= 10^9',
        sampleInput: '4 9\n2 7 11 15',
        sampleOutput: '0 1',
        tags: ['Array', 'Hash Table'],
        submissions: 1234,
        accuracy: 45.2
    },
    {
        id: '2',
        title: 'Palindrome Number',
        difficulty: 'Easy',
        description: 'Given an integer x, return true if x is palindrome integer.',
        inputFormat: 'A single integer x.',
        outputFormat: 'true or false',
        constraints: '-2^31 <= x <= 2^31 - 1',
        sampleInput: '121',
        sampleOutput: 'true',
        tags: ['Math'],
        submissions: 2456,
        accuracy: 52.8
    },
    {
        id: '3',
        title: 'Longest Common Subsequence',
        difficulty: 'Medium',
        description: 'Given two strings text1 and text2, return the length of their longest common subsequence.',
        inputFormat: 'Two strings text1 and text2.',
        outputFormat: 'An integer representing the length of LCS.',
        constraints: '1 <= text1.length, text2.length <= 1000',
        sampleInput: 'abcde\nace',
        sampleOutput: '3',
        tags: ['Dynamic Programming', 'String'],
        submissions: 987,
        accuracy: 38.7
    },
    {
        id: '4',
        title: 'Binary Tree Maximum Path Sum',
        difficulty: 'Hard',
        description: 'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them.',
        inputFormat: 'Tree nodes in level order format.',
        outputFormat: 'Maximum path sum.',
        constraints: 'Number of nodes is in range [1, 3 * 10^4]',
        sampleInput: '1 2 3',
        sampleOutput: '6',
        tags: ['Tree', 'DFS', 'Binary Tree'],
        submissions: 543,
        accuracy: 24.1
    }
];

const sampleContests = [
    {
        id: '1',
        title: 'Weekly Contest 365',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
        problems: ['1', '2', '3'],
        participants: 1247,
        status: 'upcoming'
    },
    {
        id: '2',
        title: 'Monthly Challenge',
        startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
        problems: ['2', '3', '4'],
        participants: 856,
        status: 'live'
    }
];

// Helper functions
const readJsonFile = async (filename) => {
    try {
        return await fs.readJson(path.join('./data', filename));
    } catch (error) {
        return [];
    }
};

const writeJsonFile = async (filename, data) => {
    await fs.writeJson(path.join('./data', filename), data, { spaces: 2 });
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const users = await readJsonFile('users.json');
        
        if (users.find(u => u.username === username || u.email === email)) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: uuidv4(),
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            solved: 0,
            rating: 1200
        };
        
        users.push(newUser);
        await writeJsonFile('users.json', users);
        
        const token = jwt.sign({ id: newUser.id, username }, JWT_SECRET);
        res.json({ token, user: { id: newUser.id, username, email, solved: 0, rating: 1200 } });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const users = await readJsonFile('users.json');
        
        const user = users.find(u => u.username === username);
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email, 
                solved: user.solved || 0, 
                rating: user.rating || 1200 
            } 
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Problems routes
app.get('/api/problems', async (req, res) => {
    try {
        const problems = await readJsonFile('problems.json');
        res.json(problems);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/problems/:id', async (req, res) => {
    try {
        const problems = await readJsonFile('problems.json');
        const problem = problems.find(p => p.id === req.params.id);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        res.json(problem);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Submissions route
app.post('/api/submit', authenticateToken, async (req, res) => {
    try {
        const { problemId, code, language } = req.body;
        const submissions = await readJsonFile('submissions.json');
        
        // Simulate code execution result
        const verdict = Math.random() > 0.3 ? 'Accepted' : 'Wrong Answer';
        const runtime = Math.floor(Math.random() * 1000) + 100;
        
        const submission = {
            id: uuidv4(),
            userId: req.user.id,
            username: req.user.username,
            problemId,
            code,
            language,
            verdict,
            runtime,
            submittedAt: new Date().toISOString()
        };
        
        submissions.push(submission);
        await writeJsonFile('submissions.json', submissions);
        
        // Update user stats if accepted
        if (verdict === 'Accepted') {
            const users = await readJsonFile('users.json');
            const userIndex = users.findIndex(u => u.id === req.user.id);
            if (userIndex !== -1) {
                users[userIndex].solved = (users[userIndex].solved || 0) + 1;
                users[userIndex].rating = (users[userIndex].rating || 1200) + 10;
                await writeJsonFile('users.json', users);
            }
        }
        
        res.json(submission);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Contests routes
app.get('/api/contests', async (req, res) => {
    try {
        const contests = await readJsonFile('contests.json');
        res.json(contests);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Leaderboard route
app.get('/api/leaderboard', async (req, res) => {
    try {
        const users = await readJsonFile('users.json');
        const leaderboard = users
            .map(u => ({ username: u.username, solved: u.solved || 0, rating: u.rating || 1200 }))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 50);
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// User submissions
app.get('/api/my-submissions', authenticateToken, async (req, res) => {
    try {
        const submissions = await readJsonFile('submissions.json');
        const userSubmissions = submissions
            .filter(s => s.userId === req.user.id)
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        res.json(userSubmissions);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize data and start server
initializeData().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 CodeQuest Platform running on http://localhost:${PORT}`);
    });
});