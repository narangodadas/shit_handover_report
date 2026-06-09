import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
  IMGBB_API_KEY,
} from '../config/emailjs';
import { buildImageEmailHtml } from '../utils/buildReportEmail';

const ANIMATION_KILL = '*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; }';

async function captureReportCanvas(reportEl) {
  const { default: html2canvas } = await import('html2canvas');
  if (document.fonts?.ready) await document.fonts.ready;

  const full = await html2canvas(reportEl, {
    scale: 1.0,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    imageTimeout: 0,
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth: reportEl.scrollWidth,
    onclone: (doc) => {
      const s = doc.createElement('style');
      s.textContent = ANIMATION_KILL;
      doc.head.appendChild(s);
    },
  });

  // Downscale to max 720 px wide so the base64 stays small for ImgBB upload
  const MAX_W = 720;
  if (full.width <= MAX_W) return full;
  const ratio   = MAX_W / full.width;
  const small   = document.createElement('canvas');
  small.width   = MAX_W;
  small.height  = Math.round(full.height * ratio);
  small.getContext('2d').drawImage(full, 0, 0, small.width, small.height);
  return small;
}

async function uploadToImgBB(base64Data) {
  const fd = new FormData();
  fd.append('key', IMGBB_API_KEY);
  fd.append('image', base64Data.replace(/^data:image\/\w+;base64,/, ''));

  const res  = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`Image upload failed (HTTP ${res.status}).`);
  const json = await res.json();
  if (!json.success) throw new Error('ImgBB upload failed: ' + (json.error?.message ?? 'unknown'));
  return json.data.url;          // real HTTPS URL, works in all email clients
}

export default function SendReportEmail({ report }) {
  const [email, setEmail]   = useState('');
  const [sentTo, setSentTo] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errMsg, setErrMsg] = useState('');

  const emailjsReady  = EMAILJS_SERVICE_ID  !== 'YOUR_SERVICE_ID';
  const imgbbReady    = IMGBB_API_KEY       !== 'YOUR_IMGBB_API_KEY';
  const isValidEmail  = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handleSend = async () => {
    if (!isValidEmail(email)) {
      setErrMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    if (!emailjsReady) {
      setErrMsg('EmailJS not configured — open src/config/emailjs.js and add your credentials.');
      setStatus('error');
      return;
    }
    if (!imgbbReady) {
      setErrMsg('Image hosting not configured — add your free ImgBB API key to src/config/emailjs.js (see instructions in that file).');
      setStatus('error');
      return;
    }

    const recipient = email.trim();
    setStatus('sending');
    setErrMsg('');

    try {
      const reportEl = document.getElementById('report');
      if (!reportEl) throw new Error('Report not visible — scroll down to the report first.');

      const emailCanvas  = await captureReportCanvas(reportEl);
      const base64Image  = emailCanvas.toDataURL('image/jpeg', 0.82);
      const hostedUrl    = await uploadToImgBB(base64Image);
      const reportHtml   = buildImageEmailHtml(hostedUrl, report);

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { to_email: recipient, report_date: report.date, report_html: reportHtml },
        EMAILJS_PUBLIC_KEY,
      );

      setSentTo(recipient);
      setStatus('sent');
      setEmail('');
      setTimeout(() => setStatus('idle'), 6000);
    } catch (err) {
      console.error('Send error:', err);
      let msg = 'Send failed. Check your configuration and try again.';
      try {
        if (err?.text) msg = String(err.text);
        else if (err?.message) msg = String(err.message);
        else msg = JSON.stringify(err);
      } catch (_) { /* ignore */ }
      setStatus('error');
      setErrMsg(msg);
    }
  };

  useEffect(() => {
    try {
      if (EMAILJS_PUBLIC_KEY && typeof emailjs.init === 'function') emailjs.init(EMAILJS_PUBLIC_KEY);
    } catch (e) { console.warn('EmailJS init warning:', e); }
  }, []);

  const isBusy = status === 'sending';
  const isSent = status === 'sent';

  return (
    <div className="send-email-bar no-print">
      <div className="send-email-header">
        <div className="send-email-icon">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M1.5 4l6.5 4.5L14.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="send-email-label">Send Report via Email</span>
      </div>

      <div className="send-email-controls">
        <input
          type="email"
          className={`send-email-input${status === 'error' ? ' input-error' : ''}`}
          placeholder="Enter recipient email address..."
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            if (status === 'error') { setStatus('idle'); setErrMsg(''); }
          }}
          onKeyDown={e => e.key === 'Enter' && !isBusy && !isSent && handleSend()}
          disabled={isBusy || isSent}
          autoComplete="email"
        />
        <button
          className={`send-email-btn${isSent ? ' sent' : ''}`}
          onClick={handleSend}
          disabled={isBusy || isSent || !email.trim()}
        >
          {isBusy ? (
            <><span className="send-spinner" />Sending...</>
          ) : isSent ? (
            <>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sent!
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M1.5 7.5l11-5-4.5 11-2-4.5-4.5-1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              Send Email
            </>
          )}
        </button>
      </div>

      {status === 'error' && errMsg && (
        <div className="send-email-feedback send-email-error">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 4v4M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {errMsg}
        </div>
      )}

      {isSent && (
        <div className="send-email-feedback send-email-success">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Report sent to {sentTo}
        </div>
      )}
    </div>
  );
}
