import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  flatNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(['RESIDENT', 'ADMIN']).default('RESIDENT'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createComplaintSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'PLUMBING',
    'ELECTRICAL',
    'CARPENTRY',
    'CLEANING',
    'ELEVATOR',
    'SECURITY',
    'PAINTING',
    'OTHER',
  ]),
  photoUrl: z.string().url().optional().nullable().or(z.literal('')),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']),
  note: z.string().optional().nullable(),
});

export const updatePrioritySchema = z.object({
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

export const createNoticeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(5, 'Content must be at least 5 characters'),
  isImportant: z.boolean().default(false),
});

export const updateSettingSchema = z.object({
  key: z.string(),
  value: z.string(),
});
