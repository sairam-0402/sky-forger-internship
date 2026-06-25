const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');


router.get('/dashboard-stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const totalStudents = await db('students').count('* as count').first();
    const approvedCompanies = await db('companies').where({ status: 'approved' }).count('* as count').first();
    const pendingCompanies = await db('companies').where({ status: 'pending' }).count('* as count').first();
    const totalApplications = await db('applications').count('* as count').first();

    
    const placedStudents = await db('applications').where({ status: 'selected' }).count('* as count').first();

    
    const branchStats = await db('students')
      .leftJoin('applications', 'students.id', 'applications.student_id')
      .select('students.branch')
      .count('students.id as total_students')
      .count('applications.id as applied_count')
      .sum(db.raw("CASE WHEN applications.status = 'selected' THEN 1 ELSE 0 END as placed_count"))
      .groupBy('students.branch');

    
    const topRecruiters = await db('applications')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .join('companies', 'jobs.company_id', 'companies.id')
      .where({ 'applications.status': 'selected' })
      .select('companies.name', 'companies.logo_url')
      .count('applications.id as placed_count')
      .groupBy('companies.name', 'companies.logo_url')
      .orderBy('placed_count', 'desc')
      .limit(5);

    
    const ctcDetails = await db('applications')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .where({ 'applications.status': 'selected' })
      .select('jobs.salary');

    let highestPackage = 12.0; 
    let sumPackage = 0;
    let packageCount = 0;

    ctcDetails.forEach(c => {
      
      const match = c.salary.replace(/,/g, '').match(/(\d+)/);
      if (match) {
        let val = parseFloat(match[0]);
        
        if (val > 100000) val = val / 100000;
        
        else if (val > 10000) val = (val * 12) / 100000;
        
        sumPackage += val;
        packageCount++;
        if (val > highestPackage) highestPackage = val;
      }
    });

    const averagePackage = packageCount > 0 ? sumPackage / packageCount : 7.2; 

    return res.status(200).json({
      totalStudents: parseInt(totalStudents.count),
      approvedCompanies: parseInt(approvedCompanies.count),
      pendingCompanies: parseInt(pendingCompanies.count),
      totalApplications: parseInt(totalApplications.count),
      placedStudents: parseInt(placedStudents.count),
      highestPackage: Math.round(highestPackage * 10) / 10,
      averagePackage: Math.round(averagePackage * 10) / 10,
      branchStats: branchStats.map(bs => ({
        branch: bs.branch,
        total: parseInt(bs.total_students),
        applied: parseInt(bs.applied_count || 0),
        placed: parseInt(bs.placed_count || 0)
      })),
      topRecruiters
    });
  } catch (error) {
    console.error('Fetch admin stats error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.get('/companies', authenticate, authorize('admin'), async (req, res) => {
  try {
    const companies = await db('companies').orderBy('status', 'desc').orderBy('name', 'asc');
    return res.status(200).json(companies);
  } catch (error) {
    console.error('Fetch admin companies error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.put('/companies/:id/status', authenticate, authorize('admin'), async (req, res) => {
  const companyId = req.params.id;
  const { status } = req.body; 

  if (!status || (status !== 'approved' && status !== 'rejected')) {
    return res.status(400).json({ error: 'Please supply a valid status: approved or rejected.' });
  }

  try {
    const company = await db('companies').where({ id: companyId }).first();
    if (!company) return res.status(404).json({ error: 'Company not found.' });

    await db('companies').where({ id: companyId }).update({ status });

    
    const recruiters = await db('recruiters').where({ company_id: companyId });
    for (const rec of recruiters) {
      await db('notifications').insert({
        user_id: rec.user_id,
        title: `Company Registration ${status.toUpperCase()}`,
        message: `Your company (${company.name}) has been ${status} by the Placement Admin.`,
        type: status === 'approved' ? 'success' : 'alert'
      });
    }

    
    await db('activity_logs').insert({
      user_id: req.user.id,
      action: `${status}_company`,
      details: `Admin ${status} company: ${company.name}`
    });

    return res.status(200).json({ message: `Company successfully ${status}.` });
  } catch (error) {
    console.error('Update company status error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.get('/students', authenticate, authorize('admin'), async (req, res) => {
  try {
    const students = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .select('students.*', 'users.email')
      .orderBy('students.name', 'asc');
    
    const result = students.map(s => ({
      ...s,
      skills: JSON.parse(s.skills || '[]'),
      certifications: JSON.parse(s.certifications || '[]'),
      projects: JSON.parse(s.projects || '[]')
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Fetch admin students list error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.get('/activity-logs', authenticate, authorize('admin'), async (req, res) => {
  try {
    const logs = await db('activity_logs')
      .leftJoin('users', 'activity_logs.user_id', 'users.id')
      .select('activity_logs.*', 'users.email as user_email', 'users.role as user_role')
      .orderBy('activity_logs.created_at', 'desc')
      .limit(100);
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Fetch activity logs error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


router.get('/reports/excel', authenticate, authorize('admin'), async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    
    
    const placedSheet = workbook.addWorksheet('Placed Students List');
    placedSheet.columns = [
      { header: 'Student Name', key: 'name', width: 25 },
      { header: 'USN', key: 'usn', width: 15 },
      { header: 'Branch', key: 'branch', width: 25 },
      { header: 'CGPA', key: 'cgpa', width: 10 },
      { header: 'Placed Company', key: 'company', width: 20 },
      { header: 'Designation / Job Title', key: 'job_title', width: 25 },
      { header: 'Salary Package (CTC)', key: 'salary', width: 20 },
      { header: 'Selection Date', key: 'applied_at', width: 20 }
    ];

    const placedData = await db('applications')
      .join('students', 'applications.student_id', 'students.id')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .join('companies', 'jobs.company_id', 'companies.id')
      .where({ 'applications.status': 'selected' })
      .select(
        'students.name',
        'students.usn',
        'students.branch',
        'students.cgpa',
        'companies.name as company_name',
        'jobs.title as job_title',
        'jobs.salary',
        'applications.updated_at'
      );

    placedData.forEach(row => {
      placedSheet.addRow({
        name: row.name,
        usn: row.usn,
        branch: row.branch,
        cgpa: row.cgpa,
        company: row.company_name,
        job_title: row.job_title,
        salary: row.salary,
        applied_at: new Date(row.updated_at).toLocaleDateString()
      });
    });

    
    placedSheet.getRow(1).font = { bold: true };
    placedSheet.getRow(1).eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    });

    
    const branchSheet = workbook.addWorksheet('Branch Stats');
    branchSheet.columns = [
      { header: 'Engineering Branch', key: 'branch', width: 30 },
      { header: 'Total Registered Students', key: 'total', width: 25 },
      { header: 'Total Placements', key: 'placed', width: 20 },
      { header: 'Placement Rate (%)', key: 'rate', width: 20 }
    ];

    const branchStats = await db('students')
      .leftJoin('applications', 'students.id', 'applications.student_id')
      .select('students.branch')
      .count('students.id as total_students')
      .sum(db.raw("CASE WHEN applications.status = 'selected' THEN 1 ELSE 0 END as placed_count"))
      .groupBy('students.branch');

    branchStats.forEach(bs => {
      const total = parseInt(bs.total_students);
      const placed = parseInt(bs.placed_count || 0);
      const rate = total > 0 ? (placed / total) * 100 : 0;
      
      branchSheet.addRow({
        branch: bs.branch,
        total,
        placed,
        rate: Math.round(rate * 10) / 10
      });
    });

    branchSheet.getRow(1).font = { bold: true };
    branchSheet.getRow(1).eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=placement_reports.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export Excel report error:', error);
    return res.status(500).json({ error: 'Failed to generate Excel report.' });
  }
});


router.get('/reports/pdf', authenticate, authorize('admin'), async (req, res) => {
  try {
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=placement_reports.pdf');
    doc.pipe(res);

    
    doc.fillColor('#1A237E').fontSize(22).text('COLLEGE OF ENGINEERING', { align: 'center', bold: true });
    doc.fillColor('#5C1D24').fontSize(14).text('Department of Placements & Internships', { align: 'center' });
    doc.moveDown();
    
    doc.strokeColor('#CCCCCC').lineWidth(1).moveTo(50, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown();

    
    doc.fillColor('#333333').fontSize(16).text('ANNUAL PLACEMENT & INTERNSHIP STATISTICS', { align: 'center', bold: true });
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, { align: 'center' });
    doc.moveDown(2);

    
    const totalStudents = await db('students').count('* as count').first();
    const placedStudents = await db('applications').where({ status: 'selected' }).count('* as count').first();
    const totalJobs = await db('jobs').count('* as count').first();
    
    doc.fillColor('#000000').fontSize(12).text('1. Executive Placement Summary', { bold: true });
    doc.moveDown(0.5);
    doc.fontSize(10)
       .text(`Total Registered Students: ${totalStudents.count}`)
       .text(`Total Placed Students: ${placedStudents.count}`)
       .text(`Aggregate Placement Rate: ${totalStudents.count > 0 ? Math.round((placedStudents.count / totalStudents.count) * 1000) / 10 : 0}%`)
       .text(`Active Recruiters Partnered: ${totalJobs.count}`);
    doc.moveDown(2);

    
    doc.fontSize(12).text('2. Branch Wise Placement Breakdowns', { bold: true });
    doc.moveDown(0.5);
    
    const branchStats = await db('students')
      .leftJoin('applications', 'students.id', 'applications.student_id')
      .select('students.branch')
      .count('students.id as total_students')
      .sum(db.raw("CASE WHEN applications.status = 'selected' THEN 1 ELSE 0 END as placed_count"))
      .groupBy('students.branch');

    
    const startY = doc.y;
    doc.fontSize(10).text('Branch', 50, startY, { bold: true, width: 220 });
    doc.text('Registered', 270, startY, { bold: true, width: 80, align: 'center' });
    doc.text('Placed', 350, startY, { bold: true, width: 80, align: 'center' });
    doc.text('Placement %', 430, startY, { bold: true, width: 80, align: 'center' });
    
    doc.moveDown(0.3);
    doc.strokeColor('#EEEEEE').moveTo(50, doc.y).lineTo(510, doc.y).stroke();
    doc.moveDown(0.5);

    branchStats.forEach(bs => {
      const rate = bs.total_students > 0 ? (bs.placed_count / bs.total_students) * 100 : 0;
      const currentY = doc.y;
      
      doc.text(bs.branch, 50, currentY, { width: 220 });
      doc.text(String(bs.total_students), 270, currentY, { width: 80, align: 'center' });
      doc.text(String(bs.placed_count || 0), 350, currentY, { width: 80, align: 'center' });
      doc.text(`${Math.round(rate * 10) / 10}%`, 430, currentY, { width: 80, align: 'center' });
      
      doc.moveDown(0.8);
    });

    doc.moveDown(2);

    
    doc.fontSize(12).text('3. Recently Placed Candidates', { bold: true });
    doc.moveDown(0.5);

    const placedData = await db('applications')
      .join('students', 'applications.student_id', 'students.id')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .join('companies', 'jobs.company_id', 'companies.id')
      .where({ 'applications.status': 'selected' })
      .select('students.name', 'students.usn', 'companies.name as company_name', 'jobs.title as job_title')
      .limit(8);

    const tableY = doc.y;
    doc.fontSize(9).text('Candidate Name', 50, tableY, { bold: true, width: 130 });
    doc.text('USN', 180, tableY, { bold: true, width: 90 });
    doc.text('Company Name', 270, tableY, { bold: true, width: 120 });
    doc.text('Designation', 390, tableY, { bold: true, width: 120 });

    doc.moveDown(0.3);
    doc.strokeColor('#EEEEEE').moveTo(50, doc.y).lineTo(510, doc.y).stroke();
    doc.moveDown(0.5);

    placedData.forEach(row => {
      const cY = doc.y;
      doc.text(row.name, 50, cY, { width: 130 });
      doc.text(row.usn, 180, cY, { width: 90 });
      doc.text(row.company_name, 270, cY, { width: 120 });
      doc.text(row.job_title, 390, cY, { width: 120 });
      doc.moveDown(0.8);
    });

    
    doc.moveDown(3);
    doc.fontSize(10).text('Authorized Signatory', 400, doc.y, { bold: true });
    doc.fontSize(9).text('Officer-in-Charge, Placement Cell', 400, doc.y + 15);

    doc.end();
  } catch (error) {
    console.error('Export PDF report error:', error);
    return res.status(500).json({ error: 'Failed to generate PDF report.' });
  }
});

module.exports = router;
