/**
 * EmailJS Configuration
 *
 * One-time setup (free — 200 emails/month):
 *
 * 1. Create account at https://www.emailjs.com
 *
 * 2. Add an Email Service
 *    Dashboard → Email Services → Add New Service
 *    Connect Gmail / Outlook / etc.
 *    Copy the Service ID  →  paste as EMAILJS_SERVICE_ID below
 *
 * 3. Create an Email Template
 *    Dashboard → Email Templates → Create New Template
 *      To:       {{to_email}}
 *      Subject:  NOC Shift Handover Report — {{report_date}}
 *      Content type: HTML
 *      Body:     {{{report_html}}}   ← triple curly braces (renders raw HTML)
 *    Save, then copy the Template ID  →  paste as EMAILJS_TEMPLATE_ID below
 *
 * 4. Get your Public Key
 *    Dashboard → Account → General → Public Key
 *    Paste as EMAILJS_PUBLIC_KEY below
 */

export const EMAILJS_SERVICE_ID  = 'service_218zwgb';
export const EMAILJS_TEMPLATE_ID = 'template_x8ag47g';
export const EMAILJS_PUBLIC_KEY  = 'WAsEkOEqpExSyr5w9';

/**
 * ImgBB — free image hosting used to embed the report as a real HTTPS image
 * in the email (data: URIs are blocked by Gmail, Outlook, etc.)
 *
 * Setup (free, takes 1 minute):
 * 1. Sign up at https://imgbb.com
 * 2. Go to https://api.imgbb.com  →  click "Get API key"
 * 3. Copy your key and paste it below
 */
export const IMGBB_API_KEY = 'YOUR_IMGBB_API_KEY';
