export default function StatusBadge({ status }) {
  const config = {
    Complete: { bg: "#dcfce7", border: "#86efac", text: "#15803d", dot: "#16a34a" },
    Pending:  { bg: "#fef3c7", border: "#fcd34d", text: "#92400e", dot: "#d97706" },
    Critical: { bg: "#fee2e2", border: "#fca5a5", text: "#991b1b", dot: "#dc2626" },
  };
  const c = config[status] || config.Pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      letterSpacing: "0.07em", textTransform: "uppercase",
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontFamily: "'IBM Plex Mono', monospace"
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}
