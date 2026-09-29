import type { D1Database } from '@cloudflare/workers-types';
import type { Registration, AdminFilterOptions, RegistrationStats } from '../types/registration';

const generateRegistrationId = async (db: D1Database): Promise<string> => {
  const result = await db
    .prepare('SELECT COUNT(*) as count FROM registrations')
    .first<{ count: number }>();
  const count = (result?.count || 0) + 1;
  return `OGW-${String(count).padStart(6, '0')}`;
};

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const createRegistration = async (
  db: D1Database,
  data: Omit<Registration, 'id' | 'registrationId' | 'createdAt' | 'updatedAt'>,
  ipAddress?: string,
  userAgent?: string
): Promise<Registration> => {
  const id = generateUUID();
  const registrationId = await generateRegistrationId(db);
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO registrations (
      id, registration_id, full_name, email, whatsapp, city, age_range,
      courses_interested, training_goals, experience_level, previous_skills,
      learning_mode, preferred_time, training_plan, additional_goals,
      status, ip_address, user_agent, source, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  await stmt.bind(
    id,
    registrationId,
    data.fullName,
    data.email,
    data.whatsapp,
    data.city,
    data.ageRange,
    JSON.stringify(data.courses),
    JSON.stringify(data.goals),
    data.experience,
    JSON.stringify(data.previousSkills),
    data.learningMode,
    data.preferredTime,
    data.trainingPlan,
    data.additionalGoals || null,
    'registered',
    ipAddress || null,
    userAgent || null,
    data.source || 'web',
    now,
    now
  ).run();

  return {
    id,
    registrationId,
    ...data,
    createdAt: now,
    updatedAt: now,
    ipAddress,
    userAgent
  };
};

export const getRegistrations = async (
  db: D1Database,
  options: AdminFilterOptions = {}
): Promise<{ registrations: Registration[]; total: number }> => {
  let query = 'SELECT * FROM registrations WHERE 1=1';
  const params: unknown[] = [];

  if (options.search) {
    query += ' AND (full_name LIKE ? OR email LIKE ? OR city LIKE ?)';
    const searchTerm = `%${options.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (options.status) {
    query += ' AND status = ?';
    params.push(options.status);
  }

  if (options.city) {
    query += ' AND city = ?';
    params.push(options.city);
  }

  if (options.ageRange) {
    query += ' AND age_range = ?';
    params.push(options.ageRange);
  }

  if (options.experience) {
    query += ' AND experience_level = ?';
    params.push(options.experience);
  }

  if (options.dateFrom) {
    query += ' AND created_at >= ?';
    params.push(options.dateFrom);
  }

  if (options.dateTo) {
    query += ' AND created_at <= ?';
    params.push(options.dateTo);
  }

  // Get total count
  const countStmt = db.prepare(query.replace('SELECT *', 'SELECT COUNT(*) as count'));
  const countResult = await (params.length > 0 
    ? countStmt.bind(...params).first<{ count: number }>()
    : countStmt.first<{ count: number }>());
  const total = countResult?.count || 0;

  // Get paginated results
  query += ' ORDER BY created_at DESC';
  const limit = options.limit || 50;
  const offset = options.offset || 0;
  query += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const stmt = db.prepare(query);
  const results = await stmt.bind(...params).all<any>();
  
  const registrations: Registration[] = (results.results || []).map((row: any) => ({
    id: row.id,
    registrationId: row.registration_id,
    fullName: row.full_name,
    email: row.email,
    whatsapp: row.whatsapp,
    city: row.city,
    ageRange: row.age_range,
    courses: JSON.parse(row.courses_interested || '[]'),
    goals: JSON.parse(row.training_goals || '[]'),
    experience: row.experience_level,
    previousSkills: JSON.parse(row.previous_skills || '[]'),
    learningMode: row.learning_mode,
    preferredTime: row.preferred_time,
    trainingPlan: row.training_plan,
    additionalGoals: row.additional_goals,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    source: row.source,
    contactedAt: row.contacted_at,
    enrolledAt: row.enrolled_at
  }));

  return { registrations, total };
};

export const getRegistrationById = async (
  db: D1Database,
  id: string
): Promise<Registration | null> => {
  const result = await db
    .prepare('SELECT * FROM registrations WHERE id = ? OR registration_id = ?')
    .bind(id, id)
    .first<any>();

  if (!result) return null;

  return {
    id: result.id,
    registrationId: result.registration_id,
    fullName: result.full_name,
    email: result.email,
    whatsapp: result.whatsapp,
    city: result.city,
    ageRange: result.age_range,
    courses: JSON.parse(result.courses_interested || '[]'),
    goals: JSON.parse(result.training_goals || '[]'),
    experience: result.experience_level,
    previousSkills: JSON.parse(result.previous_skills || '[]'),
    learningMode: result.learning_mode,
    preferredTime: result.preferred_time,
    trainingPlan: result.training_plan,
    additionalGoals: result.additional_goals,
    status: result.status,
    notes: result.notes,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
    ipAddress: result.ip_address,
    userAgent: result.user_agent,
    source: result.source,
    contactedAt: result.contacted_at,
    enrolledAt: result.enrolled_at
  };
};

export const updateRegistrationStatus = async (
  db: D1Database,
  id: string,
  status: string,
  notes?: string
): Promise<void> => {
  const now = new Date().toISOString();
  const contactedAt = status === 'contacted' ? now : undefined;
  const enrolledAt = status === 'enrolled' ? now : undefined;

  const stmt = db.prepare(`
    UPDATE registrations
    SET status = ?, notes = ?, updated_at = ?
    ${contactedAt ? ', contacted_at = ?' : ''}
    ${enrolledAt ? ', enrolled_at = ?' : ''}
    WHERE id = ? OR registration_id = ?
  `);

  const params = [status, notes || null, now];
  if (contactedAt) params.push(contactedAt);
  if (enrolledAt) params.push(enrolledAt);
  params.push(id, id);

  await stmt.bind(...params).run();
};

export const bulkUpdateStatus = async (
  db: D1Database,
  ids: string[],
  status: string
): Promise<number> => {
  const now = new Date().toISOString();
  const placeholders = ids.map(() => '?').join(',');
  
  const stmt = db.prepare(`
    UPDATE registrations
    SET status = ?, updated_at = ?
    WHERE id IN (${placeholders}) OR registration_id IN (${placeholders})
  `);

  const params = [status, now, ...ids, ...ids];
  const result = await stmt.bind(...params).run();
  return result.meta.duration || 0;
};

export const getRegistrationStats = async (
  db: D1Database
): Promise<RegistrationStats> => {
  const baseQuery = 'SELECT * FROM registrations';
  const result = await db.prepare(baseQuery).all<any>();
  const rows = result.results || [];

  const stats: RegistrationStats = {
    total: rows.length,
    registered: 0,
    contacted: 0,
    enrolled: 0,
    dropped: 0,
    byCourse: {},
    byCity: {},
    byExperience: {},
    byAgeRange: {}
  };

  rows.forEach((row: any) => {
    // Status counts
    if (row.status === 'registered') stats.registered++;
    else if (row.status === 'contacted') stats.contacted++;
    else if (row.status === 'enrolled') stats.enrolled++;
    else if (row.status === 'dropped') stats.dropped++;

    // Course counts
    const courses = JSON.parse(row.courses_interested || '[]');
    courses.forEach((course: string) => {
      stats.byCourse[course] = (stats.byCourse[course] || 0) + 1;
    });

    // City counts
    if (row.city) {
      stats.byCity[row.city] = (stats.byCity[row.city] || 0) + 1;
    }

    // Experience counts
    if (row.experience_level) {
      stats.byExperience[row.experience_level] = (stats.byExperience[row.experience_level] || 0) + 1;
    }

    // Age range counts
    if (row.age_range) {
      stats.byAgeRange[row.age_range] = (stats.byAgeRange[row.age_range] || 0) + 1;
    }
  });

  return stats;
};

export const emailExists = async (
  db: D1Database,
  email: string
): Promise<boolean> => {
  const result = await db
    .prepare('SELECT COUNT(*) as count FROM registrations WHERE email = ?')
    .bind(email)
    .first<{ count: number }>();
  return (result?.count || 0) > 0;
};
