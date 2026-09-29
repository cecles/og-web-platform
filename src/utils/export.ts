import type { Registration } from '../types/registration';

export const exportToCSV = (registrations: Registration[]): string => {
  if (registrations.length === 0) {
    return '';
  }

  // Headers
  const headers = [
    'Registration ID',
    'Full Name',
    'Email',
    'WhatsApp',
    'City',
    'Age Range',
    'Courses',
    'Goals',
    'Experience',
    'Previous Skills',
    'Learning Mode',
    'Preferred Time',
    'Training Plan',
    'Additional Goals',
    'Status',
    'Notes',
    'Created At',
    'Updated At'
  ];

  // Escape CSV values
  const escapeCSV = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) value = value.join('; ');
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Convert rows
  const rows = registrations.map((reg) => [
    escapeCSV(reg.registrationId),
    escapeCSV(reg.fullName),
    escapeCSV(reg.email),
    escapeCSV(reg.whatsapp),
    escapeCSV(reg.city),
    escapeCSV(reg.ageRange),
    escapeCSV(reg.courses),
    escapeCSV(reg.goals),
    escapeCSV(reg.experience),
    escapeCSV(reg.previousSkills),
    escapeCSV(reg.learningMode),
    escapeCSV(reg.preferredTime),
    escapeCSV(reg.trainingPlan),
    escapeCSV(reg.additionalGoals),
    escapeCSV(reg.status),
    escapeCSV(reg.notes),
    escapeCSV(reg.createdAt),
    escapeCSV(reg.updatedAt)
  ]);

  return [
    headers.join(','),
    ...rows.map((row) => row.join(','))
  ].join('\n');
};

export const exportToJSON = (registrations: Registration[]): string => {
  return JSON.stringify(registrations, null, 2);
};

export const downloadCSV = (csvContent: string, filename = 'registrations.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadJSON = (jsonContent: string, filename = 'registrations.json') => {
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadExcel = async (registrations: Registration[], filename = 'registrations.xlsx') => {
  // For Excel export, we'll use a simple approach:
  // Generate CSV and prompt user to open with Excel
  // For production, consider using a library like 'xlsx' or 'exceljs'
  const csvContent = exportToCSV(registrations);
  downloadCSV(csvContent, filename.replace('.xlsx', '.csv'));
};
