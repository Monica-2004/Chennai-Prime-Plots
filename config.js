/**
 * LLB Real Estate - Global Configuration
 * Contains company details, contact information, and n8n webhook settings.
 */

const LLB_CONFIG = {
  // Business Branding
  company: {
    name: "LLB Real Estate",
    tagline: "Prime Properties. Legally Verified. Unrivaled Luxury.",
    shortName: "LLB Realty",
    licenseNumber: "RERA / RE-LIC-849204",
    phone: "+1 (800) 552-7325",
    phoneRaw: "18005527325",
    email: "inquiries@llbrealestate.com",
    supportEmail: "support@llbrealestate.com",
    address: "One Grand Plaza, Suite 4800, Financial District, New York, NY 10005",
    workingHours: "Mon - Sat: 9:00 AM - 8:00 PM EST (24/7 VIP Concierge)",
  },

  // n8n Webhook Configuration
  n8n: {
    // Default active webhook endpoint (adapts automatically to current host, or point to n8n Cloud)
    webhookUrl: (typeof window !== "undefined" && window.location && window.location.origin && window.location.origin.startsWith("http")) 
      ? (window.location.origin + "/webhook/llb-property-inquiry") 
      : "http://localhost:8080/webhook/llb-property-inquiry",
    testWebhookUrl: (typeof window !== "undefined" && window.location && window.location.origin && window.location.origin.startsWith("http")) 
      ? (window.location.origin + "/webhook/llb-property-inquiry") 
      : "http://localhost:8080/webhook/llb-property-inquiry",
    
    // Enable/disable localStorage override (allows changing webhook in browser settings)
    allowStorageOverride: true,
    
    // Fallback actions if webhook fails or user hasn't set one up yet
    enableEmailFallback: true,    // Auto-open mail client with prefilled details
    timeoutMs: 8000,              // Request timeout in milliseconds
  },

  // Social Links
  social: {
    instagram: "https://instagram.com/llbrealestate",
    linkedin: "https://linkedin.com/company/llbrealestate",
    facebook: "https://facebook.com/llbrealestate",
    youtube: "https://youtube.com/@llbrealestate",
  },

  // Currency & Formatting
  currency: {
    symbol: "$",
    code: "USD",
  }
};

// Export to window for global access in browsers
if (typeof window !== "undefined") {
  window.LLB_CONFIG = LLB_CONFIG;
}
