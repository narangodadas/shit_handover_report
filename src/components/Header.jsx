export default function Header({ subtitle }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-logo">
          <div>
            <div className="header-title">FIT Network Operations Center</div>
            <div className="header-sub">{subtitle}</div>
          </div>
        </div>
        <div className="header-status">
          <span className="live-dot" />
          <span className="live-label">LIVE</span>
        </div>
      </div>
    </header>
  );
}
