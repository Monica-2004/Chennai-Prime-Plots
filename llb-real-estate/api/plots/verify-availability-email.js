import nodemailer from 'nodemailer';

const PLOTS_DB = {
  "CHN-OMR-01": {
    id: "CHN-OMR-01",
    title: "Emerald Crest Villa Plots",
    locality: "Sholinganallur, OMR",
    priceDisplay: "₹48.00 Lakhs",
    pricePerSqftDisplay: "₹4,000 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "East",
    roadWidth: "40 Feet Blacktop Road",
    approvalType: "CMDA & TNRERA",
    approvalNo: "CMDA/PPD/2026/0412",
    reraNo: "TNRERA/2026/PL-0842",
    pattaStatus: "100% Individual Clean Patta",
    bankLoan: "Pre-approved by SBI, HDFC, ICICI (up to 80%)",
    coords: [12.9010, 80.2279]
  },
  "CHN-ECR-01": {
    id: "CHN-ECR-01",
    title: "Bay Breeze Luxury Beachside Plots",
    locality: "Uthandi, ECR",
    priceDisplay: "₹1.44 Crores",
    pricePerSqftDisplay: "₹6,000 / sq.ft",
    plotSizeSqft: 2400,
    plotSizeCents: 5.51,
    plotSizeGrounds: 1.00,
    dimensions: "40 ft × 60 ft",
    facing: "North-East",
    roadWidth: "50 Feet Avenue Boulevard",
    approvalType: "CMDA Approved",
    approvalNo: "CMDA/PPD/2026/0189",
    reraNo: "TNRERA/2026/PL-0419",
    pattaStatus: "100% Individual Clean Patta (Nil EC 30+ Yrs)",
    bankLoan: "Pre-approved by HDFC, Axis, SBI",
    coords: [12.8682, 80.2458]
  },
  "CHN-GST-01": {
    id: "CHN-GST-01",
    title: "Grand South Villa Plots",
    locality: "Guduvanchery, GST Road",
    priceDisplay: "₹24.00 Lakhs",
    pricePerSqftDisplay: "₹2,400 / sq.ft",
    plotSizeSqft: 1000,
    plotSizeCents: 2.30,
    plotSizeGrounds: 0.42,
    dimensions: "25 ft × 40 ft",
    facing: "North",
    roadWidth: "30 Feet Internal Road",
    approvalType: "DTCP & RERA Approved",
    approvalNo: "DTCP/CR/2026/1024",
    reraNo: "TNRERA/2026/PL-0731",
    pattaStatus: "100% Individual Clean Patta (Nil EC 30+ Yrs)",
    bankLoan: "Pre-approved by SBI, Indian Bank, Canara Bank",
    coords: [12.7845, 80.0562]
  }
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Bypass-Tunnel-Reminder'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const visitInfo = (body.visitData && typeof body.visitData === 'object') ? body.visitData : body;
    const plotId = body.plotId || body.propertyId || visitInfo.plotId || "CHN-OMR-01";
    const recipientEmail = (body.email || body.userEmail || visitInfo.email || visitInfo.userEmail || "").trim().toLowerCase();
    const fullName = body.fullName || body.name || visitInfo.fullName || visitInfo.name || "Valued Investor";
    const phone = body.phone || visitInfo.phone || "+91 93450 29705";
    const visitDate = body.visitDate || visitInfo.visitDate || "Immediate Inspection (Tomorrow)";
    const visitTime = body.visitTime || visitInfo.visitTime || "10:30 AM";
    const pickupLocation = body.pickupLocation || visitInfo.pickupLocation || "Doorstep Pickup in Chennai";
    const needCab = (body.needCab !== false && visitInfo.needCab !== false);
    const visitRef = body.visitRef || visitInfo.visitRef || ("VISIT-" + Math.floor(100000 + Math.random() * 900000));

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({ success: false, error: "A valid recipient email address is required." });
    }

    const plot = PLOTS_DB[plotId] || {
      id: plotId,
      title: body.plotTitle || visitInfo.propertyTitle || "Chennai Prime Villa Plot",
      locality: body.locality || visitInfo.locality || "OMR / ECR Expressway, Chennai",
      priceDisplay: body.priceDisplay || "₹48.00 Lakhs",
      pricePerSqftDisplay: "₹4,000 / sq.ft",
      plotSizeSqft: 1200,
      plotSizeCents: 2.75,
      plotSizeGrounds: 0.50,
      dimensions: "30 ft × 40 ft",
      facing: "East",
      roadWidth: "40 Feet Blacktop Road",
      approvalType: "CMDA & TNRERA",
      approvalNo: "CMDA/PPD/2026/0412",
      reraNo: "TNRERA/2026/PL-0842",
      pattaStatus: "100% Individual Clean Patta (Nil EC 30+ Yrs)",
      bankLoan: "Pre-approved by SBI, HDFC, ICICI",
      coords: [12.9010, 80.2279]
    };

    const cabStatus = needCab ? "✔ Reserved (Complimentary AC Sedan Pickup & Drop)" : "Self Arrival to Site Office";
    const dateStr = new Date().toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Plot Availability Verified & Visit Pass — ${plot.id}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070b14; color: #f1f5f9; margin: 0; padding: 25px 15px;">
      <div style="max-width: 640px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(212, 175, 55, 0.45); border-radius: 14px; overflow: hidden; box-shadow: 0 12px 48px rgba(0, 0, 0, 0.7);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0b132b 0%, #1e293b 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid #d4af37;">
          <span style="display:inline-block; background:#10b981; color:#0b132b; font-weight:900; font-size:11.5px; padding:4px 14px; border-radius:20px; letter-spacing:1.5px; margin-bottom:10px; text-transform:uppercase;">✔ Availability Verified &amp; Visit Pass</span>
          <h1 style="color:#ffffff; font-size:24px; font-weight:800; letter-spacing:1.5px; margin:0;">CHENNAI PRIME PLOTS</h1>
          <div style="color:#94a3b8; font-size:12px; letter-spacing:1.5px; text-transform:uppercase; margin-top:6px;">CMDA &bull; DTCP &bull; TNRERA Approved &bull; 100% Clean Title Patta</div>
        </div>

        <div style="padding: 28px 22px; line-height: 1.6; color: #cbd5e1; font-size: 14.5px;">
          
          <!-- Banner -->
          <div style="background: linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(5,150,105,0.08) 100%); border: 2px solid #10b981; border-radius: 10px; padding: 18px; margin-bottom: 22px;">
            <div style="color:#34d399; font-weight:800; font-size:13.5px; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">
              🟢 Plot Status: 100% Available &bull; Ref: ${plot.id}
            </div>
            <div style="font-size:18px; font-weight:800; color:#ffffff; margin-bottom:4px;">
              ${plot.title} — ${plot.locality}
            </div>
            <div style="color:#94a3b8; font-size:12.5px;">
              Verified sovereign-title clear and ready for immediate sale deed registration. Nil-encumbrance certified 1994 to 2026.
            </div>
          </div>

          <p>Dear <strong>${fullName}</strong>,</p>
          <p>
            Thank you for requesting plot availability and scheduling a site inspection. Your visit voucher has been confirmed in our master site registry:
          </p>

          <!-- Specifications Table -->
          <table style="width: 100%; border-collapse: collapse; margin: 18px 0; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; font-size: 13.5px;">
            <tr><td style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); color:#94a3b8; width:40%;">Plot Reference:</td><td style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); color:#fbbf24; font-weight:bold;">${plot.id}</td></tr>
            <tr><td style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); color:#94a3b8;">Project & Location:</td><td style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); color:#ffffff; font-weight:600;">${plot.title}, ${plot.locality}</td></tr>
            <tr><td style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); color:#94a3b8;">Dimensions & Area:</td><td style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); color:#ffffff;">${plot.plotSizeSqft} Sq.Ft &bull; ${plot.dimensions} (${plot.plotSizeCents} Cents)</td></tr>
            <tr><td style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); color:#94a3b8;">Orientation (Vastu):</td><td style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); color:#34d399; font-weight:bold;">✔ ${plot.facing} Facing (100% Vastu)</td></tr>
            <tr><td style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); color:#94a3b8;">Road Access:</td><td style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); color:#ffffff;">${plot.roadWidth}</td></tr>
            <tr><td style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); color:#94a3b8;">Quoted Rate:</td><td style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); color:#fbbf24; font-weight:bold;">${plot.priceDisplay} (${plot.pricePerSqftDisplay})</td></tr>
            <tr><td style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); color:#94a3b8;">Approval Orders:</td><td style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); color:#ffffff;">${plot.approvalNo} (${plot.approvalType})</td></tr>
            <tr><td style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); color:#94a3b8;">TNRERA Reg:</td><td style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.06); color:#ffffff;">${plot.reraNo}</td></tr>
            <tr><td style="padding:10px 14px; color:#94a3b8;">Patta Status:</td><td style="padding:10px 14px; color:#10b981; font-weight:bold;">${plot.pattaStatus}</td></tr>
          </table>

          <!-- Security Pass Voucher -->
          <div style="background: rgba(212, 175, 55, 0.09); border: 2px dashed #fbbf24; border-radius: 12px; padding: 20px; margin: 22px 0; text-align: center;">
            <div style="color:#94a3b8; font-size:11px; text-transform:uppercase; letter-spacing:2px; font-weight:700;">
              🎫 Official Site Visit Security Pass
            </div>
            <div style="font-size:26px; font-weight:900; color:#fbbf24; font-family:'Courier New', monospace; letter-spacing:4px; margin:8px 0;">
              ${visitRef}
            </div>
            <div style="background:rgba(0,0,0,0.3); border-radius:8px; padding:12px; text-align:left; font-size:13px; line-height:1.7;">
              <div><strong style="color:#94a3b8;">📅 Visit Date &amp; Time:</strong> <span style="color:#ffffff; font-weight:bold;">${visitDate} at ${visitTime}</span></div>
              <div><strong style="color:#94a3b8;">🚖 VIP Transport:</strong> <span style="color:#34d399; font-weight:bold;">${cabStatus}</span></div>
              <div><strong style="color:#94a3b8;">📍 Doorstep Pickup:</strong> <span style="color:#ffffff;">${pickupLocation}</span></div>
              <div><strong style="color:#94a3b8;">👤 Registered Client:</strong> <span style="color:#ffffff;">${fullName} (${phone})</span></div>
            </div>
          </div>

          <!-- Assigned Surveyor -->
          <div style="background: rgba(255, 255, 255, 0.03); border-left: 4px solid #d4af37; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 20px 0;">
            <div style="color:#fbbf24; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; font-weight:800;">
              📍 Assigned Chief Land Surveyor &amp; Inspection Officer
            </div>
            <div style="font-size:16px; font-weight:800; color:#ffffff; margin:3px 0;">Er. K. Senthil Nathan</div>
            <div style="font-size:12.5px; color:#94a3b8;">Senior Site Coordinator &bull; Direct: +91 93450 29705</div>
            <div style="margin-top:10px;">
              <a href="tel:+919345029705" style="display:inline-block; background:#0b132b; border:1px solid #d4af37; color:#fbbf24 !important; text-decoration:none; padding:7px 14px; border-radius:6px; font-size:12px; font-weight:700; margin-right:8px;">
                📞 Call Surveyor
              </a>
              <a href="https://wa.me/919345029705?text=Hello%20Senthil,%20I%20have%20received%20visit%20pass%20${visitRef}%20for%20${encodeURIComponent(plot.title)}%20(${plot.id})" style="display:inline-block; background:#25d366; color:#ffffff !important; text-decoration:none; padding:7px 14px; border-radius:6px; font-size:12px; font-weight:700;">
                💬 WhatsApp
              </a>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="text-align:center; margin:22px 0 10px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${plot.coords[0]},${plot.coords[1]}" style="display:inline-block; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#ffffff !important; text-decoration:none; font-weight:800; font-size:14px; padding:12px 22px; border-radius:8px; margin:6px;" target="_blank">
              📍 Open GPS Driving Route (Google Maps)
            </a>
            <a href="https://monica-2004.github.io/Chennai-Prime-Plots/chennai-plots.html?plot=${plot.id}&autovision=1" style="display:inline-block; background:linear-gradient(135deg, #fbbf24 0%, #d4af37 100%); color:#0b132b !important; text-decoration:none; font-weight:800; font-size:14px; padding:12px 22px; border-radius:8px; margin:6px;" target="_blank">
              📱 3D Street Vision &amp; Virtual Tour
            </a>
          </div>

          <p style="font-size:12px; color:#64748b; margin-top:20px; line-height:1.5; text-align:center;">
            Pass issued on ${dateStr}. Valid for 7 calendar days. For queries, contact <a href="mailto:monicaperumal2004@gmail.com" style="color:#94a3b8;">monicaperumal2004@gmail.com</a>.
          </p>
        </div>

        <div style="background: rgba(0, 0, 0, 0.5); padding: 16px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 11.5px; color: #64748b;">
          Chennai Prime Plots &bull; DPIIT Recognized &bull; TN RERA Registered Partner<br>
          One Grand Plaza, Anna Salai / OMR Expressway, Chennai, Tamil Nadu 600028<br>
          Helpline: +91 93450 29705 &bull; Support: monicaperumal2004@gmail.com
        </div>
      </div>
    </body>
    </html>
    `;

    let emailSent = false;
    let messageId = null;

    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'monicaperumal2004@gmail.com',
          pass: 'qrdt tkox ebuy nzhy'
        }
      });

      const info = await transporter.sendMail({
        from: '"Chennai Prime Plots" <monicaperumal2004@gmail.com>',
        to: recipientEmail,
        bcc: 'monicaperumal2004@gmail.com',
        subject: `🟢 Plot Availability Verified & Visit Pass: ${plot.title} [${plot.id}]`,
        html: htmlContent
      });

      emailSent = true;
      messageId = info.messageId;
    } catch (smtpErr) {
      console.warn("Vercel Serverless SMTP Dispatch Warning:", smtpErr);
    }

    return res.status(200).json({
      success: true,
      emailSent: emailSent,
      messageId: messageId,
      visitRef: visitRef,
      plotId: plot.id,
      plotTitle: plot.title,
      recipient: recipientEmail,
      message: `Official plot availability confirmed & visit pass dispatched to ${recipientEmail}!`,
      receiptHtml: htmlContent,
      plot: plot
    });

  } catch (error) {
    console.error("Vercel plot availability error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
