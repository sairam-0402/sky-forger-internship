import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  Building2, 
  Users, 
  Award, 
  Download, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  DollarSign, 
  Activity,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatsCard from '../components/StatsCard';

export default function AdminDashboard({ activeTab }) {
  const { API_BASE_URL, fetchNotifications } = useApp();
  const [stats, setStats] = useState({
    totalStudents: 0,
    approvedCompanies: 0,
    pendingCompanies: 0,
    totalApplications: 0,
    placedStudents: 0,
    highestPackage: 0.0,
    averagePackage: 0.0,
    branchStats: [],
    topRecruiters: []
  });

  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);

  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'companies') fetchCompanies();
    if (activeTab === 'students') fetchStudents();
    if (activeTab === 'activity_logs') fetchLogs();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/dashboard-stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Error loading admin stats:", err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/companies`);
      setCompanies(res.data);
    } catch (err) {
      console.error("Error loading admin companies:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/students`);
      setStudents(res.data);
    } catch (err) {
      console.error("Error loading admin students:", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/activity-logs`);
      setLogs(res.data);
    } catch (err) {
      console.error("Error loading admin logs:", err);
    }
  };

  const handleUpdateCompanyStatus = async (companyId, newStatus) => {
    setError('');
    setSuccess('');
    try {
      await axios.put(`${API_BASE_URL}/admin/companies/${companyId}/status`, { status: newStatus });
      setSuccess(`Company registration has been successfully ${newStatus}.`);
      fetchCompanies();
      fetchStats();
      fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update company approval status.');
    }
  };

  const handleExportExcel = () => {
    window.open(`${API_BASE_URL}/admin/reports/excel`, '_blank');
  };

  const handleExportPdf = () => {
    window.open(`${API_BASE_URL}/admin/reports/pdf`, '_blank');
  };

  
  const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  
  const chartData = stats.branchStats?.map(bs => ({
    name: bs.branch.replace(" Engineering", ""),
    Registered: bs.total,
    Placed: bs.placed
  })) || [];

  
  const pieData = stats.topRecruiters?.map(tr => ({
    name: tr.name,
    value: tr.placed_count
  })) || [];

  const placementRate = stats.totalStudents > 0 
    ? Math.round((stats.placedStudents / stats.totalStudents) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-5 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white m-0 leading-tight">Placement Statistics Dashboard</h2>
              <span className="text-xs text-slate-400 mt-1 block">Live academic stats & reporting panels</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportExcel}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-4 h-4" /> Export Excel
              </button>
              <button
                onClick={handleExportPdf}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-4 h-4" /> Export PDF
              </button>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="Placement Rate"
              value={`${placementRate}%`}
              icon={Award}
              description={`Placed: ${stats.placedStudents} / ${stats.totalStudents} Students`}
              trend={`${placementRate > 80 ? 'High' : 'Normal'}`}
            />
            <StatsCard
              title="Partner Companies"
              value={stats.approvedCompanies}
              icon={Building2}
              description={`Pending Approvals: ${stats.pendingCompanies}`}
              colorClass="text-cyan-600 bg-cyan-50 dark:bg-slate-800"
            />
            <StatsCard
              title="Highest Package"
              value={`₹${stats.highestPackage} LPA`}
              icon={DollarSign}
              description="National and overseas offers"
              colorClass="text-emerald-600 bg-emerald-50 dark:bg-slate-800"
            />
            <StatsCard
              title="Average Package"
              value={`₹${stats.averagePackage} LPA`}
              icon={DollarSign}
              description="Engineering stream mean CTC"
              colorClass="text-indigo-600 bg-indigo-50 dark:bg-slate-800"
            />
          </div>

          {}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Registered vs Placed Candidates by Branch</h3>
              <div className="h-72 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Legend />
                    <Bar dataKey="Registered" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Placed" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Top Placements Recruiters</h3>
              <div className="h-56 w-full text-xs flex justify-center items-center">
                {pieData.length === 0 ? (
                  <span className="text-slate-400 italic">No selected hires yet.</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <p className="text-[10px] text-slate-400 text-center">Share of selected hires across companies.</p>
            </div>
          </div>
        </>
      )}

      {}
      {}
      {}
      {activeTab === 'companies' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recruiter Companies Approval Panel</h3>
            <p className="text-xs text-slate-400 mt-1">Approve pending corporate registrations. Only approved companies can post job opportunities.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold">
                  <th className="pb-3">Company Logo / Name</th>
                  <th className="pb-3">Website</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Industry</th>
                  <th className="pb-3">Approval Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-750 dark:text-slate-300">
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400">No company registrations found.</td>
                  </tr>
                ) : (
                  companies.map(comp => (
                    <tr key={comp.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/30 transition-colors">
                      <td className="py-3.5 flex items-center gap-3">
                        {comp.logo_url ? (
                          <img src={comp.logo_url} alt={comp.name} className="w-6 h-6 object-contain" />
                        ) : (
                          <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">{comp.name[0]}</div>
                        )}
                        <span className="font-bold text-slate-900 dark:text-white">{comp.name}</span>
                      </td>
                      <td className="py-3.5">
                        {comp.website ? <a href={comp.website} target="_blank" rel="noreferrer" className="text-indigo-650 hover:underline">{comp.website}</a> : 'N/A'}
                      </td>
                      <td className="py-3.5">{comp.location || 'Not Specified'}</td>
                      <td className="py-3.5">{comp.industry || 'Not Specified'}</td>
                      <td className="py-3.5">
                        {comp.status === 'approved' && <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 text-[10px] font-bold">Approved</span>}
                        {comp.status === 'pending' && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/20 text-[10px] font-bold">Pending Approval</span>}
                        {comp.status === 'rejected' && <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/20 text-[10px] font-bold">Rejected</span>}
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        {comp.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateCompanyStatus(comp.id, 'rejected')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-650 rounded-lg font-semibold text-[10px]"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleUpdateCompanyStatus(comp.id, 'approved')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[10px]"
                            >
                              Approve
                            </button>
                          </>
                        )}
                        {comp.status === 'approved' && (
                          <button
                            onClick={() => handleUpdateCompanyStatus(comp.id, 'rejected')}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-white rounded-lg font-semibold text-[10px]"
                          >
                            Revoke
                          </button>
                        )}
                        {comp.status === 'rejected' && (
                          <button
                            onClick={() => handleUpdateCompanyStatus(comp.id, 'approved')}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-primary rounded-lg font-semibold text-[10px]"
                          >
                            Re-Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {}
      {}
      {}
      {activeTab === 'students' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Registered Students Database</h3>
            <p className="text-xs text-slate-400 mt-1">Review USNs, branch divisions, academic CGPAs, and parsed resume skill catalogs.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold">
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">USN / Email</th>
                  <th className="pb-3">Branch</th>
                  <th className="pb-3">CGPA</th>
                  <th className="pb-3">Skills Portfolio</th>
                  <th className="pb-3 text-right">Resume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-750 dark:text-slate-300">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400">No students registered yet.</td>
                  </tr>
                ) : (
                  students.map(std => (
                    <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/30 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white">{std.name}</td>
                      <td className="py-3.5">
                        <div>{std.usn}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{std.email}</div>
                      </td>
                      <td className="py-3.5 font-medium">{std.branch}</td>
                      <td className="py-3.5 font-bold text-indigo-650 dark:text-blue-400">{std.cgpa || 'N/A'}</td>
                      <td className="py-3.5 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {std.skills?.slice(0, 5).map(sk => (
                            <span key={sk} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[9px] font-semibold">
                              {sk}
                            </span>
                          ))}
                          {std.skills?.length > 5 && (
                            <span className="text-[9px] text-slate-400 font-semibold pl-1">+{std.skills.length - 5} more</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        {std.resume_url ? (
                          <a
                            href={`http://localhost:3001/${std.resume_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-primary dark:bg-slate-700 dark:text-white rounded text-[10px] font-bold"
                          >
                            Open PDF
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No resume</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {}
      {}
      {}
      {activeTab === 'activity_logs' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> System Action Audit Logs
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">User Email / Role</th>
                  <th className="pb-3">Action Scope</th>
                  <th className="pb-3">Detailed Audit Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-750 dark:text-slate-300">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400">No audits recorded.</td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/30 transition-colors">
                      <td className="py-3 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{log.user_email || 'System'}</div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">{log.user_role || 'System'}</div>
                      </td>
                      <td className="py-3 font-semibold text-indigo-650 dark:text-blue-300">{log.action.replace('_', ' ')}</td>
                      <td className="py-3 leading-relaxed">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
