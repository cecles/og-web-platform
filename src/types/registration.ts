import { z } from 'zod';

export const RegistrationFormSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  whatsapp: z.string().min(5, 'Valid WhatsApp number required'),
  email: z.string().email('Valid email required'),
  city: z.string().min(2, 'City is required'),
  ageRange: z.string().min(1, 'Age range is required'),
  courses: z.array(z.string()).min(1, 'Select at least one course'),
  goals: z.array(z.string()).min(1, 'Select at least one goal'),
  experience: z.string().min(1, 'Experience level is required'),
  previousSkills: z.array(z.string()).default([]),
  learningMode: z.string().min(1, 'Learning mode is required'),
  preferredTime: z.string().min(1, 'Preferred time is required'),
  trainingPlan: z.string().min(1, 'Training plan is required'),
  additionalGoals: z.string().optional()
});

export type RegistrationForm = z.infer<typeof RegistrationFormSchema>;

export interface Registration extends RegistrationForm {
  id: string;
  registrationId: string;
  status: 'registered' | 'contacted' | 'enrolled' | 'dropped';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  ipAddress?: string;
  userAgent?: string;
  source: 'web' | 'mobile' | 'api';
  contactedAt?: string;
  enrolledAt?: string;
}

export interface AdminFilterOptions {
  search?: string;
  status?: string;
  city?: string;
  ageRange?: string;
  experience?: string;
  course?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface RegistrationStats {
  total: number;
  registered: number;
  contacted: number;
  enrolled: number;
  dropped: number;
  byCourse: Record<string, number>;
  byCity: Record<string, number>;
  byExperience: Record<string, number>;
  byAgeRange: Record<string, number>;
}
