export type UserRole = "ADMIN" | "USER" | "VIEWER";

export type ReportStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface Report {
  id: string;
  userId: string;
  activityName: string;
  date: string;
  location: string;
  agency: string;
  description: string;
  attachments?: string | null;
  status: ReportStatus;
  clientId?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface ReportFormData {
  activityName: string;
  date: string;
  location: string;
  agency: string;
  description: string;
  attachments?: string;
  status?: ReportStatus;
  clientId?: string;
}

export interface RekapSummary {
  total: number;
  byStatus: Record<string, number>;
  byAgency: { agency: string; count: number }[];
  byPeriod: { period: string; count: number }[];
  reports: Report[];
}
