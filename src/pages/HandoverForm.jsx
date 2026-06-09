import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Header from "../components/Header";
import TaskCard from "../components/TaskCard";
import { TEAM_MEMBERS, SHIFT_OPTIONS, DAILY_CHECKLIST } from "../data/constants";

const defaultTask = () => ({ name: "", status: "Complete", description: "" });

export default function HandoverForm() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [timing, setTiming] = useState("");
  const [handoverFrom, setHandoverFrom] = useState("");
  const [handoverTo, setHandoverTo] = useState("");
  const [tasks, setTasks] = useState([defaultTask()]);
  const [checklist, setChecklist] = useState(
    DAILY_CHECKLIST.reduce((acc, item) => ({ ...acc, [item.id]: false }), {})
  );
  const toggleChecklist = (id) => setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  const [members, setMembers] = useState(TEAM_MEMBERS);
  const [errors, setErrors] = useState({});
  const [addingMember, setAddingMember] = useState({ from: false, to: false });
  const [newMemberName, setNewMemberName] = useState({ from: "", to: "" });

  const handleMemberSelect = (field, value) => {
    if (value === "__add_new__") {
      setAddingMember(prev => ({ ...prev, [field]: true }));
    } else {
      if (field === "from") setHandoverFrom(value);
      else setHandoverTo(value);
    }
  };

  const confirmNewMember = (field) => {
    const name = newMemberName[field].trim();
    if (!name) return;
    if (!members.includes(name)) setMembers(prev => [...prev, name]);
    if (field === "from") setHandoverFrom(name);
    else setHandoverTo(name);
    setAddingMember(prev => ({ ...prev, [field]: false }));
    setNewMemberName(prev => ({ ...prev, [field]: "" }));
  };

  const handleTaskChange = (index, field, value) => {
    setTasks(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  const addTask = () => setTasks(prev => [...prev, defaultTask()]);

  const removeTask = (index) => setTasks(prev => prev.filter((_, i) => i !== index));

  const validate = () => {
    const e = {};
    if (!timing) e.timing = "Please select a shift timing.";
    if (!handoverFrom) e.handoverFrom = "Please select the engineer handing over.";
    if (!handoverTo) e.handoverTo = "Please select the engineer taking over.";
    if (handoverFrom && handoverTo && handoverFrom === handoverTo) {
      e.handoverTo = "Handover From and To cannot be the same person.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleViewReport = () => {
    if (!validate()) return;
    const resolvedTasks = tasks.map(t => ({
      name: t.name || "None",
      status: t.status,
      description: t.description || "No description provided."
    }));
    const reportData = {
      date: date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
      timing,
      handoverFrom,
      handoverTo,
      tasks: resolvedTasks,
      checklist: DAILY_CHECKLIST.map(item => ({ label: item.label, done: checklist[item.id] }))
    };
    navigate("/report", { state: { reportData } });
  };

  const MemberField = ({ field, label, value }) => (
    <div className="field-group">
      <label className="field-label">{label}</label>
      {addingMember[field] ? (
        <div className="new-member-row">
          <input
            className="form-input"
            placeholder="Enter full name..."
            value={newMemberName[field]}
            onChange={e => setNewMemberName(prev => ({ ...prev, [field]: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && confirmNewMember(field)}
            autoFocus
          />
          <button className="confirm-btn" onClick={() => confirmNewMember(field)}>Add</button>
          <button className="cancel-btn" onClick={() => setAddingMember(prev => ({ ...prev, [field]: false }))}>✕</button>
        </div>
      ) : (
        <div className="select-wrapper">
          <select
            className={`form-select ${errors[field === "from" ? "handoverFrom" : "handoverTo"] ? "error" : ""}`}
            value={value}
            onChange={e => handleMemberSelect(field, e.target.value)}
          >
            <option value="">— Select Engineer —</option>
            {members.map(m => <option key={m} value={m}>{m}</option>)}
            <option value="__add_new__">＋ Add New Member</option>
          </select>
        </div>
      )}
      {errors[field === "from" ? "handoverFrom" : "handoverTo"] && (
        <span className="error-msg">{errors[field === "from" ? "handoverFrom" : "handoverTo"]}</span>
      )}
    </div>
  );

  return (
    <div className="page">
      <Header subtitle="Shift Handover Form" />
      <main className="form-main">
        <div className="form-card">
          <div className="form-card-header">
            <div className="form-card-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="3" width="16" height="14" rx="2" stroke="#2563eb" strokeWidth="1.5"/>
                <path d="M6 7h8M6 10h8M6 13h5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="form-card-title">Operational Details</div>
              <div className="form-card-desc">Enter shift date, timing and personnel information</div>
            </div>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label className="field-label">Date</label>
              <div className="datepicker-wrapper">
                <DatePicker
                  selected={date}
                  onChange={setDate}
                  dateFormat="dd MMMM yyyy"
                  className="form-input datepicker-input"
                  calendarClassName="noc-calendar"
                  showPopperArrow={false}
                />
                <span className="datepicker-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="2.5" width="14" height="12" rx="1.5" stroke="#64748b" strokeWidth="1.3"/>
                    <path d="M5 1v3M11 1v3M1 6h14" stroke="#64748b" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Timing</label>
              <div className="select-wrapper">
                <select
                  className={`form-select ${errors.timing ? "error" : ""}`}
                  value={timing}
                  onChange={e => { setTiming(e.target.value); setErrors(p => ({...p, timing: ""})); }}
                >
                  <option value="">— Select Shift —</option>
                  {SHIFT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {errors.timing && <span className="error-msg">{errors.timing}</span>}
            </div>

            <MemberField field="from" label="Shift Handover From" value={handoverFrom} />
            <MemberField field="to" label="Shift Handover To" value={handoverTo} />
          </div>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <div className="form-card-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="2" width="12" height="16" rx="2" stroke="#2563eb" strokeWidth="1.5"/>
                <path d="M7 7h6M7 10h6M7 13h3" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M7 6.5l1 1 2-2" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="form-card-title">Daily Checklist</div>
              <div className="form-card-desc">Mark all routine checks completed before handover</div>
            </div>
          </div>
          <div className="checklist-grid">
            {DAILY_CHECKLIST.map(item => (
              <button
                key={item.id}
                type="button"
                className={`checklist-item${checklist[item.id] ? " checked" : ""}`}
                onClick={() => toggleChecklist(item.id)}
              >
                <div className="checklist-box">
                  {checklist[item.id] && (
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1.5 5.5l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="checklist-label">{item.label}</span>
                {checklist[item.id] && (
                  <span className="checklist-done-tag">Done</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <div className="form-card-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="#2563eb" strokeWidth="1.5"/>
                <path d="M10 6v4l3 3" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="form-card-title">Task Summary</div>
              <div className="form-card-desc">Document all tasks, issues, and status updates for handover</div>
            </div>
          </div>

          <div className="tasks-list">
            {tasks.map((task, i) => (
              <TaskCard
                key={i}
                task={task}
                index={i}
                onChange={handleTaskChange}
                onRemove={removeTask}
                totalTasks={tasks.length}
              />
            ))}
          </div>

          <button className="add-task-btn" onClick={addTask}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add Another Task
          </button>
        </div>

        <button className="view-report-btn" onClick={handleViewReport}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3h12v12H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M6 6h6M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Generate Handover Report
        </button>
      </main>
    </div>
  );
}
