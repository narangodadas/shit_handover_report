function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const STATUS = {
  Complete: {
    rowBg:          '#f0fdf4',
    leftColor:      '#16a34a',
    solidBorder:    '#bbf7d0',
    dashedBorder:   '#bbf7d0',
    badgeBg:        '#dcfce7',
    badgeBorder:    '#86efac',
    badgeColor:     '#15803d',
    dotColor:       '#16a34a',
    labelColor:     '#15803d',
    textColor:      '#166534',
    emptyLabel:     'Completed Tasks',
    emptyText:      'No tasks were completed during this shift.',
  },
  Pending: {
    rowBg:          '#fffbeb',
    leftColor:      '#d97706',
    solidBorder:    '#fde68a',
    dashedBorder:   '#fde68a',
    badgeBg:        '#fef3c7',
    badgeBorder:    '#fcd34d',
    badgeColor:     '#92400e',
    dotColor:       '#d97706',
    labelColor:     '#92400e',
    textColor:      '#78350f',
    emptyLabel:     'Pending Tasks',
    emptyText:      'No tasks are currently pending for handover.',
  },
  Critical: {
    rowBg:          '#fff1f2',
    leftColor:      '#dc2626',
    solidBorder:    '#fecdd3',
    dashedBorder:   '#fecdd3',
    badgeBg:        '#fee2e2',
    badgeBorder:    '#fca5a5',
    badgeColor:     '#991b1b',
    dotColor:       '#dc2626',
    labelColor:     '#991b1b',
    textColor:      '#7f1d1d',
    emptyLabel:     'Critical Incidents',
    emptyText:      'No critical incidents were reported during this shift.',
  },
};

// Filled task row — matches report-task-row style
function taskRow(task) {
  const s = STATUS[task.status] || STATUS.Pending;
  return `
<div style="margin-bottom:10px;background:${s.rowBg};border-top:1px solid ${s.solidBorder};border-right:1px solid ${s.solidBorder};border-bottom:1px solid ${s.solidBorder};border-left:3px solid ${s.leftColor};border-radius:8px;overflow:hidden;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding:16px 20px;vertical-align:top;">
        <p style="margin:0 0 5px;font-size:14px;font-weight:700;color:#0f172a;">${esc(task.name)}</p>
        <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">${esc(task.description)}</p>
      </td>
      <td style="padding:16px 20px;vertical-align:middle;text-align:right;white-space:nowrap;">
        <span style="display:inline-block;padding:4px 11px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;background:${s.badgeBg};border:1px solid ${s.badgeBorder};color:${s.badgeColor};">${esc(task.status)}</span>
      </td>
    </tr>
  </table>
</div>`;
}

// Empty-state row — matches report-task-empty style (dashed border)
function emptyRow(s) {
  return `
<div style="margin-bottom:10px;display:flex;align-items:center;background:${s.rowBg};border-top:1px dashed ${s.dashedBorder};border-right:1px dashed ${s.dashedBorder};border-bottom:1px dashed ${s.dashedBorder};border-left:3px solid ${s.leftColor};border-radius:8px;overflow:hidden;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding:15px 14px 15px 20px;vertical-align:middle;width:14px;">
        <div style="width:8px;height:8px;border-radius:50%;background:${s.dotColor};"></div>
      </td>
      <td style="padding:15px 20px 15px 6px;vertical-align:middle;">
        <p style="margin:0 0 3px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${s.labelColor};">${s.emptyLabel}</p>
        <p style="margin:0;font-size:13px;color:${s.textColor};font-style:italic;">${s.emptyText}</p>
      </td>
    </tr>
  </table>
</div>`;
}

// Section heading — matches report-section-header with blue left bar
function sectionHeading(title) {
  return `
<table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
  <tr>
    <td style="width:3px;background:#2563eb;border-radius:2px;font-size:0;">&nbsp;</td>
    <td style="padding-left:12px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.06em;vertical-align:middle;line-height:20px;">${title}</td>
  </tr>
</table>`;
}

export function buildReportEmailHtml(report) {
  const displayTasks  = report.tasks.filter(t => t.name && t.name !== 'None');
  const completeTasks = displayTasks.filter(t => t.status === 'Complete');
  const pendingTasks  = displayTasks.filter(t => t.status === 'Pending');
  const criticalTasks = displayTasks.filter(t => t.status === 'Critical');

  const taskContent = [
    ...displayTasks.map(taskRow),
    completeTasks.length === 0 ? emptyRow(STATUS.Complete) : '',
    pendingTasks.length  === 0 ? emptyRow(STATUS.Pending)  : '',
    criticalTasks.length === 0 ? emptyRow(STATUS.Critical) : '',
  ].join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:28px 16px;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.12);">

  <!-- ① Top accent bar -->
  <tr>
    <td style="height:4px;background:#2563eb;font-size:0;line-height:0;">&nbsp;</td>
  </tr>

  <!-- ② Org band — dark blue, matches report-header-org-band -->
  <tr>
    <td style="background:#1e3a8a;background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 55%,#3b82f6 100%);padding:24px 48px;text-align:center;">
      <p style="margin:0;font-size:17px;font-weight:700;color:#ffffff;letter-spacing:0.12em;text-transform:uppercase;line-height:1;">
        <span style="color:rgba(255,255,255,0.4);font-size:10px;margin-right:16px;">&#9679;</span>FIT NETWORK OPERATIONS CENTER<span style="color:rgba(255,255,255,0.4);font-size:10px;margin-left:16px;">&#9679;</span>
      </p>
    </td>
  </tr>

  <!-- ③ Title zone — matches report-header-title-zone -->
  <tr>
    <td style="background:#f0f6ff;padding:44px 40px 40px;text-align:center;border-bottom:1px solid #c7d9f5;">
      <h1 style="margin:0;font-size:46px;font-weight:700;color:#0f172a;letter-spacing:-0.04em;line-height:1;">Shift Handover</h1>
      <div style="width:64px;height:4px;background:#1d4ed8;border-radius:3px;margin:20px auto 0;"></div>
    </td>
  </tr>

  <!-- ④ Divider -->
  <tr><td style="height:1px;background:#e2e8f0;font-size:0;line-height:0;">&nbsp;</td></tr>

  <!-- ⑤ Operational Shift Summary -->
  <tr>
    <td style="background:#ffffff;padding:32px 40px;">
      ${sectionHeading('Operational Shift Summary')}
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="48%" style="padding:16px 20px;background:#f7f9fc;border:1px solid #e2e8f0;border-radius:8px;vertical-align:top;">
            <p style="margin:0 0 6px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">Report Date</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${esc(report.date)}</p>
          </td>
          <td width="4%"></td>
          <td width="48%" style="padding:16px 20px;background:#f7f9fc;border:1px solid #e2e8f0;border-radius:8px;vertical-align:top;">
            <p style="margin:0 0 6px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">Shift Timing</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${esc(report.timing)}</p>
          </td>
        </tr>
        <tr><td colspan="3" style="height:12px;font-size:0;">&nbsp;</td></tr>
        <tr>
          <td width="48%" style="padding:16px 20px;background:#f7f9fc;border:1px solid #e2e8f0;border-radius:8px;vertical-align:top;">
            <p style="margin:0 0 6px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">Handover From</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:#2563eb;">${esc(report.handoverFrom)}</p>
          </td>
          <td width="4%"></td>
          <td width="48%" style="padding:16px 20px;background:#f7f9fc;border:1px solid #e2e8f0;border-radius:8px;vertical-align:top;">
            <p style="margin:0 0 6px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">Handover To</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:#2563eb;">${esc(report.handoverTo)}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ⑥ Divider -->
  <tr><td style="height:1px;background:#e2e8f0;font-size:0;line-height:0;">&nbsp;</td></tr>

  <!-- ⑦ Task Status & Updates -->
  <tr>
    <td style="background:#ffffff;padding:32px 40px;">
      ${sectionHeading('Task Status &amp; Updates')}
      ${taskContent}
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
