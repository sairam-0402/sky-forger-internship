const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  
  await knex('activity_logs').del();
  await knex('notifications').del();
  await knex('placement_reports').del();
  await knex('interviews').del();
  await knex('applications').del();
  await knex('jobs').del();
  await knex('recruiters').del();
  await knex('students').del();
  await knex('companies').del();
  await knex('users').del();

  
  const passwordHash = '$2a$10$rJb8f7Y2mj7/./.wg/wMsOT60zfJ8E.N2456RdFxFubxWPESxA9hi';


  
  const users = await knex('users').insert([
    { email: 'admin@college.edu', password_hash: passwordHash, role: 'admin' },       
    { email: 'student.amit@college.edu', password_hash: passwordHash, role: 'student' }, 
    { email: 'student.priya@college.edu', password_hash: passwordHash, role: 'student' }, 
    { email: 'student.rahul@college.edu', password_hash: passwordHash, role: 'student' }, 
    { email: 'recruiter.john@google.com', password_hash: passwordHash, role: 'recruiter' }, 
    { email: 'recruiter.sarah@microsoft.com', password_hash: passwordHash, role: 'recruiter' }, 
    { email: 'recruiter.vijay@infosys.com', password_hash: passwordHash, role: 'recruiter' }  
  ]).returning('id');

  
  const adminId = 1;
  const student1UserId = 2;
  const student2UserId = 3;
  const student3UserId = 4;
  const recruiter1UserId = 5;
  const recruiter2UserId = 6;
  const recruiter3UserId = 7;

  
  await knex('companies').insert([
    { id: 1, name: 'Google', website: 'https://google.com', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', description: 'Search engine giant and technology innovator.', location: 'Bangalore, India', industry: 'Software / Internet', status: 'approved' },
    { id: 2, name: 'Microsoft', website: 'https://microsoft.com', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_2012.svg', description: 'Empowering people and organizations through cloud and computing technology.', location: 'Hyderabad, India', industry: 'Software / Hardware', status: 'approved' },
    { id: 3, name: 'Infosys', website: 'https://infosys.com', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg', description: 'Global leader in next-generation digital services and consulting.', location: 'Bangalore, India', industry: 'IT Services', status: 'approved' },
    { id: 4, name: 'Acme Corp', website: 'https://acme.com', logo_url: '', description: 'Up-and-coming robotics and widget manufacturing.', location: 'Mumbai, India', industry: 'Robotics', status: 'pending' }
  ]);

  
  await knex('students').insert([
    {
      id: 1,
      user_id: student1UserId,
      name: 'Amit Sharma',
      usn: '1RV22CS001',
      branch: 'Computer Science',
      cgpa: 9.25,
      skills: JSON.stringify(['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Algorithms', 'Data Structures']),
      resume_url: '',
      resume_text: 'Amit Sharma. 1RV22CS001. RV College of Engineering. CGPA: 9.25. Python developer with experience in React and Node.js backend. Strong data structures and algorithms.',
      certifications: JSON.stringify(['AWS Certified Cloud Practitioner', 'Google Data Analytics Certification']),
      projects: JSON.stringify([
        { title: 'E-commerce Platform', description: 'Built a full-stack MERN shopping website with Stripe integration.', link: 'https://github.com/amit/ecommerce' },
        { title: 'Task Scheduler', description: 'Developed a task scheduler CLI in Python.', link: 'https://github.com/amit/tasks' }
      ])
    },
    {
      id: 2,
      user_id: student2UserId,
      name: 'Priya Patel',
      usn: '1RV22EC045',
      branch: 'Electronics & Communication',
      cgpa: 8.80,
      skills: JSON.stringify(['Python', 'C++', 'Matlab', 'SQL', 'Machine Learning', 'TensorFlow', 'Linux']),
      resume_url: '',
      resume_text: 'Priya Patel. 1RV22EC045. RV College of Engineering. CGPA: 8.80. Electronics student focused on machine learning and signals processing. Proficient in C++ and python.',
      certifications: JSON.stringify(['TensorFlow Developer Certificate']),
      projects: JSON.stringify([
        { title: 'Edge Detection NLP Model', description: 'Implemented a convolutional neural network for image filter detection.', link: 'https://github.com/priya/edge-detector' }
      ])
    },
    {
      id: 3,
      user_id: student3UserId,
      name: 'Rahul Verma',
      usn: '1RV22ME089',
      branch: 'Mechanical Engineering',
      cgpa: 7.90,
      skills: JSON.stringify(['Matlab', 'CAD', 'SolidWorks', 'Python', 'Excel']),
      resume_url: '',
      resume_text: 'Rahul Verma. 1RV22ME089. RV College of Engineering. CGPA: 7.90. Mechanical engineering student experienced in SolidWorks modeling and Python automation scripts.',
      certifications: JSON.stringify(['Certified SolidWorks Associate']),
      projects: JSON.stringify([
        { title: 'Formula Student Chassis', description: 'Designed the structural frame for college Formula Student race car.', link: '' }
      ])
    }
  ]);

  
  await knex('recruiters').insert([
    { id: 1, user_id: recruiter1UserId, company_id: 1, name: 'John Doe', phone: '+919876543210' },
    { id: 2, user_id: recruiter2UserId, company_id: 2, name: 'Sarah Connor', phone: '+919876543211' },
    { id: 3, user_id: recruiter3UserId, company_id: 3, name: 'Vijay Kumar', phone: '+919876543212' }
  ]);

  
  await knex('jobs').insert([
    {
      id: 1,
      company_id: 1,
      title: 'Software Engineer Intern',
      description: 'Join the Google search team to optimize low-latency database queries and build beautiful user-facing dashboards. Strong knowledge of data structures, algorithms, and React/Node.js is preferred.',
      requirements: JSON.stringify({
        skills: ['Python', 'JavaScript', 'React', 'Node.js', 'Algorithms'],
        min_cgpa: 8.5,
        allowed_branches: ['Computer Science', 'Electronics & Communication']
      }),
      location: 'Bangalore, India (Hybrid)',
      job_type: 'internship',
      salary: '₹80,000 / month',
      posted_by: 1
    },
    {
      id: 2,
      company_id: 2,
      title: 'Front-End Engineer',
      description: 'Develop next-generation web client applications for Microsoft 365. Experience with TypeScript, React, and CSS animations is required.',
      requirements: JSON.stringify({
        skills: ['JavaScript', 'TypeScript', 'React', 'CSS', 'HTML'],
        min_cgpa: 8.0,
        allowed_branches: ['Computer Science', 'Electronics & Communication']
      }),
      location: 'Hyderabad, India',
      job_type: 'full-time',
      salary: '₹18,000,000 / annum',
      posted_by: 2
    },
    {
      id: 3,
      company_id: 3,
      title: 'Graduate Engineer Trainee',
      description: 'Systems engineer role involving system installation, database management, and client side scripting. Open to all engineering disciplines. Training will be provided.',
      requirements: JSON.stringify({
        skills: ['Python', 'Java', 'SQL', 'Excel'],
        min_cgpa: 7.0,
        allowed_branches: ['Computer Science', 'Electronics & Communication', 'Electrical & Electronics', 'Mechanical Engineering', 'Civil Engineering']
      }),
      location: 'Bangalore, India',
      job_type: 'full-time',
      salary: '₹500,000 / annum',
      posted_by: 3
    }
  ]);

  
  await knex('applications').insert([
    { id: 1, student_id: 1, job_id: 1, status: 'shortlisted', resume_url: '', match_score: 95.0, screening_feedback: 'Student profile is a perfect match. Meets CGPA requirement (9.25 >= 8.5) and Branch is allowed. Skills overlap is high (Python, JavaScript, React, Node.js, Algorithms).' },
    { id: 2, student_id: 2, job_id: 1, status: 'applied', resume_url: '', match_score: 62.5, screening_feedback: 'Student meets CGPA (8.80 >= 8.5) and Branch is allowed. Skill overlap is medium (Python, Linux). Missing React and Node.js.' },
    { id: 3, student_id: 2, job_id: 3, status: 'selected', resume_url: '', match_score: 80.0, screening_feedback: 'Meets eligibility requirements. High overlap in data analysis/python tools.' }
  ]);

  
  await knex('interviews').insert([
    {
      id: 1,
      application_id: 1,
      scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), 
      duration_minutes: 45,
      type: 'technical',
      location: 'https://meet.google.com/abc-defg-hij',
      notes: 'Google SWE Intern Interview. Focus on System Design, Data Structures, and React component state management.',
      status: 'scheduled'
    }
  ]);

  
  await knex('placement_reports').insert([
    { id: 1, academic_year: '2025-2026', total_students: 450, placed_students: 390, average_package: 12.5, highest_package: 48.0, top_recruiter_id: 1 },
    { id: 2, academic_year: '2024-2025', total_students: 420, placed_students: 350, average_package: 11.2, highest_package: 44.0, top_recruiter_id: 2 }
  ]);

  
  await knex('notifications').insert([
    { id: 1, user_id: 2, title: 'Application Shortlisted', message: 'Congratulations! Your application for Software Engineer Intern at Google has been shortlisted.', type: 'success', is_read: false },
    { id: 2, user_id: 2, title: 'Interview Scheduled', message: 'A technical interview has been scheduled for Google on ' + new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString() + '.', type: 'info', is_read: false },
    { id: 3, user_id: 3, title: 'Selected for Placement', message: 'Congratulations Priya Patel! You have been selected for Graduate Engineer Trainee at Infosys.', type: 'success', is_read: false }
  ]);

  
  await knex('activity_logs').insert([
    { user_id: 2, action: 'apply_job', details: 'Amit Sharma applied for Software Engineer Intern at Google' },
    { user_id: 5, action: 'shortlist_candidate', details: 'Recruiter John Doe shortlisted Amit Sharma for Software Engineer Intern' },
    { user_id: 1, action: 'approve_company', details: 'Admin approved Google registration' }
  ]);
};
