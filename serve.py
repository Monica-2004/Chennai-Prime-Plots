#!/usr/bin/env python3
"""
LLB Real Estate — Local Automation Server & Webhook Engine
Provides:
  1. Static web asset server (HTML, CSS, JS)
  2. Built-in Webhook Engine for n8n-compatible lead intake (/webhook/llb-property-inquiry)
  3. Automatic VIP Confirmation Email Generator & SMTP Dispatcher
  4. Real-time Lead Database & Admin API (/api/leads, /api/settings/smtp, /api/test-email)
"""

import http.server
import socket
import socketserver
import os
import sys
import json
import time
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import webbrowser

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(DIRECTORY, "data")
EMAILS_DIR = os.path.join(DIRECTORY, "sent_emails")
LEADS_FILE = os.path.join(DATA_DIR, "leads.json")
SMTP_FILE = os.path.join(DATA_DIR, "smtp_config.json")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(EMAILS_DIR, exist_ok=True)

if not os.path.exists(LEADS_FILE):
    with open(LEADS_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


def load_smtp_config():
    if os.path.exists(SMTP_FILE):
        try:
            with open(SMTP_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_smtp_config(cfg):
    with open(SMTP_FILE, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2)


def load_leads():
    try:
        with open(LEADS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def save_lead(lead):
    leads = load_leads()
    leads.insert(0, lead)
    # keep last 200 leads
    leads = leads[:200]
    with open(LEADS_FILE, "w", encoding="utf-8") as f:
        json.dump(leads, f, indent=2)


def generate_email_html(lead):
    full_name = lead.get("fullName", "Valued Client")
    lead_id = lead.get("leadId", "CHN-0000")
    property_title = lead.get("propertyTitle", "Chennai Prime Plot Selection")
    inquiry_type = lead.get("inquiryType", "Plot Inquiry & Sanction Dossier")
    budget = lead.get("budget", "Price on Request")
    phone = lead.get("phone", "")
    preferred_contact = lead.get("preferredContact", "Email / WhatsApp")
    user_message = lead.get("message") or lead.get("notes") or "Requesting full CMDA/DTCP sanction order copy, layout blueprint, and site visit scheduling."
    date_str = lead.get("formattedDate", datetime.now().strftime("%B %d, %Y - %I:%M %p IST"))
    
    prop_lower = (property_title + " " + inquiry_type + " " + lead.get("propertyId", "")).lower()
    is_plot = ("plot" in prop_lower) or ("cmda" in prop_lower) or ("dtcp" in prop_lower) or ("chn" in prop_lower) or ("cab" in prop_lower) or ("patta" in prop_lower)
    
    brand_title = "CHENNAI PLOTS" if is_plot else "LLB REAL ESTATE"
    brand_sub = "CMDA & DTCP Approved Plots • Clear Patta • 100% Title Guarantee" if is_plot else "Luxury • Legal • Bespoke"
    inquiry_heading = "Plot Inquiry & Dossier Confirmed" if is_plot else "VIP Inquiry Received & Confirmed"
    
    approval_row = """
        <tr>
          <td style="font-weight:700; color:#0b132b; background:#f1f5f9; padding:12px 16px; border-bottom:1px solid #e2e8f0; width:38%;">Sanction Status</td>
          <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; color:#059669; font-weight:700;">100% CMDA / DTCP Sanctioned • TNRERA Registered</td>
        </tr>
        <tr>
          <td style="font-weight:700; color:#0b132b; background:#f1f5f9; padding:12px 16px; border-bottom:1px solid #e2e8f0;">Title & Patta</td>
          <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0; color:#0f172a; font-weight:700;">Guaranteed Individual Clean Patta (Nil EC 30+ Yrs)</td>
        </tr>
    """ if is_plot else ""

    manager_box = f"""
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:18px 20px; margin:22px 0;">
        <div style="font-size:12px; font-weight:800; color:#b45309; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
          📍 Assigned Senior Site Relationship Manager
        </div>
        <div style="font-size:16px; font-weight:800; color:#0b132b;">Er. K. Senthil Nathan</div>
        <div style="font-size:13px; color:#64748b; margin-top:2px;">Chief Land Surveyor & Senior Site Coordinator</div>
        <div style="margin-top:12px;">
          <a href="tel:+919345029705" style="display:inline-block; background:#0b132b; color:#ffffff !important; text-decoration:none; padding:8px 16px; border-radius:6px; font-size:13px; font-weight:700; margin-right:8px; margin-bottom:6px;">📞 Call +91 93450 29705</a>
          <a href="https://wa.me/919345029705?text=Hi%20Senthil,%20I%20received%20email%20confirmation%20for%20{lead_id}%20regarding%20{property_title}" style="display:inline-block; background:#25d366; color:#ffffff !important; text-decoration:none; padding:8px 16px; border-radius:6px; font-size:13px; font-weight:700;">💬 Chat on WhatsApp</a>
        </div>
      </div>
    """ if is_plot else ""

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{inquiry_heading} — {brand_title}</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f1f5f9;
      color: #1e293b;
      margin: 0;
      padding: 30px 15px;
    }}
    .email-wrapper {{
      max-width: 620px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(11, 19, 43, 0.08);
    }}
    .email-header {{
      background: #0b132b;
      padding: 32px 30px;
      text-align: center;
      border-bottom: 3px solid #d4af37;
    }}
    .logo-badge {{
      display: inline-block;
      background: #d4af37;
      color: #0b132b;
      font-weight: 900;
      font-size: 14px;
      padding: 4px 14px;
      border-radius: 4px;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
    }}
    .logo-text {{
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 1px;
      margin: 0;
      text-transform: uppercase;
    }}
    .header-sub {{
      color: #94a3b8;
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 6px;
    }}
    .email-body {{
      padding: 34px 32px;
      line-height: 1.7;
      color: #334155;
      font-size: 15px;
    }}
    .ref-pill {{
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      font-weight: 800;
      font-size: 12px;
      padding: 4px 14px;
      border-radius: 20px;
      margin-bottom: 16px;
    }}
    .greeting {{
      font-size: 22px;
      font-weight: 800;
      color: #0b132b;
      margin: 0 0 12px;
    }}
    .details-table {{
      width: 100%;
      border-collapse: collapse;
      margin: 22px 0;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      font-size: 14px;
    }}
    .details-table td {{
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
    }}
    .legal-box {{
      background: rgba(5, 150, 105, 0.08);
      border-left: 4px solid #059669;
      padding: 16px 20px;
      border-radius: 4px;
      margin: 24px 0;
    }}
    .legal-title {{
      color: #065f46;
      font-weight: 800;
      font-size: 13px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }}
    .legal-text {{
      color: #047857;
      font-size: 13px;
      margin: 0;
      line-height: 1.5;
    }}
    .email-footer {{
      background: #0b132b;
      color: #94a3b8;
      padding: 24px 30px;
      text-align: center;
      font-size: 12px;
      line-height: 1.6;
    }}
    .email-footer a {{
      color: #d4af37;
      text-decoration: none;
    }}
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <div class="logo-badge">📍 {brand_title}</div>
      <h1 class="logo-text">{brand_title}</h1>
      <div class="header-sub">{brand_sub}</div>
    </div>
    <div class="email-body">
      <span class="ref-pill">Inquiry Reference: {lead_id}</span>
      <h2 class="greeting">{inquiry_heading}</h2>
      <p>Dear <strong>{full_name}</strong>,</p>
      <p>
        Thank you for contacting <strong>{brand_title}</strong>. Your property acquisition request has been registered in our senior land advisory desk. A dedicated legal dossier and confirmation copy has been prepared for your review below.
      </p>

      <table class="details-table">
        <tr>
          <td style="font-weight:700; color:#0b132b; background:#f1f5f9; padding:12px 16px; border-bottom:1px solid #e2e8f0; width:38%;">Interested Property / Plot</td>
          <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0;"><strong>{property_title}</strong></td>
        </tr>
        <tr>
          <td style="font-weight:700; color:#0b132b; background:#f1f5f9; padding:12px 16px; border-bottom:1px solid #e2e8f0;">Inquiry Purpose</td>
          <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0;">{inquiry_type}</td>
        </tr>
        <tr>
          <td style="font-weight:700; color:#0b132b; background:#f1f5f9; padding:12px 16px; border-bottom:1px solid #e2e8f0;">Budget / Quoted Value</td>
          <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0;"><strong>{budget}</strong></td>
        </tr>
        {approval_row}
        <tr>
          <td style="font-weight:700; color:#0b132b; background:#f1f5f9; padding:12px 16px; border-bottom:1px solid #e2e8f0;">Registered Contact</td>
          <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0;">{phone or 'Via Email'} ({lead.get('email', '')})</td>
        </tr>
        <tr>
          <td style="font-weight:700; color:#0b132b; background:#f1f5f9; padding:12px 16px; border-bottom:1px solid #e2e8f0;">Registration Date</td>
          <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0;">{date_str}</td>
        </tr>
        <tr>
          <td style="font-weight:700; color:#0b132b; background:#f1f5f9; padding:12px 16px; border-bottom:1px solid #e2e8f0;">Your Message / Notes</td>
          <td style="padding:12px 16px; border-bottom:1px solid #e2e8f0;">{user_message}</td>
        </tr>
      </table>

      {manager_box}

      <div class="legal-box">
        <div class="legal-title">🛡️ Guaranteed Sovereign Legal Title & CMDA Clearances</div>
        <p class="legal-text">
          Every plotted layout in our registry is subjected to comprehensive 3-tier municipal due diligence, 100% CMDA/DTCP sanction compliance, and certified individual clean Patta with nil encumbrances for 30+ years. Pre-approved bank loans up to 80% available via SBI, HDFC, and ICICI.
        </p>
      </div>

      <p style="font-size:14px; color:#64748b;">
        If you requested a Free AC Cab Visit or layout blueprint copy, our team will coordinate the driver pickup or dispatch the layout drawing directly via WhatsApp / Email.
      </p>

      <div style="text-align: center; margin-top: 26px;">
        <a href="https://wa.me/919345029705?text=Hello%20Chennai%20Plots,%20I%20have%20inquired%20about%20{property_title}%20(Ref:%20{lead_id})" style="display:inline-block; background:#25d366; color:#ffffff !important; text-decoration:none; padding:13px 26px; font-weight:700; font-size:14px; border-radius:6px; margin:6px;">
          💬 Connect on WhatsApp
        </a>
        <a href="mailto:monicaperumal2004@gmail.com?subject=Re:%20Inquiry%20{lead_id}%20-{property_title}" style="display:inline-block; background:#0b132b; color:#ffffff !important; text-decoration:none; padding:13px 26px; font-weight:700; font-size:14px; border-radius:6px; margin:6px;">
          ✉️ Reply to Email Support
        </a>
      </div>
    </div>
    <div class="email-footer">
      Chennai Plots • LLB Real Estate Group<br>
      OMR IT Expressway & Anna Salai, Chennai, Tamil Nadu 600096<br>
      Direct Support Hotline: +91 93450 29705 • Email: <a href="mailto:monicaperumal2004@gmail.com">monicaperumal2004@gmail.com</a><br>
      Licensed Real Estate Brokerage TNRERA: TNRERA/2026/PL-0842 &bull; Automatic Verification Engine
    </div>
  </div>
</body>
</html>"""


def send_smtp_email(to_email, subject, html_content):
    cfg = load_smtp_config()
    host = cfg.get("host") or "smtp.gmail.com"
    port = int(cfg.get("port", 465))
    user = cfg.get("user")
    password = cfg.get("password")
    from_email = cfg.get("fromEmail") or user or "monicaperumal2004@gmail.com"

    if not host or not user:
        return False, "SMTP user email is not configured."

    if not password:
        return False, "SMTP password is blank. Google App Password required."

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Chennai Plots Support <{from_email}>"
    msg["Reply-To"] = from_email
    msg["To"] = to_email
    part = MIMEText(html_content, "html", "utf-8")
    msg.attach(part)

    try:
        if port == 465:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(host, port, context=context, timeout=12) as server:
                server.login(user, password)
                server.sendmail(from_email, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(host, port, timeout=12) as server:
                server.starttls()
                server.login(user, password)
                server.sendmail(from_email, [to_email], msg.as_string())
        return True, f"Email successfully dispatched to {to_email}."
    except smtplib.SMTPAuthenticationError:
        return False, "Authentication Failed (535): Gmail rejected credentials. Make sure you use a 16-character App Password (not your personal Gmail password)."
    except Exception as e:
        return False, f"SMTP dispatch failed: {str(e)}"


def render_webhook_console():
    cfg = load_smtp_config()
    user = cfg.get("user", "monicaperumal2004@gmail.com")
    has_pwd = bool(cfg.get("password"))
    leads = load_leads()

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LLB Real Estate — Webhook Diagnostic & Testing Console</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    :root {{
      --bg: #f8f9fa;
      --card-bg: #ffffff;
      --black: #0b0f19;
      --gold: #b8860b;
      --text: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
      --success: #059669;
      --error: #dc2626;
      --font: 'Plus Jakarta Sans', sans-serif;
      --font-serif: 'Playfair Display', serif;
      --font-mono: 'JetBrains Mono', monospace;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.6; padding: 30px 20px; }}
    .container {{ max-width: 900px; margin: 0 auto; }}
    .header {{ background: var(--black); color: white; padding: 28px 32px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; border-bottom: 2px solid var(--gold); }}
    .brand {{ display: flex; align-items: center; gap: 12px; }}
    .logo-badge {{ background: var(--gold); color: var(--black); font-weight: 900; padding: 4px 10px; border-radius: 4px; font-size: 14px; letter-spacing: 1px; }}
    .brand-title {{ font-family: var(--font-serif); font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }}
    .pill-active {{ background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px; }}
    .pulse {{ width: 8px; height: 8px; border-radius: 50%; background: #34d399; box-shadow: 0 0 8px #34d399; display: inline-block; }}
    .content {{ background: var(--card-bg); padding: 36px; border: 1px solid var(--border); border-top: none; border-radius: 0 0 12px 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }}
    
    .notice-box {{ background: rgba(217, 119, 6, 0.08); border-left: 4px solid #d97706; padding: 18px 22px; border-radius: 4px; margin-bottom: 28px; }}
    .notice-title {{ color: #b45309; font-weight: 800; font-size: 14px; text-transform: uppercase; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }}
    .notice-text {{ color: #78350f; font-size: 13.5px; line-height: 1.6; }}

    .section-box {{ background: #fafafa; border: 1px solid var(--border); border-radius: 8px; padding: 24px; margin-bottom: 24px; }}
    .section-title {{ font-size: 15px; font-weight: 800; color: var(--black); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.5px; }}
    
    .code-pill {{ font-family: var(--font-mono); background: var(--black); color: #f8fafc; padding: 4px 10px; border-radius: 4px; font-size: 13px; word-break: break-all; }}
    .grid-2 {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }}
    
    label {{ display: block; font-size: 12px; font-weight: 700; color: var(--text); margin-bottom: 6px; text-transform: uppercase; }}
    input, select {{ width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: 6px; font-family: var(--font); font-size: 14px; background: white; }}
    input:focus {{ outline: none; border-color: var(--black); box-shadow: 0 0 0 3px rgba(11,15,25,0.08); }}
    
    .btn {{ display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 20px; font-size: 14px; font-weight: 700; border-radius: 6px; cursor: pointer; text-decoration: none; border: none; transition: 0.2s; }}
    .btn-black {{ background: var(--black); color: white; }}
    .btn-black:hover {{ background: #1f293d; }}
    .btn-gold {{ background: var(--gold); color: var(--black); }}
    .btn-gold:hover {{ background: #997538; color: white; }}
    .btn-outline {{ background: white; border: 1px solid var(--border); color: var(--text); }}
    .btn-outline:hover {{ border-color: var(--black); color: var(--black); }}
    
    .terminal {{ font-family: var(--font-mono); font-size: 12.5px; background: #0b0f19; color: #a7f3d0; padding: 16px; border-radius: 6px; margin-top: 14px; min-height: 90px; white-space: pre-wrap; overflow-x: auto; }}
    
    .steps-list {{ padding-left: 20px; font-size: 13.5px; color: var(--muted); line-height: 1.8; }}
    .steps-list strong {{ color: var(--black); }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <div class="logo-badge">LLB</div>
        <div class="brand-title">LLB Real Estate — Webhook Console</div>
      </div>
      <div>
        <span class="pill-active"><span class="pulse"></span> HTTP POST LISTENER ACTIVE</span>
      </div>
    </div>

    <div class="content">
      <!-- Explanation of 404 & Why Email Was Not Received -->
      <div class="notice-box">
        <div class="notice-title"><i class="fas fa-info-circle"></i> Why did you see an error when visiting this URL?</div>
        <div class="notice-text">
          <strong>1. Webhook Method:</strong> Webhooks are designed to receive <strong>HTTP POST requests</strong> with client registration data. Visiting this URL directly in your browser triggers a <code>GET</code> request, which previously showed a 404 error.<br>
          <strong>2. Why Email Was Not Received:</strong> Your registration was captured, but the confirmation email could not be sent because the <strong>Gmail App Password</strong> is currently blank.
        </div>
      </div>

      <!-- Quick SMTP Setup in 1-Click -->
      <div class="section-box" style="background: {'#f0fdf4' if has_pwd else '#fffbeb'}; border-color: {'#bbf7d0' if has_pwd else '#fef08a'};">
        <div class="section-title" style="color: {'#15803d' if has_pwd else '#b45309'};">
          <i class="fas fa-key"></i> SMTP Dispatch Status: {'🟢 Ready to Deliver Real Emails' if has_pwd else '⚠️ Gmail App Password Required'}
        </div>
        <p style="font-size: 13.5px; color: #475569; margin-bottom: 14px;">
          Sender Address: <strong>{user}</strong> (Gmail SMTP: <code>smtp.gmail.com:465</code>).
          {' Password is configured and ready.' if has_pwd else ' Google requires a 16-character App Password (not your personal password).'}
        </p>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <input type="password" id="smtpPasswordInput" placeholder="Enter 16-character App Password (e.g. abcd efgh ijkl mnop)" style="flex: 1; min-width: 260px;" />
          <button class="btn btn-black" onclick="savePassword()">
            <i class="fas fa-save"></i> Save & Test SMTP Connection
          </button>
        </div>
        <div style="margin-top: 8px; font-size: 12px; color: var(--muted);">
          👉 Don't have an App Password? Get one in 30 seconds at: <a href="https://myaccount.google.com/apppasswords" target="_blank" style="color:var(--black); font-weight:700; text-decoration:underline;">myaccount.google.com/apppasswords</a> (with 2-Step Verification ON).
        </div>
        <div id="smtpFeedback" style="margin-top: 10px; font-size: 13px; font-weight: 700; display: none;"></div>
      </div>

      <!-- Live Webhook Test Lead Dispatcher -->
      <div class="section-box">
        <div class="section-title"><i class="fas fa-bolt"></i> Execute Live Webhook Test Lead</div>
        <p style="font-size: 13px; color: var(--muted); margin-bottom: 14px;">
          Send an immediate registration payload to this webhook endpoint to verify the full email confirmation pipeline.
        </p>

        <div class="grid-2">
          <div>
            <label>Full Name</label>
            <input type="text" id="testName" value="Shahira Shabanam" />
          </div>
          <div>
            <label>Recipient Email</label>
            <input type="email" id="testEmail" value="{user}" />
          </div>
        </div>

        <div style="margin-top: 14px;">
          <button class="btn btn-gold" id="testBtn" onclick="runLiveTest()">
            <i class="fas fa-paper-plane"></i> Execute Webhook & Send Confirmation Email
          </button>
        </div>

        <div id="testOutput" class="terminal" style="display:none;"></div>
      </div>

      <!-- How to use this with n8n -->
      <div class="section-box" style="background:#ffffff;">
        <div class="section-title"><i class="fas fa-project-diagram"></i> Connecting this with n8n Automation</div>
        <p style="font-size: 13px; color: var(--muted); margin-bottom: 10px;">
          If you want <strong>n8n</strong> to receive the lead and send the email instead of this local server:
        </p>
        <ol class="steps-list">
          <li>Open your n8n workspace (Cloud or Local).</li>
          <li>Import <strong><code>llb_n8n_automation_workflow.json</code></strong>.</li>
          <li>Double-click Node 1 (<strong>Webhook</strong>) and copy the <strong>Production URL</strong> provided by n8n.</li>
          <li>Open the website (<a href="/index.html" style="font-weight:700; text-decoration:underline; color:var(--black);">index.html</a>), click <strong>n8n Setup</strong> in the navigation bar, and paste your n8n Webhook URL.</li>
          <li>In n8n Node 3 (<strong>Send Email</strong>), enter your email & 16-character App Password, and toggle to <strong>ACTIVE</strong>.</li>
        </ol>
      </div>

      <!-- Action Footer -->
      <div style="display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap; border-top: 1px solid var(--border); padding-top: 20px;">
        <a href="/index.html" class="btn btn-black"><i class="fas fa-globe"></i> Open Website & Registration Form</a>
        <a href="/admin.html" class="btn btn-outline"><i class="fas fa-tachometer-alt"></i> Open Admin Dashboard</a>
      </div>
    </div>
  </div>

  <script>
    async function savePassword() {{
      const pwd = document.getElementById('smtpPasswordInput').value.trim();
      const fb = document.getElementById('smtpFeedback');
      if (!pwd) {{
        alert('Please enter your 16-character Google App Password.');
        return;
      }}
      fb.style.display = 'block';
      fb.style.color = '#0b0f19';
      fb.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying credentials with smtp.gmail.com:465...';

      try {{
        const res = await fetch('/api/settings/smtp', {{
          method: 'POST',
          headers: {{ 'Content-Type': 'application/json' }},
          body: JSON.stringify({{
            host: 'smtp.gmail.com',
            port: 465,
            user: '{user}',
            password: pwd
          }})
        }});
        const data = await res.json();
        if (data.success) {{
          fb.style.color = '#059669';
          fb.innerHTML = '✅ SMTP Connected! ' + data.message + ' You can now click "Execute Webhook & Send Confirmation Email" below!';
        }} else {{
          fb.style.color = '#dc2626';
          fb.innerHTML = '❌ Connection Error: ' + data.message;
        }}
      }} catch (e) {{
        fb.style.color = '#dc2626';
        fb.innerHTML = '❌ Network Error: ' + e.message;
      }}
    }}

    async function runLiveTest() {{
      const btn = document.getElementById('testBtn');
      const out = document.getElementById('testOutput');
      const name = document.getElementById('testName').value;
      const email = document.getElementById('testEmail').value;

      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Dispatched to Webhook...';
      out.style.display = 'block';
      out.textContent = '>> Sending HTTP POST to /webhook/llb-property-inquiry ...\\n';

      const payload = {{
        fullName: name,
        email: email,
        phone: '+91 82700 55556',
        inquiryType: 'VIP Property Buyer',
        propertyTitle: 'The Grand Horizon Sky Penthouse',
        budget: '$4,850,000',
        timeline: 'Immediate (Next 30 Days)',
        preferredContact: 'Email',
        message: 'Testing live webhook and automated email dispatch.'
      }};

      try {{
        const res = await fetch('/webhook/llb-property-inquiry', {{
          method: 'POST',
          headers: {{ 'Content-Type': 'application/json' }},
          body: JSON.stringify(payload)
        }});
        const json = await res.json();
        out.textContent += '>> HTTP ' + res.status + '\\n' + JSON.stringify(json, null, 2);

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Execute Webhook & Send Confirmation Email';

        if (json.emailSent) {{
          alert('🎉 SUCCESS! Confirmation email has been sent to ' + email + '! Check your inbox.');
        }} else {{
          alert('⚠️ Lead registered (Ref: ' + json.leadId + '), but email was NOT sent to your inbox because: ' + (json.emailStatus || json.error) + '\\n\\nEnter your Google App Password in the box above to enable email delivery.');
        }}
      }} catch (err) {{
        out.textContent += '>> Error: ' + err.message;
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Execute Webhook & Send Confirmation Email';
      }}
    }}
  </script>
</body>
</html>"""


class AutomationRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS for cross-origin testing and frontend calls
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # API: Return Server Network Info for zero-configuration mobile access
        if self.path == "/api/server-info" or self.path == "/api/server-info/":
            local_ip = get_local_ip()
            active_port = self.server.server_address[1] if hasattr(self, 'server') and hasattr(self.server, 'server_address') else PORT
            server_info = {
                "server": "LLB Real Estate Mobile & Automation Hub",
                "status": "online",
                "localIp": local_ip,
                "port": active_port,
                "mobilePlotUrl": f"http://{local_ip}:{active_port}/chennai-plots.html",
                "mobileHomeUrl": f"http://{local_ip}:{active_port}/index.html",
                "desktopPlotUrl": f"http://localhost:{active_port}/chennai-plots.html",
                "desktopHomeUrl": f"http://localhost:{active_port}/index.html"
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(server_info, indent=2).encode("utf-8"))
            return

        # Mobile shortcut redirect
        if self.path == "/mobile" or self.path == "/mobile/":
            self.send_response(302)
            self.send_header("Location", "/mobile.html")
            self.end_headers()
            return

        # API: Return list of leads
        if self.path == "/api/leads" or self.path == "/api/leads/":
            leads = load_leads()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(leads).encode("utf-8"))
            return

        # API: Return system and SMTP status
        if self.path == "/api/status" or self.path == "/api/status/":
            cfg = load_smtp_config()
            leads = load_leads()
            status_data = {
                "server": "LLB Real Estate Automation Hub",
                "status": "online",
                "webhookEndpoint": f"http://localhost:{PORT}/webhook/llb-property-inquiry",
                "totalLeads": len(leads),
                "smtpConfigured": bool(cfg.get("user") and cfg.get("host")),
                "smtpUser": cfg.get("user", "")
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(status_data).encode("utf-8"))
            return

        # API: Return SMTP config (without exposing full password)
        if self.path == "/api/settings/smtp":
            cfg = load_smtp_config()
            safe_cfg = {
                "host": cfg.get("host", ""),
                "port": cfg.get("port", 465),
                "user": cfg.get("user", ""),
                "fromEmail": cfg.get("fromEmail", ""),
                "hasPassword": bool(cfg.get("password")),
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(safe_cfg).encode("utf-8"))
            return

        # Webhook Console & Health Diagnostic (Handles browser GET gracefully)
        if self.path.startswith("/webhook/llb-property-inquiry") or self.path.startswith("/api/webhook"):
            accept = self.headers.get("Accept", "")
            if "application/json" in accept and "text/html" not in accept:
                cfg = load_smtp_config()
                has_pwd = bool(cfg.get("password"))
                res_obj = {
                    "endpoint": f"http://localhost:{PORT}/webhook/llb-property-inquiry",
                    "status": "online",
                    "method": "POST",
                    "smtpUser": cfg.get("user", "monicaperumal2004@gmail.com"),
                    "smtpConfigured": bool(cfg.get("user") and has_pwd),
                    "message": "Ready to receive POST JSON lead registrations." if has_pwd else "Password missing. Set 16-character Google App Password to enable live email delivery.",
                    "howToUse": "Submit HTTP POST with JSON body containing fullName and email."
                }
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(res_obj, indent=2).encode("utf-8"))
                return
            else:
                html = render_webhook_console()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(html.encode("utf-8"))
                return

        # Default static file handling
        super().do_GET()

    def do_POST(self):
        # 1. Primary Webhook Handler: Compatible with n8n Webhook Node
        if self.path.startswith("/webhook/llb-property-inquiry") or self.path.startswith("/api/webhook"):
            content_length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(content_length).decode("utf-8")
            
            try:
                payload = json.loads(raw_body) if raw_body else {}
            except Exception:
                payload = {}

            lead_id = "LLB-" + hex(int(time.time()))[2:].upper()
            now_dt = datetime.now()
            formatted_date = now_dt.strftime("%B %d, %Y - %I:%M %p EST")

            lead_record = {
                "leadId": lead_id,
                "fullName": payload.get("fullName") or payload.get("name") or "VIP Inquirer",
                "email": payload.get("email", "").strip().lower(),
                "phone": payload.get("phone") or payload.get("whatsapp") or "",
                "inquiryType": payload.get("inquiryType") or "Private Site Visit Tour",
                "propertyTitle": payload.get("propertyTitle") or "General Luxury Portfolio",
                "propertyId": payload.get("propertyId") or "GENERAL",
                "budget": payload.get("budget") or "$3,000,000 - $5,000,000",
                "timeline": payload.get("timeline") or "Immediate (Next 30 Days)",
                "preferredContact": payload.get("preferredContact") or "Email",
                "message": payload.get("message") or "Requesting full property dossier and legal clearance sheet.",
                "formattedDate": formatted_date,
                "timestamp": now_dt.isoformat(),
                "sendEmail": payload.get("sendEmail", True),
                "sendWhatsApp": payload.get("sendWhatsApp", True),
                "viewEmailUrl": f"/sent_emails/{lead_id}.html"
            }

            # Generate Luxury HTML Confirmation Email
            html_content = generate_email_html(lead_record)
            email_filepath = os.path.join(EMAILS_DIR, f"{lead_id}.html")
            with open(email_filepath, "w", encoding="utf-8") as f:
                f.write(html_content)

            # Attempt SMTP Dispatch if email provided
            email_sent = False
            email_status_msg = "Saved locally"
            if lead_record["email"] and lead_record["sendEmail"]:
                inq_type = (lead_record.get("inquiryType") or "").lower()
                prop_title = lead_record.get("propertyTitle", "Plot Selection")
                
                if "cab" in inq_type or "visit" in inq_type:
                    subj = f"🚖 Free Cab Site Visit Confirmed: {prop_title} [Ref: {lead_id}]"
                elif "sell" in inq_type:
                    subj = f"🏡 Plot Listing Confirmed: {prop_title} [Ref: {lead_id}]"
                elif "vip" in inq_type:
                    subj = f"VIP Registration Confirmation: {prop_title} [Ref: {lead_id}]"
                else:
                    subj = f"📍 Plot Inquiry & Dossier Confirmed: {prop_title} [Ref: {lead_id}]"

                success, msg = send_smtp_email(
                    to_email=lead_record["email"],
                    subject=subj,
                    html_content=html_content
                )
                email_sent = success
                email_status_msg = msg

            lead_record["emailSent"] = email_sent
            lead_record["emailStatus"] = email_status_msg
            save_lead(lead_record)

            if email_sent:
                response_data = {
                    "status": "success",
                    "leadId": lead_id,
                    "recipient": lead_record["email"],
                    "emailSent": True,
                    "emailStatus": email_status_msg,
                    "message": f"VIP Registration confirmed! Confirmation email successfully dispatched to {lead_record['email']}.",
                    "viewEmailUrl": lead_record["viewEmailUrl"],
                    "timestamp": lead_record["timestamp"]
                }
            else:
                response_data = {
                    "status": "warning",
                    "leadId": lead_id,
                    "recipient": lead_record["email"],
                    "emailSent": False,
                    "emailStatus": email_status_msg,
                    "error": f"Lead registered, but confirmation email could NOT be delivered to {lead_record['email']} because: {email_status_msg}",
                    "actionRequired": "Enter your 16-character Google App Password at http://localhost:8080/webhook/llb-property-inquiry to enable live email delivery.",
                    "viewEmailUrl": lead_record["viewEmailUrl"],
                    "timestamp": lead_record["timestamp"]
                }

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode("utf-8"))
            print(f"[✓] Received Lead {lead_id} | Client: {lead_record['fullName']} ({lead_record['email']}) | Email: {email_status_msg}")
            return

        # 2. Save SMTP Settings API
        if self.path == "/api/settings/smtp":
            content_length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(raw_body) if raw_body else {}

            existing = load_smtp_config()
            if not data.get("password") and existing.get("password"):
                data["password"] = existing["password"]

            save_smtp_config(data)

            # Test connection
            test_success = False
            test_msg = "Credentials saved."
            if data.get("host") and data.get("user") and data.get("password"):
                try:
                    host = data["host"]
                    port = int(data.get("port", 465))
                    user = data["user"]
                    pwd = data["password"]
                    if port == 465:
                        ctx = ssl.create_default_context()
                        with smtplib.SMTP_SSL(host, port, context=ctx, timeout=8) as s:
                            s.login(user, pwd)
                    else:
                        with smtplib.SMTP(host, port, timeout=8) as s:
                            s.starttls()
                            s.login(user, pwd)
                    test_success = True
                    test_msg = "SMTP connection verified successfully!"
                except Exception as e:
                    test_msg = f"Connection error: {str(e)}"

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": test_success,
                "message": test_msg
            }).encode("utf-8"))
            return

        # 3. Quick Test Email Dispatch API
        if self.path == "/api/test-email":
            content_length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(raw_body) if raw_body else {}
            to_email = data.get("email") or "test@example.com"

            test_lead = {
                "leadId": "LLB-TEST-" + hex(int(time.time()))[2:].upper(),
                "fullName": data.get("name") or "VIP Test Recipient",
                "email": to_email,
                "phone": "+1 (800) 552-7325",
                "inquiryType": "Automated Email Verification Test",
                "propertyTitle": "The Grand Horizon Sky Penthouse",
                "budget": "$4,850,000",
                "preferredContact": "Email",
                "message": "Testing the automated registration verification email system.",
                "formattedDate": datetime.now().strftime("%B %d, %Y - %I:%M %p EST")
            }
            html = generate_email_html(test_lead)
            email_filepath = os.path.join(EMAILS_DIR, f"{test_lead['leadId']}.html")
            with open(email_filepath, "w", encoding="utf-8") as f:
                f.write(html)

            sent, msg = send_smtp_email(to_email, f"VIP Verification Test [Ref: {test_lead['leadId']}]", html)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": sent,
                "message": msg,
                "viewUrl": f"/sent_emails/{test_lead['leadId']}.html",
                "leadId": test_lead["leadId"]
            }).encode("utf-8"))
            return

        # Fallback
        self.send_response(404)
        self.end_headers()


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        if ip and not ip.startswith('127.'):
            return ip
    except Exception:
        pass
    try:
        hostname = socket.gethostname()
        ip = socket.gethostbyname(hostname)
        if ip and not ip.startswith('127.'):
            return ip
    except Exception:
        pass
    return '127.0.0.1'


def run_server():
    os.chdir(DIRECTORY)
    port = PORT
    local_ip = get_local_ip()

    for attempt_port in range(PORT, PORT + 20):
        try:
            handler = AutomationRequestHandler
            server_cls = getattr(http.server, "ThreadingHTTPServer", socketserver.ThreadingTCPServer)
            server_cls.daemon_threads = True
            server_cls.allow_reuse_address = True
            with server_cls(("", attempt_port), handler) as httpd:
                url = f"http://localhost:{attempt_port}/chennai-plots.html"
                mobile_url = f"http://{local_ip}:{attempt_port}/chennai-plots.html"
                home_url = f"http://localhost:{attempt_port}/index.html"
                admin_url = f"http://localhost:{attempt_port}/admin.html"
                webhook_url = f"http://localhost:{attempt_port}/webhook/llb-property-inquiry"
                
                print("=" * 70)
                print(" [CHENNAI PRIME PLOTS & REAL ESTATE] LOCAL SERVER & ROUTING ENGINE")
                print("=" * 70)
                print(f" * Chennai Plots (PC):  {url}")
                print(f" * Mobile (Same Wi-Fi): {mobile_url}  (No IP entry needed)")
                print(f" * Luxury Homes:        {home_url}")
                print(f" * Mobile Portal & QR:  http://localhost:{attempt_port}/mobile.html")
                print(f" * Admin Dashboard:     {admin_url}")
                print(f" * Webhook:             {webhook_url}")
                print(" * Status:              Online & Ready")
                print("=" * 70)

                try:
                    webbrowser.open(admin_url)
                except Exception:
                    pass

                httpd.serve_forever()
                break
        except OSError:
            continue


if __name__ == "__main__":
    try:
        run_server()
    except KeyboardInterrupt:
        print("\n[✓] Server gracefully stopped.")
        sys.exit(0)
