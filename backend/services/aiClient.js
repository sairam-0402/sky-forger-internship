const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';


function localParseFallback(filePath, fileContentText = "") {
  console.warn("AI Service offline. Using Node.js fallback resume parser.");
  
  const text = fileContentText || "Parsed Resume Content. Skills: React, Node.js, Python, Javascript, SQL. CGPA: 8.5. Branch: Computer Science.";
  
  
  let cgpa = null;
  const cgpaMatch = text.match(/(?:cgpa|gpa)\s*(?:of|is|:)?\s*([0-9]\.[0-9]{1,2})/i);
  if (cgpaMatch) {
    cgpa = parseFloat(cgpaMatch[1]);
  } else {
    const rawMatch = text.match(/\b([6-9]\.[0-9]{2})\b/);
    if (rawMatch) cgpa = parseFloat(rawMatch[1]);
  }

  
  let branch = 'Computer Science';
  if (text.toLowerCase().includes('ece') || text.toLowerCase().includes('electronics')) {
    branch = 'Electronics & Communication';
  } else if (text.toLowerCase().includes('mech') || text.toLowerCase().includes('mechanical')) {
    branch = 'Mechanical Engineering';
  } else if (text.toLowerCase().includes('eee') || text.toLowerCase().includes('electrical')) {
    branch = 'Electrical & Electronics';
  } else if (text.toLowerCase().includes('civil') || text.toLowerCase().includes('cv')) {
    branch = 'Civil Engineering';
  }

  
  const SKILL_LIBRARY = [
    "python", "javascript", "typescript", "java", "c++", "c#", "react", "angular", "vue", "next.js",
    "node.js", "express", "django", "flask", "postgresql", "mysql", "mongodb", "sqlite",
    "aws", "docker", "kubernetes", "git", "github", "machine learning", "deep learning", "nlp", "scikit-learn"
  ];
  
  const textLower = text.toLowerCase();
  const skills = SKILL_LIBRARY.filter(skill => {
    const regex = new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i');
    return regex.test(textLower);
  });

  return {
    text,
    skills,
    cgpa: cgpa || 8.0, 
    branch
  };
}


function localMatchFallback(student, job) {
  console.warn("AI Service offline. Using Node.js fallback matcher.");
  
  const stdSkills = (student.skills || []).map(s => s.toLowerCase());
  const jobRequirements = typeof job.requirements === 'string' ? JSON.parse(job.requirements) : job.requirements;
  const jobSkills = (jobRequirements.skills || []).map(s => s.toLowerCase());
  
  
  const allowedBranches = jobRequirements.allowed_branches || [];
  const stdBranch = student.branch || "Unknown";
  let branchPass = true;
  if (allowedBranches.length > 0) {
    branchPass = allowedBranches.some(b => b.toLowerCase().includes(stdBranch.toLowerCase()) || stdBranch.toLowerCase().includes(b.toLowerCase()));
  }

  
  const minCgpa = jobRequirements.min_cgpa;
  const stdCgpa = student.cgpa;
  let cgpaPass = true;
  if (minCgpa !== undefined && stdCgpa !== undefined) {
    cgpaPass = parseFloat(stdCgpa) >= parseFloat(minCgpa);
  }

  
  const overlap = stdSkills.filter(s => jobSkills.includes(s));
  const skillMatchRatio = jobSkills.length > 0 ? overlap.length / jobSkills.length : 0;

  
  let baseScore = skillMatchRatio * 100;
  if (baseScore === 0) {
    
    const words = (student.resume_text || "").toLowerCase().split(/\W+/);
    const jobWords = (job.description || "").toLowerCase().split(/\W+/);
    const overlapWords = words.filter(w => w.length > 4 && jobWords.includes(w));
    baseScore = Math.min(80, (overlapWords.length / Math.max(1, jobWords.length)) * 300);
  }

  let finalScore = baseScore;
  const feedback = [];
  const meetsCriteria = branchPass && cgpaPass;

  if (!cgpaPass) {
    finalScore *= 0.5;
    feedback.push(`CGPA (${stdCgpa}) is below minimum requirement (${minCgpa}).`);
  }
  if (!branchPass) {
    finalScore *= 0.4;
    feedback.push(`Branch (${stdBranch}) is not in the allowed list: ${allowedBranches.join(', ')}.`);
  }

  if (meetsCriteria) {
    feedback.push("Meets all minimum eligibility criteria (CGPA and branch).");
    if (skillMatchRatio > 0.7) {
      feedback.push("Excellent matching skill set!");
    } else {
      feedback.push("Good skills overlap, matches core requirements.");
    }
  } else {
    feedback.push("Does not meet minimum requirements for this position.");
  }

  return {
    score: Math.round(Math.max(10, Math.min(98, finalScore)) * 10) / 10,
    meets_criteria: meetsCriteria,
    skills_overlap: overlap,
    missing_skills: jobSkills.filter(s => !stdSkills.includes(s)),
    feedback: feedback.join(" ")
  };
}

module.exports = {
  parseResume: async (filePath, originalText = "") => {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/parse`, { file_path: filePath }, { timeout: 4000 });
      return response.data;
    } catch (error) {
      console.error("Failed to connect to Python AI Parser:", error.message);
      return localParseFallback(filePath, originalText);
    }
  },

  matchCandidate: async (studentProfile, jobRequirements) => {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/match`, {
        student: studentProfile,
        job: jobRequirements
      }, { timeout: 4000 });
      return response.data;
    } catch (error) {
      console.error("Failed to connect to Python AI Matcher:", error.message);
      return localMatchFallback(studentProfile, jobRequirements);
    }
  }
};
