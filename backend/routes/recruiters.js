const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');


const getRecruiter = async (userId) => {
  return db('recruiters').where({ user_id: userId }).first();
};


router.get('/dashboard-stats', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const recruiter = await getRecruiter(req.user.id);
    if (!recruiter) return res.status(404).json({ error: 'Recruiter profile not found.' });

    
    const jobs = await db('jobs').where({ company_id: recruiter.company_id }).select('id');
    const jobIds = jobs.map(j => j.id);

    if (jobIds.length === 0) {
      return res.status(200).json({
        totalApplications: 0,
        shortlistedCandidates: 0,
        selectedCandidates: 0,
        applicationsList: []
      });
    }

    
    const stats = await db('applications')
      .whereIn('job_id', jobIds)
      .select('status')
      .count('* as count')
      .groupBy('status');

    let totalApplications = 0;
    let shortlisted = 0;
    let selected = 0;

    stats.forEach(s => {
      totalApplications += parseInt(s.count);
      if (s.status === 'shortlisted' || s.status === 'interview_scheduled') shortlisted += parseInt(s.count);
      if (s.status === 'selected') selected += parseInt(s.count);
    });

    
    const recentApps = await db('applications')
      .join('students', 'applications.student_id', 'students.id')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .whereIn('applications.job_id', jobIds)
      .select(
        'applications.*',
        'students.name as student_name',
        'students.usn as student_usn',
        'students.branch as student_branch',
        'students.cgpa as student_cgpa',
        'jobs.title as job_title'
      )
      .orderBy('applications.applied_at', 'desc')
      .limit(10);

    return res.status(200).json({
      totalApplications,
      shortlistedCandidates: shortlisted,
      selectedCandidates: selected,
      recentApplications: recentApps
    });
  } catch (error) {
    console.error('Fetch recruiter dashboard stats error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.post('/jobs', authenticate, authorize('recruiter'), async (req, res) => {
  const { title, description, skills, minCgpa, allowedBranches, location, jobType, salary } = req.body;

  if (!title || !description || !skills || !minCgpa || !allowedBranches) {
    return res.status(400).json({ error: 'Please supply all required job details.' });
  }

  try {
    const recruiter = await getRecruiter(req.user.id);
    if (!recruiter) return res.status(404).json({ error: 'Recruiter profile not found.' });

    const requirements = {
      skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()),
      min_cgpa: parseFloat(minCgpa),
      allowed_branches: Array.isArray(allowedBranches) ? allowedBranches : allowedBranches.split(',').map(b => b.trim())
    };

    const [jobId] = await db('jobs').insert({
      company_id: recruiter.company_id,
      title,
      description,
      requirements: JSON.stringify(requirements),
      location: location || 'Remote',
      job_type: jobType || 'full-time',
      salary: salary || 'Not Specified',
      posted_by: recruiter.id
    }).returning('id');

    
    const matchedStudents = await db('students').whereIn('branch', requirements.allowed_branches);
    for (const student of matchedStudents) {
      await db('notifications').insert({
        user_id: student.user_id,
        title: 'New Job Matching Your Profile',
        message: `${recruiter.name} from Google/Microsoft posted a new role: ${title}. Min CGPA: ${minCgpa}. Apply now!`,
        type: 'info'
      });
    }

    
    await db('activity_logs').insert({
      user_id: req.user.id,
      action: 'post_job',
      details: `Recruiter posted new job: ${title} (Job ID: ${jobId})`
    });

    return res.status(201).json({ message: 'Job posting created successfully.', job_id: jobId });
  } catch (error) {
    console.error('Create job posting error:', error);
    return res.status(500).json({ error: 'Failed to create job posting.' });
  }
});


router.get('/jobs', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const recruiter = await getRecruiter(req.user.id);
    if (!recruiter) return res.status(404).json({ error: 'Recruiter profile not found.' });

    const jobs = await db('jobs')
      .where({ company_id: recruiter.company_id })
      .orderBy('created_at', 'desc');

    const result = jobs.map(j => ({
      ...j,
      requirements: JSON.parse(j.requirements || '{}')
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Fetch posted jobs error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.get('/jobs/:id/applicants', authenticate, authorize('recruiter'), async (req, res) => {
  const jobId = req.params.id;

  try {
    const recruiter = await getRecruiter(req.user.id);
    if (!recruiter) return res.status(404).json({ error: 'Recruiter profile not found.' });

    
    const job = await db('jobs').where({ id: jobId, company_id: recruiter.company_id }).first();
    if (!job) return res.status(403).json({ error: 'Unauthorized to view these applicants.' });

    const applicants = await db('applications')
      .join('students', 'applications.student_id', 'students.id')
      .where({ 'applications.job_id': jobId })
      .select(
        'applications.*',
        'students.name as student_name',
        'students.usn as student_usn',
        'students.branch as student_branch',
        'students.cgpa as student_cgpa',
        'students.skills as student_skills',
        'students.certifications as student_certifications',
        'students.projects as student_projects',
        'students.resume_url as student_resume_url'
      )
      .orderBy('applications.match_score', 'desc'); 

    const result = applicants.map(app => ({
      ...app,
      student_skills: JSON.parse(app.student_skills || '[]'),
      student_certifications: JSON.parse(app.student_certifications || '[]'),
      student_projects: JSON.parse(app.student_projects || '[]')
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Fetch job applicants error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.put('/applications/:id/status', authenticate, authorize('recruiter'), async (req, res) => {
  const appId = req.params.id;
  const { status, feedback } = req.body;

  if (!status) return res.status(400).json({ error: 'Please supply a status.' });

  try {
    const recruiter = await getRecruiter(req.user.id);
    if (!recruiter) return res.status(404).json({ error: 'Recruiter profile not found.' });

    
    const app = await db('applications')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .join('students', 'applications.student_id', 'students.id')
      .where({ 'applications.id': appId })
      .select('applications.*', 'jobs.title as job_title', 'jobs.company_id', 'students.user_id as student_user_id', 'students.name as student_name')
      .first();

    if (!app) return res.status(404).json({ error: 'Application not found.' });

    if (app.company_id !== recruiter.company_id) {
      return res.status(403).json({ error: 'Unauthorized to modify this application.' });
    }

    
    await db('applications').where({ id: appId }).update({
      status,
      screening_feedback: feedback || app.screening_feedback,
      updated_at: db.fn.now()
    });

    
    let title = 'Application Status Updated';
    let message = `Your application status for ${app.job_title} has been updated to "${status.replace('_', ' ')}".`;
    
    if (status === 'shortlisted') {
      title = 'Shortlisted for Job Opportunity!';
      message = `Congratulations! You have been shortlisted for ${app.job_title}. Expect an interview schedule soon.`;
    } else if (status === 'selected') {
      title = 'Congratulations! You are Selected!';
      message = `Amazing news! You have been selected for the position of ${app.job_title}. Our HR department will contact you with details.`;
    } else if (status === 'rejected') {
      title = 'Application Update: ' + app.job_title;
      message = `Thank you for applying to ${app.job_title}. We regret to inform you that we are moving forward with other candidates at this time.`;
    }

    await db('notifications').insert({
      user_id: app.student_user_id,
      title,
      message,
      type: status === 'selected' ? 'success' : (status === 'rejected' ? 'alert' : 'info')
    });

    
    console.log(`[EMAIL SEND MOCK] Sending email to student ${app.student_user_id} regarding status "${status}"`);
    console.log(`[SMS SEND MOCK] Sending Twilio SMS to student regarding status "${status}"`);

    
    await db('activity_logs').insert({
      user_id: req.user.id,
      action: `update_application_${status}`,
      details: `Recruiter updated ${app.student_name} status to ${status} for ${app.job_title}`
    });

    return res.status(200).json({ message: 'Candidate status updated successfully.' });
  } catch (error) {
    console.error('Update applicant status error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.post('/interviews', authenticate, authorize('recruiter'), async (req, res) => {
  const { applicationId, scheduledAt, durationMinutes, type, location, notes } = req.body;

  if (!applicationId || !scheduledAt) {
    return res.status(400).json({ error: 'Please supply applicationId and scheduledAt date.' });
  }

  try {
    const recruiter = await getRecruiter(req.user.id);
    if (!recruiter) return res.status(404).json({ error: 'Recruiter profile not found.' });

    
    const app = await db('applications')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .join('students', 'applications.student_id', 'students.id')
      .where({ 'applications.id': applicationId })
      .select('applications.*', 'jobs.title as job_title', 'jobs.company_id', 'students.user_id as student_user_id', 'students.name as student_name')
      .first();

    if (!app) return res.status(404).json({ error: 'Application not found.' });
    if (app.company_id !== recruiter.company_id) {
      return res.status(403).json({ error: 'Unauthorized to schedule interview.' });
    }

    
    const [interviewId] = await db('interviews').insert({
      application_id: applicationId,
      scheduled_at: scheduledAt,
      duration_minutes: parseInt(durationMinutes) || 30,
      type: type || 'technical',
      location: location || 'Online Zoom / Meet',
      notes: notes || ''
    }).returning('id');

    
    await db('applications').where({ id: applicationId }).update({
      status: 'interview_scheduled',
      updated_at: db.fn.now()
    });

    
    const interviewDate = new Date(scheduledAt).toLocaleString();
    await db('notifications').insert({
      user_id: app.student_user_id,
      title: 'Interview Scheduled!',
      message: `An interview of type "${type}" has been scheduled for ${app.job_title} on ${interviewDate}. Venue: ${location}.`,
      type: 'info'
    });

    
    console.log(`[EMAIL SEND MOCK] Sending interview invitation email to student ${app.student_user_id} for ${interviewDate}`);
    console.log(`[SMS SEND MOCK] Sending Twilio SMS: Interview scheduled for ${app.job_title} on ${interviewDate}.`);

    
    await db('activity_logs').insert({
      user_id: req.user.id,
      action: 'schedule_interview',
      details: `Scheduled interview (ID: ${interviewId}) for ${app.student_name} on ${scheduledAt}`
    });

    return res.status(201).json({ message: 'Interview scheduled successfully.', interview_id: interviewId });
  } catch (error) {
    console.error('Schedule interview error:', error);
    return res.status(500).json({ error: 'Failed to schedule interview.' });
  }
});

module.exports = router;
