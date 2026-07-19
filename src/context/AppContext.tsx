import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  API_URL,
  SCREENING_WEBHOOK_URL, 
  GET_CANDIDATES_WEBHOOK_URL, 
  SCHEDULE_INTERVIEW_WEBHOOK_URL 
} from '../config';

export interface Candidate {
  id: string;
  candidate_name: string;
  email: string;
  match_score: number;
  status: 'Strong Fit' | 'Possible Fit' | 'Rejected';
  strengths: string;
  missing_skills: string;
  experience_analysis: string;
  education_analysis: string;
  resume_summary: string;
  job_match_analysis: string;
  interview_status: 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled';
  interview_date?: string;
  interview_time?: string;
  interviewer?: string;
  meeting_type?: string;
  notes?: string;
}

export interface User {
  name: string;
  company: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Settings {
  companyName: string;
  recruiterName: string;
  recruiterEmail: string;
}

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  triggerScreening: (jobTitle: string, jobDesc: string, files: File[], onProgress: (msg: string) => void) => Promise<void>;
  scheduleInterview: (data: {
    candidateId: string;
    interviewDate: string;
    interviewTime: string;
    meetingType: string;
    interviewer: string;
    notes: string;
  }) => Promise<boolean>;
  bulkAction: (action: 'invite' | 'reject' | 'next_round' | 'export_csv' | 'export_excel', ids: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  recentActivities: { id: string; type: string; message: string; time: string }[];
  addActivity: (type: string, message: string) => void;
  
  // Auth API
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loginUser: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  registerUser: (name: string, company: string, email: string, password: string) => Promise<void>;
  logoutUser: () => void;
  forgotPassword: (email: string) => Promise<string>;
  
  // Sheets sync via n8n
  isFetchingCandidates: boolean;
  fetchCandidates: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentActivities, setRecentActivities] = useState<{ id: string; type: string; message: string; time: string }[]>([]);
  const [isFetchingCandidates, setIsFetchingCandidates] = useState(false);

  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [settings, setSettings] = useState<Settings>({
    companyName: 'TalentAI Labs',
    recruiterName: 'Saurav Gautam',
    recruiterEmail: 'recruiter@talentai.io'
  });

  // Verify auth token on boot
  useEffect(() => {
    const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (savedToken) {
      fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setUser(data.user);
        setToken(savedToken);
        setIsAuthenticated(true);
        setSettings(prev => ({
          ...prev,
          recruiterName: data.user.name,
          companyName: data.user.company,
          recruiterEmail: data.user.email
        }));
      })
      .catch(() => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      });
    }
  }, []);

  // Theme Loader
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  // Auto refresh candidate database via n8n
  useEffect(() => {
    if (isAuthenticated) {
      fetchCandidates();
      const interval = setInterval(() => {
        fetchCandidates();
      }, 15000); // Poll every 15s in production
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addActivity = (type: string, message: string) => {
    setRecentActivities(prev => [
      { id: `act-${Date.now()}`, type, message, time: 'Just now' },
      ...prev.slice(0, 9)
    ]);
  };

  // Auth Operations
  const loginUser = async (email: string, password: string, rememberMe: boolean) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await response.json();
    setUser(data.user);
    setToken(data.token);
    setIsAuthenticated(true);
    if (rememberMe) {
      localStorage.setItem('token', data.token);
    } else {
      sessionStorage.setItem('token', data.token);
    }
    setSettings({
      recruiterName: data.user.name,
      companyName: data.user.company,
      recruiterEmail: data.user.email
    });
    addActivity('shortlist', `Recruiter ${data.user.name} logged in.`);
  };

  const registerUser = async (name: string, company: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, company, email, password })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Registration failed');
    }
    const data = await response.json();
    setUser(data.user);
    setToken(data.token);
    setIsAuthenticated(true);
    sessionStorage.setItem('token', data.token);
    setSettings({
      recruiterName: data.user.name,
      companyName: data.user.company,
      recruiterEmail: data.user.email
    });
    addActivity('shortlist', `New account registered: ${name}.`);
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setCandidates([]);
  };

  const forgotPassword = async (email: string) => {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Password reset failed');
    }
    const data = await response.json();
    return data.message;
  };

  // 3. FETCH LIVE CANDIDATES via n8n webhook
  const fetchCandidates = async () => {
    setIsFetchingCandidates(true);
    try {
      const response = await fetch(GET_CANDIDATES_WEBHOOK_URL);
      if (!response.ok) throw new Error('Failed to fetch from candidates database');
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const parsed: Candidate[] = data.map((item: any, idx: number) => {
          const score = Number(item.match_score || 70);
          const status = item.status || (score >= 85 ? 'Strong Fit' : score >= 70 ? 'Possible Fit' : 'Rejected');
          return {
            id: item.id || item.candidate_email || `rec-${idx}`,
            candidate_name: item.candidate_name || 'Parsed Candidate',
            email: item.candidate_email || item.email || '',
            match_score: score,
            status,
            strengths: item.strengths || 'N/A',
            missing_skills: item.missing_skills || 'None parsed',
            experience_analysis: item.experience_analysis || 'Experience analysis parsed by workflow.',
            education_analysis: item.education_analysis || 'Education credentials parsed.',
            resume_summary: item.resume_summary || 'Summary parsed from upload.',
            job_match_analysis: item.job_match_analysis || item.analysis || 'Relevance metrics logged.',
            interview_status: item.interview_status || 'Pending',
            interview_date: item.interview_date || '',
            interview_time: item.interview_time || '',
            interviewer: item.interviewer || '',
            meeting_type: item.meeting_type || 'Google Meet',
            notes: item.notes || ''
          };
        });
        setCandidates(parsed);
      }
    } catch (err) {
      console.error('Error loading live candidate sync:', err);
    } finally {
      setIsFetchingCandidates(false);
    }
  };

  // 4. SCREENING RESUMES via n8n screening webhook
  const triggerScreening = async (
    jobTitle: string, 
    jobDesc: string, 
    files: File[], 
    onProgress: (msg: string) => void
  ) => {
    addActivity('resume', `Dispatched batch screen request for "${jobTitle}"`);
    
    const formData = new FormData();
    formData.append('job_title', jobTitle);
    formData.append('job_description', jobDesc);
    files.forEach((file) => {
      formData.append('resumes', file);
    });

    onProgress('Uploading resumes...');
    await new Promise(r => setTimeout(r, 600));

    const totalFiles = files.length;
    for (let i = 0; i < totalFiles; i++) {
      onProgress(`Processing Resume ${i + 1} of ${totalFiles}`);
      await new Promise(r => setTimeout(r, 1000));
    }

    onProgress('Please wait...');

    const response = await fetch(SCREENING_WEBHOOK_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Screening failed: ${response.status}`);
    }

    // Refresh candidate list automatically
    await fetchCandidates();
  };

  // 5. SCHEDULER UPDATE via n8n scheduler webhook
  const scheduleInterview = async (data: {
    candidateId: string;
    interviewDate: string;
    interviewTime: string;
    meetingType: string;
    interviewer: string;
    notes: string;
  }) => {
    const candidate = candidates.find(c => c.id === data.candidateId);
    if (!candidate) return false;

    addActivity('interview', `Scheduling meeting for ${candidate.candidate_name}`);

    const response = await fetch(SCHEDULE_INTERVIEW_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_name: candidate.candidate_name,
        candidate_email: candidate.email,
        interview_date: data.interviewDate,
        interview_time: data.interviewTime,
        meeting_type: data.meetingType,
        interviewer: data.interviewer,
        notes: data.notes
      })
    });

    if (!response.ok) {
      throw new Error('Scheduler webhook failed');
    }

    // Refresh candidate list automatically
    await fetchCandidates();
    return true;
  };

  const bulkAction = (action: 'invite' | 'reject' | 'next_round' | 'export_csv' | 'export_excel', ids: string[]) => {
    if (ids.length === 0) return;

    if (action === 'reject') {
      setCandidates(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: 'Rejected' as const } : c));
    } else if (action === 'next_round') {
      setCandidates(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: 'Strong Fit' as const } : c));
    } else if (action === 'export_csv' || action === 'export_excel') {
      const selected = candidates.filter(c => ids.includes(c.id));
      const headers = 'Candidate Name,Email,Match Score,Status,Strengths,Interview Status\n';
      const rows = selected.map(c => `"${c.candidate_name}","${c.email}",${c.match_score},"${c.status}","${c.strengths.replace(/"/g, '""')}","${c.interview_status}"`).join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `talentai_candidates_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        candidates,
        setCandidates,
        settings,
        updateSettings,
        triggerScreening,
        scheduleInterview,
        bulkAction,
        searchQuery,
        setSearchQuery,
        recentActivities,
        addActivity,
        
        // Auth API
        user,
        token,
        isAuthenticated,
        loginUser,
        registerUser,
        logoutUser,
        forgotPassword,

        // Sheet sync via n8n
        isFetchingCandidates,
        fetchCandidates
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
