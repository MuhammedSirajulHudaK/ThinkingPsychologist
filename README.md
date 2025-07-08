# CodeQuest - Competitive Programming Platform

A modern, full-featured competitive programming platform similar to HackerEarth, built with Node.js and Express for the backend and vanilla JavaScript for the frontend.

## 🚀 Features

### 🎯 Core Features
- **Problem Solving**: Browse and solve coding problems with varying difficulty levels
- **Online IDE**: Built-in code editor with syntax highlighting for multiple languages
- **Real-time Submission**: Submit solutions and get instant feedback
- **User Authentication**: Secure login/signup system with JWT tokens
- **Contest System**: Participate in coding contests with live leaderboards
- **Global Leaderboard**: Track your ranking against other users
- **Personal Dashboard**: View your submission history and progress

### 💻 Programming Languages Supported
- Python
- Java
- C++
- JavaScript

### � Problem Categories
- Easy, Medium, Hard difficulty levels
- Various topics: Arrays, Dynamic Programming, Trees, Math, Strings, etc.
- Sample problems include Two Sum, Palindrome Number, Longest Common Subsequence, and more

## 🛠️ Technology Stack

**Backend:**
- Node.js with Express.js
- JWT for authentication
- bcryptjs for password hashing
- JSON file-based data storage (easily replaceable with a database)

**Frontend:**
- Vanilla HTML5, CSS3, JavaScript
- Font Awesome icons
- Google Fonts (Inter)
- Responsive design with CSS Grid and Flexbox

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## 🚀 Quick Start

1. **Clone/Download the project** (if you don't already have it)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access the platform:**
   Open your browser and navigate to: `http://localhost:3000`

## 📁 Project Structure

```
codequest-platform/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styling
│   └── script.js          # JavaScript functionality
├── data/                  # JSON data files (auto-generated)
│   ├── users.json         # User accounts
│   ├── problems.json      # Problem definitions
│   ├── submissions.json   # User submissions
│   └── contests.json      # Contest information
├── server.js              # Main server file
├── package.json           # Node.js dependencies
└── README.md             # This file
```

## 🎮 How to Use

### For Users:

1. **Registration/Login:**
   - Click "Sign Up" to create a new account
   - Or "Login" if you already have an account
   - Use any username/email/password combination

2. **Solving Problems:**
   - Navigate to "Problems" section
   - Filter by difficulty or search for specific topics
   - Click on any problem to open it in the IDE
   - Write your solution in the code editor
   - Select your preferred programming language
   - Click "Submit" to test your solution

3. **Viewing Results:**
   - Get instant feedback on your submission
   - Check "My Submissions" to see your history
   - Track your progress on the leaderboard

4. **Contests:**
   - View upcoming and live contests
   - Participate when contests are active
   - Compete with other users

### Sample User Credentials:
Since this is a demo, you can create any account you want. Here's an example:
- Username: `coder123`
- Email: `coder@example.com`
- Password: `password123`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get specific problem
- `POST /api/submit` - Submit solution (requires auth)

### Data
- `GET /api/contests` - Get all contests
- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/my-submissions` - Get user submissions (requires auth)

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with smooth animations
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Modern color scheme with good contrast
- **Interactive Elements**: Hover effects, smooth transitions, and intuitive navigation
- **Real-time Feedback**: Instant notifications for user actions

## 🔍 Problem Examples

The platform comes with 4 sample problems:

1. **Two Sum** (Easy) - Array manipulation
2. **Palindrome Number** (Easy) - Mathematical problem
3. **Longest Common Subsequence** (Medium) - Dynamic programming
4. **Binary Tree Maximum Path Sum** (Hard) - Tree algorithms

## 🎯 Future Enhancements

Potential features that could be added:
- Database integration (MongoDB, PostgreSQL)
- Advanced code editor (Monaco Editor integration)
- Real code execution and testing
- Discussion forums
- Company hiring challenges
- More programming languages
- Code plagiarism detection
- Advanced analytics and insights

## � Troubleshooting

**Server won't start:**
- Make sure Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check if port 3000 is available

**Can't submit solutions:**
- Ensure you're logged in
- Check browser console for errors
- Verify server is running

**Data not loading:**
- Check server console for errors
- Ensure `data/` directory exists
- Restart the server

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📞 Support

For issues or questions, please check the troubleshooting section or create an issue in the project repository.

---

**Happy Coding! 🎉**

Start your competitive programming journey with CodeQuest!

