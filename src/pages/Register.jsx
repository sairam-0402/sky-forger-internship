import React, { useState } from 'react';
import { User, Mail, Lock, Building, GraduationCap, Phone, Globe, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Register({ onLoginClick }) {
  const { registerStudent, registerRecruiter } = useApp();
  const [role, setRole] = useState('student'); 

  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  
  const [usn, setUsn] = useState('');
  const [branch, setBranch] = useState('Computer Science');
  const [cgpa, setCgpa] = useState('');
  
  
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const branchesList = [
    'Computer Science',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (role === 'student') {
        const parsedCgpa = cgpa ? parseFloat(cgpa) : 0.0;
        if (parsedCgpa < 0 || parsedCgpa > 10) {
          throw new Error('CGPA must be between 0.0 and 10.0');
        }
        const res = await registerStudent({
          email,
          password,
          name,
          usn,
          branch,
          cgpa: parsedCgpa,
          skills: [] 
        });
        setSuccess(res.message);
      } else {
        const res = await registerRecruiter({
          email,
          password,
          name,
          phone,
          companyName,
          companyWebsite
        });
        setSuccess(res.message);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90svh] px-4 py-8">
      <div className="w-full max-w-lg p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 transition-colors">
        {}
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Create an Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose your role and register for the portal
          </p>
        </div>

        {}
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setRole('student'); setError(''); setSuccess(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              role === 'student'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Student
          </button>
          <button
            type="button"
            onClick={() => { setRole('recruiter'); setError(''); setSuccess(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              role === 'recruiter'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Recruiter
          </button>
        </div>

        {}
        {error && (
          <div className="mb-6 p-4 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/10 dark:text-rose-450 border border-rose-100 dark:border-rose-900/20 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/20 rounded-xl">
            {success}
            <button
              onClick={onLoginClick}
              className="block font-bold mt-2 underline"
            >
              Proceed to Sign In
            </button>
          </div>
        )}

        {}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
                    placeholder="Amit Kumar"
                  />
                </div>
              </div>

              {}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
                    placeholder="name@college.edu"
                  />
                </div>
              </div>
            </div>

            {}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
                  placeholder="Minimum 6 characters"
                  minLength="6"
                />
              </div>
            </div>

            {}
            {role === 'student' && (
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      University Seat Number (USN)
                    </label>
                    <input
                      type="text"
                      required
                      value={usn}
                      onChange={(e) => setUsn(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
                      placeholder="1RV22CS001"
                    />
                  </div>

                  {}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Current CGPA
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      max="10"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
                      placeholder="e.g. 9.15"
                    />
                  </div>
                </div>

                {}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Engineering Branch
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
                  >
                    {branchesList.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {}
            {role === 'recruiter' && (
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
                        placeholder="+919876543210"
                      />
                    </div>
                  </div>

                  {}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Company Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                        <Building className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
                        placeholder="Google / Microsoft"
                      />
                    </div>
                  </div>
                </div>

                {}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Company Website (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                      <Globe className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
                      placeholder="https://google.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:transform active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              ) : (
                'Register Now'
              )}
            </button>
          </form>
        )}

        {}
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <button
            onClick={onLoginClick}
            className="font-bold text-indigo-600 dark:text-blue-400 hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
