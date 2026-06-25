const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');


router.post('/register-student', async (req, res) => {
  const { email, password, name, usn, branch, cgpa, skills } = req.body;

  if (!email || !password || !name || !usn || !branch) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  const trx = await db.transaction();
  try {
    
    const existingUser = await trx('users').where({ email }).first();
    if (existingUser) {
      await trx.rollback();
      return res.status(400).json({ error: 'Email already registered.' });
    }

    
    const existingStudent = await trx('students').where({ usn }).first();
    if (existingStudent) {
      await trx.rollback();
      return res.status(400).json({ error: 'USN already registered.' });
    }

    
    const passwordHash = await bcrypt.hash(password, 10);

    
    const [userId] = await trx('users').insert({
      email,
      password_hash: passwordHash,
      role: 'student'
    }).returning('id');

    
    await trx('students').insert({
      user_id: userId,
      name,
      usn,
      branch,
      cgpa: cgpa || 0.0,
      skills: JSON.stringify(skills || []),
      resume_url: '',
      resume_text: '',
      certifications: JSON.stringify([]),
      projects: JSON.stringify([])
    });

    
    await trx('activity_logs').insert({
      user_id: userId,
      action: 'register_student',
      details: `Student registered: ${name} (${usn})`
    });

    await trx.commit();
    return res.status(201).json({ message: 'Student registered successfully. Please login.' });
  } catch (error) {
    await trx.rollback();
    console.error('Student registration error:', error);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});


router.post('/register-recruiter', async (req, res) => {
  const { email, password, name, phone, companyName, companyWebsite } = req.body;

  if (!email || !password || !name || !companyName) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  const trx = await db.transaction();
  try {
    
    const existingUser = await trx('users').where({ email }).first();
    if (existingUser) {
      await trx.rollback();
      return res.status(400).json({ error: 'Email already registered.' });
    }

    
    let company = await trx('companies').whereRaw('LOWER(name) = ?', [companyName.toLowerCase()]).first();
    if (!company) {
      const [newCompanyId] = await trx('companies').insert({
        name: companyName,
        website: companyWebsite || '',
        status: 'pending' 
      }).returning('id');
      
      company = { id: newCompanyId, name: companyName, status: 'pending' };
    }

    
    const passwordHash = await bcrypt.hash(password, 10);

    
    const [userId] = await trx('users').insert({
      email,
      password_hash: passwordHash,
      role: 'recruiter'
    }).returning('id');

    
    await trx('recruiters').insert({
      user_id: userId,
      company_id: company.id,
      name,
      phone: phone || ''
    });

    
    await trx('activity_logs').insert({
      user_id: userId,
      action: 'register_recruiter',
      details: `Recruiter registered: ${name} for ${company.name}`
    });

    await trx.commit();
    
    return res.status(201).json({
      message: company.status === 'pending'
        ? 'Registration successful. Waiting for admin approval of company: ' + company.name
        : 'Registration successful. Please login.'
    });
  } catch (error) {
    await trx.rollback();
    console.error('Recruiter registration error:', error);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please supply email and password.' });
  }

  try {
    
    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    
    let profile = null;
    if (user.role === 'student') {
      profile = await db('students').where({ user_id: user.id }).first();
    } else if (user.role === 'recruiter') {
      profile = await db('recruiters')
        .join('companies', 'recruiters.company_id', 'companies.id')
        .where({ 'recruiters.user_id': user.id })
        .select('recruiters.*', 'companies.name as company_name', 'companies.status as company_status')
        .first();

      
      if (profile && profile.company_status === 'pending') {
        return res.status(403).json({
          error: 'Your company registration is pending approval by the Placement Officer.'
        });
      } else if (profile && profile.company_status === 'rejected') {
        return res.status(403).json({
          error: 'Your company registration has been rejected.'
        });
      }
    } else if (user.role === 'admin') {
      profile = { name: 'Placement Officer', admin: true };
    }

    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    
    await db('activity_logs').insert({
      user_id: user.id,
      action: 'login',
      details: `User logged in: ${user.email}`
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.get('/me', authenticate, async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'student') {
      profile = await db('students').where({ user_id: req.user.id }).first();
    } else if (req.user.role === 'recruiter') {
      profile = await db('recruiters')
        .join('companies', 'recruiters.company_id', 'companies.id')
        .where({ 'recruiters.user_id': req.user.id })
        .select('recruiters.*', 'companies.name as company_name', 'companies.status as company_status')
        .first();
    } else if (req.user.role === 'admin') {
      profile = { name: 'Placement Officer', admin: true };
    }

    return res.status(200).json({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      profile
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Please supply email.' });

  try {
    const user = await db('users').where({ email }).first();
    if (!user) {
      
      return res.status(200).json({ message: 'If this email exists, a password reset link has been sent.' });
    }

    
    const resetToken = jwt.sign({ id: user.id, action: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
    console.log(`[PASSWORD RESET MOCK] Email: ${email}, Link: http://localhost:5173/reset-password?token=${resetToken}`);
    
    
    await db('activity_logs').insert({
      user_id: user.id,
      action: 'forgot_password',
      details: `Password reset request triggered for ${email}`
    });

    return res.status(200).json({
      message: 'If this email exists, a password reset link has been sent.',
      resetToken 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Missing token or password.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.action !== 'reset') {
      return res.status(400).json({ error: 'Invalid reset token.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db('users').where({ id: decoded.id }).update({ password_hash: passwordHash });

    await db('activity_logs').insert({
      user_id: decoded.id,
      action: 'reset_password',
      details: 'Password was reset successfully'
    });

    return res.status(200).json({ message: 'Password updated successfully. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(400).json({ error: 'Invalid or expired password reset link.' });
  }
});

module.exports = router;
