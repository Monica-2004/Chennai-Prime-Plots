import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS Headers so requests from GitHub Pages or any client origin succeed
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let payload = req.body || {};
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        console.warn("Could not parse req.body as JSON string:", e);
      }
    }
    const bookingRef = payload.bookingRef || ("CP-CH-" + Math.floor(100000 + Math.random() * 900000));
    const recipientEmail = (payload.email || "").trim().toLowerCase();
    const recipientName = payload.fullName || payload.name || "Valued VIP Client";
    const propertyTitle = payload.propertyTitle || "Chennai Prime Plot";
    const pickupLoc = payload.pickupLocation || payload.notes || "Chennai City / Airport Pickup";
    const scheduledDate = payload.date || new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
    const phone = payload.phone || "Not Provided";
    const inquiryType = payload.inquiryType || "Free Cab Site Visit";

    let emailSent = false;
    let messageId = null;

    if (recipientEmail) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'monicaperumal2004@gmail.com',
          pass: 'qrdt tkox ebuy nzhy'
        }
      });

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0b132b; color: #f8fafc; border: 1px solid rgba(212,175,55,0.4); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px; border-bottom: 2px solid #d4af37; text-align: center;">
            <h2 style="margin: 0; color: #d4af37; font-size: 24px; letter-spacing: 1px; font-weight: 800;">CHENNAI PRIME PLOTS</h2>
            <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Official Booking Confirmation & Legal Blueprint Dossier</p>
          </div>

          <!-- Body -->
          <div style="padding: 24px;">
            <div style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; border-radius: 8px; padding: 14px 18px; margin-bottom: 22px;">
              <span style="color: #34d399; font-size: 18px; font-weight: bold; margin-right: 8px;">✔</span>
              <span style="color: #ffffff; font-size: 15px; font-weight: 600;">Dear ${recipientName}, your request has been confirmed!</span>
            </div>

            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              Thank you for choosing <strong>Chennai Prime Plots</strong>. Your site inspection and official document dossier have been reserved under Reference Number <span style="color: #fbbf24; font-weight: bold;">${bookingRef}</span>.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; background: rgba(255,255,255,0.02); border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px;">Booking Reference:</td>
                <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #d4af37; font-size: 16px; font-weight: bold; text-align: right;">${bookingRef}</td>
              </tr>
              <tr>
                <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px;">Selected Property:</td>
                <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #ffffff; font-size: 14.5px; font-weight: 700; text-align: right;">${propertyTitle}</td>
              </tr>
              <tr>
                <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px;">Client Name:</td>
                <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #ffffff; font-size: 14px; text-align: right;">${recipientName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px;">Contact Number:</td>
                <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #ffffff; font-size: 14px; text-align: right;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px;">Pickup Location:</td>
                <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #ffffff; font-size: 14px; text-align: right;">${pickupLoc}</td>
              </tr>
              <tr>
                <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px;">Scheduled Inspection Date:</td>
                <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #38bdf8; font-size: 14.5px; font-weight: bold; text-align: right;">${scheduledDate}</td>
              </tr>
            </table>

            <div style="background: rgba(212,175,55,0.06); border-left: 3px solid #d4af37; padding: 14px 18px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #fbbf24; font-weight: bold; text-transform: uppercase;">Verified Legal Guarantees Included:</p>
              <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 13px; line-height: 1.6;">
                <li><strong>CMDA & DTCP Sanctioned Layout</strong> — 100% compliant with Tamil Nadu town planning norms</li>
                <li><strong>30-Year Encumbrance Certificate (EC)</strong> — Verified nil-encumbrance & clear marketable title</li>
                <li><strong>Revenue Patta, Chitta & Adangal</strong> — Up-to-date land registry ownership proof</li>
                <li><strong>Complimentary AC Cab Inspection</strong> — Doorstep pickup & drop with senior surveyor</li>
              </ul>
            </div>

            <!-- Action Buttons -->
            <div style="text-align: center; margin-top: 26px;">
              <a href="https://wa.me/919345029705?text=Hello%20Chennai%20Prime%20Plots,%20my%20booking%20reference%20is%20${bookingRef}%20for%20${encodeURIComponent(propertyTitle)}.%20Please%20confirm%20my%20pickup." target="_blank" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 13px 26px; border-radius: 8px; font-weight: bold; font-size: 14.5px; box-shadow: 0 4px 16px rgba(37,211,102,0.4); margin: 6px;">
                💬 WhatsApp VIP Concierge
              </a>
              <a href="tel:+919345029705" style="display: inline-block; background: #1e293b; color: #ffffff; border: 1px solid rgba(255,255,255,0.2); text-decoration: none; padding: 13px 22px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 6px;">
                📞 Call Direct (+91 93450 29705)
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: rgba(0,0,0,0.4); padding: 18px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); font-size: 11.5px; color: #64748b; line-height: 1.5;">
            Chennai Prime Plots &bull; DPIIT Recognized &bull; TN RERA Registered Partner<br>
            One Grand Plaza, Anna Salai / OMR Road, Chennai, Tamil Nadu 600028<br>
            To reschedule or speak with our legal team, simply reply to this email or call +91 93450 29705.
          </div>
        </div>
      `;

      const info = await transporter.sendMail({
        from: '"Chennai Prime Plots" <monicaperumal2004@gmail.com>',
        to: recipientEmail,
        bcc: 'monicaperumal2004@gmail.com', // Agency copy
        subject: `[Confirmed] Official Booking & Legal Dossier: ${propertyTitle} (${bookingRef})`,
        html: htmlContent
      });

      emailSent = true;
      messageId = info.messageId;
    }

    return res.status(200).json({
      success: true,
      emailSent: emailSent,
      messageId: messageId,
      bookingRef: bookingRef,
      message: `Official confirmation email successfully dispatched to ${recipientEmail}`,
      payload: payload
    });

  } catch (error) {
    console.error('Serverless email error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
}
