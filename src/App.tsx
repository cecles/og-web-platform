import { useEffect, useMemo, useState } from 'react';

type ThemeMode = 'dark' | 'light';

type RegistrationForm = {
  fullName: string;
  whatsapp: string;
  email: string;
  city: string;
  ageRange: string;
  courses: string[];
  goals: string[];
  experience: string;
  previousSkills: string[];
  learningMode: string;
  preferredTime: string;
  trainingPlan: string;
  additionalGoals: string;
};

const storageKey = 'og-web-registration-draft';

const stepLabels = [
  'Full name',
  'WhatsApp number',
  'Email',
  'City/location',
  'Age range',
  'Courses',
  'Training goal',
  'Experience',
  'Previous skills',
  'Learning mode',
  'Preferred time',
  'Training plan',
  'Comments',
  'Review',
  'Confirmation'
];

const ageOptions = ['18-24', '25-34', '35-44', '45-54', '55+'];
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
const goalOptions = [
  'Get a job',
  'Start a business',
  'Freelance',
  'Build websites/apps',
  'Make money online',
  'Start a tech career',
  'Personal development',
  'Other'
];
const experienceOptions = ['Absolute beginner', 'Beginner', 'Intermediate', 'Advanced'];
const skillOptions = ['HTML/CSS', 'JavaScript', 'UI Design', 'Marketing', 'Graphics', 'Video', 'Python'];
const modeOptions = ['Online', 'Offline', 'Hybrid'];
const timeOptions = ['Morning', 'Afternoon', 'Evening', 'Flexible'];
const planOptions = ['Single Course', 'Multiple Courses', 'Full Stack'];

const initialForm: RegistrationForm = {
  fullName: '',
  whatsapp: '',
  email: '',
  city: '',
  ageRange: '',
  courses: [],
  goals: [],
  experience: '',
  previousSkills: [],
  learningMode: '',
  preferredTime: '',
  trainingPlan: '',
  additionalGoals: ''
};

function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [registrationId, setRegistrationId] = useState('OGW-000001');
  const [resumeMessage, setResumeMessage] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('og-web-theme') as ThemeMode | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('og-web-theme', theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as { step?: number; form?: Partial<RegistrationForm> };
      if (parsed.form) {
        setForm({ ...initialForm, ...parsed.form });
      }
      if (typeof parsed.step === 'number') {
        setStep(Math.min(parsed.step, stepLabels.length - 1));
      }
      setResumeMessage('Your saved progress has been restored.');
    } catch {
      setResumeMessage('');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ step, form }));
  }, [step, form]);

  const progress = ((step + 1) / stepLabels.length) * 100;
  const currentStepTitle = stepLabels[step];

  const canProceed = useMemo(() => {
    if (step === 0 && !form.fullName.trim()) return false;
    if (step === 1 && !form.whatsapp.trim()) return false;
    if (step === 2 && !form.email.trim()) return false;
    if (step === 3 && !form.city.trim()) return false;
    if (step === 4 && !form.ageRange) return false;
    if (step === 5 && form.courses.length === 0) return false;
    if (step === 6 && form.goals.length === 0) return false;
    if (step === 7 && !form.experience) return false;
    if (step === 9 && !form.learningMode) return false;
    if (step === 10 && !form.preferredTime) return false;
    if (step === 11 && !form.trainingPlan) return false;
    if (step === 12 && !form.additionalGoals.trim()) return false;
    return true;
  }, [step, form]);

  const updateField = <K extends keyof RegistrationForm>(key: K, value: RegistrationForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = (
    key: 'courses' | 'goals' | 'previousSkills',
    value: string
  ) => {
    setForm((prev) => {
      const values = [...prev[key]];
      const alreadySelected = values.includes(value);
      return {
        ...prev,
        [key]: alreadySelected ? values.filter((item) => item !== value) : [...values, value]
      };
    });
  };

  const nextStep = () => {
    if (step < stepLabels.length - 1) {
      setStep((value) => value + 1);
    }
  };

  const previousStep = () => {
    if (step > 0) {
      setStep((value) => value - 1);
    }
  };

  const restart = () => {
    localStorage.removeItem(storageKey);
    setForm(initialForm);
    setStep(0);
    setSubmitted(false);
  };

  const submitRegistration = () => {
    const generatedId = `OGW-${String(Math.floor(Math.random() * 90000) + 10000)}`;
    setRegistrationId(generatedId);
    localStorage.removeItem(storageKey);
    setSubmitted(true);
  };

  const renderStepContent = () => {
    if (submitted) {
      return (
        <div className="success-panel">
          <div className="success-badge">Registration successful</div>
          <h2>🎉 Welcome to OG WEB</h2>
          <p>
            Thank you for registering for the OG WEB 3-Day Webinar. We'll keep you posted here on WhatsApp and email.
          </p>
          <div className="success-meta">
            <span>Registration ID</span>
            <strong>{registrationId}</strong>
          </div>
          <div className="review-stack small-grid">
            <div>
              <label>Name</label>
              <strong>{form.fullName}</strong>
            </div>
            <div>
              <label>Location</label>
              <strong>{form.city}</strong>
            </div>
            <div>
              <label>Courses</label>
              <strong>{form.courses.join(', ') || '—'}</strong>
            </div>
            <div>
              <label>Goal</label>
              <strong>{form.goals[0] || '—'}</strong>
            </div>
          </div>
          <div className="actions-row single-action">
            <button className="primary-btn" type="button" onClick={restart}>
              Register another person
            </button>
          </div>
        </div>
      );
    }

    switch (step) {
      case 0:
        return (
          <label className="field-label">
            <span>1/14 — What is your full name?</span>
            <input
              type="text"
              value={form.fullName}
              placeholder="Enter your full name"
              onChange={(event) => updateField('fullName', event.target.value)}
            />
          </label>
        );
      case 1:
        return (
          <label className="field-label">
            <span>2/14 — What is your WhatsApp number?</span>
            <input
              type="tel"
              value={form.whatsapp}
              placeholder="e.g. +234 800 000 0000"
              onChange={(event) => updateField('whatsapp', event.target.value)}
            />
          </label>
        );
      case 2:
        return (
          <label className="field-label">
            <span>3/14 — What is your email address?</span>
            <input
              type="email"
              value={form.email}
              placeholder="you@example.com"
              onChange={(event) => updateField('email', event.target.value)}
            />
          </label>
        );
      case 3:
        return (
          <label className="field-label">
            <span>4/14 — Which city or location are you in?</span>
            <input
              type="text"
              value={form.city}
              placeholder="Port Harcourt, Lagos, Abuja..."
              onChange={(event) => updateField('city', event.target.value)}
            />
          </label>
        );
      case 4:
        return (
          <div className="option-group">
            <span>5/14 — Select your age range</span>
            {ageOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`choice-btn ${form.ageRange === option ? 'active' : ''}`}
                onClick={() => updateField('ageRange', option)}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="option-group multi-select">
            <span>6/14 — What would you like to learn?</span>
            {courseOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`choice-btn ${form.courses.includes(option) ? 'active' : ''}`}
                onClick={() => toggleArrayValue('courses', option)}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 6:
        return (
          <div className="option-group multi-select">
            <span>7/14 — What is your main goal?</span>
            {goalOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`choice-btn ${form.goals.includes(option) ? 'active' : ''}`}
                onClick={() => toggleArrayValue('goals', option)}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 7:
        return (
          <div className="option-group">
            <span>8/14 — What is your experience level?</span>
            {experienceOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`choice-btn ${form.experience === option ? 'active' : ''}`}
                onClick={() => updateField('experience', option)}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 8:
        return (
          <div className="option-group multi-select">
            <span>9/14 — Do you have previous skills? If yes, tell us which ones.</span>
            <div className="inline-actions">
              <button
                type="button"
                className={`choice-btn ${form.previousSkills.length > 0 ? 'active' : ''}`}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    previousSkills: prev.previousSkills.length > 0 ? [] : ['HTML/CSS']
                  }))
                }
              >
                Yes, I have skills
              </button>
              <button
                type="button"
                className={`choice-btn ${form.previousSkills.length === 0 ? 'active' : ''}`}
                onClick={() => updateField('previousSkills', [])}
              >
                No, I'm starting fresh
              </button>
            </div>

            {form.previousSkills.length > 0 && (
              <div className="multi-grid">
                {skillOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`pill ${form.previousSkills.includes(option) ? 'selected' : ''}`}
                    onClick={() => toggleArrayValue('previousSkills', option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      case 9:
        return (
          <div className="option-group">
            <span>10/14 — What learning mode do you prefer?</span>
            {modeOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`choice-btn ${form.learningMode === option ? 'active' : ''}`}
                onClick={() => updateField('learningMode', option)}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 10:
        return (
          <div className="option-group">
            <span>11/14 — Which time is best for you?</span>
            {timeOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`choice-btn ${form.preferredTime === option ? 'active' : ''}`}
                onClick={() => updateField('preferredTime', option)}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 11:
        return (
          <div className="option-group">
            <span>12/14 — Which training plan do you prefer?</span>
            {planOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`choice-btn ${form.trainingPlan === option ? 'active' : ''}`}
                onClick={() => updateField('trainingPlan', option)}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 12:
        return (
          <label className="field-label">
            <span>13/14 — Any additional goals or comments?</span>
            <textarea
              value={form.additionalGoals}
              placeholder="Tell us what you hope to achieve..."
              onChange={(event) => updateField('additionalGoals', event.target.value)}
            />
          </label>
        );
      case 13:
        return (
          <div className="review-panel">
            <span>14/14 — Please review your registration</span>
            <div className="review-stack">
              <div>
                <label>Name</label>
                <strong>{form.fullName || 'Not provided'}</strong>
              </div>
              <div>
                <label>WhatsApp</label>
                <strong>{form.whatsapp || 'Not provided'}</strong>
              </div>
              <div>
                <label>Email</label>
                <strong>{form.email || 'Not provided'}</strong>
              </div>
              <div>
                <label>Location</label>
                <strong>{form.city || 'Not provided'}</strong>
              </div>
              <div>
                <label>Age</label>
                <strong>{form.ageRange || 'Not provided'}</strong>
              </div>
              <div>
                <label>Courses</label>
                <strong>{form.courses.join(', ') || 'Not provided'}</strong>
              </div>
              <div>
                <label>Goal</label>
                <strong>{form.goals.join(', ') || 'Not provided'}</strong>
              </div>
              <div>
                <label>Experience</label>
                <strong>{form.experience || 'Not provided'}</strong>
              </div>
              <div>
                <label>Mode</label>
                <strong>{form.learningMode || 'Not provided'}</strong>
              </div>
              <div>
                <label>Time</label>
                <strong>{form.preferredTime || 'Not provided'}</strong>
              </div>
              <div>
                <label>Plan</label>
                <strong>{form.trainingPlan || 'Not provided'}</strong>
              </div>
              <div>
                <label>Additional info</label>
                <strong>{form.additionalGoals || 'None'}</strong>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isFinalStep = step === 13;

  return (
    <div className={`app-shell ${theme}`}>
      <div className="floating-glow" />

      <main className="platform-shell">
        <aside className="preview-panel card-surface">
          <div className="mini-brand">OG WEB</div>

          <div className="preview-card hero-card">
            <h3>Learn • Grow • Earn</h3>
            <p>Welcome to OG WEB LLC SERVICES</p>
            <div className="mini-progress">
              <span />
            </div>
          </div>

          <div className="preview-card course-card">
            <div className="title-row">
              <span>Skills</span>
              <button type="button">+ New</button>
            </div>
            <div className="course-list">
              <span>Web Development</span>
              <span>AI Tools</span>
              <span>Design</span>
            </div>
          </div>

          <div className="preview-card stats-card">
            <div className="stat-row">
              <strong>120+</strong>
              <span>Registrations</span>
            </div>
            <div className="stat-row">
              <strong>08</strong>
              <span>Courses</span>
            </div>
          </div>
        </aside>

        <section className="form-panel card-surface">
          <header className="topbar">
            <div>
              <span className="eyebrow">3-Day Webinar Registration</span>
              <h1>{step === 13 ? 'Review details' : 'Join the OG WEB webinar'}</h1>
            </div>
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </header>

          <div className="progress-wrap">
            <div className="progress-bar">
              <span style={{ width: `${progress}%` }} />
            </div>
            <small>
              {step + 1} / {stepLabels.length}
            </small>
          </div>

          {resumeMessage && <div className="resume-banner">{resumeMessage}</div>}

          <div className="step-card">
            <div className="step-header">
              <span className="crumb">{currentStepTitle}</span>
            </div>
            {renderStepContent()}
          </div>

          <div className="actions-row">
            <button
              className="ghost-btn"
              onClick={previousStep}
              type="button"
              disabled={step === 0 || submitted}
            >
              Back
            </button>
            <button className="ghost-btn" onClick={restart} type="button" disabled={submitted}>
              Restart
            </button>
            <button
              className="ghost-btn"
              onClick={() => setStep(13)}
              type="button"
              disabled={submitted || step === 13}
            >
              Edit
            </button>
            <button
              className="primary-btn"
              type="button"
              onClick={() => {
                if (isFinalStep) {
                  submitRegistration();
                  return;
                }
                if (canProceed) {
                  nextStep();
                }
              }}
              disabled={!canProceed && !isFinalStep}
            >
              {isFinalStep ? 'Confirm registration' : 'Next'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

