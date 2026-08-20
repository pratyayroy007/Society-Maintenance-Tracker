export type Role = 'RESIDENT' | 'ADMIN';
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Category = 
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'CARPENTRY'
  | 'CLEANING'
  | 'ELEVATOR'
  | 'SECURITY'
  | 'PAINTING'
  | 'OTHER';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  flatNumber?: string | null;
}

export interface ComplaintWithDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  photoUrl: string | null;
  residentId: string;
  resident: {
    id: string;
    name: string;
    email: string;
    flatNumber: string | null;
    phoneNumber: string | null;
  };
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isOverdue?: boolean;
  history?: Array<{
    id: string;
    previousStatus: string | null;
    newStatus: string;
    changedById: string;
    changedBy: {
      id: string;
      name: string;
      role: string;
    };
    note: string | null;
    createdAt: Date;
  }>;
}
