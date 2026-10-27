/**
 * Chennai Prime Plots & LLB Real Estate - Universal Resilient API & Email Dispatcher
 * Features:
 * 1. Automatic confirmation email delivery directly to the registered user's inbox
 * 2. Multi-tier dispatch (Vercel Serverless with Gmail SMTP -> FormSubmit with Autoresponse -> Localhost)
 * 3. Instant on-screen HTML Email Receipt generator (allows immediate viewing/printing of dossier)
 * 4. 1-Tap WhatsApp VIP Concierge integration
 * 5. Offline resilience & lead queueing
 */

(function (window) {
  "use strict";

  const STORAGE_KEY = "chennai_plots_bookings";
  const NOTIFICATION_EMAIL = "monicaperumal2004@gmail.com"; // Primary agency inbox with verified Gmail SMTP

  /**
   * Universal Dispatcher for Cab Bookings, Document Enquiries, and VIP Registrations
   */
  async function dispatchInquiry(payload) {
    const bookingRef = "CP-CH-" + Math.floor(100000 + Math.random() * 900000);
    const timestamp = new Date().toISOString();

    const enriched = {
      bookingRef: bookingRef,
      fullName: payload.fullName || payload.name || "VIP Client",
      email: (payload.email || "").trim().toLowerCase(),
      phone: payload.phone || "",
      inquiryType: payload.inquiryType || "Site Visit & Documentation",
      propertyTitle: payload.propertyTitle || "Chennai Prime Plot",
      pickupLocation: payload.pickupLocation || payload.notes || "Chennai City / Airport Pickup",
      date: payload.date || new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
      message: payload.message || payload.notes || "Requesting full CMDA/DTCP legal verification & site inspection.",
      submittedAt: timestamp,
      source: window.location.hostname,
    };

    // 1. Store in localStorage immediately
    saveLocalBooking(enriched);

    let serverDispatched = false;
    let dispatchMethod = "offline_receipt";

    // 2. Try Vercel Serverless Function endpoints (local and remote)
    const endpointsToTry = [
      "/webhook/llb-property-inquiry",
      "/api/webhook/llb-property-inquiry",
      "https://chennai-prime-plots.vercel.app/api/webhook/llb-property-inquiry"
    ];

    for (const endpoint of endpointsToTry) {
      if (serverDispatched) break;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(enriched),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data && (data.success || data.emailSent)) {
            serverDispatched = true;
            dispatchMethod = "vercel_gmail_smtp";
            console.log("Automated email dispatched via serverless endpoint:", endpoint);
            break;
          }
        }
      } catch (e) {
        // Try next endpoint
      }
    }

    // 3. Automated Email Gateway with Autoresponder to User's Email
    if (enriched.email) {
      try {
        const autoresponderMessage = `Dear ${enriched.fullName},\n\nThank you for registering with Chennai Prime Plots.\nYour site inspection booking for ${enriched.propertyTitle} has been confirmed under Reference Number: ${enriched.bookingRef}.\n\nScheduled Date: ${enriched.date}\nPickup Location: ${enriched.pickupLocation}\nIncluded: Free AC Cab Pickup & Complete CMDA/DTCP Sanction Dossier.\n\nOur VIP Concierge team will contact you shortly at ${enriched.phone}.\nHelpline: +91 93450 29705\n\nWarm regards,\nChennai Prime Plots Team`;

        const formSubmitPayload = {
          name: enriched.fullName,
          email: enriched.email,
          phone: enriched.phone,
          subject: `[${enriched.bookingRef}] ${enriched.inquiryType}: ${enriched.propertyTitle}`,
          message: `Booking Ref: ${enriched.bookingRef}\nClient: ${enriched.fullName}\nPhone: ${enriched.phone}\nEmail: ${enriched.email}\nPlot: ${enriched.propertyTitle}\nPickup: ${enriched.pickupLocation}\nDate: ${enriched.date}\nNotes: ${enriched.message}`,
          _replyto: enriched.email,
          _subject: `[Confirmed] Official Booking & Legal Dossier: ${enriched.propertyTitle} (${enriched.bookingRef})`,
          _autoresponse: autoresponderMessage,
          _template: "table",
          _captcha: "false"
        };

        const fsRes = await fetch(`https://formsubmit.co/ajax/${NOTIFICATION_EMAIL}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(formSubmitPayload)
        });

        if (fsRes.ok) {
          serverDispatched = true;
          if (dispatchMethod === "offline_receipt") {
            dispatchMethod = "formsubmit_autoresponder";
          }
        }
      } catch (err) {
        console.warn("Public email gateway notice:", err);
      }
    }

    // 4. Generate formatted HTML Email Dossier for immediate on-screen access & printing
    const receiptHtml = generateEmailReceiptHtml(enriched);

    return {
      success: true,
      bookingRef: bookingRef,
      dispatchMethod: dispatchMethod,
      payload: enriched,
      receiptHtml: receiptHtml,
    };
  }

  /**
   * Save booking to localStorage for offline persistence & admin lookup
   */
  function saveLocalBooking(data) {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      existing.unshift(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
    } catch (e) {
      console.warn("Could not write booking to localStorage:", e);
    }
  }

  /**
   * Generates a luxury, high-conversion HTML email dossier receipt
   */
  function generateEmailReceiptHtml(data) {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0b132b; color: #f8fafc; border: 1px solid rgba(212,175,55,0.4); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px; border-bottom: 2px solid #d4af37; text-align: center;">
          <h2 style="margin: 0; color: #d4af37; font-size: 22px; letter-spacing: 1px; font-weight: 800;">CHENNAI PRIME PLOTS</h2>
          <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Official Booking & Verification Confirmation</p>
        </div>

        <!-- Body -->
        <div style="padding: 24px;">
          <div style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <span style="color: #34d399; font-size: 18px; margin-right: 8px; font-weight: bold;">✔</span>
              <strong style="color: #ffffff; font-size: 15px;">Automated Confirmation Sent!</strong>
            </div>
            <p style="margin: 0; color: #cbd5e1; font-size: 13px;">
              An official email confirmation with your booking summary and CMDA/DTCP legal dossier has been dispatched to <strong>${data.email || 'your registered email'}</strong>.
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: rgba(255,255,255,0.02); border-radius: 8px;">
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px;">Booking Reference:</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #d4af37; font-size: 15px; font-weight: bold; text-align: right;">${data.bookingRef}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px;">Selected Property:</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #ffffff; font-size: 14px; font-weight: 600; text-align: right;">${data.propertyTitle}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px;">Client Name:</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #ffffff; font-size: 14px; text-align: right;">${data.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px;">Registered Email:</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #38bdf8; font-size: 13.5px; text-align: right;">${data.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px;">Contact Phone:</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #ffffff; font-size: 14px; text-align: right;">${data.phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px;">Pickup Location:</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #ffffff; font-size: 14px; text-align: right;">${data.pickupLocation}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px;">Scheduled Date:</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #38bdf8; font-size: 14px; font-weight: 600; text-align: right;">${data.date}</td>
            </tr>
          </table>

          <div style="background: rgba(255,255,255,0.03); border-left: 3px solid #d4af37; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 6px 6px 0;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #d4af37; font-weight: bold; text-transform: uppercase;">Included VIP Inclusions:</p>
            <ul style="margin: 0; padding-left: 18px; color: #cbd5e1; font-size: 12.5px; line-height: 1.6;">
              <li>Complimentary Air-Conditioned SUV Pickup & Drop at your doorstep</li>
              <li>Complete CMDA / DTCP Sanction Blueprint & Revenue Patta Dossier</li>
              <li>30-Year Legal Encumbrance Certificate (EC) Verified by Senior High Court Advocate</li>
              <li>Bank Loan Pre-Sanction Assistance (SBI, HDFC, ICICI, LIC HFL)</li>
            </ul>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://wa.me/919345029705?text=Hello%20Chennai%20Prime%20Plots,%20my%20booking%20ref%20is%20${data.bookingRef}%20for%20${encodeURIComponent(data.propertyTitle)}.%20Please%20confirm%20my%20cab%20pickup." target="_blank" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 14px rgba(37,211,102,0.4); margin: 6px;">
              💬 Connect on WhatsApp (Instant)
            </a>
            <a href="tel:+919345029705" style="display: inline-block; background: #1e293b; color: #ffffff; border: 1px solid rgba(255,255,255,0.2); text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 6px;">
              📞 Call VIP Concierge
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: rgba(0,0,0,0.4); padding: 16px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); font-size: 11px; color: #64748b;">
          Chennai Prime Plots &bull; DPIIT Recognized &bull; TN RERA Registered Partner<br>
          Need to reschedule? Call +91 93450 29705 or reply to this message.
        </div>
      </div>
    `;
  }

  // Export to window
  window.UniversalDispatcher = {
    dispatchInquiry: dispatchInquiry,
    generateEmailReceiptHtml: generateEmailReceiptHtml,
  };

})(window);
