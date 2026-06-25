import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Search, 
  MapPin, 
  Clock, 
  SlidersHorizontal, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  User, 
  Award, 
  Code,
  Sparkles,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  UploadCloud
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

export default function StudentDashboard({ activeTab }) {
  const { user, API_BASE_URL, fetchNotifications } = useApp();
  const [student, setStudent] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  
  
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');

  
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [certifications, setCertifications] = useState([]);
  const [newCert, setNewCert] = useState('');
  const [projects, setProjects] = useState([]);
  
  
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projLink, setProjLink] = useState('');

  
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchOpportunities();
    fetchStudentApplications();
    fetchRecommendations();
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/students/profile`);
      setStudent(res.data);
      setSkills(res.data.skills || []);
      setCertifications(res.data.certifications || []);
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (locationFilter) params.location = locationFilter;
      if (typeFilter) params.jobType = typeFilter;
      if (skillsFilter) params.skills = skillsFilter;

      const res = await axios.get(`${API_BASE_URL}/students/jobs`, { params });
      setJobs(res.data);
    } catch (err) {
      console.error("Error loading jobs:", err);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/students/recommended-jobs`);
      setRecommendedJobs(res.data);
    } catch (err) {
      console.error("Error loading recommendations:", err);
    }
  };

  const fetchStudentApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/students/applications`);
      setApplications(res.data);
    } catch (err) {
      console.error("Error loading applications:", err);
    }
  };

  const handleApply = async (jobId) => {
    setActionError('');
    setActionSuccess('');
    try {
      const response = await axios.post(`${API_BASE_URL}/students/jobs/${jobId}/apply`);
      
      
      const score = response.data.match_score;
      if (score >= 70) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      setActionSuccess(`Successfully applied for job! AI Match Score: ${score}%`);
      fetchStudentApplications();
      fetchOpportunities();
      fetchRecommendations();
      fetchNotifications();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to submit application.');
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    setActionError('');
    setActionSuccess('');
    setUploadingResume(true);

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/students/resume-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setActionSuccess(response.data.message);
      
      
      fetchProfile();
      fetchRecommendations();
      fetchNotifications();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to process resume parsing.');
    } finally {
      setUploadingResume(false);
      setResumeFile(null);
    }
  };

  const handleSaveProfile = async () => {
    setActionError('');
    setActionSuccess('');
    setUpdatingProfile(true);

    try {
      await axios.put(`${API_BASE_URL}/students/profile`, {
        skills,
        certifications,
        projects
      });
      setActionSuccess('Profile modifications saved successfully.');
      fetchProfile();
      fetchRecommendations();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to save profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  
  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (s) => {
    setSkills(skills.filter(x => x !== s));
  };

  const addCert = () => {
    if (newCert && !certifications.includes(newCert)) {
      setCertifications([...certifications, newCert]);
      setNewCert('');
    }
  };

  const removeCert = (c) => {
    setCertifications(certifications.filter(x => x !== c));
  };

  const addProject = () => {
    if (projTitle && projDesc) {
      setProjects([...projects, { title: projTitle, description: projDesc, link: projLink }]);
      setProjTitle('');
      setProjDesc('');
      setProjLink('');
    }
  };

  const removeProject = (index) => {
    setProjects(projects.filter((_, idx) => idx !== index));
  };

  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'applied':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-900/15 dark:text-blue-400">Applied</span>;
      case 'shortlisted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 dark:bg-amber-900/15 dark:text-amber-400">Shortlisted</span>;
      case 'interview_scheduled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/15 dark:text-indigo-400">Interview Scheduled</span>;
      case 'selected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/15 dark:text-emerald-450">Selected</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-900/15 dark:text-rose-450">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600">{status}</span>;
    }
  };

  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'selected': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-rose-500" />;
      default: return <Clock className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {}
      {actionError && (
        <div className="p-4 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/10 dark:text-rose-450 border border-rose-100 dark:border-rose-900/20 rounded-xl">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="p-4 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/20 rounded-xl">
          {actionSuccess}
        </div>
      )}

      {}
      {}
      {}
      {activeTab === 'dashboard' && (
        <>
          {}
          <div className="p-6 bg-gradient-to-r from-primary to-indigo-800 dark:from-slate-800 dark:to-indigo-950 text-white rounded-3xl shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight m-0">Hello, {student?.name}!</h2>
            <p className="text-sm text-slate-200 mt-1 max-w-xl">
              Welcome to your placement dashboard. Make sure your resume is uploaded for the AI matching engine to suggest customized job opportunities.
            </p>
            <div className="mt-4 flex gap-4 text-xs">
              <div>USN: <span className="font-semibold text-amber-300">{student?.usn}</span></div>
              <div>Branch: <span className="font-semibold text-amber-300">{student?.branch}</span></div>
              <div>CGPA: <span className="font-semibold text-amber-300">{student?.cgpa || 'N/A'}</span></div>
            </div>
          </div>

          {}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Total Applied</span>
              <span className="text-2xl font-bold text-slate-800 dark:text-white mt-1 block">{applications.length}</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Shortlisted</span>
              <span className="text-2xl font-bold text-amber-500 mt-1 block">
                {applications.filter(a => a.status === 'shortlisted' || a.status === 'interview_scheduled').length}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Offers Secured</span>
              <span className="text-2xl font-bold text-emerald-500 mt-1 block">
                {applications.filter(a => a.status === 'selected').length}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">AI Match Pool</span>
              <span className="text-2xl font-bold text-indigo-500 mt-1 block">
                {recommendedJobs.filter(r => r.match_score >= 60).length} Roles
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" /> AI Job Recommendations
                </h3>
                <span className="text-xs text-slate-400">Ranked by skill and profile matching</span>
              </div>

              <div className="space-y-4">
                {recommendedJobs.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400">
                    Upload your resume to receive AI recommendations.
                  </div>
                ) : (
                  recommendedJobs.slice(0, 4).map(job => {
                    const alreadyApplied = applications.some(app => app.job_id === job.id);
                    return (
                      <div
                        key={job.id}
                        className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-400 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400">{job.company_name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-750 uppercase">{job.job_type}</span>
                          </div>
                          <h4 className="text-base font-bold text-slate-800 dark:text-white m-0">{job.title}</h4>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</div>
                            <div className="font-semibold text-indigo-600 dark:text-blue-400">{job.salary}</div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(job.requirements.skills || []).slice(0, 4).map(s => (
                              <span key={s} className="px-2 py-0.5 rounded-md text-[10px] bg-indigo-50 dark:bg-slate-750 text-indigo-600 dark:text-blue-300">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
                          <div className="flex items-center gap-1.5 bg-indigo-50/50 dark:bg-slate-750 px-3 py-1.5 rounded-xl border border-indigo-100/50 dark:border-slate-700">
                            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-blue-400" />
                            <span className="text-xs font-bold text-indigo-700 dark:text-blue-300">
                              {job.match_score}% Match
                            </span>
                          </div>

                          <button
                            onClick={() => handleApply(job.id)}
                            disabled={alreadyApplied}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                              alreadyApplied
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                            }`}
                          >
                            {alreadyApplied ? 'Applied' : 'Apply'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Application Status</h3>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No active applications.
                  </div>
                ) : (
                  applications.slice(0, 5).map(app => (
                    <div key={app.id} className="flex gap-3 border-b border-slate-100 dark:border-slate-750 pb-3 last:border-0 last:pb-0">
                      <div className="mt-0.5">{getStatusIcon(app.status)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{app.job_title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{app.company_name}</p>
                        
                        {}
                        {app.status === 'interview_scheduled' && app.interview && (
                          <div className="mt-2 p-2 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl text-[10px] text-indigo-700 dark:text-indigo-300">
                            <strong>Interview:</strong> {new Date(app.interview.scheduled_at).toLocaleDateString()} @ {app.interview.type}
                            <a href={app.interview.location} target="_blank" rel="noreferrer" className="block text-primary hover:underline mt-1">Join Meeting</a>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {getStatusBadge(app.status)}
                        <span className="text-[9px] text-slate-400 block mt-1">
                          {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {}
      {}
      {}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search jobs by title, description, or recruiter company..."
                  className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="Location (e.g. Bangalore)"
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors text-slate-800 dark:text-white"
                />

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors text-slate-800 dark:text-white"
                >
                  <option value="">Job Type</option>
                  <option value="full-time">Full-time</option>
                  <option value="internship">Internship</option>
                </select>

                <button
                  onClick={fetchOpportunities}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.length === 0 ? (
              <div className="col-span-2 p-12 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400">
                No matching opportunities found.
              </div>
            ) : (
              jobs.map(job => {
                const alreadyApplied = applications.some(app => app.job_id === job.id);
                return (
                  <div
                    key={job.id}
                    className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-400">{job.company_name}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-750 uppercase">{job.job_type}</span>
                        </div>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-blue-400">{job.salary}</span>
                      </div>

                      <h4 className="text-base font-bold text-slate-800 dark:text-white m-0">{job.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {job.description}
                      </p>

                      {}
                      <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-xl space-y-1">
                        <p className="text-[10px] text-slate-400">
                          Min CGPA: <span className="font-semibold text-slate-700 dark:text-white">{job.requirements.min_cgpa}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Branches: <span className="font-semibold text-slate-700 dark:text-white">
                            {job.requirements.allowed_branches?.join(', ')}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {(job.requirements.skills || []).map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-md text-[10px] bg-indigo-50 dark:bg-slate-750 text-indigo-600 dark:text-blue-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-750 pt-4">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.location}
                      </span>

                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={alreadyApplied}
                        className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                          alreadyApplied
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                        }`}
                      >
                        {alreadyApplied ? 'Applied' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {}
      {}
      {}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-500" /> AI Resume Parser
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Upload your resume (PDF/DOCX). Our AI service parses your details (CGPA, Branch, Skills) to automatically fill your profile and matches you against jobs.
              </p>
            </div>

            <form onSubmit={handleResumeUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <input
                  type="file"
                  id="resume-file-input"
                  className="hidden"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
                <label htmlFor="resume-file-input" className="cursor-pointer block space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-400" />
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-350">
                    {resumeFile ? resumeFile.name : 'Choose Resume Document'}
                  </span>
                  <span className="block text-[10px] text-slate-400">PDF, DOCX up to 5MB</span>
                </label>
              </div>

              {student?.resume_url && (
                <div className="flex items-center justify-between p-2 bg-indigo-50/50 dark:bg-slate-900/50 rounded-xl text-[10px] text-indigo-700 dark:text-blue-300">
                  <span className="truncate">Active Resume: {student.resume_url.split('/').pop()}</span>
                  <a href={`http://localhost:3001/${student.resume_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 hover:underline font-bold">
                    View <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={!resumeFile || uploadingResume}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
              >
                {uploadingResume ? 'Processing NLP parser...' : 'Parse Resume'}
              </button>
            </form>
          </div>

          {}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Profile Details</h3>
              <p className="text-xs text-slate-400 mt-1">Review and manage your parsed skill tags, achievements, and academic credentials.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">USN</span>
                <span className="block text-sm font-bold text-slate-800 dark:text-white mt-0.5">{student?.usn}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Academic CGPA</span>
                <span className="block text-sm font-bold text-slate-800 dark:text-white mt-0.5">{student?.cgpa || '0.00'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Engineering Branch</span>
                <span className="block text-sm font-bold text-slate-800 dark:text-white mt-0.5 truncate">{student?.branch}</span>
              </div>
            </div>

            {}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Skills Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill tag (e.g. AWS)"
                  className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 text-slate-800 dark:text-white text-xs font-bold rounded-xl"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No skills listed yet.</span>
                ) : (
                  skills.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs bg-indigo-50 dark:bg-slate-750 text-indigo-700 dark:text-blue-300">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} className="hover:text-rose-500 font-bold ml-1">×</button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Certifications</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  placeholder="Add certification (e.g. Google Analytics)"
                  className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCert}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 text-slate-800 dark:text-white text-xs font-bold rounded-xl"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {certifications.length === 0 ? (
                  <span className="text-xs text-slate-400 italic block">No certifications added.</span>
                ) : (
                  certifications.map(c => (
                    <div key={c} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-750 rounded-xl text-xs">
                      <span className="flex items-center gap-2"><Award className="w-4 h-4 text-indigo-500" /> {c}</span>
                      <button type="button" onClick={() => removeCert(c)} className="text-rose-500 hover:underline font-bold">Delete</button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Projects</label>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-3">
                <input
                  type="text"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="Project Title (e.g. Portfolio Website)"
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl text-xs focus:outline-none"
                />
                <textarea
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Brief description of technology and tools used..."
                  rows="2"
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl text-xs focus:outline-none"
                />
                <input
                  type="url"
                  value={projLink}
                  onChange={(e) => setProjLink(e.target.value)}
                  placeholder="Project Link (GitHub/Live URL)"
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addProject}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                >
                  Add Project
                </button>
              </div>

              <div className="space-y-2">
                {projects.map((p, index) => (
                  <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-750 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-800 dark:text-white">{p.title}</span>
                      <button type="button" onClick={() => removeProject(index)} className="text-rose-500 font-normal hover:underline">Remove</button>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{p.description}</p>
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-blue-400 flex items-center gap-1 hover:underline mt-1">
                        View Codebase <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={updatingProfile}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
            >
              {updatingProfile ? 'Saving updates...' : 'Save Profile Adjustments'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
