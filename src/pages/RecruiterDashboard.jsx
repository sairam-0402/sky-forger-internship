import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PlusCircle, 
  Briefcase, 
  Users, 
  Award, 
  ChevronRight, 
  Sparkles, 
  Calendar, 
  MapPin, 
  TrendingUp,
  FileText,
  Clock,
  Video,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatsCard from '../components/StatsCard';

export default function RecruiterDashboard({ activeTab, setActiveTab }) {
  const { API_BASE_URL, fetchNotifications } = useApp();
  const [stats, setStats] = useState({
    totalApplications: 0,
    shortlistedCandidates: 0,
    selectedCandidates: 0,
    recentApplications: []
  });
  
  const [myJobs, setMyJobs] = useState([]);
  
  
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobType, setJobType] = useState('full-time');
  const [jobSkills, setJobSkills] = useState('');
  const [jobMinCgpa, setJobMinCgpa] = useState('8.0');
  const [jobBranches, setJobBranches] = useState(['Computer Science']);

  
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  
  const [activeApplicant, setActiveApplicant] = useState(null);

  
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedDuration, setSchedDuration] = useState('45');
  const [schedType, setSchedType] = useState('technical');
  const [schedLoc, setSchedLoc] = useState('https://meet.google.com/');
  const [schedNotes, setSchedNotes] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);

  
  const [statusFeedback, setStatusFeedback] = useState('');

  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submittingJob, setSubmittingJob] = useState(false);

  const branchesList = [
    'Computer Science',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering'
  ];

  useEffect(() => {
    fetchStats();
    fetchMyJobs();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/recruiters/dashboard-stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    }
  };

  const fetchMyJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/recruiters/jobs`);
      setMyJobs(res.data);
    } catch (err) {
      console.error("Error loading recruiter jobs:", err);
    }
  };

  const loadJobApplicants = async (job) => {
    setSelectedJob(job);
    setLoadingApplicants(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.get(`${API_BASE_URL}/recruiters/jobs/${job.id}/applicants`);
      setApplicants(res.data);
      setActiveTab('view_applicants'); 
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load applicants.');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!jobTitle || !jobDesc || !jobSkills || !jobMinCgpa) {
      setError('Please fill in all required job fields.');
      return;
    }

    setError('');
    setSuccess('');
    setSubmittingJob(true);

    try {
      await axios.post(`${API_BASE_URL}/recruiters/jobs`, {
        title: jobTitle,
        description: jobDesc,
        salary: jobSalary,
        location: jobLocation,
        jobType,
        skills: jobSkills.split(',').map(s => s.trim()),
        minCgpa: parseFloat(jobMinCgpa),
        allowedBranches: jobBranches
      });

      setSuccess('Job opportunity posted successfully!');
      
      
      setJobTitle('');
      setJobDesc('');
      setJobSalary('');
      setJobLocation('');
      setJobSkills('');
      setJobMinCgpa('8.0');
      setJobBranches(['Computer Science']);
      
      setActiveTab('my_jobs');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post job.');
    } finally {
      setSubmittingJob(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    setError('');
    setSuccess('');
    try {
      await axios.put(`${API_BASE_URL}/recruiters/applications/${appId}/status`, {
        status: newStatus,
        feedback: statusFeedback
      });

      setSuccess(`Candidate status successfully set to "${newStatus}".`);
      setStatusFeedback('');
      
      
      if (selectedJob) {
        loadJobApplicants(selectedJob);
      }
      fetchStats();
      fetchNotifications();
      setActiveApplicant(null); 
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update candidate status.');
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!schedDate || !schedTime) {
      setError('Please select date and time.');
      return;
    }

    setError('');
    setSuccess('');
    const fullDateTime = `${schedDate}T${schedTime}`;

    try {
      await axios.post(`${API_BASE_URL}/recruiters/interviews`, {
        applicationId: activeApplicant.id,
        scheduledAt: fullDateTime,
        durationMinutes: parseInt(schedDuration),
        type: schedType,
        location: schedLoc,
        notes: schedNotes
      });

      setSuccess('Technical interview scheduled successfully.');
      setShowScheduler(false);
      
      
      setSchedDate('');
      setSchedTime('');
      setSchedNotes('');
      
      if (selectedJob) {
        loadJobApplicants(selectedJob);
      }
      fetchStats();
      fetchNotifications();
      setActiveApplicant(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to schedule interview.');
    }
  };

  const toggleBranch = (br) => {
    if (jobBranches.includes(br)) {
      setJobBranches(jobBranches.filter(b => b !== br));
    } else {
      setJobBranches([...jobBranches, br]);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30';
    if (score >= 60) return 'text-indigo-600 bg-indigo-50 dark:bg-slate-750 border-indigo-200 dark:border-slate-700';
    return 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30';
  };

  return (
    <div className="space-y-8">
      {}
      {error && (
        <div className="p-4 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/10 dark:text-rose-450 border border-rose-100 dark:border-rose-900/20 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/20 rounded-xl">
          {success}
        </div>
      )}

      {}
      {}
      {}
      {activeTab === 'dashboard' && (
        <>
          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Total Job Applicants"
              value={stats.totalApplications}
              icon={Users}
              description="Candidates applied across active roles"
              trend="+12%"
            />
            <StatsCard
              title="Shortlisted Candidates"
              value={stats.shortlistedCandidates}
              icon={Clock}
              description="Candidates currently in review funnel"
              colorClass="text-amber-600 bg-amber-50 dark:bg-slate-800"
            />
            <StatsCard
              title="Offers Extended"
              value={stats.selectedCandidates}
              icon={Award}
              description="Candidates selected for placements"
              colorClass="text-emerald-600 bg-emerald-50 dark:bg-slate-800"
              trend="+4%"
            />
          </div>

          {}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Candidate Applications</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">USN / Branch</th>
                    <th className="pb-3">Target Role</th>
                    <th className="pb-3 text-center">AI Match</th>
                    <th className="pb-3">Applied Date</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-750 dark:text-slate-300">
                  {stats.recentApplications?.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-slate-400">No applicants yet.</td>
                    </tr>
                  ) : (
                    stats.recentApplications?.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/30 transition-colors">
                        <td className="py-3.5 font-semibold text-slate-900 dark:text-white">{app.student_name}</td>
                        <td className="py-3.5">
                          <div>{app.student_usn}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{app.student_branch}</div>
                        </td>
                        <td className="py-3.5 font-medium">{app.job_title}</td>
                        <td className="py-3.5 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg border font-bold text-[10px] ${getScoreColor(app.match_score)}`}>
                            {app.match_score}%
                          </span>
                        </td>
                        <td className="py-3.5">{new Date(app.applied_at).toLocaleDateString()}</td>
                        <td className="py-3.5 text-right">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold tracking-wide uppercase">
                            {app.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {}
      {}
      {}
      {activeTab === 'post_job' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm max-w-3xl mx-auto space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Post New Job / Internship Listing</h3>
            <p className="text-xs text-slate-400 mt-1">Specify detailed descriptions and requirements for candidate screening.</p>
          </div>

          <form onSubmit={handleCreateJob} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Job Title</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Software Development Engineer Intern"
                  className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Job Type</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
                >
                  <option value="full-time">Full-Time (Placement)</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">CTC / Stipend Package</label>
                <input
                  type="text"
                  value={jobSalary}
                  onChange={(e) => setJobSalary(e.target.value)}
                  placeholder="₹12 LPA or ₹80,000 / month"
                  className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Location</label>
                <input
                  type="text"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                  placeholder="Bangalore, India (Hybrid)"
                  className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>

            {}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Job Description</label>
              <textarea
                required
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Include core projects, responsibilities, technical stacks, and scope of role..."
                rows="4"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
              />
            </div>

            {}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-4">
              <span className="text-xs font-bold text-indigo-600 dark:text-blue-400 block">AI Screening Requirements</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    required
                    value={jobSkills}
                    onChange={(e) => setJobSkills(e.target.value)}
                    placeholder="React, Node.js, Python, SQL"
                    className="block w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                {}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Minimum Required CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={jobMinCgpa}
                    onChange={(e) => setJobMinCgpa(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              {}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Allowed Engineering Branches</label>
                <div className="flex flex-wrap gap-3">
                  {branchesList.map(br => {
                    const isChecked = jobBranches.includes(br);
                    return (
                      <button
                        key={br}
                        type="button"
                        onClick={() => toggleBranch(br)}
                        className={`px-3 py-1.5 rounded-xl border text-[10px] font-semibold transition-all ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {br}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingJob}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:transform active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
            >
              {submittingJob ? 'Publishing listing...' : 'Publish Job Listing'}
            </button>
          </form>
        </div>
      )}

      {}
      {}
      {}
      {activeTab === 'my_jobs' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Active Job Listing Positions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myJobs.length === 0 ? (
              <div className="col-span-2 p-12 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400">
                No jobs published yet. Go to "Post a Job" tab.
              </div>
            ) : (
              myJobs.map(job => (
                <div
                  key={job.id}
                  className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-750 uppercase">{job.job_type}</span>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-blue-400">{job.salary}</span>
                    </div>

                    <h4 className="text-base font-bold text-slate-800 dark:text-white m-0">{job.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {(job.requirements.skills || []).slice(0, 4).map(s => (
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
                      onClick={() => loadJobApplicants(job)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1"
                    >
                      View Applicants <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {}
      {}
      {}
      {activeTab === 'view_applicants' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab('my_jobs')}
              className="text-xs font-semibold text-slate-500 hover:underline"
            >
              ← Back to Listings
            </button>
            <span className="text-xs font-semibold text-slate-400">Applicants for: <strong className="text-slate-750 dark:text-white">{selectedJob?.title}</strong></span>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" /> AI Candidates Ranking Pool
              </h3>
              <span className="text-xs text-slate-400">Order by match algorithms (Skills, CGPA, and text matches)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">USN / Branch</th>
                    <th className="pb-3">CGPA</th>
                    <th className="pb-3 text-center">AI Match Score</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-750 dark:text-slate-300">
                  {loadingApplicants ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">Analyzing resume datasets...</td>
                    </tr>
                  ) : applicants.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">No applicants for this position yet.</td>
                    </tr>
                  ) : (
                    applicants.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/30 transition-colors">
                        <td className="py-3.5 font-bold text-slate-900 dark:text-white">{app.student_name}</td>
                        <td className="py-3.5">
                          <div>{app.student_usn}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{app.student_branch}</div>
                        </td>
                        <td className="py-3.5 font-semibold">{app.student_cgpa}</td>
                        <td className="py-3.5 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg border font-bold text-[10px] ${getScoreColor(app.match_score)}`}>
                            {app.match_score}% Match
                          </span>
                        </td>
                        <td className="py-3.5">{getStatusBadge(app.status)}</td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => {
                              setActiveApplicant(app);
                              setStatusFeedback('');
                              setShowScheduler(false);
                            }}
                            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-650 text-[10px] font-bold rounded-lg"
                          >
                            Review & Screen
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {}
      {}
      {}
      {activeApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            {}
            <button
              onClick={() => setActiveApplicant(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {}
            <div>
              <span className={`inline-block px-3 py-1 rounded-xl border text-xs font-bold ${getScoreColor(activeApplicant.match_score)}`}>
                AI Fit Score: {activeApplicant.match_score}%
              </span>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-3">{activeApplicant.student_name}</h2>
              <p className="text-xs text-slate-400 mt-1">{activeApplicant.student_branch} | USN: {activeApplicant.student_usn} | CGPA: {activeApplicant.student_cgpa}</p>
            </div>

            {}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-indigo-700 dark:text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> AI Screening Remarks
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                {activeApplicant.screening_feedback || "No screening feedback calculated yet."}
              </p>
            </div>

            {}
            <div className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Skills Profile</span>
              <div className="flex flex-wrap gap-1.5">
                {activeApplicant.student_skills?.map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-xl text-xs bg-slate-50 dark:bg-slate-750 text-slate-700 dark:text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Projects List</span>
                {activeApplicant.student_projects?.length === 0 ? (
                  <span className="text-xs text-slate-400 italic block">None listed.</span>
                ) : (
                  activeApplicant.student_projects?.map((p, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs">
                      <strong>{p.title}</strong>: {p.description}
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Certifications</span>
                {activeApplicant.student_certifications?.length === 0 ? (
                  <span className="text-xs text-slate-400 italic block">None listed.</span>
                ) : (
                  activeApplicant.student_certifications?.map(c => (
                    <div key={c} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs">
                      {c}
                    </div>
                  ))
                )}
              </div>
            </div>

            {}
            {activeApplicant.student_resume_url && (
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <a
                  href={`http://localhost:3001/${activeApplicant.student_resume_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Download Candidate Resume Document (PDF)
                </a>
              </div>
            )}

            {}
            {!showScheduler ? (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Screening Feedback Note (Optional)</label>
                <textarea
                  value={statusFeedback}
                  onChange={(e) => setStatusFeedback(e.target.value)}
                  placeholder="Enter remarks for the applicant (e.g. Excellent communication skills, coding round scheduled)..."
                  rows="2"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-xl text-xs focus:outline-none mb-4"
                />

                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => handleUpdateStatus(activeApplicant.id, 'rejected')}
                    className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-450 text-xs font-bold rounded-xl"
                  >
                    Reject Candidate
                  </button>
                  <button
                    onClick={() => setShowScheduler(true)}
                    className="px-4 py-2 bg-indigo-50 text-indigo-650 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 text-xs font-bold rounded-xl flex items-center gap-1"
                  >
                    <Calendar className="w-4 h-4" /> Schedule Interview
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeApplicant.id, 'shortlisted')}
                    className="px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-105 dark:bg-amber-950/20 dark:text-amber-400 text-xs font-bold rounded-xl"
                  >
                    Shortlist Candidate
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeApplicant.id, 'selected')}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                  >
                    Hire Candidate / Select
                  </button>
                </div>
              </div>
            ) : (
              
              <form onSubmit={handleScheduleInterview} className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                <span className="text-xs font-bold text-slate-800 dark:text-white block flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-indigo-500" /> Schedule Placement Interview
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={schedDate}
                      onChange={(e) => setSchedDate(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-xs rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Time</label>
                    <input
                      type="time"
                      required
                      value={schedTime}
                      onChange={(e) => setSchedTime(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-xs rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Interview Type</label>
                    <select
                      value={schedType}
                      onChange={(e) => setSchedType(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-xs rounded-xl focus:outline-none text-slate-800 dark:text-white"
                    >
                      <option value="technical">Technical Round</option>
                      <option value="coding">Coding assessment</option>
                      <option value="hr">HR Interview</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Meeting Link / Room No.</label>
                    <input
                      type="text"
                      required
                      value={schedLoc}
                      onChange={(e) => setSchedLoc(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-xs rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={schedDuration}
                    onChange={(e) => setSchedDuration(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-xs rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Coordinator Notes</label>
                  <textarea
                    value={schedNotes}
                    onChange={(e) => setSchedNotes(e.target.value)}
                    placeholder="Enter instructions, syllabus, or pre-requisite instructions..."
                    rows="2"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-xs rounded-xl focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowScheduler(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                  >
                    Confirm Interview Schedule
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
