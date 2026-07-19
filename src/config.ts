// TalentAI Recruiter Developer Configuration File
// Update these endpoints to match your deployed n8n backend instances.

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const SCREENING_WEBHOOK_URL = import.meta.env.VITE_SCREENING_WEBHOOK_URL || 'https://vecnaa.app.n8n.cloud/webhook/resume-screen';

export const GET_CANDIDATES_WEBHOOK_URL = import.meta.env.VITE_GET_CANDIDATES_WEBHOOK_URL || 'https://n8n.your-domain.com/webhook/candidates';

export const SCHEDULE_INTERVIEW_WEBHOOK_URL = import.meta.env.VITE_SCHEDULE_INTERVIEW_WEBHOOK_URL || 'https://n8n.your-domain.com/webhook/schedule';

export const GOOGLE_SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || '';
