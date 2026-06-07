import { TASK_OPTIONS, TASK_STATUS_OPTIONS } from "../data/constants";

export default function TaskCard({ task, index, onChange, onRemove, totalTasks }) {
  return (
    <div className="task-card">
      <div className="task-card-header">
        <div className="task-number">Task #{index + 1}</div>
        {totalTasks > 1 && (
          <button className="remove-task-btn" onClick={() => onRemove(index)} title="Remove task">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
      <div className="task-card-body">
        <div className="field-group">
          <label className="field-label">Task</label>
          <div className="select-wrapper">
            <select
              className="form-select"
              value={task.name}
              onChange={e => onChange(index, "name", e.target.value)}
            >
              <option value="">— Select Task —</option>
              {TASK_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="task-card-row">
          <div className="field-group">
            <label className="field-label">Status</label>
            <div className="select-wrapper">
              <select
                className="form-select"
                value={task.status}
                onChange={e => onChange(index, "status", e.target.value)}
              >
                {TASK_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="field-group">
          <label className="field-label">Task Description</label>
          <textarea
            className="form-textarea"
            placeholder="Enter task updates, observations, and notes..."
            rows={3}
            value={task.description}
            onChange={e => onChange(index, "description", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
