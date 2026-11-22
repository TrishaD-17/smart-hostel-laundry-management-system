import { useMemo, useState } from 'react'
import {
  ArrowDownUp, ArrowRight, Bell, CalendarDays, Check, CheckCheck, ChevronDown,
  CircleHelp, Clock3, Droplets, LayoutDashboard, LogOut, Menu, MessageSquareWarning,
  PackageCheck, Plus, Search, Shirt, Sparkles, Users, WashingMachine, X,
} from 'lucide-react'
import { statusSteps } from './data/initialData.js'
import { useLaundry } from './context/LaundryContext.jsx'
import { STAFF_EMAIL, normalizeEmail } from './services/authService.js'
import { isValidEmail, validateRegistration } from './services/registrationValidation.js'

const dateLabel = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '—'
const fullDate = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'
const initials = (name) => name.split(' ').map((part) => part[0]).slice(0, 2).join('')

function StatusBadge({ status }) {
  const classes = {
    Received: 'status-received',
    Sorting: 'status-sorting',
    Washing: 'status-washing',
    Drying: 'status-drying',
    'Ready for Collection': 'status-ready',
    Collected: 'status-collected',
  }
  return <span className={`status-badge ${classes[status] || ''}`}><span />{status}</span>
}

function Modal({ title, eyebrow, onClose, children, wide = false }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-heading">
          <div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button>
        </div>
        {children}
      </section>
    </div>
  )
}

function Login({ onLogin, onRegister }) {
  const [activeTab, setActiveTab] = useState('signin')
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('ananya.sen@campus.edu')
  const [password, setPassword] = useState('')
  const [registration, setRegistration] = useState({ name: '', email: '', hostel: '', roomNumber: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!isValidEmail(email) || !password) {
      setError('Enter a valid campus email and password to continue.')
      return
    }
    setBusy(true)
    try {
      await onLogin({ role, email, password })
    } catch (loginError) {
      setError(loginError.message || 'We could not sign you in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function switchRole(nextRole) {
    setRole(nextRole)
    setEmail(nextRole === 'student' ? 'ananya.sen@campus.edu' : STAFF_EMAIL)
    setPassword('')
    setError('')
    setSuccess('')
  }

  function switchTab(nextTab) {
    setActiveTab(nextTab)
    setError('')
    setSuccess('')
    if (nextTab === 'create') {
      setRole('student')
      setRegistration((current) => ({ ...current, email: '' }))
    }
  }

  function updateRegistration(field, value) {
    setRegistration((current) => ({ ...current, [field]: value }))
    setError('')
  }

  async function submitRegistration(event) {
    event.preventDefault()
    const validationError = validateRegistration(registration)
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setBusy(true)
    try {
      await onRegister(registration)
      setEmail(normalizeEmail(registration.email))
      setPassword('')
      setRole('student')
      setSuccess('Your Washday account is ready. Sign in with your new email and password.')
      setActiveTab('signin')
      setRegistration({ name: '', email: '', hostel: '', roomNumber: '', password: '', confirmPassword: '' })
    } catch (registrationError) {
      setError(registrationError.message || 'We could not create your account. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-shell">
      <div className="login-brand"><span className="brand-mark"><WashingMachine size={22} /></span><span>Washday<span className="brand-dot">.</span></span></div>
      <div className="login-card">
        <div className="login-art">
          <div className="art-glow" />
          <div className="laundry-illustration"><Shirt size={58} strokeWidth={1.2} /><Sparkles className="sparkle-one" size={18} /><Droplets className="sparkle-two" size={20} /></div>
          <div className="art-copy"><span className="eyebrow light-eyebrow">CAMPUS LAUNDRY, MADE SIMPLE</span><h2>A little more time<br />for the things you love.</h2><p>Drop it off. Track every step. Pick it up fresh.</p></div>
          <div className="art-footer"><span>Thoughtful care, every cycle</span><span className="art-footer-line" /></div>
        </div>
        <div className="login-form-wrap">
          <div className="eyebrow">WELCOME TO WASHDAY</div>
          <h1>Good laundry<br />starts here.</h1>
          <p className="muted login-intro">{activeTab === 'signin' ? 'Sign in to manage your campus laundry.' : 'Create your student account to get started.'}</p>
          <div className="auth-tabs" role="tablist" aria-label="Account options">
            <button type="button" role="tab" aria-selected={activeTab === 'signin'} className={activeTab === 'signin' ? 'selected' : ''} onClick={() => switchTab('signin')}>Sign In</button>
            <button type="button" role="tab" aria-selected={activeTab === 'create'} className={activeTab === 'create' ? 'selected' : ''} onClick={() => switchTab('create')}>Create Account</button>
          </div>
          {activeTab === 'signin' ? <>
            <div className="role-switch" aria-label="Choose sign-in portal">
              <button type="button" className={role === 'student' ? 'selected' : ''} onClick={() => switchRole('student')}><Users size={16} /> Student</button>
              <button type="button" className={role === 'staff' ? 'selected' : ''} onClick={() => switchRole('staff')}><WashingMachine size={16} /> Laundry staff</button>
            </div>
            <form onSubmit={submit} className="login-fields" noValidate>
              <label>Campus email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@campus.edu" required /></label>
              <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /></label>
              {error && <div className="form-error" role="alert">{error}</div>}
              {success && <div className="form-success" role="status">{success}</div>}
              <button className="button button-primary button-full" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} /></button>
            </form>
            <div className="demo-hint"><span className="demo-icon"><Sparkles size={15} /></span><span><strong>Demo account?</strong> Seeded student accounts and the staff demo still accept any non-empty password.</span></div>
          </> : <>
            <form onSubmit={submitRegistration} className="login-fields registration-fields" noValidate>
              <label>Full name<input type="text" autoComplete="name" value={registration.name} onChange={(event) => updateRegistration('name', event.target.value)} placeholder="Your full name" required /></label>
              <label>Campus email<input type="email" autoComplete="email" value={registration.email} onChange={(event) => updateRegistration('email', event.target.value)} placeholder="you@campus.edu" required /></label>
              <div className="registration-row">
                <label>Hostel name<input type="text" autoComplete="organization" value={registration.hostel} onChange={(event) => updateRegistration('hostel', event.target.value)} placeholder="e.g. Maple Hall" required /></label>
                <label>Room number<input type="text" value={registration.roomNumber} onChange={(event) => updateRegistration('roomNumber', event.target.value)} placeholder="e.g. 204" required /></label>
              </div>
              <label>Password<input type="password" autoComplete="new-password" value={registration.password} onChange={(event) => updateRegistration('password', event.target.value)} placeholder="Create a strong password" required /><small className="password-hint">8+ characters, upper and lowercase, number, and symbol.</small></label>
              <label>Confirm password<input type="password" autoComplete="new-password" value={registration.confirmPassword} onChange={(event) => updateRegistration('confirmPassword', event.target.value)} placeholder="Enter your password again" required /></label>
              {error && <div className="form-error" role="alert">{error}</div>}
              <button className="button button-primary button-full" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create student account'} <ArrowRight size={17} /></button>
            </form>
          </>}
        </div>
      </div>
      <div className="login-bottom">A calmer laundry day, right on campus <span>·</span> Demo environment</div>
    </main>
  )
}

function Sidebar({ role, student, page, setPage, onLogout, open, onClose, unread }) {
  const studentLinks = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'requests', label: 'My laundry', icon: Shirt },
    { id: 'history', label: 'Laundry history', icon: Clock3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unread },
    { id: 'complaints', label: 'Help & complaints', icon: CircleHelp },
  ]
  const staffLinks = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'requests', label: 'Laundry requests', icon: Shirt },
    { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
    { id: 'schedule', label: 'Collection schedule', icon: CalendarDays },
  ]
  const links = role === 'staff' ? staffLinks : studentLinks
  const user = role === 'staff' ? { name: 'Laundry team', detail: 'Staff portal', initials: 'LT', color: 'blue' } : student
  return (
    <>
      {open && <button className="sidebar-scrim" onClick={onClose} aria-label="Close menu" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand"><span className="brand-mark"><WashingMachine size={20} /></span><span>Washday<span className="brand-dot">.</span></span></div>
        <div className="portal-label">{role === 'staff' ? 'LAUNDRY STAFF' : 'STUDENT PORTAL'}</div>
        <nav className="side-nav">
          {links.map(({ id, label, icon: Icon, count }) => (
            <button key={id} onClick={() => { setPage(id); onClose() }} className={`nav-link ${page === id ? 'nav-active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {count > 0 && <span className="nav-count">{count}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-icon"><Sparkles size={17} /></span><strong>Fresh, every time.</strong><p>Need a hand? Our laundry team is here to help.</p><button onClick={() => setPage('complaints')}>Get support <ArrowRight size={14} /></button></div>
          <div className="profile-row">
            <span className={`avatar avatar-${user.color}`}>{user.initials}</span>
            <span className="profile-text"><strong>{user.name}</strong><small>{user.detail}</small></span>
            <button className="icon-button profile-logout" onClick={onLogout} aria-label="Sign out"><LogOut size={17} /></button>
          </div>
        </div>
      </aside>
    </>
  )
}

function PageHeader({ title, description, action, eyebrow }) {
  return <div className="page-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{description}</p></div>{action}</div>
}

function RequestTable({ requests, staff, onOpen, compact = false }) {
  const { students: people } = useLaundry()
  if (!requests.length) return <div className="empty-state"><span className="empty-icon"><Shirt size={23} /></span><strong>No laundry here yet</strong><p>When you submit a request, it will show up here.</p></div>
  return (
    <div className="table-scroll">
      <table className={compact ? 'compact-table' : ''}>
        <thead><tr><th>Token</th>{staff && <th>Student</th>}<th>Items</th><th>Status</th><th>Return by</th><th /></tr></thead>
        <tbody>
          {requests.map((request) => {
            const student = people.find((person) => person.id === request.studentId)
            const itemCount = request.items.reduce((sum, item) => sum + Number(item.quantity), 0)
            return <tr key={request.id} onClick={() => onOpen(request)} className="clickable-row">
              <td><span className="token">{request.token}</span><small className="table-sub">{dateLabel(request.submittedAt)}</small></td>
              {staff && <td><span className="student-cell"><span className={`avatar avatar-${student?.color || 'blue'} avatar-small`}>{student?.initials || 'ST'}</span><span>{student?.name || 'Student'}<small>{student?.room || ''}</small></span></span></td>}
              <td><span className="items-cell">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span><small className="table-sub">{request.items.map((item) => item.type).join(', ')}</small></td>
              <td><StatusBadge status={request.status} /></td>
              <td><span className="date-cell">{dateLabel(request.expectedDate)}</span></td>
              <td><button className="row-arrow" aria-label={`View ${request.token}`} onClick={(event) => { event.stopPropagation(); onOpen(request) }}><ArrowRight size={16} /></button></td>
            </tr>
          })}
        </tbody>
      </table>
    </div>
  )
}

function MetricCard({ label, value, note, icon: Icon, tone = 'blue' }) {
  return <div className="metric-card"><span className={`metric-icon metric-${tone}`}><Icon size={19} /></span><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-note">{note}</div></div>
}

function StudentOverview({ requests, notifications, onOpen, onPage, onNew }) {
  const active = requests.filter((request) => request.status !== 'Collected')
  const ready = active.filter((request) => request.status === 'Ready for Collection').length
  const next = active.find((request) => request.status === 'Ready for Collection') || active[0]
  const recent = [...requests].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 3)
  const unread = notifications.filter((item) => !item.read).length
  return (
    <>
      <div className="welcome-banner"><div className="welcome-text"><div className="eyebrow light-eyebrow">YOUR CAMPUS LAUNDRY</div><h2>A fresh start, <em>every day.</em></h2><p>Keep your laundry moving while you focus on what matters.</p><button className="button button-white" onClick={onNew}><Plus size={16} /> Place a laundry request</button></div><div className="banner-art"><div className="banner-orbit" /><Shirt size={106} strokeWidth={1.1} /><Sparkles className="banner-sparkle" size={22} /></div><div className="banner-stats"><span><strong>{active.length}</strong><small>Active requests</small></span><i /><span><strong>{ready}</strong><small>Ready to collect</small></span></div></div>
      <div className="metrics-grid student-metrics">
        <MetricCard label="In the laundry" value={active.length} note="Requests in progress" icon={WashingMachine} />
        <MetricCard label="Ready for you" value={ready} note={ready ? 'Drop by the laundry room' : 'We’ll let you know'} icon={PackageCheck} tone="green" />
        <MetricCard label="New updates" value={unread} note={unread ? 'Tap to catch up' : 'You’re all caught up'} icon={Bell} tone="gold" />
      </div>
      {next && <button className="next-step-card" onClick={() => onOpen(next)}>
        <span className="next-icon"><Droplets size={20} /></span><span className="next-copy"><small>{next.status === 'Ready for Collection' ? 'READY WHEN YOU ARE' : 'CURRENTLY IN PROGRESS'}</small><strong>{next.status === 'Ready for Collection' ? 'Your laundry is ready to collect' : `Your laundry is ${next.status.toLowerCase()}`}</strong><span>{next.token} <i>·</i> Expected {dateLabel(next.expectedDate)}</span></span><span className="next-link">Track laundry <ArrowRight size={15} /></span>
      </button>}
      <div className="section-heading"><div><h2>Recent laundry</h2><p>Your latest requests, all in one place.</p></div><button className="text-button" onClick={() => onPage('requests')}>View all <ArrowRight size={15} /></button></div>
      <div className="panel"><RequestTable requests={recent} onOpen={onOpen} compact /></div>
      <div className="dashboard-footnote"><span><CalendarDays size={16} /> Collection is open until 7:00 PM today.</span><button onClick={() => onPage('schedule')}>See collection hours <ArrowRight size={14} /></button></div>
    </>
  )
}

function StaffOverview({ requests, onOpen, onPage }) {
  const { complaints } = useLaundry()
  const pending = requests.filter((item) => item.status === 'Received').length
  const processing = requests.filter((item) => ['Sorting', 'Washing', 'Drying'].includes(item.status)).length
  const ready = requests.filter((item) => item.status === 'Ready for Collection').length
  const completed = requests.filter((item) => item.status === 'Collected').length
  const latest = [...requests].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 5)
  return (
    <>
      <div className="staff-banner"><div><span className="eyebrow light-eyebrow">LAUNDRY OPERATIONS</span><h2>Good morning, team.</h2><p>Here’s what’s happening in the laundry room today.</p></div><div className="staff-banner-date"><CalendarDays size={17} /> {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</div></div>
      <div className="metrics-grid staff-metrics">
        <MetricCard label="Pending intake" value={pending} note="Waiting to be sorted" icon={Clock3} tone="gold" />
        <MetricCard label="In progress" value={processing} note="Sorting, washing or drying" icon={WashingMachine} />
        <MetricCard label="Ready to collect" value={ready} note="Awaiting student pickup" icon={PackageCheck} tone="green" />
        <MetricCard label="Completed" value={completed} note="Collected by students" icon={CheckCheck} tone="purple" />
      </div>
      <div className="staff-shortcuts"><button onClick={() => onPage('requests')}><span className="shortcut-icon"><Shirt size={18} /></span><span><strong>Manage requests</strong><small>Update status and return dates</small></span><ArrowRight size={16} /></button><button onClick={() => onPage('complaints')}><span className="shortcut-icon shortcut-warm"><MessageSquareWarning size={18} /></span><span><strong>Review complaints</strong><small>{complaints.filter((item) => item.status !== 'Resolved').length} open student concerns</small></span><ArrowRight size={16} /></button></div>
      <div className="section-heading"><div><h2>Latest requests</h2><p>Recently submitted laundry from students.</p></div><button className="text-button" onClick={() => onPage('requests')}>All requests <ArrowRight size={15} /></button></div>
      <div className="panel"><RequestTable requests={latest} staff onOpen={onOpen} compact /></div>
    </>
  )
}

function RequestList({ requests, role, onOpen }) {
  const { students: people } = useLaundry()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All status')
  const filtered = requests.filter((request) => {
    const person = people.find((student) => student.id === request.studentId)
    const matchesText = `${request.token} ${person?.name || ''} ${request.items.map((item) => item.type).join(' ')}`.toLowerCase().includes(query.toLowerCase())
    return matchesText && (filter === 'All status' || request.status === filter)
  })
  return <>
    <PageHeader title={role === 'staff' ? 'Laundry requests' : 'My laundry'} description={role === 'staff' ? 'Search, track and update every student laundry request.' : 'Follow your laundry through every step of its journey.'} />
    <div className="list-toolbar"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={role === 'staff' ? 'Search token or student' : 'Search by token or clothing'} /></label><label className="filter-field"><ArrowDownUp size={15} /><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All status</option>{statusSteps.map((status) => <option key={status}>{status}</option>)}</select><ChevronDown size={14} /></label><span className="result-count">{filtered.length} {filtered.length === 1 ? 'request' : 'requests'}</span></div>
    <div className="panel"><RequestTable requests={filtered} staff={role === 'staff'} onOpen={onOpen} /></div>
  </>
}

function HistoryPage({ requests, onOpen }) {
  const completed = requests.filter((request) => request.status === 'Collected').sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
  return <><PageHeader title="Laundry history" description="A little archive of laundry days gone by." /><div className="history-summary"><span className="history-summary-icon"><CheckCheck size={19} /></span><span><strong>{completed.length} completed {completed.length === 1 ? 'request' : 'requests'}</strong><small>Every fresh fold, right here when you need it.</small></span></div><div className="panel"><RequestTable requests={completed} onOpen={onOpen} /></div></>
}

function NotificationsPage({ notifications, onRead, onOpen }) {
  const ordered = [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return <><PageHeader title="Notifications" description="Helpful little updates about your laundry." /><div className="notification-list">{ordered.length ? ordered.map((item) => <button key={item.id} className={`notification-card ${item.read ? '' : 'notification-unread'}`} onClick={() => { onRead(item.id); onOpen(item.requestId) }}><span className={`notification-icon ${item.title.toLowerCase().includes('ready') ? 'notification-green' : ''}`}>{item.title.toLowerCase().includes('ready') ? <PackageCheck size={19} /> : <Shirt size={19} />}</span><span className="notification-copy"><strong>{item.title}</strong><span>{item.message}</span><small>{dateLabel(item.createdAt)} {item.read ? '' : '· New'}</small></span><ArrowRight size={16} className="notification-arrow" /></button>) : <div className="panel"><div className="empty-state"><span className="empty-icon"><Bell size={22} /></span><strong>All caught up</strong><p>New updates will find their way here.</p></div></div>}</div></>
}

function ComplaintsPage({ role, complaints, onNew, onUpdate }) {
  const { students: people } = useLaundry()
  const openCount = complaints.filter((item) => item.status !== 'Resolved').length
  return <>
    <PageHeader title={role === 'staff' ? 'Complaints' : 'Help & complaints'} description={role === 'staff' ? 'Keep track of student concerns and follow-ups.' : 'Something not quite right? Let our team know.'} action={role === 'student' && <button className="button button-primary" onClick={onNew}><Plus size={16} /> Report an issue</button>} />
    {role === 'staff' && <div className="complaint-summary"><span className="complaint-summary-icon"><MessageSquareWarning size={18} /></span><strong>{openCount} open {openCount === 1 ? 'concern' : 'concerns'}</strong><span>·</span><span>{complaints.length} total reported</span></div>}
    <div className="complaint-list">{complaints.length ? complaints.map((item) => {
      const person = people.find((student) => student.id === item.studentId)
      return <article className="complaint-card" key={item.id}><div className="complaint-top"><span className={`complaint-type ${item.category === 'Missing item' ? 'complaint-missing' : ''}`}><MessageSquareWarning size={15} />{item.category}</span><span className={`complaint-status ${item.status === 'Resolved' ? 'resolved' : ''}`}>{item.status}</span></div><h3>{item.token} <span>·</span> {role === 'staff' ? person?.name : dateLabel(item.createdAt)}</h3><p>{item.description}</p><div className="complaint-footer"><span>{role === 'staff' && person ? `${person.room} · ` : ''}Reported {dateLabel(item.createdAt)}</span>{role === 'staff' && <select value={item.status} onChange={(event) => onUpdate(item.id, event.target.value)} aria-label={`Update complaint ${item.id}`}><option>Open</option><option>In review</option><option>Resolved</option></select>}</div></article>
    }) : <div className="panel"><div className="empty-state"><span className="empty-icon"><Check size={22} /></span><strong>No concerns to show</strong><p>{role === 'staff' ? 'New student reports will appear here.' : 'Your reports and their status will appear here.'}</p></div></div>}</div>
  </>
}

function SchedulePage({ schedules, role, onAdd, onRemove }) {
  return <><PageHeader title="Collection schedule" description="A convenient time to drop off or pick up your laundry." action={role === 'staff' && <button className="button button-primary" onClick={onAdd}><Plus size={16} /> Add time slot</button>} />
    <div className="schedule-banner"><span className="schedule-clock"><Clock3 size={22} /></span><div><strong>We’re here to help, Monday through Saturday.</strong><p>Visit the laundry room on the ground floor during one of the windows below.</p></div></div>
    <div className="schedule-grid">{schedules.map((slot) => <article className="schedule-card" key={slot.id}><div className="schedule-card-top"><span className="schedule-icon"><CalendarDays size={18} /></span>{role === 'staff' && <button className="icon-button delete-slot" onClick={() => onRemove(slot.id)} aria-label={`Remove ${slot.note}`}><X size={16} /></button>}</div><span className="eyebrow">{slot.note}</span><h3>{slot.day}</h3><div className="schedule-time"><Clock3 size={16} />{slot.time}</div><div className="schedule-location"><span>⌖</span>{slot.location}</div></article>)}</div>
    <div className="schedule-note"><Sparkles size={16} /><span>Collection schedule can change during holidays. We’ll post an update here if it does.</span></div>
  </>
}

function RequestModal({ request, role, onClose, onComplaint, onStatus, onDate, onCollect }) {
  const { students: people } = useLaundry()
  const student = people.find((item) => item.id === request.studentId)
  const currentStep = statusSteps.indexOf(request.status)
  const totalItems = request.items.reduce((sum, item) => sum + Number(item.quantity), 0)
  const [date, setDate] = useState(request.expectedDate)
  return <Modal title="Laundry details" eyebrow={request.token} onClose={onClose} wide>
    <div className="detail-meta"><span>Submitted {fullDate(request.submittedAt)}</span>{role === 'staff' && student && <span>· {student.name} · {student.room}</span>}<StatusBadge status={request.status} /></div>
    <div className="detail-content">
      <div className="detail-main">
        <div className="detail-section-title"><h3>Your laundry journey</h3><span>{currentStep + 1} of {statusSteps.length} steps</span></div>
        <div className="timeline">{statusSteps.map((step, index) => <div key={step} className={`timeline-step ${index < currentStep ? 'step-done' : ''} ${index === currentStep ? 'step-current' : ''}`}><span className="timeline-dot">{index < currentStep ? <Check size={12} /> : null}</span><span className="timeline-label">{step}</span>{index === currentStep && <small>In progress</small>}</div>)}</div>
        <div className="detail-section-title item-title"><h3>In this bag</h3><span>{totalItems} pieces</span></div>
        <div className="detail-items">{request.items.map((item) => <div key={item.type}><span>{item.type}</span><strong>× {item.quantity}</strong></div>)}</div>
        {request.notes && <div className="care-note"><Sparkles size={15} /><span><strong>Care note</strong>{request.notes}</span></div>}
      </div>
      <aside className="detail-aside"><div className="return-card"><span className="return-icon"><CalendarDays size={19} /></span><small>EXPECTED RETURN</small><strong>{fullDate(request.expectedDate)}</strong><span>We’ll notify you when it’s ready.</span></div>
        {role === 'staff' && <div className="staff-controls"><label>Update status<select value={request.status} onChange={(event) => onStatus(request.id, event.target.value)}>{statusSteps.map((status) => <option key={status}>{status}</option>)}</select></label><label>Expected return date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><button className="button button-secondary button-full" onClick={() => onDate(request.id, date)}>Save return date</button></div>}
        {role === 'student' && request.status === 'Ready for Collection' && <button className="button button-primary button-full collect-button" onClick={() => onCollect(request.id)}><Check size={16} /> Confirm collection</button>}
        {role === 'student' && <button className="report-link" onClick={() => onComplaint(request)}>Something missing or damaged? <ArrowRight size={14} /></button>}
      </aside>
    </div>
  </Modal>
}

function FormModal({ type, student, onClose, onSubmit }) {
  const [quantities, setQuantities] = useState({ Shirts: 0, Trousers: 0, Jeans: 0, Dresses: 0, Tops: 0, Towels: 0, Bedsheets: 0, Kurtas: 0 })
  const [expectedDate, setExpectedDate] = useState(() => { const date = new Date(); date.setDate(date.getDate() + 3); return date.toISOString().slice(0, 10) })
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState('Missing item')
  const [requestId, setRequestId] = useState('')
  const [description, setDescription] = useState('')
  const [day, setDay] = useState('Monday – Friday')
  const [time, setTime] = useState('8:00 AM – 10:00 AM')
  const [location, setLocation] = useState('Laundry room · Ground floor')
  const [slotNote, setSlotNote] = useState('Morning drop-off')
  const { requests } = useLaundry()
  const eligible = requests.filter((request) => request.studentId === student?.id)
  const total = Object.values(quantities).reduce((sum, value) => sum + Number(value), 0)
  const title = type === 'request' ? 'Start a laundry request' : type === 'complaint' ? 'Tell us what happened' : 'Add a collection time'
  function submit(event) {
    event.preventDefault()
    if (type === 'request') {
      onSubmit({ items: Object.entries(quantities).filter(([, quantity]) => Number(quantity) > 0).map(([itemType, quantity]) => ({ type: itemType, quantity: Number(quantity) })), expectedDate, notes })
    } else if (type === 'complaint') onSubmit({ requestId, category, description })
    else onSubmit({ day, time, location, note: slotNote })
  }
  return <Modal title={title} eyebrow={type === 'request' ? 'A FRESH CYCLE STARTS HERE' : type === 'complaint' ? 'WE’RE HERE TO HELP' : 'SCHEDULE MANAGEMENT'} onClose={onClose}>
    <form className="form-modal-body" onSubmit={submit}>
      {type === 'request' && <>
        <p className="form-intro">Tell us what’s in your laundry bag and we’ll take it from here.</p>
        <div className="quantity-list">{Object.entries(quantities).map(([itemType, quantity]) => <div className="quantity-row" key={itemType}><span><Shirt size={16} />{itemType}</span><div className="stepper"><button type="button" onClick={() => setQuantities((current) => ({ ...current, [itemType]: Math.max(0, current[itemType] - 1) }))} aria-label={`Remove one ${itemType}`}>−</button><strong>{quantity}</strong><button type="button" onClick={() => setQuantities((current) => ({ ...current, [itemType]: current[itemType] + 1 }))} aria-label={`Add one ${itemType}`}>+</button></div></div>)}</div>
        <div className="form-field"><label htmlFor="return-date">Expected return date</label><input id="return-date" type="date" min={new Date().toISOString().slice(0, 10)} value={expectedDate} onChange={(event) => setExpectedDate(event.target.value)} required /></div>
        <div className="form-field"><label htmlFor="care-notes">Care notes <span>(optional)</span></label><textarea id="care-notes" rows="2" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Anything our laundry team should know?" /></div>
        <div className="form-total"><span>{total} pieces in your bag</span><span>Campus laundry service</span></div>
        <button className="button button-primary button-full" type="submit" disabled={!total}>Generate laundry token <ArrowRight size={16} /></button>
        {!total && <small className="form-hint">Add at least one clothing item to continue.</small>}
      </>}
      {type === 'complaint' && <>
        <p className="form-intro">Missing a piece or something doesn’t look right? Let us know and we’ll follow up.</p>
        <div className="form-field"><label htmlFor="complaint-request">Laundry request</label><select id="complaint-request" value={requestId} onChange={(event) => setRequestId(event.target.value)} required><option value="">Choose a request</option>{eligible.map((request) => <option value={request.id} key={request.id}>{request.token} · {dateLabel(request.submittedAt)}</option>)}</select></div>
        <div className="form-field"><label htmlFor="complaint-category">What happened?</label><select id="complaint-category" value={category} onChange={(event) => setCategory(event.target.value)}><option>Missing item</option><option>Damaged clothing</option><option>Other concern</option></select></div>
        <div className="form-field"><label htmlFor="complaint-description">A few details</label><textarea id="complaint-description" rows="4" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the item or tell us what happened…" required /></div>
        <button className="button button-primary button-full" type="submit" disabled={!eligible.length}>Send report <ArrowRight size={16} /></button>
      </>}
      {type === 'schedule' && <>
        <p className="form-intro">Add a pickup or drop-off window for students to see.</p>
        <div className="form-field"><label htmlFor="slot-note">Window name</label><input id="slot-note" value={slotNote} onChange={(event) => setSlotNote(event.target.value)} required placeholder="e.g. Evening collection" /></div>
        <div className="form-field"><label htmlFor="slot-day">Days</label><select id="slot-day" value={day} onChange={(event) => setDay(event.target.value)}><option>Monday – Friday</option><option>Monday – Saturday</option><option>Weekends</option><option>Every day</option></select></div>
        <div className="form-field"><label htmlFor="slot-time">Time window</label><input id="slot-time" value={time} onChange={(event) => setTime(event.target.value)} required placeholder="e.g. 4:00 PM – 7:00 PM" /></div>
        <div className="form-field"><label htmlFor="slot-location">Location</label><input id="slot-location" value={location} onChange={(event) => setLocation(event.target.value)} required /></div>
        <button className="button button-primary button-full" type="submit">Add time slot <Plus size={16} /></button>
      </>}
    </form>
  </Modal>
}

export default function App() {
  const store = useLaundry()
  const session = store.session
  const role = session?.role
  const activeStudent = role === 'student' ? store.students.find((student) => student.id === session.studentId) : null
  const [page, setPage] = useState('overview')
  const [modal, setModal] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')
  const myRequests = useMemo(() => role === 'staff' ? store.requests : store.requests.filter((item) => item.studentId === activeStudent?.id), [role, activeStudent?.id, store.requests])
  const myNotifications = store.notifications.filter((item) => role === 'staff' || item.studentId === activeStudent?.id)
  const myComplaints = role === 'staff' ? store.complaints : store.complaints.filter((item) => item.studentId === activeStudent?.id)
  const unread = myNotifications.filter((item) => !item.read).length

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  function handleLogout() {
    store.signOut()
    setPage('overview')
    setSelectedRequest(null)
    setModal('')
  }

  function openRequest(request) {
    if (typeof request === 'string') {
      const match = store.requests.find((item) => item.id === request)
      if (match) setSelectedRequest(match)
      return
    }
    setSelectedRequest(request)
  }
  function submitModal(payload) {
    if (modal === 'request') {
      const request = store.createRequest({ ...payload, studentId: session.studentId })
      setSelectedRequest(request)
      notify(`Request ${request.token} created`)
    } else if (modal === 'complaint') {
      store.addComplaint({ ...payload, studentId: session.studentId })
      notify('Your report has been sent to the laundry team')
    } else {
      store.addSchedule(payload)
      notify('Collection time added')
    }
    setModal('')
  }
  function updateStatus(requestId, status) {
    store.updateStatus(requestId, status)
    setSelectedRequest((request) => request?.id === requestId ? { ...request, status } : request)
    notify(`Request status updated to ${status}`)
  }
  function updateDate(requestId, expectedDate) {
    if (!expectedDate) return
    store.updateExpectedDate(requestId, expectedDate)
    setSelectedRequest((request) => request?.id === requestId ? { ...request, expectedDate } : request)
    notify('Expected return date saved')
  }
  function confirmCollection(requestId) {
    store.confirmCollection(requestId)
    setSelectedRequest(null)
    notify('Collection confirmed. Enjoy your fresh laundry!')
  }

  if (!session || (role === 'student' && !activeStudent)) {
    return <Login
      onLogin={async (credentials) => {
        const nextSession = await store.signIn(credentials)
        setPage('overview')
        return nextSession
      }}
      onRegister={store.registerStudent}
    />
  }

  let title = page
  if (page === 'overview') title = role === 'staff' ? 'Overview' : 'Your laundry space'
  else if (page === 'requests') title = role === 'staff' ? 'Laundry requests' : 'My laundry'
  else if (page === 'history') title = 'Laundry history'
  else if (page === 'notifications') title = 'Notifications'
  else if (page === 'complaints') title = role === 'staff' ? 'Complaints' : 'Help & complaints'
  else if (page === 'schedule') title = 'Collection schedule'

  return <div className="app-shell">
    <Sidebar role={role} student={activeStudent} page={page} setPage={setPage} onLogout={handleLogout} open={mobileNav} onClose={() => setMobileNav(false)} unread={unread} />
    <main className="main-area">
      <header className="topbar"><button className="icon-button menu-button" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20} /></button><div className="breadcrumbs"><span>Washday</span><span className="breadcrumb-divider">/</span><strong>{title}</strong></div><div className="topbar-actions"><div className="portal-toggle"><span>{role === 'staff' ? 'Laundry staff portal' : 'Student portal'}</span></div><button className="topbar-bell" onClick={() => setPage(role === 'staff' ? 'complaints' : 'notifications')} aria-label={role === 'staff' ? 'Complaints' : 'Notifications'}><Bell size={18} />{unread > 0 && role === 'student' && <i />}</button><span className={`avatar top-avatar avatar-${role === 'staff' ? 'blue' : activeStudent.color}`}>{role === 'staff' ? 'LT' : activeStudent.initials}</span></div></header>
      <div className="page-content">
        {page === 'overview' && (role === 'staff' ? <StaffOverview requests={store.requests} onOpen={openRequest} onPage={setPage} /> : <StudentOverview requests={myRequests} notifications={myNotifications} onOpen={openRequest} onPage={setPage} onNew={() => setModal('request')} />)}
        {page === 'requests' && <RequestList requests={myRequests} role={role} onOpen={openRequest} />}
        {page === 'history' && <HistoryPage requests={myRequests} onOpen={openRequest} />}
        {page === 'notifications' && <NotificationsPage notifications={myNotifications} onRead={store.markNotificationRead} onOpen={openRequest} />}
        {page === 'complaints' && <ComplaintsPage role={role} complaints={myComplaints} onNew={() => setModal('complaint')} onUpdate={(id, status) => { store.updateComplaint(id, status); notify(`Complaint marked ${status.toLowerCase()}`) }} />}
        {page === 'schedule' && <SchedulePage schedules={store.schedules} role={role} onAdd={() => setModal('schedule')} onRemove={(id) => { store.removeSchedule(id); notify('Collection time removed') }} />}
      </div>
      <footer className="app-footer"><span>Washday <span className="brand-dot">.</span> <i>Thoughtful care, every cycle.</i></span><span>Campus Laundry Services <span>·</span> Demo</span></footer>
    </main>
    {selectedRequest && <RequestModal request={store.requests.find((item) => item.id === selectedRequest.id) || selectedRequest} role={role} onClose={() => setSelectedRequest(null)} onComplaint={() => { setSelectedRequest(null); setModal('complaint') }} onStatus={updateStatus} onDate={updateDate} onCollect={confirmCollection} />}
    {modal && <FormModal type={modal} student={activeStudent} onClose={() => setModal('')} onSubmit={submitModal} />}
    {toast && <div className="toast"><span><Check size={15} /></span>{toast}</div>}
  </div>
}
