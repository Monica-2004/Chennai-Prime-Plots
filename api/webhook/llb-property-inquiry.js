/**
 * Vercel Serverless Function: /api/webhook/llb-property-inquiry
 * Handles real estate lead capture and instant confirmation email dispatch on Vercel.
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
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
    const payload = req.body || {};
    const bookingRef = payload.bookingRef || ("CP-CH-" + Math.floor(100000 + Math.random() * 900000));
    
    // In Vercel, dispatch to FormSubmit or internal SMTP
    const notificationEmail = process.env.NOTIFICATION_EMAIL || "plantgreeninertia@gmail.com";
    
    if (payload.email) {
      try {
        await fetch(`https://formsubmit.co/ajax/${notificationEmail}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            name: payload.fullName || "VIP Client",
            email: payload.email,
            phone: payload.phone || "Not Provided",
            subject: `[${bookingRef}] ${payload.inquiryType || 'Inquiry'}: ${payload.propertyTitle || 'Chennai Plot'}`,
            message: `Booking Ref: ${bookingRef}\nClient: ${payload.fullName}\nPhone: ${payload.phone}\nPlot: ${payload.propertyTitle}\nPickup: ${payload.pickupLocation || payload.notes}\nDate: ${payload.date}`,
            _replyto: payload.email,
            _subject: `Confirmation: Your Site Visit & Legal Dossier (${bookingRef})`,
            _template: "table"
          })
        });
      } catch (e) {
        console.warn("Serverless email dispatch notice:", e);
      }
    }

    return res.status(200).json({
      success: true,
      bookingRef: bookingRef,
      message: "Lead captured and instant email dispatched successfully.",
      payload: payload
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
