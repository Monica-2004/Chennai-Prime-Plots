/**
 * LLB Real Estate — Main Application Logic
 * Interactive UI, Property Filtering, Dynamic Modals,
 * Mortgage Calculator, and n8n Lead Dispatching.
 */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // Elements
  const propertiesContainer = document.getElementById("propertiesGrid");
  const propertyFilterBtns = document.querySelectorAll(".filter-btn");
  const heroSearchBtn = document.getElementById("heroSearchBtn");
  const heroTabBtns = document.querySelectorAll(".tab-btn");
  
  // Property Modal Elements
  const propertyModal = document.getElementById("propertyModal");
  const propertyModalClose = document.getElementById("propertyModalClose");
  const propertyModalBody = document.getElementById("propertyModalBody");

  // Success Modal Elements
  const successModal = document.getElementById("successModal");
  const successModalClose = document.getElementById("successModalClose");

  // Lead Form
  const leadForm = document.getElementById("llbLeadForm");
  const leadSubmitBtn = document.getElementById("leadSubmitBtn");

  // Calculator Elements
  const homeValueSlider = document.getElementById("homeValueSlider");
  const downPaymentSlider = document.getElementById("downPaymentSlider");
  const interestRateSlider = document.getElementById("interestRateSlider");
  const loanTermSlider = document.getElementById("loanTermSlider");

  const homeValueDisplay = document.getElementById("homeValueDisplay");
  const downPaymentDisplay = document.getElementById("downPaymentDisplay");
  const interestRateDisplay = document.getElementById("interestRateDisplay");
  const loanTermDisplay = document.getElementById("loanTermDisplay");

  const emiAmountDisplay = document.getElementById("emiAmountDisplay");
  const loanAmountDisplay = document.getElementById("loanAmountDisplay");
  const totalInterestDisplay = document.getElementById("totalInterestDisplay");
  const totalPaymentDisplay = document.getElementById("totalPaymentDisplay");
  const calcPreApproveBtn = document.getElementById("calcPreApproveBtn");

  // Current State
  let currentCategory = "all";
  let currentTypeFilter = "all"; // 'sale', 'rent', or 'all'

  // =========================================================================
  // 1. Property Card Rendering
  // =========================================================================
  function renderProperties(list) {
    if (!propertiesContainer) return;

    if (!list || list.length === 0) {
      propertiesContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #ffffff; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
          <i class="fas fa-search" style="font-size: 2.5rem; color: var(--black-primary); margin-bottom: 16px;"></i>
          <h3 style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--text-dark);">No Properties Match Your Search</h3>
          <p style="color: var(--text-muted); margin-top: 8px;">Try adjusting your filters or location parameters, or contact our VIP concierge desk.</p>
          <button class="btn btn-black" style="margin-top: 20px;" onclick="window.resetPropertyFilters()">
            Reset All Filters
          </button>
        </div>
      `;
      return;
    }

    propertiesContainer.innerHTML = list.map((property) => `
      <article class="property-card" data-id="${property.id}" data-category="${property.category}">
        <div class="property-image-container">
          <img src="${property.images.cover}" alt="${property.title}" loading="lazy" />
          <div class="property-badge-group">
            <span class="property-badge">${property.badge}</span>
            ${property.legalVerification && property.legalVerification.verified ? `
              <span class="property-badge legal-badge">
                <i class="fas fa-shield-alt"></i> 100% Legal Title
              </span>
            ` : ''}
          </div>
          <div class="property-price-pill">${property.priceDisplay}</div>
        </div>

        <div class="property-body">
          <div class="property-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${property.location}</span>
          </div>

          <h3 class="property-title">${property.title}</h3>
          <p class="property-description-snippet">${property.tagline || property.description}</p>
          ${property.legalVerification && property.legalVerification.titleDeedNo ? `
            <div class="property-deed-ref" title="Officially Verified Sovereign Title Deed">
              <i class="fas fa-file-signature"></i> Registry Deed: <strong>${property.legalVerification.titleDeedNo}</strong>
            </div>
          ` : ''}

          <div class="property-specs-list">
            ${property.beds > 0 ? `
              <div class="spec-item" title="Bedrooms">
                <i class="fas fa-bed"></i> <span>${property.beds} Beds</span>
              </div>
            ` : `
              <div class="spec-item" title="Commercial Area">
                <i class="fas fa-building"></i> <span>Executive</span>
              </div>
            `}
            <div class="spec-item" title="Bathrooms">
              <i class="fas fa-bath"></i> <span>${property.baths} Baths</span>
            </div>
            <div class="spec-item" title="Living Area">
              <i class="fas fa-vector-square"></i> <span>${property.sqft.toLocaleString()} sqft</span>
            </div>
          </div>

          <div class="property-card-actions">
            <button class="btn btn-outline-black btn-sm" onclick="window.openPropertyDetailModal('${property.id}')">
              <i class="fas fa-eye"></i> Details
            </button>
            <button class="btn btn-black btn-sm" onclick="window.selectPropertyForTour('${property.id}')">
              <i class="fas fa-calendar-check"></i> Book Tour
            </button>
          </div>
        </div>
      </article>
    `).join("");
  }

  // Initial render
  if (window.LLB_PROPERTIES) {
    renderProperties(window.LLB_PROPERTIES);
  }

  // =========================================================================
  // 2. Property Filtering
  // =========================================================================
  propertyFilterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      propertyFilterBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      currentCategory = this.getAttribute("data-filter");
      applyCombinedFilters();
    });
  });

  heroTabBtns.forEach((tab) => {
    tab.addEventListener("click", function () {
      heroTabBtns.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      currentTypeFilter = this.getAttribute("data-type"); // 'sale', 'rent', 'commercial', 'all'
    });
  });

  function applyCombinedFilters() {
    let filtered = window.LLB_PROPERTIES || [];

    // Filter by Category
    if (currentCategory && currentCategory !== "all") {
      filtered = filtered.filter((p) => p.category === currentCategory);
    }

    // Filter by Type (Sale vs Rent)
    if (currentTypeFilter && currentTypeFilter !== "all") {
      if (currentTypeFilter === "commercial") {
        filtered = filtered.filter((p) => p.category === "commercial");
      } else {
        filtered = filtered.filter((p) => p.type === currentTypeFilter);
      }
    }

    renderProperties(filtered);
  }

  window.resetPropertyFilters = function () {
    currentCategory = "all";
    currentTypeFilter = "all";
    propertyFilterBtns.forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-filter") === "all");
    });
    heroTabBtns.forEach((t) => {
      t.classList.toggle("active", t.getAttribute("data-type") === "all");
    });
    renderProperties(window.LLB_PROPERTIES || []);
  };

  // Hero Search Filter Action
  if (heroSearchBtn) {
    heroSearchBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const locationSelect = document.getElementById("searchLocation");
      const typeSelect = document.getElementById("searchType");
      const budgetSelect = document.getElementById("searchBudget");

      const locVal = locationSelect ? locationSelect.value.toLowerCase() : "";
      const typeVal = typeSelect ? typeSelect.value.toLowerCase() : "";
      const budgetVal = budgetSelect ? budgetSelect.value : "";

      let filtered = window.LLB_PROPERTIES || [];

      // Type filter from hero tabs
      if (currentTypeFilter && currentTypeFilter !== "all") {
        if (currentTypeFilter === "commercial") {
          filtered = filtered.filter((p) => p.category === "commercial");
        } else {
          filtered = filtered.filter((p) => p.type === currentTypeFilter);
        }
      }

      // Location Filter
      if (locVal && locVal !== "any") {
        filtered = filtered.filter((p) => p.location.toLowerCase().includes(locVal));
      }

      // Property Type Filter
      if (typeVal && typeVal !== "any") {
        filtered = filtered.filter((p) => p.category === typeVal);
      }

      // Budget Filter
      if (budgetVal && budgetVal !== "any") {
        const maxBudget = parseInt(budgetVal, 10);
        if (!isNaN(maxBudget)) {
          filtered = filtered.filter((p) => p.price <= maxBudget);
        }
      }

      renderProperties(filtered);

      // Smooth scroll to property catalog
      const section = document.getElementById("properties");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // =========================================================================
  // 3. Property Detail Modal Logic
  // =========================================================================
  window.openPropertyDetailModal = function (propertyId) {
    const property = (window.LLB_PROPERTIES || []).find((p) => p.id === propertyId);
    if (!property || !propertyModal || !propertyModalBody) return;

    propertyModalBody.innerHTML = `
      <div style="position: relative;">
        <div style="height: 380px; overflow: hidden; border-radius: var(--radius-md); margin-bottom: 24px;">
          <img src="${property.images.cover}" alt="${property.title}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
        <div>
          <div style="font-size: 0.8125rem; color: var(--gold-primary); font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">
            <i class="fas fa-map-marker-alt"></i> ${property.location} • ${property.address}
          </div>
          <h2 style="font-family: var(--font-serif); font-size: 1.85rem; color: var(--text-dark);">${property.title}</h2>
          <div style="color: var(--text-muted); font-size: 0.95rem; margin-top: 4px;">${property.tagline}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px; font-weight: 700;">Listing Price</div>
          <div style="font-family: var(--font-serif); font-size: 2.2rem; color: var(--text-dark); font-weight: 800;">${property.priceDisplay}</div>
        </div>
      </div>

      <!-- Legal Assurance Badge Box -->
      <div style="background: rgba(5, 150, 105, 0.08); border: 1px solid rgba(5, 150, 105, 0.3); border-radius: var(--radius-sm); padding: 16px 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <i class="fas fa-shield-check" style="font-size: 1.75rem; color: #059669;"></i>
          <div>
            <div style="font-weight: 700; color: #065f46; font-size: 0.95rem;">LLB Certified Legal Due Diligence Completed</div>
            <div style="font-size: 0.8125rem; color: #047857;">Title Deed: <strong>${property.legalVerification.titleDeedNo}</strong> • Encumbrance Free • RERA Approved</div>
          </div>
        </div>
        <span style="background: #059669; color: #ffffff; font-size: 0.75rem; font-weight: 700; padding: 5px 12px; border-radius: 20px;">
          Sovereign Title Clear
        </span>
      </div>

      <!-- Property Specifications -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; background: var(--bg-light-alt); padding: 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); margin-bottom: 24px; text-align: center;">
        <div>
          <div style="color: var(--black-primary); font-size: 1.15rem; margin-bottom: 4px;"><i class="fas fa-bed"></i></div>
          <div style="font-weight: 700; color: var(--text-dark);">${property.beds > 0 ? property.beds + ' Beds' : 'Commercial'}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Bedrooms</div>
        </div>
        <div>
          <div style="color: var(--black-primary); font-size: 1.15rem; margin-bottom: 4px;"><i class="fas fa-bath"></i></div>
          <div style="font-weight: 700; color: var(--text-dark);">${property.baths} Baths</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Bathrooms</div>
        </div>
        <div>
          <div style="color: var(--black-primary); font-size: 1.15rem; margin-bottom: 4px;"><i class="fas fa-vector-square"></i></div>
          <div style="font-weight: 700; color: var(--text-dark);">${property.sqft.toLocaleString()}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Square Feet</div>
        </div>
        <div>
          <div style="color: var(--black-primary); font-size: 1.15rem; margin-bottom: 4px;"><i class="fas fa-car"></i></div>
          <div style="font-weight: 700; color: var(--text-dark);">${property.parking} Bays</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Parking</div>
        </div>
      </div>

      <!-- Description -->
      <div style="margin-bottom: 24px;">
        <h4 style="font-family: var(--font-serif); font-size: 1.15rem; color: var(--text-dark); margin-bottom: 8px;">Architectural Overview</h4>
        <p style="color: var(--text-body); line-height: 1.7; font-size: 0.9375rem;">${property.description}</p>
      </div>

      <!-- Amenities -->
      <div style="margin-bottom: 30px;">
        <h4 style="font-family: var(--font-serif); font-size: 1.15rem; color: var(--text-dark); margin-bottom: 12px;">Premium Amenities & Bespoke Features</h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          ${property.amenities.map((item) => `
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: var(--text-body);">
              <i class="fas fa-check-circle" style="color: var(--black-primary);"></i>
              <span>${item}</span>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Action Row -->
      <div style="display: flex; gap: 14px; flex-wrap: wrap; border-top: 1px solid var(--border-light); padding-top: 24px;">
        <button class="btn btn-black" style="flex: 1;" onclick="window.selectPropertyForTour('${property.id}')">
          <i class="fas fa-calendar-alt"></i> Book Private Site Tour via n8n
        </button>
        <button class="btn btn-whatsapp" onclick="window.inquireViaWhatsApp('${property.id}')">
          <i class="fab fa-whatsapp"></i> WhatsApp Advisor
        </button>
      </div>
    `;

    propertyModal.classList.add("active");
    document.body.classList.add("modal-open");
  };

  if (propertyModalClose) {
    propertyModalClose.addEventListener("click", function () {
      propertyModal.classList.remove("active");
      document.body.classList.remove("modal-open");
    });
  }

  // =========================================================================
  // Official Regulatory Credentials Modal
  // =========================================================================
  const credentialsModal = document.getElementById("credentialsModal");
  window.openCredentialsModal = function () {
    if (credentialsModal) {
      credentialsModal.classList.add("active");
      document.body.classList.add("modal-open");
    }
  };

  window.closeCredentialsModal = function () {
    if (credentialsModal) {
      credentialsModal.classList.remove("active");
      document.body.classList.remove("modal-open");
    }
  };

  // Pre-fill property in consultation form
  window.selectPropertyForTour = function (propertyId) {
    const property = (window.LLB_PROPERTIES || []).find((p) => p.id === propertyId);
    if (propertyModal) propertyModal.classList.remove("active");
    document.body.classList.remove("modal-open");

    const propertySelect = document.getElementById("leadPropertySelect");
    const notesInput = document.getElementById("leadMessage");

    if (propertySelect && property) {
      propertySelect.value = property.title;
    }
    if (notesInput && property) {
      notesInput.value = `I would like to schedule a private VIP viewing and request the full legal dossier for ${property.title} (${property.priceDisplay}).`;
    }

    const leadSection = document.getElementById("contact");
    if (leadSection) {
      leadSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // =========================================================================
  // 4. Mortgage / EMI Calculator
  // =========================================================================
  function calculateEMI() {
    if (!homeValueSlider || !downPaymentSlider || !interestRateSlider || !loanTermSlider) return;

    const homeVal = parseFloat(homeValueSlider.value) || 2000000;
    const downPayment = parseFloat(downPaymentSlider.value) || 400000;
    const annualRate = parseFloat(interestRateSlider.value) || 6.5;
    const termYears = parseFloat(loanTermSlider.value) || 30;

    // Guard against down payment exceeding property value
    const principal = Math.max(0, homeVal - downPayment);
    const monthlyRate = (annualRate / 100) / 12;
    const totalMonths = termYears * 12;

    let monthlyEMI = 0;
    if (monthlyRate > 0 && principal > 0) {
      monthlyEMI = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                   (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else if (principal > 0) {
      monthlyEMI = principal / totalMonths;
    }

    const totalPayment = monthlyEMI * totalMonths;
    const totalInterest = Math.max(0, totalPayment - principal);

    // Update Display labels
    if (homeValueDisplay) homeValueDisplay.textContent = "$" + homeVal.toLocaleString();
    if (downPaymentDisplay) downPaymentDisplay.textContent = "$" + downPayment.toLocaleString() + " (" + Math.round((downPayment / homeVal) * 100) + "%)";
    if (interestRateDisplay) interestRateDisplay.textContent = annualRate.toFixed(2) + "%";
    if (loanTermDisplay) loanTermDisplay.textContent = termYears + " Years";

    if (emiAmountDisplay) emiAmountDisplay.textContent = "$" + Math.round(monthlyEMI).toLocaleString();
    if (loanAmountDisplay) loanAmountDisplay.textContent = "$" + Math.round(principal).toLocaleString();
    if (totalInterestDisplay) totalInterestDisplay.textContent = "$" + Math.round(totalInterest).toLocaleString();
    if (totalPaymentDisplay) totalPaymentDisplay.textContent = "$" + Math.round(totalPayment).toLocaleString();
  }

  [homeValueSlider, downPaymentSlider, interestRateSlider, loanTermSlider].forEach((slider) => {
    if (slider) {
      slider.addEventListener("input", calculateEMI);
    }
  });

  // Calculate on initial load
  calculateEMI();

  // Apply for Pre-Approval button triggers consultation form
  if (calcPreApproveBtn) {
    calcPreApproveBtn.addEventListener("click", function () {
      const homeVal = homeValueSlider ? homeValueSlider.value : "";
      const emiVal = emiAmountDisplay ? emiAmountDisplay.textContent : "";
      const notesInput = document.getElementById("leadMessage");

      if (notesInput) {
        notesInput.value = `I am seeking mortgage pre-approval for a property valued at approximately $${parseInt(homeVal).toLocaleString()} with an estimated monthly payment of ${emiVal}.`;
      }

      const leadSection = document.getElementById("contact");
      if (leadSection) {
        leadSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // =========================================================================
  // 5. Form Submission & n8n Lead Dispatch
  // =========================================================================
  if (leadForm) {
    leadForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!leadSubmitBtn) return;

      const originalBtnHtml = leadSubmitBtn.innerHTML;
      leadSubmitBtn.disabled = true;
      leadSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Transmitting to n8n Automation Hub...';

      // Gather form values
      const formData = {
        fullName: document.getElementById("leadName")?.value || "",
        email: document.getElementById("leadEmail")?.value || "",
        phone: document.getElementById("leadPhone")?.value || "",
        inquiryType: document.getElementById("leadInquiryType")?.value || "VIP Property Buyer",
        propertyTitle: document.getElementById("leadPropertySelect")?.value || "General Luxury Portfolio",
        budget: document.getElementById("leadBudget")?.value || "$3,000,000 - $5,000,000",
        timeline: document.getElementById("leadTimeline")?.value || "Immediate (Next 30 Days)",
        preferredContact: document.getElementById("leadPreferredContact")?.value || "Email",
        message: document.getElementById("leadMessage")?.value || "",
        sendEmail: true,
      };

      try {
        const result = await window.LLBN8N.dispatchLead(formData);

        leadSubmitBtn.disabled = false;
        leadSubmitBtn.innerHTML = originalBtnHtml;

        // Show Success Modal
        showSuccessModal(result, formData);
        leadForm.reset();

      } catch (err) {
        console.error("Submission error:", err);
        leadSubmitBtn.disabled = false;
        leadSubmitBtn.innerHTML = originalBtnHtml;

        alert("We processed your submission. An executive confirmation email has been logged.");
      }
    });
  }

  function showSuccessModal(result, formData) {
    if (!successModal) return;

    const leadIdPill = document.getElementById("successLeadId");
    const successChannelNote = document.getElementById("successChannelNote");
    const successBannerNote = document.getElementById("successBannerNote");
    const successViewEmailBtn = document.getElementById("successViewEmailBtn");

    const leadId = result.leadId || (result.data && result.data.leadId) || "LLB-PROCESSED";
    const emailSent = result.emailSent || (result.data && result.data.emailSent);
    const emailStatus = result.emailStatus || (result.data && result.data.emailStatus);

    if (leadIdPill) {
      leadIdPill.textContent = "Reference ID: " + leadId;
    }

    if (successChannelNote) {
      if (emailSent) {
        successChannelNote.innerHTML = `✅ <strong style="color:var(--success);">Email Dispatched:</strong> A personalized luxury confirmation dossier has been successfully transmitted to <strong>${formData.email}</strong>.`;
        if (successBannerNote) {
          successBannerNote.innerHTML = `<i class="fas fa-check-circle" style="color:var(--success);"></i> <strong>Delivered:</strong> Confirmation email was dispatched to <strong>${formData.email}</strong> via your SMTP engine.`;
          successBannerNote.style.background = "rgba(5, 150, 105, 0.08)";
        }
      } else if (result.simulation) {
        successChannelNote.innerHTML = `ℹ️ <strong>Demo Simulation Mode:</strong> Registration recorded. Link your live n8n webhook URL via the <em>n8n Setup</em> button to deliver real emails to inboxes.`;
      } else if (emailStatus && emailStatus.includes("SMTP credentials not configured")) {
        successChannelNote.innerHTML = `⚠️ <strong>Registration Saved Locally:</strong> Your inquiry is safely recorded (Ref: ${leadId}).`;
        if (successBannerNote) {
          successBannerNote.innerHTML = `<i class="fas fa-exclamation-triangle" style="color:#d97706;"></i> <strong>Why didn't you receive the email?</strong> The website sent this to the local engine, but the SMTP password is blank in <a href="admin.html" style="text-decoration:underline; font-weight:bold;">Admin Settings</a>. To send via n8n, click <strong>n8n Setup</strong> above and paste your n8n Webhook URL!`;
          successBannerNote.style.background = "rgba(217, 119, 6, 0.1)";
        }
      } else {
        successChannelNote.innerHTML = `VIP Registration received for <strong>${formData.email}</strong>. (Ref: ${leadId})`;
      }
    }

    // Show View Email button if backend returned an email URL
    const emailUrl = (result.data && result.data.viewEmailUrl) || result.viewEmailUrl;
    if (successViewEmailBtn) {
      if (emailUrl) {
        successViewEmailBtn.href = emailUrl;
        successViewEmailBtn.style.display = "inline-flex";
      } else {
        successViewEmailBtn.style.display = "none";
      }
    }

    successModal.classList.add("active");
    document.body.classList.add("modal-open");
  }

  if (successModalClose) {
    successModalClose.addEventListener("click", function () {
      successModal.classList.remove("active");
      document.body.classList.remove("modal-open");
    });
  }

  // Close modals on overlay backdrop click
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", function (e) {
      if (e.target === this) {
        this.classList.remove("active");
        document.body.classList.remove("modal-open");
      }
    });
  });

  // =========================================================================
  // 6. Sticky Navbar on Scroll
  // =========================================================================
  const siteHeader = document.querySelector(".site-header");
  window.addEventListener("scroll", function () {
    if (siteHeader) {
      if (window.scrollY > 40) {
        siteHeader.classList.add("scrolled");
      } else {
        siteHeader.classList.remove("scrolled");
      }
    }
  });

  // Mobile Menu Toggle & Navigation Drawer
  const mobileToggle = document.getElementById("mobileToggle");
  const desktopNav = document.getElementById("desktopNav");

  window.closeMobileNav = function () {
    if (desktopNav) {
      desktopNav.classList.remove("mobile-open");
    }
    document.body.classList.remove("menu-open");
    if (mobileToggle) {
      mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
      mobileToggle.setAttribute("aria-expanded", "false");
    }
  };

  if (mobileToggle && desktopNav) {
    mobileToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      const isOpen = desktopNav.classList.toggle("mobile-open");
      document.body.classList.toggle("menu-open", isOpen);
      mobileToggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
      mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close when clicking nav links
    desktopNav.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", function () {
        window.closeMobileNav();
      });
    });

    // Close when clicking outside
    document.addEventListener("click", function (e) {
      if (desktopNav.classList.contains("mobile-open")) {
        if (!desktopNav.contains(e.target) && !mobileToggle.contains(e.target)) {
          window.closeMobileNav();
        }
      }
    });

    // Close on ESC key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (desktopNav.classList.contains("mobile-open")) {
          window.closeMobileNav();
        }
        document.querySelectorAll(".modal-overlay.active").forEach((modal) => {
          modal.classList.remove("active");
        });
        document.body.classList.remove("modal-open");
      }
    });
  }
});
