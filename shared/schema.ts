import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

// Types
export type User = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  isRestricted?: boolean;
  restrictionReason?: string;
  restrictedAt?: string;
  restrictedBy?: string;
  createdAt: string;
};

export type InsertUser = {
  username: string;
  email: string;
  fullName: string;
  role: string;
  password?: string;
};

export type Document = {
  id: string;
  section_id: string;
  reference: string;
  title: string;
  category: string;
  metadata: any;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  description: string;
};

export type InsertDocument = {
  section_id: string;
  reference: string;
  title: string;
  category: string;
  metadata: any;
  status: string;
  created_by: string;
  description: string;
};

export type InsertPaper = {
  document_id: string;
  title: string;
  content?: string;
  attachment_url?: string;
  file_type?: string;
  file_size?: number;
};

export type Block = {
  id: string;
  label: string;
  created_at: string;
};

export type Row = {
  id: string;
  block_id: string;
  label: string;
  created_at: string;
};

export type Section = {
  id: string;
  row_id: string;
  label: string;
  created_at: string;
};

export type Paper = {
  id: string;
  document_id: string;
  title: string;
  content: string;
  attachment_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
};

export type DocumentWithDetails = Document & {
  sections: Section;
  users: User;
  papers?: Paper[];
  is_favorited?: boolean; // This will be computed based on user's favorites
};

// User Favorites types
export type UserFavorite = {
  id: string;
  user_id: string;
  document_id: string;
  created_at: string;
};

export type InsertUserFavorite = {
  user_id: string;
  document_id: string;
};

export type DashboardStats = {
  total_documents: number;
  approved_documents: number;
  pending_documents: number;
  archived_documents: number;
  totalCases: number;
  processedDocs: number;
  pendingDocs: number;
  archivedCases: number;
};

export type LoginCredentials = z.infer<typeof loginSchema>;

// Recommendation types
export type Recommendation = {
  id: string;
  document_id: string;
  user_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  created_at: string;
  updated_at: string;
  documents?: Document;
  users?: User;
};

export type InsertRecommendation = {
  document_id: string;
  user_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status?: 'pending' | 'approved' | 'rejected' | 'implemented';
};

// Comment types
export type Comment = {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  type: 'general' | 'review' | 'suggestion' | 'question';
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  documents?: Document;
  users?: User;
};

export type InsertComment = {
  document_id: string;
  user_id: string;
  content: string;
  type: 'general' | 'review' | 'suggestion' | 'question';
  is_resolved?: boolean;
};

// Report types
export type Report = {
  id: string;
  document_id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'error' | 'improvement' | 'complaint' | 'suggestion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  documents?: Document;
  users?: User;
};

export type InsertReport = {
  document_id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'error' | 'improvement' | 'complaint' | 'suggestion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
};

// User Activity Log types
export type UserActivityLog = {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
};

// System Report types
export type SystemReport = {
  id: string;
  title: string;
  description?: string;
  report_type: 'user_activity' | 'document_stats' | 'system_health' | 'security_audit';
  data: any;
  generated_by: string;
  created_at: string;
};

export type InsertSystemReport = {
  title: string;
  description?: string;
  report_type: 'user_activity' | 'document_stats' | 'system_health' | 'security_audit';
  data: any;
  generated_by: string;
};

// User Statistics type
export type UserStats = {
  total_documents: number;
  total_comments: number;
  total_recommendations: number;
  total_reports: number;
  last_activity?: string;
  account_age_days: number;
};
