import type { Registration } from '../types/registration';

export const exportToCSV = (registrations: Registration[]): string => {
  const headers = [
    'Registration ID', 'Full Name', 'Email', 'WhatsApp', 'City', 'Age Range',
    'Courses', 'Goals', 'Experience', 'Previous Skills', 'Learning Mode',
    'Preferred Time', 'Training Plan', 'Additional Goals', 'Status', 'Notes',
    'Created At', 'Updated At'
  ];
  const escapeCSV = (value: unknown) => {
    const text = Array.isArray(value) ? value.join('; ') : String(value ?? '');
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const rows = registrations.map((registration) => [
    registration.registrationId, registration.fullName, registration.email,
    registration.whatsapp, registration.city, registration.ageRange,
    registration.courses, registration.goals, registration.experience,
    registration.previousSkills, registration.learningMode, registration.preferredTime,
    registration.trainingPlan, registration.additionalGoals, registration.status,
    registration.notes, registration.createdAt, registration.updatedAt
  ].map(escapeCSV).join(','));
  return [headers.join(','), ...rows].join('\r\n');
};

export const exportToJSON = (registrations: Registration[]): string => JSON.stringify(registrations, null, 2);

export const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadCSV = (csvContent: string, filename = 'registrations.csv') => downloadFile(csvContent, filename, 'text/csv;charset=utf-8');
export const downloadJSON = (jsonContent: string, filename = 'registrations.json') => downloadFile(jsonContent, filename, 'application/json;charset=utf-8');

// Excel-compatible HTML workbook. Excel opens the .xls download directly without a third-party API key.
export const downloadExcel = (registrations: Registration[], filename = 'registrations.xls') => {
  const headers = ['Registration ID', 'Full Name', 'Email', 'WhatsApp', 'City', 'Courses', 'Goals', 'Experience', 'Status', 'Created At'];
  const escape = (value: unknown) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rows = registrations.map((registration) => [registration.registrationId, registration.fullName, registration.email, registration.whatsapp, registration.city, registration.courses.join('; '), registration.goals.join('; '), registration.experience, registration.status, registration.createdAt]);
  const html = `<table><tr>${headers.map((header) => `<th>${escape(header)}</th>`).join('')}</tr>${rows.map((row) => `<tr>${row.map((value) => `<td>${escape(value)}</td>`).join('')}</tr>`).join('')}</table>`;
  downloadFile(`<!doctype html><meta charset="utf-8">${html}`, filename, 'application/vnd.ms-excel');
};
