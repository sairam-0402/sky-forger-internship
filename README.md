# sky-forger-internship
HOW TO RUN: COLLEGE INTERNSHIP & PLACEMENT MANAGEMENT PORTAL ("SKY")
<br>This project is a multi-tier web application designed to manage college placements and
internships. It features an automated resume-parsing and job-matching AI system.
The application consists of three main components:
1. FRONTEND APP : React + Vite + TailwindCSS (Runs on Port 5173)
2. BACKEND API : Node.js + Express + Knex + SQLite (Runs on Port 3001)
3. AI SERVICE : Python + Flask + spaCy + NLP parsing (Runs on Port 5000)
PREREQUISITES
Before you start, make sure you have the following installed on your machine:
- Node.js (v18 or higher) & npm
- Python (3.8 or higher)
- pip and virtualenv tools
STEP 1: RUN THE AI SERVICE (PYTHON / FLASK)
The AI service handles parsing resumes (PDF/DOCX) using spaCy NLP and matching student
skills/CGPA against job requirements.
1. Open a terminal and navigate to the project root directory.
2. Activate the existing Python virtual environment (`venv` folder in the root directory):
 - On Windows (PowerShell):
 .\venv\Scripts\Activate.ps1
 - On Windows (Command Prompt):
 .\venv\Scripts\activate.bat
 - On macOS/Linux:
 source venv/bin/activate

3. Navigate into the `ai_service` directory:
 cd ai_service
4. If dependencies are not already installed, install them using:
 pip install flask spacy pypdf python-docx
 python -m spacy download en_core_web_sm
5. Start the AI service:
 python app.py

 * The AI service will start running on http://localhost:5000.
STEP 2: RUN THE BACKEND API (NODE.JS / EXPRESS)
The backend API handles authentication, student profiles, job postings, recruiter accounts,
application status, and database persistence.
1. Open a new terminal window/tab and navigate to the `backend` directory:
 cd backend
2. Install dependencies: npm install
3. Verify or configure environment variables in `backend/.env`. (Default values are preconfigured):
 PORT=3001
 JWT_SECRET=super_secret_college_key
 NODE_ENV=development
 AI_SERVICE_URL=http://localhost:5000
4. Run the backend server:
 npm run dev

 * The backend server will start on http://localhost:3001.
 * NOTE: The server checks the SQLite database on startup. If the database is empty/new, it
will automatically run migrations and seeds (`seed_data.js`) to populate the system with test
companies, jobs, student profiles, and users.
STEP 3: RUN THE FRONTEND APP (REACT / VITE)
The frontend provides interactive, premium dashboards for Students, Recruiters, and Admins.
1. Open a new terminal window/tab and navigate to the root directory of the project.
2. Install dependencies:
 npm install
3. Start the Vite development server:
 npm run dev
4. Open your browser and navigate to http://localhost:5173.
DEMO ACCOUNTS & LOGIN CREDENTIALS
For testing and demonstration, use the following pre-seeded credentials.
The password for ALL accounts listed below is: password123
1. ADMIN ACCOUNT
 - Email: admin@college.edu
 - Role: System management, dashboard analytics, approving companies.
2. RECRUITER ACCOUNTS
 - Email: recruiter.john@google.com (Google)
 - Email: recruiter.sarah@microsoft.com (Microsoft)
 - Email: recruiter.vijay@infosys.com (Infosys)
 - Role: Posting jobs, viewing applications, shortlisting candidates, scheduling interviews.
3. STUDENT ACCOUNTS
 - Email: student.amit@college.edu (Computer Science - CGPA: 9.25)
 - Email: student.priya@college.edu (Electronics & Communication - CGPA: 8.80)
 - Email: student.rahul@college.edu (Mechanical Engineering - CGPA: 7.90)
 - Role: Viewing jobs, upload/parsing resume, checking application status and scheduled
interviews.
