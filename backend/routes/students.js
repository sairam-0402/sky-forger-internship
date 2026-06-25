const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const aiClient = require('../services/aiClient');


const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `resume_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx' && ext !== '.doc') {
      return cb(new Error('Only PDF or Word documents are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } 
});


const getStudentProfile = async (userId) => {
  return db('students').where({ user_id: userId }).first();
};


router.get('/profile', authenticate, authorize('student'), async (req, res) => {
  try {
    const student = await getStudentProfile(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    
    student.skills = JSON.parse(student.skills || '[]');
    student.certifications = JSON.parse(student.certifications || '[]');
    student.projects = JSON.parse(student.projects || '[]');

    return res.status(200).json(student);
  } catch (error) {
    console.error('Fetch student profile error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.put('/profile', authenticate, authorize('student'), async (req, res) => {
  const { name, usn, branch, cgpa, skills, certifications, projects } = req.body;

  try {
    const student = await getStudentProfile(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    await db('students').where({ id: student.id }).update({
      name: name || student.name,
      usn: usn || student.usn,
      branch: branch || student.branch,
      cgpa: cgpa !== undefined ? parseFloat(cgpa) : student.cgpa,
      skills: skills ? JSON.stringify(skills) : student.skills,
      certifications: certifications ? JSON.stringify(certifications) : student.certifications,
      projects: projects ? JSON.stringify(projects) : student.projects
    });

    await db('activity_logs').insert({
      user_id: req.user.id,
      action: 'update_profile',
      details: 'Student updated profile details.'
    });

    return res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Update student profile error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.post('/resume-upload', authenticate, authorize('student'), upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a file.' });
  }

  const relativePath = path.relative(path.join(__dirname, '..'), req.file.path).replace(/\\/g, '/');

  try {
    const student = await getStudentProfile(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    
    
    const mockResumeText = `Resume of ${student.name}. USN: ${student.usn}. Branch: ${student.branch}. CGPA: ${student.cgpa}. Skills: JavaScript, React, Node.js, Python, CSS, HTML, SQL, Git. Professional experience in frontend react developers.`;

    const parsedResult = await aiClient.parseResume(req.file.path, mockResumeText);

    
    await db('students').where({ id: student.id }).update({
      resume_url: relativePath,
      resume_text: parsedResult.text,
      skills: JSON.stringify(parsedResult.skills || []),
      cgpa: parsedResult.cgpa || student.cgpa,
      branch: parsedResult.branch || student.branch
    });

    await db('activity_logs').insert({
      user_id: req.user.id,
      action: 'upload_resume',
      details: `Student uploaded resume. Extracted ${parsedResult.skills?.length || 0} skills.`
    });

    return res.status(200).json({
      message: 'Resume uploaded and parsed successfully by AI.',
      parsed: {
        skills: parsedResult.skills,
        cgpa: parsedResult.cgpa,
        branch: parsedResult.branch
      }
    });
  } catch (error) {
    console.error('Resume upload/parse error:', error);
    return res.status(500).json({ error: 'Failed to process resume upload. Please try again.' });
  }
});


router.get('/jobs', authenticate, authorize(['student', 'admin']), async (req, res) => {
  const { company, skills, location, jobType, search } = req.query;

  try {
    let query = db('jobs')
      .join('companies', 'jobs.company_id', 'companies.id')
      .where({ 'companies.status': 'approved' })
      .select('jobs.*', 'companies.name as company_name', 'companies.logo_url as company_logo_url');

    
    if (company) {
      query = query.where('companies.name', 'like', `%${company}%`);
    }
    if (location) {
      query = query.where('jobs.location', 'like', `%${location}%`);
    }
    if (jobType) {
      query = query.where({ 'jobs.job_type': jobType });
    }
    if (search) {
      query = query.andWhere(function() {
        this.where('jobs.title', 'like', `%${search}%`)
            .orWhere('jobs.description', 'like', `%${search}%`)
            .orWhere('companies.name', 'like', `%${search}%`);
      });
    }

    const jobs = await query;

    
    let filteredJobs = jobs;
    if (skills) {
      const targetSkills = skills.split(',').map(s => s.trim().toLowerCase());
      filteredJobs = jobs.filter(job => {
        const jobReqs = JSON.parse(job.requirements || '{}');
        const jobSkills = (jobReqs.skills || []).map(s => s.toLowerCase());
        return targetSkills.some(ts => jobSkills.includes(ts));
      });
    }

    
    const result = filteredJobs.map(job => ({
      ...job,
      requirements: JSON.parse(job.requirements || '{}')
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Browse jobs error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.get('/recommended-jobs', authenticate, authorize('student'), async (req, res) => {
  try {
    const student = await getStudentProfile(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    
    const jobs = await db('jobs')
      .join('companies', 'jobs.company_id', 'companies.id')
      .where({ 'companies.status': 'approved' })
      .select('jobs.*', 'companies.name as company_name', 'companies.logo_url as company_logo_url');

    const studentProfile = {
      skills: JSON.parse(student.skills || '[]'),
      cgpa: student.cgpa,
      branch: student.branch,
      resume_text: student.resume_text || student.skills
    };

    
    const recommendations = [];
    for (const job of jobs) {
      const requirements = JSON.parse(job.requirements || '{}');
      const jobData = {
        skills: requirements.skills || [],
        min_cgpa: requirements.min_cgpa,
        allowed_branches: requirements.allowed_branches || [],
        description: job.description
      };

      const match = await aiClient.matchCandidate(studentProfile, jobData);
      
      
      recommendations.push({
        ...job,
        requirements,
        match_score: match.score,
        meets_criteria: match.meets_criteria,
        feedback: match.feedback,
        skills_overlap: match.skills_overlap
      });
    }

    
    recommendations.sort((a, b) => b.match_score - a.match_score);

    return res.status(200).json(recommendations);
  } catch (error) {
    console.error('Get recommended jobs error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.post('/jobs/:id/apply', authenticate, authorize('student'), async (req, res) => {
  const jobId = req.params.id;

  try {
    const student = await getStudentProfile(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    
    const job = await db('jobs').where({ id: jobId }).first();
    if (!job) return res.status(404).json({ error: 'Job posting not found.' });

    
    const existingApp = await db('applications').where({ student_id: student.id, job_id: jobId }).first();
    if (existingApp) {
      return res.status(400).json({ error: 'You have already applied for this job.' });
    }

    
    const studentProfile = {
      skills: JSON.parse(student.skills || '[]'),
      cgpa: student.cgpa,
      branch: student.branch,
      resume_text: student.resume_text || student.skills
    };
    
    const requirements = JSON.parse(job.requirements || '{}');
    const jobData = {
      skills: requirements.skills || [],
      min_cgpa: requirements.min_cgpa,
      allowed_branches: requirements.allowed_branches || [],
      description: job.description
    };

    
    const match = await aiClient.matchCandidate(studentProfile, jobData);

    
    const [appId] = await db('applications').insert({
      student_id: student.id,
      job_id: jobId,
      status: 'applied',
      resume_url: student.resume_url || '',
      match_score: match.score,
      screening_feedback: match.feedback
    }).returning('id');

    
    await db('notifications').insert({
      user_id: req.user.id,
      title: 'Application Submitted',
      message: `Your application for ${job.title} has been submitted successfully. AI Match Score: ${match.score}%.`,
      type: 'success'
    });

    
    if (job.posted_by) {
      const recruiter = await db('recruiters').where({ id: job.posted_by }).first();
      if (recruiter) {
        await db('notifications').insert({
          user_id: recruiter.user_id,
          title: 'New Application Received',
          message: `${student.name} applied for ${job.title}. AI Match Score: ${match.score}%.`,
          type: 'info'
        });
      }
    }

    
    await db('activity_logs').insert({
      user_id: req.user.id,
      action: 'apply_job',
      details: `Student applied for ${job.title}. AI Score: ${match.score}%`
    });

    return res.status(201).json({
      message: 'Application submitted successfully.',
      application_id: appId,
      match_score: match.score
    });
  } catch (error) {
    console.error('Job application error:', error);
    return res.status(500).json({ error: 'Application failed. Please try again.' });
  }
});


router.get('/applications', authenticate, authorize('student'), async (req, res) => {
  try {
    const student = await getStudentProfile(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    const applications = await db('applications')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .join('companies', 'jobs.company_id', 'companies.id')
      .where({ 'applications.student_id': student.id })
      .select(
        'applications.*',
        'jobs.title as job_title',
        'jobs.job_type',
        'jobs.location as job_location',
        'companies.name as company_name',
        'companies.logo_url as company_logo_url'
      )
      .orderBy('applications.applied_at', 'desc');

    
    const result = [];
    for (const app of applications) {
      const interview = await db('interviews').where({ application_id: app.id, status: 'scheduled' }).first();
      result.push({
        ...app,
        interview: interview || null
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Fetch student applications error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.get('/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await db('notifications')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.put('/notifications/read', authenticate, async (req, res) => {
  try {
    await db('notifications').where({ user_id: req.user.id }).update({ is_read: true });
    return res.status(200).json({ message: 'Notifications marked as read.' });
  } catch (error) {
    console.error('Read notifications error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
