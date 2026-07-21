export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'intern' | 'company_mentor' | 'institution_admin' | 'student' | 'coordinator' | 'admin' | 'organizer';
  position?: string;
  company?: string;
  designation?: string;
  department: string;
  studentId: string;
  avatar: string;
  phone?: string;
  bio?: string;
  yearOfStudy?: string;
  github?: string;
  linkedin?: string;
  status?: 'active' | 'deactivated';
  xpPoints?: number;
  level?: number;
  badges?: string[];
}

export interface Milestone {
  _id?: string;
  week?: number;
  title: string;
  description: string;
  deliverable?: string;
  status?: 'Pending' | 'In Progress' | 'Verified' | 'Completed';
}

export interface Mentor {
  _id?: string;
  name: string;
  role: string;
  company: string;
  email?: string;
  avatar: string;
}

export interface InternshipItem {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  description: string;
  domain: 'Web Development' | 'AI & Machine Learning' | 'Data Science' | 'Cloud & DevOps' | 'Cyber Security' | 'UI/UX Design' | 'Embedded & IoT' | 'Software Engineering' | 'Business Analytics';
  location: string;
  workType: 'Remote' | 'On-site' | 'Hybrid';
  duration: string;
  stipend: string;
  skillsRequired: string[];
  totalPositions: number;
  appliedCount: number;
  startDate?: string;
  endDate?: string;
  deadline?: string;
  status: 'Open' | 'Active' | 'Ongoing' | 'Completed' | 'Closed';
  isFeatured?: boolean;
  milestones?: Milestone[];
  mentors?: Mentor[];
  // Legacy backward compatibility fields
  category?: string;
  date?: string;
  time?: string;
  venue?: string;
  organizer?: string;
  department?: string;
  image?: string;
  capacity?: number;
  registeredCount?: number;
}

// Backward compatibility alias for components expecting EventItem
export type EventItem = InternshipItem;

export interface CheckInItem {
  _id?: string;
  date: string;
  taskSummary: string;
  verifiedBy: string;
  qrToken?: string;
  status: 'Verified' | 'Pending';
}

export interface ProgressReportItem {
  _id?: string;
  title: string;
  description?: string;
  hoursLogged: number;
  submissionDate: string;
  status: 'Pending' | 'Approved' | 'Revision Required';
  mentorFeedback?: string;
  score?: number;
}

export interface Registration {
  _id: string;
  internshipId?: InternshipItem;
  eventId?: InternshipItem; // Legacy alias
  userId: User;
  ticketCode: string;
  qrCodeUrl: string;
  status: 'Applied' | 'Accepted' | 'Ongoing' | 'Completed' | 'Rejected' | 'registered' | 'attended' | 'cancelled';
  progress: number;
  hoursLogged: number;
  checkIns?: CheckInItem[];
  progressReports?: ProgressReportItem[];
  attendanceStatus?: 'Pending' | 'Verified' | 'Present' | 'Absent';
  certificateIssued?: boolean;
  certificateId?: string;
  mentorRating?: number;
  mentorFeedback?: string;
  registeredAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  category?: string;
  authorName?: string;
  createdAt: string;
}

export interface Feedback {
  _id: string;
  internshipId?: string;
  eventId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  mentorName?: string;
  rating: number;
  performanceScore?: number;
  technicalSkillScore?: number;
  punctualityScore?: number;
  comment: string;
  createdAt: string;
}

export interface InstitutionAnalytics {
  summary: {
    totalInternships: number;
    activeInternships: number;
    completedInternships: number;
    totalApplications: number;
    activeApplications: number;
    completedApplications: number;
    certificatesIssued: number;
    completionRate: number;
    avgPerformanceScore: number;
  };
  domainBreakdown: Array<{
    domain: string;
    count: number;
    totalPositions: number;
    totalApplied: number;
  }>;
}

// Resolution for API Base URL
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://internship-portal-it90.onrender.com/api';
  }
  return '/api';
};

const API_BASE = getApiBaseUrl();

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('campuspulse_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Safe JSON parser
async function parseResponse(res: Response) {
  const text = await res.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text || 'Non-JSON response received' };
    }
  }
  if (!res.ok) {
    throw new Error(data.message || `Server returned status ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth & Profile
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await parseResponse(res);
    localStorage.setItem('campuspulse_token', data.token);
    return data;
  },

  async register(userData: { name: string; email: string; password: string; role?: string; department?: string; studentId?: string; company?: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await parseResponse(res);
    localStorage.setItem('campuspulse_token', data.token);
    return data;
  },

  async loginWithGoogle(googleData: { email: string; name: string; avatar?: string; role?: string; department?: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleData)
    });
    const data = await parseResponse(res);
    localStorage.setItem('campuspulse_token', data.token);
    return data;
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return await parseResponse(res);
  },

  logout() {
    localStorage.removeItem('campuspulse_token');
  },

  // Internships
  async getInternships(filters?: { domain?: string; search?: string; workType?: string; status?: string; featured?: boolean }): Promise<InternshipItem[]> {
    const params = new URLSearchParams();
    if (filters?.domain) params.append('domain', filters.domain);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.workType) params.append('workType', filters.workType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.featured) params.append('featured', 'true');

    const res = await fetch(`${API_BASE}/internships?${params.toString()}`);
    return await parseResponse(res);
  },

  async getEvents(filters?: any): Promise<InternshipItem[]> {
    return this.getInternships(filters);
  },

  async getInternshipById(id: string): Promise<InternshipItem> {
    const res = await fetch(`${API_BASE}/internships/${id}`);
    return await parseResponse(res);
  },

  async getEventById(id: string): Promise<InternshipItem> {
    return this.getInternshipById(id);
  },

  async createInternship(data: Partial<InternshipItem>): Promise<InternshipItem> {
    const res = await fetch(`${API_BASE}/internships`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return await parseResponse(res);
  },

  async createEvent(data: Partial<InternshipItem>): Promise<InternshipItem> {
    return this.createInternship(data);
  },

  async updateInternship(id: string, data: Partial<InternshipItem>): Promise<InternshipItem> {
    const res = await fetch(`${API_BASE}/internships/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return await parseResponse(res);
  },

  async updateEvent(id: string, data: Partial<InternshipItem>): Promise<InternshipItem> {
    return this.updateInternship(id, data);
  },

  async deleteInternship(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/internships/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    await parseResponse(res);
  },

  async deleteEvent(id: string): Promise<void> {
    return this.deleteInternship(id);
  },

  // Applications & Task Verification
  async getLeaderboard(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/registrations/leaderboard`);
    return await parseResponse(res);
  },

  async applyForInternship(internshipId: string): Promise<Registration> {
    const res = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ internshipId, eventId: internshipId })
    });
    return await parseResponse(res);
  },

  async registerForEvent(eventId: string): Promise<Registration> {
    return this.applyForInternship(eventId);
  },

  async getMyRegistrations(): Promise<Registration[]> {
    const res = await fetch(`${API_BASE}/registrations/my`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  async cancelRegistration(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/registrations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    await parseResponse(res);
  },

  async verifyTaskCheckIn(ticketCode: string, taskSummary?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/internships/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ticketCode, taskSummary })
    });
    return await parseResponse(res);
  },

  async scanQrTicket(ticketCode: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/scan-qr`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ticketCode })
    });
    return await parseResponse(res);
  },

  async submitProgressReport(internshipId: string, title: string, description: string, hoursLogged: number): Promise<any> {
    const res = await fetch(`${API_BASE}/internships/progress`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ internshipId, title, description, hoursLogged })
    });
    return await parseResponse(res);
  },

  async submitMentorFeedback(payload: { internshipId?: string; internId: string; rating: number; performanceScore?: number; technicalSkillScore?: number; comment: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/internships/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return await parseResponse(res);
  },

  // Institution Analytics
  async getInstitutionAnalytics(): Promise<InstitutionAnalytics> {
    const res = await fetch(`${API_BASE}/internships/analytics`);
    return await parseResponse(res);
  },

  async getAnalytics() {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  async getEventParticipants(eventId: string): Promise<{ event: InternshipItem; participants: Registration[] }> {
    const res = await fetch(`${API_BASE}/admin/events/${eventId}/participants`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  async updateAttendance(registrationId: string, attendanceStatus: 'Present' | 'Absent' | 'Pending' | 'Verified', status?: string, progress?: number) {
    const res = await fetch(`${API_BASE}/admin/registrations/${registrationId}/attendance`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ attendanceStatus, status, progress })
    });
    return await parseResponse(res);
  },

  async getAllUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  async updateUserRole(userId: string, role: string, position?: string): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role, position })
    });
    return await parseResponse(res);
  },

  async toggleUserStatus(userId: string, status: 'active' | 'deactivated'): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return await parseResponse(res);
  },

  async adminResetPassword(userId: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPassword })
    });
    return await parseResponse(res);
  },

  // AI DiGi Bot
  async chatWithBot(message: string): Promise<{ reply: string }> {
    const res = await fetch(`${API_BASE}/bot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return await parseResponse(res);
  },

  async getAnnouncements(): Promise<Announcement[]> {
    const res = await fetch(`${API_BASE}/announcements`);
    return await parseResponse(res);
  },

  async createAnnouncement(announcementData: { title: string; content: string; category?: string }): Promise<Announcement> {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(announcementData)
    });
    return await parseResponse(res);
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    await parseResponse(res);
  },

  // Feedback Methods
  async getFeedback(eventId: string): Promise<{ avgRating: number; totalCount: number; feedbacks: Feedback[] }> {
    const res = await fetch(`${API_BASE}/feedback/event/${eventId}`);
    return await parseResponse(res);
  },

  async submitFeedback(eventId: string, rating: number, comment: string): Promise<Feedback> {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ eventId, rating, comment })
    });
    return await parseResponse(res);
  },

  // Export CSV Reports
  exportParticipantsCSV(internshipTitle: string, participants: Registration[]) {
    const headers = ['Intern Name', 'Email', 'Student/Intern ID', 'Department', 'Verification Code', 'Progress %', 'Hours Logged', 'Status', 'Application Date'];
    const rows = participants.map(p => [
      `"${p.userId?.name || 'Intern'}"`,
      `"${p.userId?.email || ''}"`,
      `"${p.userId?.studentId || ''}"`,
      `"${p.userId?.department || ''}"`,
      `"${p.ticketCode}"`,
      `"${p.progress || 0}%"`,
      `"${p.hoursLogged || 0} hrs"`,
      `"${p.status || 'Applied'}"`,
      `"${new Date(p.registeredAt).toLocaleDateString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${internshipTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Intern_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportAnalyticsCSV(analytics: InstitutionAnalytics) {
    const rows = [
      ['Metric', 'Value'],
      ['Total Internships', analytics.summary.totalInternships],
      ['Active Internships', analytics.summary.activeInternships],
      ['Completed Internships', analytics.summary.completedInternships],
      ['Total Applications', analytics.summary.totalApplications],
      ['Active Applications', analytics.summary.activeApplications],
      ['Completed Applications', analytics.summary.completedApplications],
      ['Certificates Issued', analytics.summary.certificatesIssued],
      ['Overall Completion Rate', `${analytics.summary.completionRate}%`],
      ['Average Performance Score', `${analytics.summary.avgPerformanceScore}/100`],
      ['', ''],
      ['Domain', 'Active Positions', 'Total Applications']
    ];

    analytics.domainBreakdown.forEach(d => {
      rows.push([d.domain, d.totalPositions.toString(), d.totalApplied.toString()]);
    });

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Institution_Internship_Analytics_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
