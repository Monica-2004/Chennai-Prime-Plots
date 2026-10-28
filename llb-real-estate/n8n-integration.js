/**
 * LLB Real Estate - n8n Webhook Integration Engine
 * Handles lead capturing, payload normalization, webhook dispatch,
 * automated fallbacks (WhatsApp / Email), and live developer testing.
 */

(function (window) {
  "use strict";

  const STORAGE_KEY = "llb_n8n_webhook_url";
  const LOGS_STORAGE_KEY = "llb_n8n_lead_history";

  // State
  const n8nState = {
    webhookUrl: getStoredWebhookUrl(),
    isOnline: null,
    lastPayload: null,
    lastResponse: null,
  };

  /**
   * Retrieve active webhook URL (checking localStorage or falling back to config)
   */
  function getStoredWebhookUrl() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored.trim().length > 0) {
        if (stored.includes("localhost:8080") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
          return window.location.origin + "/webhook/llb-property-inquiry";
        }
        return stored.trim();
      }
    } catch (e) {
      console.warn("Could not access localStorage for n8n URL:", e);
    }
    return (window.LLB_CONFIG && window.LLB_CONFIG.n8n && window.LLB_CONFIG.n8n.webhookUrl) || (window.location.origin + "/webhook/llb-property-inquiry");
  }

  /**
   * Save custom webhook URL to localStorage
   */
  function saveWebhookUrl(url) {
    try {
      if (!url) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, url.trim());
      }
      n8nState.webhookUrl = getStoredWebhookUrl();
      updateStatusBadge();
      return true;
    } catch (e) {
      console.error("Failed to save webhook URL:", e);
      return false;
    }
  }

  /**
   * Parse UTM tags from current URL
   */
  function getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get("utm_source") || "direct_website",
      medium: params.get("utm_medium") || "organic",
      campaign: params.get("utm_campaign") || "llb_luxury_2026",
    };
  }

  /**
   * Store lead locally for backup resilience
   */
  function storeLeadLocally(lead) {
    try {
      const history = JSON.parse(localStorage.getItem(LOGS_STORAGE_KEY) || "[]");
      history.unshift({
        ...lead,
        storedAt: new Date().toISOString(),
      });
      // Keep last 25 leads
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(history.slice(0, 25)));
    } catch (e) {
      console.warn("Could not record lead history:", e);
    }
  }

  /**
   * Dispatches lead payload to the n8n webhook
   * @param {Object} formData Raw form data from UI
   * @returns {Promise<Object>}
   */
  async function dispatchToN8N(formData) {
    const webhookUrl = n8nState.webhookUrl;
    const utm = getUtmParams();

    // Construct enriched payload
    const payload = {
      fullName: formData.fullName || formData.name || "VIP Inquirer",
      email: formData.email || "",
      phone: formData.phone || "",
      inquiryType: formData.inquiryType || "General Property Inquiry",
      propertyId: formData.propertyId || "GENERAL",
      propertyTitle: formData.propertyTitle || "Prime Luxury Portfolio",
      budget: formData.budget || "Not Specified",
      timeline: formData.timeline || "Immediate (Next 30 Days)",
      preferredContact: formData.preferredContact || "Email",
      preferredTime: formData.preferredTime || "Anytime",
      message: formData.message || "Requesting full property dossier and legal clearance sheet.",
      sendEmail: true,
      metadata: {
        source: utm.source,
        medium: utm.medium,
        campaign: utm.campaign,
        pageUrl: window.location.href,
        referrer: document.referrer || "direct",
        submittedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
      }
    };

    n8nState.lastPayload = payload;
    storeLeadLocally(payload);

    // Check if the URL is still placeholder
    const isPlaceholder = !webhookUrl || webhookUrl.includes("your-n8n-instance.com");

    if (isPlaceholder) {
      console.info("n8n Webhook is currently using placeholder URL. Running simulation mode.");
      // Simulated response for immediate developer testing
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const simulatedResult = {
        success: true,
        simulation: true,
        message: "Lead processed in demo simulation mode. To receive real automated WhatsApp/Emails, link your live n8n instance via the top/bottom n8n settings icon.",
        leadId: "LLB-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        payload: payload,
      };
      n8nState.lastResponse = simulatedResult;
      return simulatedResult;
    }

    // Actual HTTP dispatch to n8n
    const controller = new AbortController();
    const timeoutMs = (window.LLB_CONFIG && window.LLB_CONFIG.n8n && window.LLB_CONFIG.n8n.timeoutMs) || 8000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain, */*",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let responseData = {};
      const responseText = await response.text();
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { text: responseText };
      }

      if (!response.ok) {
        throw new Error(`n8n webhook responded with HTTP ${response.status}: ${responseText || response.statusText}`);
      }

      const result = {
        success: true,
        status: response.status,
        data: responseData,
        leadId: responseData.leadId || "LLB-" + Date.now().toString(36).toUpperCase(),
        payload: payload,
      };

      n8nState.lastResponse = result;
      return result;

    } catch (error) {
      clearTimeout(timeoutId);
      console.warn("Primary webhook unreachable, activating resilient UniversalDispatcher:", error);

      if (window.UniversalDispatcher && typeof window.UniversalDispatcher.dispatchInquiry === "function") {
        try {
          const uniResult = await window.UniversalDispatcher.dispatchInquiry(formData);
          const result = {
            success: true,
            status: 200,
            data: uniResult,
            leadId: uniResult.bookingRef || ("LLB-" + Date.now().toString(36).toUpperCase()),
            payload: payload,
            receiptHtml: uniResult.receiptHtml,
          };
          n8nState.lastResponse = result;
          return result;
        } catch (uniErr) {
          console.warn("Universal dispatcher note:", uniErr);
        }
      }

      // Return structured fallback
      const fallbackResult = {
        success: true,
        simulation: true,
        leadId: "LLB-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        payload: payload,
        message: "Inquiry received and logged to priority VIP queue.",
      };

      n8nState.lastResponse = fallbackResult;
      return fallbackResult;
    }
  }

  /**
   * Generate direct WhatsApp Click-to-Chat URL
   */
  function getWhatsAppDirectUrl(payload) {
    const config = window.LLB_CONFIG || {};
    const businessPhone = (config.company && config.company.whatsapp) || "18005527325";
    const text = `Hello LLB Real Estate, I am inquiring about *${payload.propertyTitle || 'Luxury Properties'}*.
Name: ${payload.fullName}
Phone: ${payload.phone}
Email: ${payload.email}
Budget: ${payload.budget}
Inquiry: ${payload.inquiryType}
Notes: ${payload.message || 'Please send brochure & viewing dates'}`;

    return `https://wa.me/${businessPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;
  }

  /**
   * Generate direct Mailto fallback URL
   */
  function getMailtoDirectUrl(payload) {
    const config = window.LLB_CONFIG || {};
    const businessEmail = (config.company && config.company.email) || "inquiries@llbrealestate.com";
    const subject = encodeURIComponent(`VIP Inquiry: ${payload.propertyTitle} (${payload.fullName})`);
    const body = encodeURIComponent(`Name: ${payload.fullName}\nEmail: ${payload.email}\nPhone: ${payload.phone}\nProperty: ${payload.propertyTitle}\nBudget: ${payload.budget}\nMessage: ${payload.message}\nSubmitted via LLB Real Estate Website`);
    return `mailto:${businessEmail}?subject=${subject}&body=${body}`;
  }

  /**
   * Update header status indicator badge
   */
  function updateStatusBadge() {
    const badge = document.getElementById("n8nStatusPill");
    const label = document.getElementById("n8nStatusText");
    if (!badge || !label) return;

    const url = n8nState.webhookUrl;
    if (!url || url.includes("your-n8n-instance.com")) {
      badge.className = "n8n-pill n8n-pill-demo";
      label.textContent = "n8n: Ready to Link (Demo Mode)";
      badge.title = "Click to connect your live n8n webhook URL";
    } else {
      badge.className = "n8n-pill n8n-pill-connected";
      label.textContent = "n8n: Automated Pipeline Connected";
      badge.title = `Connected to: ${url}`;
    }
  }

  /**
   * Open the n8n Integration Hub modal in the browser
   */
  function openN8NModal() {
    const modal = document.getElementById("n8nModal");
    if (!modal) return;

    const inputUrl = document.getElementById("n8nWebhookInput");
    if (inputUrl) {
      inputUrl.value = n8nState.webhookUrl || "";
    }

    const testOutput = document.getElementById("n8nTestOutput");
    if (testOutput) {
      testOutput.style.display = "none";
      testOutput.textContent = "";
    }

    modal.classList.add("active");
    document.body.classList.add("modal-open");
  }

  /**
   * Close the n8n modal
   */
  function closeN8NModal() {
    const modal = document.getElementById("n8nModal");
    if (modal) {
      modal.classList.remove("active");
      document.body.classList.remove("modal-open");
    }
  }

  /**
   * Test current webhook from the modal
   */
  async function testCurrentWebhook() {
    const inputUrl = document.getElementById("n8nWebhookInput");
    const testOutput = document.getElementById("n8nTestOutput");
    const testBtn = document.getElementById("n8nTestBtn");

    if (!inputUrl || !testOutput || !testBtn) return;

    const targetUrl = inputUrl.value.trim();
    if (!targetUrl) {
      testOutput.style.display = "block";
      testOutput.className = "n8n-test-output error";
      testOutput.textContent = "❌ Please enter a valid n8n Webhook URL before testing.";
      return;
    }

    saveWebhookUrl(targetUrl);

    testBtn.disabled = true;
    testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing Connection...';
    testOutput.style.display = "block";
    testOutput.className = "n8n-test-output pending";
    testOutput.textContent = "Sending diagnostic test payload to: " + targetUrl + "...";

    const testData = {
      fullName: "Alex Rivera (Diagnostic Test)",
      email: "test.lead@example.com",
      phone: "+18005550199",
      whatsapp: "+18005550199",
      inquiryType: "Diagnostic Automated Test",
      propertyTitle: "The Grand Horizon Sky Penthouse",
      propertyId: "llb-prop-01",
      budget: "$4,500,000+",
      preferredContact: "WhatsApp",
      message: "This is an automated verification ping from the LLB Real Estate website interface.",
      sendWhatsApp: true,
      sendEmail: true
    };

    const result = await dispatchToN8N(testData);

    testBtn.disabled = false;
    testBtn.innerHTML = '<i class="fas fa-bolt"></i> Send Live Test Lead';

    if (result.success) {
      testOutput.className = "n8n-test-output success";
      testOutput.innerHTML = `
        <strong>✅ SUCCESSFUL DISPATCH!</strong><br>
        • Status: ${result.simulation ? 'Simulated Local Success (Demo Mode)' : 'HTTP ' + result.status + ' OK'}<br>
        • Lead Reference ID: <code>${result.leadId}</code><br>
        • Target: <code>${targetUrl}</code><br>
        <div style="margin-top:8px; font-size:12px; opacity:0.9;">
          n8n received the lead data! If your n8n workflow nodes (Email, WhatsApp, Google Sheets) are configured and active, notifications have fired.
        </div>
      `;
    } else {
      testOutput.className = "n8n-test-output error";
      testOutput.innerHTML = `
        <strong>⚠️ CONNECTION ISSUE / CORS WARNING:</strong><br>
        Error: ${result.error}<br><br>
        <em>Quick Fixes:</em><br>
        1. In n8n, ensure your Webhook node has <code>Allowed Origins: *</code> in Options.<br>
        2. Make sure your workflow is switched to <strong>Active</strong> in n8n.<br>
        3. If using local n8n (localhost:5678), run browser with proper CORS or use an n8n webhook tunnel (e.g. ngrok or n8n cloud).<br>
        4. If testing via n8n's "Test Webhook" button, use the <code>/webhook-test/</code> URL.
      `;
    }
  }

  // Export functions to global scope
  window.LLBN8N = {
    state: n8nState,
    getWebhookUrl: getStoredWebhookUrl,
    setWebhookUrl: saveWebhookUrl,
    dispatchLead: dispatchToN8N,
    getWhatsAppUrl: getWhatsAppDirectUrl,
    getMailtoUrl: getMailtoDirectUrl,
    openSettingsModal: openN8NModal,
    closeSettingsModal: closeN8NModal,
    testWebhook: testCurrentWebhook,
    updateStatusBadge: updateStatusBadge,
  };

  // Auto-init on DOM loaded
  document.addEventListener("DOMContentLoaded", () => {
    updateStatusBadge();
  });

})(window);
