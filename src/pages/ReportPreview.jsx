import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import SendReportEmail from "../components/SendReportEmail";

export default function ReportPreview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const report = state?.reportData;

  const formatDescription = (d) => {
    if (!d) return '';
    return String(d)
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean)
      .join(' • ');
  };

  if (!report) {
    return (
      <div className="page">
        <Header subtitle="Shift Handover" />
        <main className="report-main">
          <div className="report-error-card">
            <p>No report data found. Please fill out the form first.</p>
            <button className="back-btn" onClick={() => navigate("/")}>← Back to Form</button>
          </div>
        </main>
      </div>
    );
  }

  const handlePrint = () => window.print();

  const handleDownloadPNG = async () => {
    const { default: html2canvas } = await import("html2canvas");
    const element = document.getElementById("report");
    if (!element) return;
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      imageTimeout: 0,
      scrollX: 0,
      scrollY: -window.scrollY,
    });
    const link = document.createElement("a");
    link.download = `noc-handover-${report.date.replace(/\s/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const displayTasks = report.tasks.filter(t => t.name && t.name !== "None");
  const completeTasks = displayTasks.filter(t => t.status === "Complete");
  const pendingTasks = displayTasks.filter(t => t.status === "Pending");
  const criticalTasks = displayTasks.filter(t => t.status === "Critical");

  return (
    <div className="page">
      <Header subtitle="Shift Handover" />
      <main className="report-main">
        <div className="report-actions no-print">
          <button className="back-btn" onClick={() => navigate("/")}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Form
          </button>
          <div className="report-actions-right">
            <button className="print-btn" onClick={handlePrint}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 5V2.5A.5.5 0 015.5 2h5a.5.5 0 01.5.5V5" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="5" y="9" width="6" height="3" rx=".5" fill="currentColor" opacity=".5"/>
              </svg>
              Print / PDF
            </button>
            <button className="download-png-btn" onClick={handleDownloadPNG}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Download PNG
            </button>
          </div>
        </div>

        <SendReportEmail report={report} />

        <div className="report-document" id="report">
          {/* Report Header */}
          <div className="report-header-block">
            {/* Org band — dark blue with dot-grid texture */}
            <div className="report-header-org-band">
              <span className="report-org-dot" />
              <span className="report-org">FIT Network Operations Center</span>
              <span className="report-org-dot" />
            </div>
            {/* Title zone */}
            <div className="report-header-title-zone">
              <h1 className="report-title">Shift Handover</h1>
              <div className="report-title-accent" />
            </div>
          </div>

          <div className="report-divider" />

          {/* Operational Shift Summary */}
          <section className="report-section">
            <div className="report-section-header">
              <div className="section-label-bar" />
              <h2 className="report-section-title">Operational Shift Summary</h2>
            </div>
            <div className="report-info-grid">
              <div className="report-info-cell">
                <div className="info-key">Report Date</div>
                <div className="info-val">{report.date}</div>
              </div>
              <div className="report-info-cell">
                <div className="info-key">Shift Timing</div>
                <div className="info-val">{report.timing}</div>
              </div>
              <div className="report-info-cell">
                <div className="info-key">Handover From</div>
                <div className="info-val highlight">{report.handoverFrom}</div>
              </div>
              <div className="report-info-cell">
                <div className="info-key">Handover To</div>
                <div className="info-val highlight">{report.handoverTo}</div>
              </div>
            </div>
          </section>

          <div className="report-divider" />

          {/* Task Status & Updates */}
          <section className="report-section">
            <div className="report-section-header">
              <div className="section-label-bar" />
              <h2 className="report-section-title">Task Status &amp; Updates</h2>
            </div>
            <div className="report-tasks">
              {displayTasks.map((task, i) => (
                <div className={`report-task-row status-${task.status.toLowerCase()}`} key={i}>
                  <div className="task-row-index">{String(i + 1).padStart(2, "0")}</div>
                  <div className="task-row-body">
                    <div className="task-row-top">
                      <span className="task-row-name">{task.name}</span>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="task-row-desc">{formatDescription(task.description)}</div>
                  </div>
                </div>
              ))}

              {completeTasks.length === 0 && (
                <div className="report-task-empty complete-empty">
                  <div className="task-empty-indicator complete-indicator" />
                  <div>
                    <div className="task-empty-label">Completed Tasks</div>
                    <div className="task-empty-text">No tasks were completed during this shift.</div>
                  </div>
                </div>
              )}

              {pendingTasks.length === 0 && (
                <div className="report-task-empty pending-empty">
                  <div className="task-empty-indicator pending-indicator" />
                  <div>
                    <div className="task-empty-label">Pending Tasks</div>
                    <div className="task-empty-text">No tasks are currently pending for handover.</div>
                  </div>
                </div>
              )}

              {criticalTasks.length === 0 && (
                <div className="report-task-empty critical-empty">
                  <div className="task-empty-indicator critical-indicator" />
                  <div>
                    <div className="task-empty-label">Critical Incidents</div>
                    <div className="task-empty-text">No critical incidents were reported during this shift.</div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
