import { useEffect, useMemo, useState } from 'react';
import type { Registration, RegistrationStats } from '../../types/registration';
import { exportToCSV, exportToJSON, downloadCSV, downloadJSON, downloadExcel } from '../../utils/export';
import './AdminDashboard.css';

const courseOptions = [
  'Web Development',
  'Mobile Development',
  'UI/UX',
  'Digital Marketing',
  'AI & Productivity',
  'Graphics Design',
  'Video Editing',
  'Cybersecurity'
];

const cityOptions = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan',
  'Akure', 'Calabar', 'Benin', 'Enugu', 'Others'
];

const experienceOptions = ['Absolute beginner', 'Beginner', 'Intermediate', 'Advanced'];
const ageOptions = ['18-24', '25-34', '35-44', '45-54', '55+'];

function RegistrationDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    city: '',
    experience: '',
    course: '',
    ageRange: ''
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    loadRegistrations();
    loadStats();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/registrations?search=${search}&status=${filters.status}&city=${filters.city}&experience=${filters.experience}&limit=${pageSize}&offset=${page * pageSize}`
      );
      const data = await response.json();
      setRegistrations(data.registrations || []);
    } catch (error) {
      console.error('Failed to load registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/registrations/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const filteredRegistrations = useMemo(() => {
    let result = registrations;

    if (filters.course) {
      result = result.filter((reg) => reg.courses.includes(filters.course));
    }

    return result;
  }, [registrations, filters.course]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredRegistrations.map((r) => r.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedIds.length === 0) return;

    try {
      await fetch('/api/admin/registrations/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status: bulkStatus })
      });
      await loadRegistrations();
      setSelectedIds([]);
      setBulkStatus('');
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'xlsx') => {
    try {
      const response = await fetch(`/api/admin/registrations/export?format=${format}`);
      const data = await response.json();

      if (format === 'csv') {
        const csv = exportToCSV(data.registrations);
        downloadCSV(csv, `og-web-registrations-${new Date().toISOString().split('T')[0]}.csv`);
      } else if (format === 'json') {
        const json = exportToJSON(data.registrations);
        downloadJSON(json, `og-web-registrations-${new Date().toISOString().split('T')[0]}.json`);
      } else if (format === 'xlsx') {
        await downloadExcel(data.registrations, `og-web-registrations-${new Date().toISOString().split('T')[0]}.xlsx`);
      }
      setShowExportMenu(false);
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Registration Dashboard</h1>
        <div className="header-actions">
          <div className="export-dropdown">
            <button type="button" className="btn-export" onClick={() => setShowExportMenu(!showExportMenu)}>
              📥 Export
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <button type="button" onClick={() => handleExport('csv')}>Export as CSV</button>
                <button type="button" onClick={() => handleExport('json')}>Export as JSON</button>
                <button type="button" onClick={() => handleExport('xlsx')}>Export as Excel</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="label">Total</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat-card">
            <span className="label">Registered</span>
            <strong>{stats.registered}</strong>
          </div>
          <div className="stat-card">
            <span className="label">Contacted</span>
            <strong>{stats.contacted}</strong>
          </div>
          <div className="stat-card">
            <span className="label">Enrolled</span>
            <strong>{stats.enrolled}</strong>
          </div>
        </div>
      )}

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by name, email, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="registered">Registered</option>
          <option value="contacted">Contacted</option>
          <option value="enrolled">Enrolled</option>
          <option value="dropped">Dropped</option>
        </select>

        <select
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="filter-select"
        >
          <option value="">All Cities</option>
          {cityOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select
          value={filters.experience}
          onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
          className="filter-select"
        >
          <option value="">All Experience</option>
          {experienceOptions.map((exp) => (
            <option key={exp} value={exp}>
              {exp}
            </option>
          ))}
        </select>

        <select
          value={filters.course}
          onChange={(e) => setFilters({ ...filters, course: e.target.value })}
          className="filter-select"
        >
          <option value="">All Courses</option>
          {courseOptions.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>

        <button type="button" className="btn-reset" onClick={() => {
          setSearch('');
          setFilters({ status: '', city: '', experience: '', course: '', ageRange: '' });
        }}>
          Reset
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedIds.length} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">Change status...</option>
            <option value="registered">Registered</option>
            <option value="contacted">Contacted</option>
            <option value="enrolled">Enrolled</option>
            <option value="dropped">Dropped</option>
          </select>
          <button
            type="button"
            className="btn-primary"
            onClick={handleBulkStatusUpdate}
            disabled={!bulkStatus}
          >
            Update
          </button>
        </div>
      )}

      <div className="table-wrapper">
        <table className="registrations-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>City</th>
              <th>Courses</th>
              <th>Experience</th>
              <th>Status</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center">Loading...</td>
              </tr>
            ) : filteredRegistrations.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center">No registrations found</td>
              </tr>
            ) : (
              filteredRegistrations.map((reg) => (
                <tr key={reg.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(reg.id)}
                      onChange={(e) => handleSelectOne(reg.id, e.target.checked)}
                    />
                  </td>
                  <td className="font-mono">{reg.registrationId}</td>
                  <td className="font-bold">{reg.fullName}</td>
                  <td>{reg.email}</td>
                  <td>{reg.city}</td>
                  <td>
                    <div className="courses-tags">
                      {reg.courses.slice(0, 2).map((course) => (
                        <span key={course} className="tag">{course}</span>
                      ))}
                      {reg.courses.length > 2 && <span className="tag">+{reg.courses.length - 2}</span>}
                    </div>
                  </td>
                  <td>{reg.experience}</td>
                  <td>
                    <span className={`status-badge status-${reg.status}`}>{reg.status}</span>
                  </td>
                  <td>{new Date(reg.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button type="button" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button type="button" onClick={() => setPage(page + 1)} disabled={filteredRegistrations.length < pageSize}>
          Next
        </button>
      </div>
    </div>
  );
}

export default RegistrationDashboard;
