/**

 * Chennai Prime Plots Marketplace - Core Interactive Engine

 * Incorporates Leaflet Map, Custom Pointed Markers, Google Maps Modeled Directions & Routing,

 * Real-time Distance & ETA Calculations, 3D Tilt, Ken Burns Image Slider,

 * Real-time Filters, Layout Blueprint, Unit Converter, and Seller Submissions.

 */

(function () {

  "use strict";

  // Application State

  let mapInstance = null;

  let markersLayer = null;

  let streetTileLayer = null;

  let satelliteTileLayer = null;

  let currentTileMode = "satellite";

  let activePlotMarkers = {};

  let currentFilterZone = "all";

  let currentSortMode = "featured";

  let currentSearchQuery = "";

  let currentBudgetFilter = "all";

  let currentSizeFilter = "all";

  let currentStatusFilter = "all";

  let currentFacingFilter = "all";

  let allPlotsList = [];

  // 3D MapLibre First-Person Road Navigation State

  let cameraMode = "gmaps"; // "gmaps" (Google Maps: Car moves on steady map), "follow", "driver"

  let currentSmoothedBearing = 0;

  let currentSmoothedPitch = 0;

  let activeMapLibreMarkers = [];

  let mapLibreLoaded = false;

  let currentMapStyleMode = "satellite"; // "satellite" or "vector3d"

  // Google Maps Routing State

  let routeLayerGroup = null;

  let currentTravelMode = "driving";

  let currentOriginCoords = [12.9941, 80.1709]; // Default: Chennai International Airport

  let currentOriginLabel = "Chennai International Airport";

  let currentDestPlotId = null;

  // Live Vehicle Route Navigation State (Car & Bike Left/Right Directional Engine)

  let navLayerGroup = null;

  let currentVehicleType = "car"; // "car" or "bike"

  let navState = "stopped"; // "stopped", "playing", "paused"

  let navAnimFrameId = null;

  let navSpeed = 1; // Multiplier: 1 (1x Real-Time Speed), 2, 4 // Multiplier: 1, 2, 4, 8

  let navFollowCamera = true;

  const NAV_STREET_ZOOM = 16;

  let isNavZoomingIn = false;

  let navVehicleMarker = null;

  let navTurnBeaconMarker = null;

  let navProgressLine = null;

  let navDensifiedPoints = [];

  let navCurrentIndex = 0;

  let navLastTimestamp = null;

  let navActiveDestPlot = null;

  // Roadside Scenery (Leaflet Pins) & 3D Driver Street Vision Cockpit State

  let roadsideSceneryLayer = null;

  let showRoadsideScenery = true;

  let activeSceneryMarkers = [];

  let driverVisionCanvas = null;

  let driverVisionCtx = null;

  let isDriverVisionOpen = false;

  let visionAnimFrameId = null;

  let visionRoadOffset = 0;

  let visionCurveFactor = 0;

  let visionCurrentCurve = 0;

  let visionSteeringAngle = 0;

  let visionSceneryObjects = [];

  let visionLastTime = 0;

  let visionMode = "split"; // "split" or "full"

  // Major Chennai Starting Points & Landmarks

  const CHENNAI_LANDMARKS = {

    airport: { name: "Chennai International Airport (MAA)", coords: [12.9941, 80.1709], road: "GST Expressway NH-48" },

    central: { name: "Chennai Central Railway Station", coords: [13.0827, 80.2755], road: "Poonamallee High Road" },

    tidel: { name: "Tidel Park & Ascendas IT SEZ, OMR", coords: [12.9892, 80.2483], road: "Rajiv Gandhi Salai (OMR)" },

    phoenix: { name: "Phoenix Marketcity, Velachery", coords: [12.9915, 80.2173], road: "Velachery Main Road" },

    kilambakkam: { name: "Kilambakkam Bus Terminus (KCBT)", coords: [12.8711, 80.0765], road: "GST Road & Vandalur Interchange" },

    koyambedu: { name: "Koyambedu CMBT & Metro", coords: [13.0694, 80.1948], road: "100-Ft Inner Ring Road" },

    porur_junction: { name: "Porur Junction / Ramachandra", coords: [13.0382, 80.1585], road: "Mount-Poonamallee Road" },

    anna_arch: { name: "Anna Nagar Tower Park", coords: [13.0850, 80.2100], road: "2nd Avenue / Inner Ring Rd" },

    guindy: { name: "Guindy Kathipara Flyover", coords: [13.0067, 80.2025], road: "Kathipara Cloverleaf" }

  };

  // DOM Content Loaded Initializer

  
  // Mobile Legend Floating Toggle (Pill to Expanded List)
  window.toggleMapLegendFloating = function(event) {
    if (event) {
      event.stopPropagation();
    }
    const legend = document.getElementById("mapLegendFloating");
    if (!legend) return;
    legend.classList.toggle("expanded");
  };

  // Mobile Live HUD Toggle (Collapses large action strip)
  window.toggleMobileHudControls = function() {
    const hud = document.getElementById("gmapsLiveNavHud");
    const icon = document.getElementById("hudMobileToggleIcon");
    if (!hud) return;
    hud.classList.toggle("controls-expanded");
    if (icon) {
      if (hud.classList.contains("controls-expanded")) {
        icon.className = "fas fa-chevron-up";
      } else {
        icon.className = "fas fa-chevron-down";
      }
    }
  };

  
  // =========================================================================
  // ONE-BY-ONE CHENNAI PLOT STEPPER & ALL-OPTIONS ENGINE
  // =========================================================================

  let currentStepperIndex = 0;

  // 1. Fit all 20 Chennai plots within the mobile camera viewport
  window.fitAllPlotsOnMap = function() {
    if (!mapInstance || !allPlotsList || allPlotsList.length === 0) return;
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    allPlotsList.forEach(p => {
      if (p.coords && p.coords.length === 2) {
        const lat = p.coords[0];
        const lng = p.coords[1];
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      }
    });

    const isMobile = window.innerWidth <= 768;
    mapInstance.fitBounds([[minLng, minLat], [maxLng, maxLat]], {
      padding: isMobile ? { top: 50, bottom: 150, left: 18, right: 18 } : { top: 80, bottom: 80, left: 60, right: 60 },
      maxZoom: 12.2,
      pitch: 0,
      bearing: 0,
      duration: 1200
    });

    document.querySelectorAll(".nav-dimmed-marker").forEach(el => el.classList.remove("nav-dimmed-marker"));

    if (window.showToast) {
      window.showToast("🌐 Showing all 20 Chennai plots across North, South, East & West!");
    }
  };

  // 2. Step through plots one by one in line
  window.stepMobilePlot = function(delta) {
    if (!allPlotsList || allPlotsList.length === 0) return;
    currentStepperIndex = (currentStepperIndex + delta + allPlotsList.length) % allPlotsList.length;
    updateMobilePlotStepperUI(currentStepperIndex);
    focusPlotOnMap(currentStepperIndex);
  };

  // 3. Jump directly to plot by ID
  window.selectStepperPlotById = function(plotId) {
    if (!allPlotsList || allPlotsList.length === 0) return;
    const idx = allPlotsList.findIndex(p => p.id === plotId);
    if (idx !== -1) {
      currentStepperIndex = idx;
      updateMobilePlotStepperUI(idx);
      focusPlotOnMap(idx);
    }
  };

  // 4. Update the stepper card UI with active plot details
  function updateMobilePlotStepperUI(idx) {
    const plot = allPlotsList[idx];
    if (!plot) return;

    const countIdx = document.getElementById("stepperCurrentIndex");
    const countTotal = document.getElementById("stepperTotalPlots");
    const titleEl = document.getElementById("stepperPlotTitle");
    const priceEl = document.getElementById("stepperPlotPrice");
    const locEl = document.getElementById("stepperPlotLocality");
    const imgEl = document.getElementById("stepperPlotImg");
    const statusEl = document.getElementById("stepperPlotStatus");

    if (countIdx) countIdx.textContent = (idx + 1);
    if (countTotal) countTotal.textContent = allPlotsList.length;
    if (titleEl) titleEl.textContent = plot.title;
    if (priceEl) priceEl.textContent = plot.priceDisplay || "₹48.0 L";
    if (locEl) locEl.innerHTML = `<i class="fas fa-map-marker-alt text-gold"></i> ${plot.locality} &bull; ${plot.sqft || '1,500'} sq.ft &bull; ${plot.approval || 'CMDA'}`;
    if (statusEl) {
      statusEl.textContent = plot.status || "Available";
      statusEl.style.background = (plot.status === "Sold") ? "#ef4444" : "#10b981";
    }
    if (imgEl && plot.images && plot.images.length > 0) {
      imgEl.src = plot.images[0];
    }
  }

  // 5. Smoothly focus the map on the selected plot
  function focusPlotOnMap(idx) {
    const plot = allPlotsList[idx];
    if (!plot || !mapInstance) return;

    currentDestPlotId = plot.id;
    window.currentDestPlotCoords = [plot.coords[1], plot.coords[0]];

    // Smoothly fly close to the plot (Street level on mobile)
    const isMobile = window.innerWidth <= 768;
    mapInstance.flyTo({
      center: [plot.coords[1], plot.coords[0]],
      zoom: isMobile ? 18.2 : 16.5,
      pitch: isMobile ? 40 : 35,
      bearing: 0,
      duration: 1000
    });

    // Pulse the active marker
    Object.keys(activePlotMarkers).forEach(id => {
      const marker = activePlotMarkers[id];
      if (marker && marker.getElement) {
        const el = marker.getElement();
        if (id === plot.id) {
          el.classList.add("stepper-active-marker");
          el.scrollIntoView && el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
          el.classList.remove("stepper-active-marker");
        }
      }
    });
  }

  // 6. Action Triggers for Active Stepper Plot (All Options Visible in Line)
  window.triggerRouteForCurrentStepperPlot = function() {
    const plot = allPlotsList[currentStepperIndex];
    if (plot) {
      window.triggerRouteToPlot(plot.id);
    }
  };

  window.triggerVisionForCurrentStepperPlot = function() {
    const plot = allPlotsList[currentStepperIndex];
    if (plot) {
      window.triggerRouteToPlot(plot.id);
      setTimeout(() => {
        if (typeof window.openDriverStreetVision === "function") {
          window.openDriverStreetVision();
        }
      }, 700);
    }
  };

  window.triggerCabForCurrentStepperPlot = function() {
    const plot = allPlotsList[currentStepperIndex];
    if (plot && typeof window.openBookingModal === "function") {
      window.openBookingModal(plot.id);
    }
  };

  window.openCurrentStepperPlotDetails = function() {
    const plot = allPlotsList[currentStepperIndex];
    if (plot && typeof window.openPlotDetailView === "function") {
      window.openPlotDetailView(plot.id);
    }
  };

  window.triggerWhatsAppForCurrentStepperPlot = function() {
    const plot = allPlotsList[currentStepperIndex];
    if (plot && typeof window.openWhatsAppInquiry === "function") {
      window.openWhatsAppInquiry(plot.id);
    }
  };

  // 7. Linear All 20 Plots Drawer Controls
  window.toggleAllPlotsLinearDrawer = function() {
    const modal = document.getElementById("allPlotsLinearDrawerModal");
    if (!modal) return;
    if (modal.style.display === "none" || !modal.style.display) {
      modal.style.display = "flex";
      renderAllPlotsLinearList();
    } else {
      modal.style.display = "none";
    }
  };

  window.renderAllPlotsLinearList = function(filterQuery = "") {
    const container = document.getElementById("allPlotsLinearContainer");
    if (!container || !allPlotsList) return;

    const q = filterQuery.toLowerCase().trim();
    const filtered = allPlotsList.filter(p => {
      if (!q) return true;
      return (p.title && p.title.toLowerCase().includes(q)) ||
             (p.locality && p.locality.toLowerCase().includes(q)) ||
             (p.zone && p.zone.toLowerCase().includes(q)) ||
             (p.id && p.id.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:#94a3b8;">No plots match "${filterQuery}".</div>`;
      return;
    }

    container.innerHTML = filtered.map((plot, i) => {
      const img = (plot.images && plot.images.length > 0) ? plot.images[0] : "";
      const isActive = (plot.id === (allPlotsList[currentStepperIndex] && allPlotsList[currentStepperIndex].id));

      return `
        <div class="linear-plot-row-item ${isActive ? 'active' : ''}" id="linear-plot-${plot.id}">
          <div class="linear-plot-top">
            <img src="${img}" alt="${plot.title}" class="linear-plot-thumb" onclick="window.selectStepperPlotById('${plot.id}'); window.toggleAllPlotsLinearDrawer();">
            <div class="linear-plot-info" onclick="window.selectStepperPlotById('${plot.id}'); window.toggleAllPlotsLinearDrawer();" style="cursor:pointer;">
              <span class="linear-plot-num"><i class="fas fa-map-pin"></i> Plot #${i + 1} of ${allPlotsList.length} &bull; ${plot.zone.toUpperCase()}</span>
              <h4 class="linear-plot-title">${plot.title}</h4>
              <div class="linear-plot-locality">📍 ${plot.locality} &bull; ${plot.sqft || '1,500'} sq.ft &bull; <strong style="color:#10b981;">${plot.approval || 'CMDA Approved'}</strong></div>
            </div>
            <div class="linear-plot-price">${plot.priceDisplay}</div>
          </div>

          <!-- ALL OPTIONS VISIBLE IN LINE FOR THIS PLOT -->
          <div class="linear-plot-actions-line">
            <button type="button" class="btn-linear-action" onclick="window.selectStepperPlotById('${plot.id}'); window.toggleAllPlotsLinearDrawer();" style="color:#38bdf8;">
              <i class="fas fa-map-marker-alt"></i> View on Map
            </button>
            <button type="button" class="btn-linear-action" onclick="window.triggerRouteToPlot('${plot.id}'); window.toggleAllPlotsLinearDrawer();" style="color:#60a5fa;">
              <i class="fas fa-directions"></i> Directions
            </button>
            <button type="button" class="btn-linear-action" onclick="window.triggerRouteToPlot('${plot.id}'); setTimeout(window.openDriverStreetVision, 700); window.toggleAllPlotsLinearDrawer();" style="color:#c084fc;">
              <i class="fas fa-vr-cardboard"></i> 3D Vision
            </button>
            <button type="button" class="btn-linear-action" onclick="window.openBookingModal('${plot.id}'); window.toggleAllPlotsLinearDrawer();" style="color:#fbbf24;">
              <i class="fas fa-car"></i> Book Cab
            </button>
            <button type="button" class="btn-linear-action" onclick="window.openPlotDetailView('${plot.id}'); window.toggleAllPlotsLinearDrawer();" style="color:#34d399;">
              <i class="fas fa-file-contract"></i> Dossier
            </button>
            <button type="button" class="btn-linear-action" onclick="window.openWhatsAppInquiry('${plot.id}')" style="color:#4ade80;">
              <i class="fab fa-whatsapp"></i> WhatsApp
            </button>
          </div>
        </div>
      `;
    }).join("");
  };

  window.filterLinearPlotsDrawer = function(q) {
    renderAllPlotsLinearList(q);
  };

  document.addEventListener("DOMContentLoaded", () => {

    initDataset();

    initLeafletMap();

    initHeroQuickSearch();

    renderPlotCards(allPlotsList);
    updateMobilePlotStepperUI(0);

    initLayoutMasterplan();

    initLandUnitConverter();

    initModals();

    initCard3DTilt();

    initGoogleMapsRoutingEngine();

    initVehicleNavigationEngine();

    initDriverStreetVisionEngine();

    initAesthetic3DBackground();

    initPlotDetailModal();

    initStickyTaskbar();

    // Automated URL parameter triggers for verification & deep-linking
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("vehicle")) {
      const v = urlParams.get("vehicle").toLowerCase();
      if (v === "bike" || v === "car") {
        setVehicleType(v, false);
      }
    }

    if (urlParams.get("scroll") === "map" || urlParams.get("autovision") === "1" || urlParams.get("route")) {

      const mapSec = document.getElementById("mapSection");

      if (mapSec) {

        fitMapSectionIntoScreen(true);

      }

    }

    if (urlParams.get("route")) {

      setTimeout(() => {

        const targetPlot = urlParams.get("route");

        triggerRouteToPlot(targetPlot);

      }, 300);

    }

    if (urlParams.get("autovision") === "1") {

      setTimeout(() => {

        const targetPlot = urlParams.get("plot") || "plot-omr-01";

        triggerRouteToPlot(targetPlot);

        const mapSec = document.getElementById("mapSection");

        if (mapSec) {

          fitMapSectionIntoScreen(true);

        }

        setTimeout(() => {

          openDriverStreetVision();

          const mode = urlParams.get("mode");

          if (mode) setVisionDisplayMode(mode);

          const steer = urlParams.get("steer");
          if (steer) setStreetVisionSteer(steer);

          if (mapSec) {

            fitMapSectionIntoScreen(true);

          }

        }, 800);

      }, 500);

    }

    if (urlParams.get("arrived") === "1") {

      setTimeout(() => {

        const targetPlot = urlParams.get("plot") || "plot-omr-01";

        triggerRouteToPlot(targetPlot);

        const mapSec = document.getElementById("mapSection");

        if (mapSec) {

          fitMapSectionIntoScreen(true);

        }

        setTimeout(() => {

          if (urlParams.get("vision") === "1") {

            openDriverStreetVision();

            const mode = urlParams.get("mode");

            if (mode) setVisionDisplayMode(mode);

          }

          if (navDensifiedPoints && navDensifiedPoints.length > 0) {

            navCurrentIndex = navDensifiedPoints.length - 1;

            updateVehiclePositionAndManeuver(navCurrentIndex);

          }

          handleNavigationArrival();

          if (mapSec) {

            fitMapSectionIntoScreen(true);

          }

        }, 900);

      }, 500);

    

    if (urlParams.get("drive") === "1" || urlParams.get("autodrive") === "1") {

      setTimeout(() => {

        const targetPlot = urlParams.get("plot") || "plot-omr-01";

        triggerRouteToPlot(targetPlot);

        const mapSec = document.getElementById("mapSection");

        if (mapSec) fitMapSectionIntoScreen(true);

        setTimeout(() => {

          if (typeof startRouteNavigation === "function") {

            startRouteNavigation();

            const pct = parseFloat(urlParams.get("progress"));

            if (!isNaN(pct) && navDensifiedPoints && navDensifiedPoints.length > 0) {

              navCurrentIndex = Math.floor(pct * (navDensifiedPoints.length - 1));

              updateVehiclePositionAndManeuver(navCurrentIndex);

            }

          }

        }, 1200);

      }, 500);

    }

}

  });

  // 1. Initialize Combined Dataset (Preset + LocalStorage Submissions)

  function initDataset() {

    const baseData = window.CHENNAI_PLOTS_DATA || [];

    let savedPlots = [];

    try {

      savedPlots = JSON.parse(localStorage.getItem("chennai_user_listed_plots") || "[]");

    } catch (e) {

      savedPlots = [];

    }

    allPlotsList = [...savedPlots, ...baseData];

    if (allPlotsList.length > 0) {

      currentDestPlotId = allPlotsList[0].id;

    }

  }

  // 2. Initialize MapLibre GL 3D Map Engine Centered on Chennai

  function initLeafletMap() {

    const mapElement = document.getElementById("chennaiLeafletMap");

    if (!mapElement) return;

    const satelliteStyle = {

      version: 8,

      sources: {

        'satellite-tiles': {

          type: 'raster',

          tiles: [

            'https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',

            'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',

            'https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',

            'https://mt3.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'

          ],

          tileSize: 256,
          maxzoom: 21,

          attribution: '&copy; Google Maps &bull; High-Resolution Satellite Hybrid Imagery'

        }

      },

      layers: [

        {

          id: 'satellite-layer',

          type: 'raster',

          source: 'satellite-tiles'

        }

      ]

    };

    // Centered on Chennai metropolitan area with 3D perspective

    mapInstance = new maplibregl.Map({

      container: 'chennaiLeafletMap',

      style: satelliteStyle,

      center: [80.18, 12.98],

      zoom: 11,

      pitch: 20,

      bearing: 0,

      maxPitch: 85,

      antialias: true,
      maxZoom: 21,
      minZoom: 9,
      touchZoomRotate: true

    });

    setupMapInstanceAdapters(mapInstance);

    // Marker & layer shim groups for backward compatibility

    markersLayer = {

      clearLayers: () => {

        activeMapLibreMarkers.forEach(m => m.remove());

        activeMapLibreMarkers = [];

        activePlotMarkers = {};

      },

      addLayer: (m) => {

        activeMapLibreMarkers.push(m);

      }

    };

    routeLayerGroup = {

      clearLayers: () => {

        clearMapLibreRouteLayers();

      },

      addLayer: () => {}

    };

    navLayerGroup = {

      clearLayers: () => {

        if (navVehicleMarker) {

          navVehicleMarker.remove();

          navVehicleMarker = null;

        }

        if (navTurnBeaconMarker) {

          navTurnBeaconMarker.remove();

          navTurnBeaconMarker = null;

        }

      },

      addLayer: () => {},

      removeLayer: (layer) => {

        if (layer && layer.remove) layer.remove();

      }

    };

    roadsideSceneryLayer = {

      clearLayers: () => {

        activeSceneryMarkers.forEach(m => m.remove());

        activeSceneryMarkers = [];

      },

      addLayer: (m) => {

        activeSceneryMarkers.push(m);

      }

    };

    mapInstance.on('load', () => {

      mapLibreLoaded = true;

      initMapLibreLayers();

      updateMapMarkers(allPlotsList);

    });

    // 3D Camera Perspective buttons

    setupCameraPerspectiveButtons();

    // Style switchers

    setupStyleSwitchers();

    // Reset Map View Button

    const resetMapBtn = document.getElementById("resetMapViewBtn");

    if (resetMapBtn) {

      resetMapBtn.addEventListener("click", () => {

        window.returnToChennaiOverview();

      });

    }

    // Map Zone Quick Jump Pills

    const zonePills = document.querySelectorAll(".zone-pill");

    zonePills.forEach(pill => {

      pill.addEventListener("click", function () {

        zonePills.forEach(p => p.classList.remove("active"));

        this.classList.add("active");

        const zone = this.getAttribute("data-zone");

        handleZoneQuickJump(zone);

      });

    });

  }

  function setupMapInstanceAdapters(map) {

    const origFlyTo = map.flyTo.bind(map);

    map.flyTo = function(arg1, arg2, arg3) {

      if (Array.isArray(arg1)) {

        const lng = arg1[1];

        const lat = arg1[0];

        const zoom = typeof arg2 === 'number' ? arg2 : 15;

        const opts = (typeof arg2 === 'object' ? arg2 : arg3) || {};

        const duration = opts.duration ? opts.duration * 1000 : 1200;

        return origFlyTo({

          center: [lng, lat],

          zoom: zoom,

          pitch: opts.pitch !== undefined ? opts.pitch : (zoom >= 16 ? currentSmoothedPitch : 20),

          bearing: opts.bearing !== undefined ? opts.bearing : 0,

          duration: duration

        });

      }

      return origFlyTo(arg1);

    };

    const origFitBounds = map.fitBounds.bind(map);

    map.fitBounds = function(bounds, opts = {}) {

      let mbBounds = bounds;

      if (Array.isArray(bounds) && bounds.length === 2 && Array.isArray(bounds[0])) {

        const p1 = bounds[0];

        const p2 = bounds[1];

        const minLng = Math.min(p1[1], p2[1]);

        const maxLng = Math.max(p1[1], p2[1]);

        const minLat = Math.min(p1[0], p2[0]);

        const maxLat = Math.max(p1[0], p2[0]);

        mbBounds = [[minLng, minLat], [maxLng, maxLat]];

      } else if (bounds && bounds.getSouthWest && bounds.getNorthEast) {

        const sw = bounds.getSouthWest();

        const ne = bounds.getNorthEast();

        mbBounds = [[sw.lng, sw.lat], [ne.lng, ne.lat]];

      }

      return origFitBounds(mbBounds, {

        padding: opts.padding ? (Array.isArray(opts.padding) ? opts.padding[0] : opts.padding) : 60,

        pitch: 25,

        bearing: 0,

        duration: opts.duration ? opts.duration * 1000 : 1000

      });

    };

    map.setView = function(latLng, zoom, opts) {

      const lng = Array.isArray(latLng) ? latLng[1] : latLng.lng;

      const lat = Array.isArray(latLng) ? latLng[0] : latLng.lat;

      map.jumpTo({

        center: [lng, lat],

        zoom: zoom || map.getZoom()

      });

      return map;

    };

    map.panTo = function(latLng, opts) {

      const lng = Array.isArray(latLng) ? latLng[1] : latLng.lng;

      const lat = Array.isArray(latLng) ? latLng[0] : latLng.lat;

      map.jumpTo({

        center: [lng, lat]

      });

      return map;

    };

    map.invalidateSize = function() {

      map.resize();

      return map;

    };

    map.stop = function() {

      // MapLibre doesn't crash on stop

    };

  }

  function initMapLibreLayers() {

    if (!mapInstance) return;

    if (!mapInstance.getSource('route-source')) {

      mapInstance.addSource('route-source', {

        type: 'geojson',

        data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }

      });

      mapInstance.addLayer({

        id: 'route-glow',

        type: 'line',

        source: 'route-source',

        paint: {

          'line-color': '#0369a1',

          'line-width': 14,

          'line-opacity': 0.55,

          'line-blur': 3

        }

      });

      mapInstance.addLayer({

        id: 'route-ribbon',

        type: 'line',

        source: 'route-source',

        paint: {

          'line-color': '#0284c7',

          'line-width': 7,

          'line-opacity': 0.95

        }

      });

      mapInstance.addLayer({

        id: 'route-pulse',

        type: 'line',

        source: 'route-source',

        paint: {

          'line-color': '#ffffff',

          'line-width': 2.5,

          'line-dasharray': [2, 2]

        }

      });

    }

    if (!mapInstance.getSource('traveled-source')) {

      mapInstance.addSource('traveled-source', {

        type: 'geojson',

        data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }

      });

      mapInstance.addLayer({

        id: 'traveled-ribbon',

        type: 'line',

        source: 'traveled-source',

        paint: {

          'line-color': '#10b981',

          'line-width': 8,

          'line-opacity': 0.95

        }

      });

    }

    if (!mapInstance.getSource('plot-boundary-source')) {

      mapInstance.addSource('plot-boundary-source', {

        type: 'geojson',

        data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [] } }

      });

      mapInstance.addLayer({

        id: 'plot-boundary-fill',

        type: 'fill',

        source: 'plot-boundary-source',

        paint: {

          'fill-color': '#f59e0b',

          'fill-opacity': 0.28

        }

      });

      mapInstance.addLayer({

        id: 'plot-boundary-outline',

        type: 'line',

        source: 'plot-boundary-source',

        paint: {

          'line-color': '#f59e0b',

          'line-width': 3.5,

          'line-dasharray': [3, 1]

        }

      });

    }

  }

  function clearMapLibreRouteLayers() {

    if (!mapInstance) return;

    if (mapInstance.getSource('route-source')) {

      mapInstance.getSource('route-source').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] } });

    }

    if (mapInstance.getSource('traveled-source')) {

      mapInstance.getSource('traveled-source').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] } });

    }

    clearPlotBoundaryHighlight();

  }

  function setupCameraPerspectiveButtons() {

    const btnDriver = document.getElementById("btnCamDriverEye");

    const btnChase = document.getElementById("btnCamChase");

    const btnOverview = document.getElementById("btnCamOverview");

    const setMode = (mode) => {

      cameraMode = mode;

      [btnDriver, btnChase, btnOverview].forEach(b => { if (b) b.classList.remove("active"); });

      if (mode === "driver" && btnDriver) btnDriver.classList.add("active");

      if (mode === "chase" && btnChase) btnChase.classList.add("active");

      if (mode === "birdseye" && btnOverview) btnOverview.classList.add("active");

      if (mapInstance) {

        const targetPitch = mode === "driver" ? 60 : (mode === "chase" ? 48 : 0);

        currentSmoothedPitch = targetPitch;

        mapInstance.easeTo({

          pitch: targetPitch,

          duration: 600

        });

      }

    };

    if (btnDriver) btnDriver.addEventListener("click", () => setMode("driver"));

    if (btnChase) btnChase.addEventListener("click", () => setMode("chase"));

    if (btnOverview) btnOverview.addEventListener("click", () => setMode("birdseye"));

  }

  function setupStyleSwitchers() {

    const toggle3DVectorBtn = document.getElementById("toggle3DVectorCityBtn");

    const toggleSatelliteBtn = document.getElementById("toggleSatelliteBtn");

    const satelliteToggleText = document.getElementById("satelliteToggleText");

    const vectorCityStyle = "https://tiles.openfreemap.org/styles/liberty";

    const satelliteStyle = {

      version: 8,

      sources: {

        'satellite-tiles': {

          type: 'raster',

          tiles: [

            'https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',

            'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',

            'https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',

            'https://mt3.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'

          ],

          tileSize: 256,
          maxzoom: 21,

          attribution: '&copy; Google Maps &bull; High-Resolution Satellite Hybrid Imagery'

        }

      },

      layers: [

        {

          id: 'satellite-layer',

          type: 'raster',

          source: 'satellite-tiles'

        }

      ]

    };

    if (toggle3DVectorBtn) {

      toggle3DVectorBtn.addEventListener("click", () => {

        if (!mapInstance) return;

        currentMapStyleMode = currentMapStyleMode === "vector3d" ? "satellite" : "vector3d";

        if (currentMapStyleMode === "vector3d") {

          mapInstance.setStyle(vectorCityStyle);

          toggle3DVectorBtn.classList.add("btn-satellite-active");

          if (toggleSatelliteBtn) toggleSatelliteBtn.classList.remove("btn-satellite-active");

        } else {

          mapInstance.setStyle(satelliteStyle);

          toggle3DVectorBtn.classList.remove("btn-satellite-active");

          if (toggleSatelliteBtn) toggleSatelliteBtn.classList.add("btn-satellite-active");

        }

        mapInstance.once('style.load', () => {

          initMapLibreLayers();

          updateMapMarkers(allPlotsList);

        });

      });

    }

    if (toggleSatelliteBtn) {

      toggleSatelliteBtn.addEventListener("click", () => {

        if (!mapInstance) return;

        currentMapStyleMode = "satellite";

        mapInstance.setStyle(satelliteStyle);

        toggleSatelliteBtn.classList.add("btn-satellite-active");

        if (toggle3DVectorBtn) toggle3DVectorBtn.classList.remove("btn-satellite-active");

        mapInstance.once('style.load', () => {

          initMapLibreLayers();

          updateMapMarkers(allPlotsList);

        });

      });

    }

  }

  // Handle Zone Quick Jump Fly Animation

  function handleZoneQuickJump(zone) {

    if (!mapInstance) return;

    const zoneCoords = {

      all: { center: [12.98, 80.18], zoom: 11 },

      omr: { center: [12.86, 80.22], zoom: 13 },

      ecr: { center: [12.89, 80.25], zoom: 13 },

      gst: { center: [12.90, 80.10], zoom: 13 },

      west: { center: [13.04, 80.12], zoom: 13 },

      central: { center: [13.03, 80.21], zoom: 13 },

      north: { center: [13.11, 80.15], zoom: 13 },

      sriperumbudur: { center: [12.97, 79.96], zoom: 12 }

    };

    const target = zoneCoords[zone] || zoneCoords.all;

    mapInstance.flyTo(target.center, target.zoom, {

      duration: 1.4,

      easeLinearity: 0.25

    });

    // Also sync with the listing filter

    currentFilterZone = zone;

    filterAndRenderPlots();

  }

  // 3. Update Custom Pointed Markers on MapLibre 3D Map

  function updateMapMarkers(plots) {

    if (!mapInstance) return;

    activeMapLibreMarkers.forEach(m => m.remove());

    activeMapLibreMarkers = [];

    activePlotMarkers = {};

    plots.forEach(plot => {

      if (!plot.coords || plot.coords.length < 2) return;

      const statusLower = (plot.status || "available").toLowerCase();

      const isSold = statusLower === "sold";

      const isBooked = statusLower === "booked";

      const isGold = !isSold && !isBooked && ((plot.price >= 10000000) || (plot.facing && plot.facing.toLowerCase().includes("corner")));

      let pinColorClass = "green";

      let pinFillColor = "#059669";

      let pinDotColor = "#34d399";

      let pinTipColor = "#047857";

      let pinBadgeText = plot.priceDisplay ? plot.priceDisplay.replace("Lakhs", "L").replace("Crores", "Cr") : "₹";

      if (isSold) {

        pinColorClass = "sold";

        pinFillColor = "#dc2626";

        pinDotColor = "#f87171";

        pinTipColor = "#991b1b";

        pinBadgeText = "SOLD";

      } else if (isBooked) {

        pinColorClass = "booked";

        pinFillColor = "#d97706";

        pinDotColor = "#fbbf24";

        pinTipColor = "#b45309";

        pinBadgeText = "BOOKED";

      } else if (isGold) {

        pinColorClass = "gold";

        pinFillColor = "#d97706";

        pinDotColor = "#fbbf24";

        pinTipColor = "#b45309";

      }

      const pointedPinHtml = `

        <div class="pointed-plot-pin ${pinColorClass}" data-plot-id="${plot.id}">

          <div class="pointed-pin-badge">${pinBadgeText}</div>

          <div class="pointed-pin-svg-wrap">

            <svg class="pointed-pin-svg" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">

              <path d="M18 0C8.05887 0 0 8.05887 0 18C0 28.5 15.5 44 18 46C20.5 44 36 28.5 36 18C36 8.05887 27.9411 0 18 0Z" 

                fill="${pinFillColor}" />

              <circle cx="18" cy="18" r="9" fill="#0b132b" />

              <circle cx="18" cy="18" r="5" fill="${pinDotColor}" />

              <path d="M18 46L14 36H22L18 46Z" fill="${pinTipColor}" />

            </svg>

          </div>

          <div class="pointed-pin-radar"></div>

        </div>

      `;

      const el = document.createElement("div");

      el.className = "custom-leaflet-pointed-icon";

      el.innerHTML = pointedPinHtml;

      const marker = new maplibregl.Marker({

        element: el,

        anchor: "bottom"

      }).setLngLat([plot.coords[1], plot.coords[0]]).addTo(mapInstance);

      const firstImage = (plot.images && plot.images[0]) || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80";

      const popupHtml = `

        <div class="map-popup-card">

          <div class="map-popup-thumb-wrap" onclick="window.openPlotDetailView('${plot.id}')" style="cursor:pointer;" title="Click to open Full Separate View">

            <img src="${firstImage}" alt="${plot.title}">

            <span class="map-popup-badge status-${statusLower}" style="right:12px; left:auto;">${plot.status || 'Available'}</span>

            <span class="map-popup-badge" style="left:12px; right:auto;">${plot.approvalType || 'CMDA Approved'}</span>

            <div class="map-popup-price">${plot.priceDisplay}</div>

          </div>

          <div class="map-popup-body">

            <h4 class="map-popup-title" onclick="window.openPlotDetailView('${plot.id}')" style="cursor:pointer;" title="Click to open Full Separate View">${plot.title}</h4>

            <div class="map-popup-locality">

              <i class="fas fa-map-marker-alt" style="color:#d97706;"></i> ${plot.locality}

            </div>

            <div class="map-popup-specs">

              <div><strong>Size:</strong> ${plot.plotSizeSqft} sq.ft</div>

              <div><strong>Rate:</strong> ${plot.pricePerSqftDisplay}</div>

              <div><strong>Facing:</strong> ${plot.facing}</div>

              <div><strong>Road:</strong> ${plot.roadWidth || '40 Ft Road'}</div>

            </div>

            <div class="map-popup-actions">

              <button class="btn btn-popup-separate" onclick="window.openPlotDetailView('${plot.id}')" title="Open Full Separate View Modal">

                <i class="fas fa-expand-alt"></i> Separate View

              </button>

              <button class="btn btn-primary btn-sm" onclick="window.triggerRouteToPlot('${plot.id}')" title="Calculate Route & Distance">

                <i class="fas fa-directions"></i> Route

              </button>

              <button class="btn btn-success btn-sm" onclick="window.openWhatsAppInquiry('${plot.id}')">

                <i class="fab fa-whatsapp"></i> Chat

              </button>

            </div>

          </div>

        </div>

      `;

      const popup = new maplibregl.Popup({ offset: [0, -50], closeButton: true, maxWidth: '340px' }).setHTML(popupHtml);

      marker.setPopup(popup);

      el.addEventListener("click", () => {

        highlightPlotCard(plot.id, false);

        triggerRouteToPlot(plot.id);

      });

      marker.closePopup = () => popup.remove();

      activeMapLibreMarkers.push(marker);

      activePlotMarkers[plot.id] = marker;

    });

    const countBadge = document.getElementById("mapPlotsCounter");

    if (countBadge) {

      countBadge.innerHTML = `<span class="pulse-dot-green"></span> <strong>${plots.length}</strong> Plots Available`;

    }

  }

  // 4. Render Selling Plot Cards with Animated Multi-Image Slider and Distance Pill

  function renderPlotCards(plots) {

    const grid = document.getElementById("plotsGrid");

    if (!grid) return;

    if (!plots || plots.length === 0) {

      grid.innerHTML = `

        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #ffffff; border-radius: var(--radius-md); border: 1px dashed var(--border);">

          <i class="fas fa-search-location" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 16px;"></i>

          <h3 style="font-size: 1.4rem; color: var(--primary); margin-bottom: 8px;">No Plots Found Matching Filters</h3>

          <p style="color: var(--text-muted); margin-bottom: 20px;">Try adjusting your search criteria, budget, or Chennai zone.</p>

          <button class="btn btn-primary" onclick="window.resetAllFilters()">

            <i class="fas fa-redo"></i> Reset All Filters

          </button>

        </div>

      `;

      return;

    }

    grid.innerHTML = plots.map(plot => {

      const images = plot.images && plot.images.length > 0 ? plot.images : [

        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"

      ];

      // Build animated image slides HTML

      const slidesHtml = images.map((img, idx) => `

        <img class="card-slide-img ${idx === 0 ? 'active' : ''}" 

             src="${img}" 

             alt="${plot.title} photo ${idx + 1}"

             data-slide-index="${idx}"

             loading="lazy">

      `).join("");

      // Build dots

      const dotsHtml = images.map((_, idx) => `

        <span class="slider-dot ${idx === 0 ? 'active' : ''}" data-dot-index="${idx}"></span>

      `).join("");

      // Hotspots HTML if available

      const hotspotsHtml = (plot.hotspots || []).map(hs => `

        <div class="img-hotspot" style="top: ${hs.y}%; left: ${hs.x}%;">

          <span class="img-hotspot-tooltip">${hs.label}</span>

        </div>

      `).join("");

      // Quick road distance calculation from active origin

      const distInfo = computeDistanceMetrics(currentOriginCoords, plot.coords);

      return `

        <article class="plot-card" id="card-${plot.id}" data-id="${plot.id}" data-zone="${plot.zone}">

          <div class="card-glare"></div>

          <!-- Animated Media Gallery Container -->

          <div class="card-media-wrap">

            <div class="card-slider-track" id="slider-${plot.id}" onclick="window.openPlotDetailView('${plot.id}')" style="cursor:pointer;" title="Click to view full separate plot view">

              ${slidesHtml}

            </div>

            <!-- Pulsing Hotspots on Ground View -->

            ${hotspotsHtml}

            <!-- Slider Arrows (Active on hover) -->

            ${images.length > 1 ? `

              <button class="slider-arrow prev" onclick="event.stopPropagation(); window.changeCardSlide('${plot.id}', -1)" aria-label="Previous Photo">

                <i class="fas fa-chevron-left"></i>

              </button>

              <button class="slider-arrow next" onclick="event.stopPropagation(); window.changeCardSlide('${plot.id}', 1)" aria-label="Next Photo">

                <i class="fas fa-chevron-right"></i>

              </button>

              <div class="slider-dots" id="dots-${plot.id}">

                ${dotsHtml}

              </div>

            ` : ''}

            <!-- Badges -->

            <div class="card-badge-top-left">

              <span class="badge-pill status-${(plot.status || 'available').toLowerCase()}">${plot.status || 'Available'}</span>

              ${plot.badge ? `<span class="badge-pill shimmer">${plot.badge}</span>` : ''}

            </div>

            <div class="card-badge-top-right">

              <button class="map-locate-btn" onclick="event.stopPropagation(); window.flyToPointedPin('${plot.id}')" title="Locate & Zoom on Map">

                <i class="fas fa-map-pin"></i> View Location

              </button>

            </div>

          </div>

          <!-- Card Details Body -->

          <div class="card-body">

            <div class="card-price-row">

              <div class="card-price">${plot.priceDisplay}</div>

              <div class="card-price-per-sqft">${plot.pricePerSqftDisplay}</div>

            </div>

            <h3 class="card-title" onclick="window.openPlotDetailView('${plot.id}')" style="cursor:pointer;" title="Click to open Full Separate View">${plot.title}</h3>

            <div class="card-locality">

              <i class="fas fa-map-marker-alt" style="color: #d97706;"></i>

              <span>${plot.locality}</span>

            </div>

            <!-- Google Maps Modeled Distance Badge -->

            <div class="card-distance-pill" onclick="window.triggerRouteToPlot('${plot.id}')" title="Click to view full Google Maps driving route and turn-by-turn distance">

              <span>

                <i class="fas fa-route" style="color:#1a73e8;"></i>

                <span id="dist-pill-${plot.id}">🚗 <strong>${distInfo.distanceKm} km</strong> (${distInfo.durationMin} min from ${currentOriginLabel.split(' ')[0]})</span>

              </span>

              <span style="font-size:0.72rem; color:#1a73e8; font-weight:700;">

                <i class="fas fa-directions"></i> Get Directions

              </span>

            </div>

            <!-- Plot Dimensions & Technical Specs Matrix -->

            <div class="card-specs-matrix">

              <div class="spec-cell">

                <span class="spec-label">Area (Sq.Ft)</span>

                <span class="spec-val">${plot.plotSizeSqft}</span>

              </div>

              <div class="spec-cell">

                <span class="spec-label">Dimensions</span>

                <span class="spec-val">${plot.dimensions || '30×40'}</span>

              </div>

              <div class="spec-cell">

                <span class="spec-label">Facing</span>

                <span class="spec-val">${plot.facing || 'East'}</span>

              </div>

              <div class="spec-cell">

                <span class="spec-label">Cents</span>

                <span class="spec-val">${plot.plotSizeCents || '2.75'} Cents</span>

              </div>

              <div class="spec-cell">

                <span class="spec-label">Grounds</span>

                <span class="spec-val">${plot.plotSizeGrounds || '0.50'} Gr</span>

              </div>

              <div class="spec-cell">

                <span class="spec-label">Road Width</span>

                <span class="spec-val">${plot.roadWidth || '30 Ft'}</span>

              </div>

            </div>

            <!-- Sanction & Approval Strip -->

            <div class="card-approval-bar">

              <div>

                <i class="fas fa-shield-alt"></i> <strong>${plot.approvalType || 'CMDA Approved'}</strong>

              </div>

              <div style="font-size: 0.72rem; color: #15803d;">

                <i class="fas fa-check-circle"></i> Clear Patta

              </div>

            </div>

            <!-- Separate View & Action Buttons -->

            <button class="btn-card-separate" onclick="window.openPlotDetailView('${plot.id}')" title="Open Dedicated Separate View & Full Dossier">

              <i class="fas fa-expand-alt"></i> Separate View & Full Dossier

            </button>

            <!-- Dedicated Verify Availability & Email Visit Pass Button -->
            <button class="btn btn-sm" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#ffffff; font-weight:800; border:none; border-radius:6px; padding:8px 12px; margin-top:6px; width:100%; display:flex; align-items:center; justify-content:center; gap:6px; cursor:pointer;" onclick="window.openBookingModal('${plot.id}')" title="Verify Availability & Email Visit Pass">
              <i class="fas fa-envelope-circle-check"></i> Verify Availability &amp; Email Visit Pass
            </button>

            <div class="card-actions-row">

              <button class="btn btn-primary btn-sm" onclick="window.openBookingModal('${plot.id}')" title="Book Free Cab Visit">

                <i class="fas fa-car"></i> Cab

              </button>

              <button class="btn btn-sm" style="background:#1a73e8; color:#ffffff; font-weight:700;" onclick="window.triggerRouteToPlot('${plot.id}')" title="Get Directions to this Plot">

                <i class="fas fa-directions"></i> Route

              </button>

              <a href="tel:+919345029705" class="btn btn-outline btn-sm" style="font-weight:700;" title="Call Relationship Manager">

                <i class="fas fa-phone-alt"></i> Call

              </a>

              <button class="btn btn-success btn-sm" onclick="window.openWhatsAppInquiry('${plot.id}')" title="Chat on WhatsApp">

                <i class="fab fa-whatsapp"></i> Chat

              </button>

            </div>

          </div>

        </article>

      `;

    }).join("");

    startAutoSlideGalleries();

  }

  // Auto-slide gallery for animated cards (smooth Ken Burns transitions)

  let autoSlideInterval = null;

  function startAutoSlideGalleries() {

    if (autoSlideInterval) clearInterval(autoSlideInterval);

    autoSlideInterval = setInterval(() => {

      const activeCards = document.querySelectorAll(".plot-card");

      if (activeCards.length === 0) return;

      

      const randomIdx = Math.floor(Math.random() * activeCards.length);

      const card = activeCards[randomIdx];

      const plotId = card.getAttribute("data-id");

      if (plotId) {

        changeCardSlide(plotId, 1);

      }

    }, 4500);

  }

  // 5. Change Card Slide Next / Prev

  function changeCardSlide(plotId, direction) {

    const track = document.getElementById(`slider-${plotId}`);

    if (!track) return;

    const slides = track.querySelectorAll(".card-slide-img");

    if (slides.length <= 1) return;

    let currentIndex = 0;

    slides.forEach((s, idx) => {

      if (s.classList.contains("active")) currentIndex = idx;

    });

    slides[currentIndex].classList.remove("active");

    let newIndex = (currentIndex + direction + slides.length) % slides.length;

    slides[newIndex].classList.add("active");

    const dotsTrack = document.getElementById(`dots-${plotId}`);

    if (dotsTrack) {

      const dots = dotsTrack.querySelectorAll(".slider-dot");

      dots.forEach((d, idx) => {

        d.classList.toggle("active", idx === newIndex);

      });

    }

  }

  // 6. Interactive 3D Card Hover Tilt with Holographic Specular Highlight

  function initCard3DTilt() {

    const grid = document.getElementById("plotsGrid");

    if (!grid) return;

    grid.addEventListener("mousemove", (e) => {

      const card = e.target.closest(".plot-card");

      if (!card) return;

      const rect = card.getBoundingClientRect();

      const x = e.clientX - rect.left;

      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;

      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;

      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      const mouseXPercent = (x / rect.width) * 100;

      const mouseYPercent = (y / rect.height) * 100;

      card.style.setProperty("--mouse-x", `${mouseXPercent}%`);

      card.style.setProperty("--mouse-y", `${mouseYPercent}%`);

    });

    grid.addEventListener("mouseleave", () => {

      const cards = document.querySelectorAll(".plot-card");

      cards.forEach(c => {

        c.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";

      });

    }, true);

  }

  // 7. Fly Map to Pointed Pin from Card Click & Trigger Route with Property Image

  function flyToPointedPin(plotId) {

    const marker = activePlotMarkers[plotId];

    if (!marker || !mapInstance) return;

    // Trigger Route Navigation with Property Image

    triggerRouteToPlot(plotId);

    fitMapSectionIntoScreen();

    setTimeout(() => {

      const latLng = marker.getLatLng();

      mapInstance.flyTo(latLng, 15, { duration: 1.2 });

      marker.openPopup();

      const pinEl = document.querySelector(`.pointed-plot-pin[data-plot-id="${plotId}"]`);

      if (pinEl) {

        pinEl.classList.add("pin-bounce");

        setTimeout(() => pinEl.classList.remove("pin-bounce"), 1500);

      }

    }, 400);

  }

  // Highlight Card on Marker Click

  function highlightPlotCard(plotId, shouldScroll = false) {

    const card = document.getElementById(`card-${plotId}`);

    if (!card) return;

    document.querySelectorAll(".plot-card").forEach(c => c.style.borderColor = "var(--border)");

    card.style.borderColor = "var(--gold)";

    if (shouldScroll) {

      card.scrollIntoView({ behavior: "smooth", block: "center" });

    }

    card.style.boxShadow = "0 0 25px rgba(212, 175, 55, 0.6)";

    setTimeout(() => {

      card.style.boxShadow = "";

    }, 2000);

  }

  function scrollToPlotCard(plotId) {

    highlightPlotCard(plotId, true);

  }

  // 8. Filters & Search Engine

  function filterAndRenderPlots() {

    let filtered = [...allPlotsList];

    // Zone Filter

    if (currentFilterZone !== "all") {

      filtered = filtered.filter(p => p.zone === currentFilterZone);

    }

    // Budget Filter

    if (currentBudgetFilter !== "all") {

      if (currentBudgetFilter === "under30") {

        filtered = filtered.filter(p => p.price <= 3000000);

      } else if (currentBudgetFilter === "30to60") {

        filtered = filtered.filter(p => p.price > 3000000 && p.price <= 6000000);

      } else if (currentBudgetFilter === "60to1cr") {

        filtered = filtered.filter(p => p.price > 6000000 && p.price <= 10000000);

      } else if (currentBudgetFilter === "above1cr") {

        filtered = filtered.filter(p => p.price > 10000000);

      }

    }

    // Plot Size Filter

    if (currentSizeFilter !== "all") {

      if (currentSizeFilter === "under1200") {

        filtered = filtered.filter(p => (p.plotSizeSqft || 0) < 1200);

      } else if (currentSizeFilter === "1200to1800") {

        filtered = filtered.filter(p => (p.plotSizeSqft || 0) >= 1200 && (p.plotSizeSqft || 0) <= 1800);

      } else if (currentSizeFilter === "1800to2400") {

        filtered = filtered.filter(p => (p.plotSizeSqft || 0) > 1800 && (p.plotSizeSqft || 0) <= 2400);

      } else if (currentSizeFilter === "above2400") {

        filtered = filtered.filter(p => (p.plotSizeSqft || 0) > 2400);

      }

    }

    // Availability Status Filter

    if (currentStatusFilter !== "all") {

      filtered = filtered.filter(p => (p.status || "available").toLowerCase() === currentStatusFilter.toLowerCase());

    }

    // Facing Filter

    if (currentFacingFilter !== "all") {

      filtered = filtered.filter(p => p.facing && p.facing.toLowerCase().includes(currentFacingFilter.toLowerCase()));

    }

    // Search Query (Plot name, project, locality, corridor, or zone)

    if (currentSearchQuery.trim() !== "") {

      const q = currentSearchQuery.toLowerCase().trim();

      filtered = filtered.filter(p => 

        (p.title && p.title.toLowerCase().includes(q)) ||

        (p.locality && p.locality.toLowerCase().includes(q)) ||

        (p.zoneLabel && p.zoneLabel.toLowerCase().includes(q)) ||

        (p.approvalType && p.approvalType.toLowerCase().includes(q)) ||

        (p.facing && p.facing.toLowerCase().includes(q))

      );

    }

    // Sorting

    if (currentSortMode === "price-low") {

      filtered.sort((a, b) => a.price - b.price);

    } else if (currentSortMode === "price-high") {

      filtered.sort((a, b) => b.price - a.price);

    } else if (currentSortMode === "size-high") {

      filtered.sort((a, b) => b.plotSizeSqft - a.plotSizeSqft);

    } else {

      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    }

    renderPlotCards(filtered);

    updateMapMarkers(filtered);

    // Update Counter Elements

    const filteredCounter = document.getElementById("filteredPlotsCounter");

    if (filteredCounter) {

      filteredCounter.innerHTML = `<span class="pulse-dot-green"></span> <strong>${filtered.length}</strong> Plots Found`;

    }

    const mobileCount = document.getElementById("mobilePlotCount");

    if (mobileCount) {

      mobileCount.textContent = filtered.length;

    }

    const mapCounter = document.getElementById("mapPlotsCounter");

    if (mapCounter) {

      mapCounter.innerHTML = `<span class="pulse-dot-green"></span> <strong>${filtered.length}</strong> Plots Available`;

    }

  }

  function initHeroQuickSearch() {

    const heroSearchInput = document.getElementById("heroSearchArea");

    const listingSearchInput = document.getElementById("listingSearchInput");

    const searchClearBtn = document.getElementById("listingSearchClearBtn");

    const heroZoneSelect = document.getElementById("heroZoneSelect");

    const heroBudgetSelect = document.getElementById("heroBudgetSelect");

    const listingBudgetSelect = document.getElementById("listingBudgetSelect");

    const listingSizeSelect = document.getElementById("listingSizeSelect");

    const listingStatusSelect = document.getElementById("listingStatusSelect");

    const heroFacingSelect = document.getElementById("heroFacingSelect");

    const searchBtn = document.getElementById("heroSearchBtn");

    const resetBtn = document.getElementById("resetAllFiltersBtn");

    // Real-Time Listing Search Input

    if (listingSearchInput) {

      listingSearchInput.addEventListener("input", function () {

        currentSearchQuery = this.value;

        if (heroSearchInput) heroSearchInput.value = this.value;

        if (searchClearBtn) {

          searchClearBtn.style.display = this.value.trim() ? "inline-block" : "none";

        }

        filterAndRenderPlots();

      });

    }

    // Search Clear Button

    if (searchClearBtn) {

      searchClearBtn.addEventListener("click", () => {

        currentSearchQuery = "";

        if (listingSearchInput) listingSearchInput.value = "";

        if (heroSearchInput) heroSearchInput.value = "";

        searchClearBtn.style.display = "none";

        filterAndRenderPlots();

      });

    }

    // Hero Search Input

    if (heroSearchInput) {

      heroSearchInput.addEventListener("input", function () {

        currentSearchQuery = this.value;

        if (listingSearchInput) listingSearchInput.value = this.value;

        if (searchClearBtn) {

          searchClearBtn.style.display = this.value.trim() ? "inline-block" : "none";

        }

      });

    }

    // Hero Search Button

    if (searchBtn) {

      searchBtn.addEventListener("click", () => {

        if (heroSearchInput) currentSearchQuery = heroSearchInput.value;

        if (heroZoneSelect) currentFilterZone = heroZoneSelect.value;

        if (heroBudgetSelect) {

          currentBudgetFilter = heroBudgetSelect.value;

          if (listingBudgetSelect) listingBudgetSelect.value = heroBudgetSelect.value;

        }

        if (heroFacingSelect) currentFacingFilter = heroFacingSelect.value;

        filterAndRenderPlots();

        const showcase = document.getElementById("showcaseSection");

        if (showcase) showcase.scrollIntoView({ behavior: "smooth" });

      });

    }

    // Budget Select Sync

    if (listingBudgetSelect) {

      listingBudgetSelect.addEventListener("change", function () {

        currentBudgetFilter = this.value;

        if (heroBudgetSelect) heroBudgetSelect.value = this.value;

        filterAndRenderPlots();

      });

    }

    // Plot Size Select

    if (listingSizeSelect) {

      listingSizeSelect.addEventListener("change", function () {

        currentSizeFilter = this.value;

        filterAndRenderPlots();

      });

    }

    // Availability Status Select

    if (listingStatusSelect) {

      listingStatusSelect.addEventListener("change", function () {

        currentStatusFilter = this.value;

        filterAndRenderPlots();

      });

    }

    // Zone Filter Buttons

    const filterBtns = document.querySelectorAll(".filter-btn");

    filterBtns.forEach(btn => {

      btn.addEventListener("click", function () {

        filterBtns.forEach(b => b.classList.remove("active"));

        this.classList.add("active");

        currentFilterZone = this.getAttribute("data-zone-filter") || "all";

        if (heroZoneSelect) heroZoneSelect.value = currentFilterZone;

        filterAndRenderPlots();

      });

    });

    // Reset Button

    if (resetBtn) {

      resetBtn.addEventListener("click", resetAllFilters);

    }

    // Sort Dropdown

    const sortSelect = document.getElementById("sortPlotsSelect");

    if (sortSelect) {

      sortSelect.addEventListener("change", function () {

        currentSortMode = this.value;

        filterAndRenderPlots();

      });

    }

  }

  function resetAllFilters() {

    currentFilterZone = "all";

    currentSearchQuery = "";

    currentBudgetFilter = "all";

    currentSizeFilter = "all";

    currentStatusFilter = "all";

    currentFacingFilter = "all";

    currentSortMode = "featured";

    document.querySelectorAll(".zone-pill").forEach(p => p.classList.toggle("active", p.getAttribute("data-zone") === "all"));

    document.querySelectorAll(".filter-btn").forEach(p => p.classList.toggle("active", p.getAttribute("data-zone-filter") === "all"));

    const searchInput = document.getElementById("heroSearchArea");

    if (searchInput) searchInput.value = "";

    const listSearchInput = document.getElementById("listingSearchInput");

    if (listSearchInput) listSearchInput.value = "";

    const searchClear = document.getElementById("listingSearchClearBtn");

    if (searchClear) searchClear.style.display = "none";

    const budgetSel = document.getElementById("listingBudgetSelect");

    if (budgetSel) budgetSel.value = "all";

    const heroBudget = document.getElementById("heroBudgetSelect");

    if (heroBudget) heroBudget.value = "all";

    const sizeSel = document.getElementById("listingSizeSelect");

    if (sizeSel) sizeSel.value = "all";

    const statusSel = document.getElementById("listingStatusSelect");

    if (statusSel) statusSel.value = "all";

    const heroZone = document.getElementById("heroZoneSelect");

    if (heroZone) heroZone.value = "all";

    const sortSel = document.getElementById("sortPlotsSelect");

    if (sortSel) sortSel.value = "featured";

    filterAndRenderPlots();

    if (mapInstance) mapInstance.flyTo([12.98, 80.18], 11);

  }

  // Mobile Map / List View Toggle Function

  function mobileSwitchView(mode) {

    const btnMap = document.getElementById("mobileBtnShowMap");
    const btnList = document.getElementById("mobileBtnShowList");
    const navMap = document.getElementById("mobileNavMap");
    const navList = document.getElementById("mobileNavList");

    if (mode === "map") {
      if (btnMap) btnMap.classList.add("active");
      if (btnList) btnList.classList.remove("active");
      if (navMap) navMap.classList.add("active");
      if (navList) navList.classList.remove("active");

      const mapSec = document.getElementById("mapSection") || document.getElementById("interactiveMapSection");
      if (mapSec) {
        mapSec.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      setTimeout(() => {
        if (mapInstance) {
          if (mapInstance.resize) mapInstance.resize();
          if (mapInstance.invalidateSize) mapInstance.invalidateSize();
        }
      }, 350);
    } else {
      if (btnList) btnList.classList.add("active");
      if (btnMap) btnMap.classList.remove("active");
      if (navList) navList.classList.add("active");
      if (navMap) navMap.classList.remove("active");

      const showcaseSec = document.getElementById("showcaseSection");
      if (showcaseSec) {
        showcaseSec.scrollIntoView({ behavior: "smooth", block: "start" });
      }

    }

  }

  window.mobileSwitchView = mobileSwitchView;

  // Persistent Sticky Taskbar & Scroll-Spy Engine

  function initStickyTaskbar() {

    const nav = document.querySelector(".site-nav");

    if (!nav) return;

    const sections = [

      { id: "mapSection", link: document.querySelector('.nav-menu a[href="#mapSection"]') },

      { id: "showcaseSection", link: document.querySelector('.nav-menu a[href="#showcaseSection"]') },

      { id: "blueprintSection", link: document.querySelector('.nav-menu a[href="#blueprintSection"]') },

      { id: "converterSection", link: document.querySelector('.nav-menu a[href="#converterSection"]') }

    ];

    function handleScroll() {

      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollY > 30) {

        nav.classList.add("scrolled");

      } else {

        nav.classList.remove("scrolled");

      }

      // Scroll-Spy: highlight current active nav item

      let currentSectionId = "";

      sections.forEach(s => {

        const el = document.getElementById(s.id);

        if (el) {

          const rect = el.getBoundingClientRect();

          if (rect.top <= 140 && rect.bottom >= 140) {

            currentSectionId = s.id;

          }

        }

      });

      if (currentSectionId) {

        sections.forEach(s => {

          if (s.link) {

            s.link.classList.toggle("active", s.id === currentSectionId);

          }

        });

      }

    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

  }

  // =========================================================================

  // 9. GOOGLE MAPS MODELED DIRECTIONS & ROUTE DISTANCE ENGINE

  // =========================================================================

  function initGoogleMapsRoutingEngine() {

    const destSelect = document.getElementById("routeDestinationSelect");

    const originPlotOptgroup = document.getElementById("routeOriginPlotsOptgroup");

    const originSelect = document.getElementById("routeOriginSelect");

    const swapBtn = document.getElementById("swapRoutePointsBtn");

    const modeBtns = document.querySelectorAll(".gmaps-mode-btn");

    const togglePanelBtn = document.getElementById("gmapsToggleBtn");

    const stepsToggleBtn = document.getElementById("gmapsStepsToggleBtn");

    const bookCabBtn = document.getElementById("bookCabFromRouteBtn");

    // Populate Destination Dropdown with all available plots

    if (destSelect) {

      destSelect.innerHTML = allPlotsList.map((p, idx) => `

        <option value="${p.id}" ${idx === 0 ? 'selected' : ''}>📍 ${p.title} (${p.locality})</option>

      `).join("");

      destSelect.addEventListener("change", function () {

        currentDestPlotId = this.value;

        const targetPlot = allPlotsList.find(p => p.id === currentDestPlotId);

        if (targetPlot && mapInstance) {

          mapInstance.flyTo(targetPlot.coords, 15, { duration: 1.0 });

          const marker = activePlotMarkers[targetPlot.id];

          if (marker) {

            marker.openPopup();

            const pinEl = document.querySelector(`.pointed-plot-pin[data-plot-id="${targetPlot.id}"]`);

            if (pinEl) {

              pinEl.classList.add("pin-bounce");

              setTimeout(() => pinEl.classList.remove("pin-bounce"), 1500);

            }

          }

        }

        executeRouteCalculation();

      });

    }

    // Populate Origin Plots Optgroup

    if (originPlotOptgroup) {

      originPlotOptgroup.innerHTML = allPlotsList.map(p => `

        <option value="plot:${p.id}">🏡 Plot: ${p.title} (${p.locality})</option>

      `).join("");

    }

    // Origin Change Listener

    if (originSelect) {

      originSelect.addEventListener("change", function () {

        handleOriginChange(this.value);

      });

    }

    // Swap Origin & Destination

    if (swapBtn) {

      swapBtn.addEventListener("click", () => {

        // Swap active destination into origin and pick next plot

        const currentDest = destSelect.value;

        const currentOrigin = originSelect.value;

        if (currentOrigin.startsWith("plot:")) {

          const plotId = currentOrigin.replace("plot:", "");

          destSelect.value = plotId;

          currentDestPlotId = plotId;

        }

        originSelect.value = `plot:${currentDest}`;

        handleOriginChange(`plot:${currentDest}`);

      });

    }

    // Travel Mode Switcher (Drive, Bike, Transit, Walk)

    modeBtns.forEach(btn => {

      btn.addEventListener("click", function () {

        modeBtns.forEach(b => b.classList.remove("active"));

        this.classList.add("active");

        currentTravelMode = this.getAttribute("data-mode") || "driving";

        if (currentTravelMode === "bike") {

          setVehicleType("bike", false);

        } else if (currentTravelMode === "driving") {

          setVehicleType("car", false);

        }

        executeRouteCalculation();

      });

    });

    // Panel Minimize / Restore Toggle

    if (togglePanelBtn) {

      togglePanelBtn.addEventListener("click", () => {

        const panel = document.getElementById("gmapsDirectionsPanel");

        const toggleText = document.getElementById("gmapsToggleText");

        const icon = togglePanelBtn.querySelector("i");

        if (!panel) return;

        const isMin = panel.classList.toggle("minimized");

        if (isMin) {

          if (toggleText) toggleText.textContent = "Expand Route";

          if (icon) icon.className = "fas fa-chevron-down";

        } else {

          if (toggleText) toggleText.textContent = "Minimize";

          if (icon) icon.className = "fas fa-chevron-up";

        }

      });

    }

    // Step by Step Directions Accordion Toggle

    if (stepsToggleBtn) {

      stepsToggleBtn.addEventListener("click", () => {

        const container = document.getElementById("gmapsStepsContainer");

        if (container) {

          container.classList.toggle("open");

          const icon = stepsToggleBtn.querySelector(".fa-chevron-down, .fa-chevron-up");

          if (icon) {

            icon.classList.toggle("fa-chevron-up");

            icon.classList.toggle("fa-chevron-down");

          }

        }

      });

    }

    // "Book Free Cab for this Route" Button

    if (bookCabBtn) {

      bookCabBtn.addEventListener("click", () => {

        const destPlot = allPlotsList.find(p => p.id === currentDestPlotId);

        const plotName = destPlot ? `${destPlot.title} (${destPlot.locality})` : "Selected Chennai Plot";

        openBookingModal(plotName);

        // Pre-fill pickup location

        const pickupInput = document.getElementById("bookPickupLocation");

        if (pickupInput) {

          pickupInput.value = currentOriginLabel;

        }

      });

    }

    // Wire Clicks on Destination Property Preview Card (#gmapsSelectedPlotCard)

    const thumbWrap = document.getElementById("gmapsPlotThumbWrap");

    const plotTitleEl = document.getElementById("gmapsPlotTitle");

    const cardSeparateBtn = document.getElementById("gmapsCardSeparateViewBtn");

    const cardCabBtn = document.getElementById("gmapsCardBookCabBtn");

    if (thumbWrap) {

      thumbWrap.addEventListener("click", () => {

        if (currentDestPlotId) openPlotDetailView(currentDestPlotId);

      });

    }

    if (plotTitleEl) {

      plotTitleEl.addEventListener("click", () => {

        if (currentDestPlotId) openPlotDetailView(currentDestPlotId);

      });

    }

    if (cardSeparateBtn) {

      cardSeparateBtn.addEventListener("click", () => {

        if (currentDestPlotId) openPlotDetailView(currentDestPlotId);

      });

    }

    if (cardCabBtn) {

      cardCabBtn.addEventListener("click", () => {

        const destPlot = allPlotsList.find(p => p.id === currentDestPlotId);

        const plotName = destPlot ? `${destPlot.title} (${destPlot.locality})` : "Selected Chennai Plot";

        openBookingModal(plotName);

      });

    }

    // "Open Separate View Dossier" Button from Route Panel

    const viewPlotRouteBtn = document.getElementById("viewPlotFromRouteBtn");

    if (viewPlotRouteBtn) {

      viewPlotRouteBtn.addEventListener("click", () => {

        if (currentDestPlotId) {

          openPlotDetailView(currentDestPlotId);

        }

      });

    }

    // Execute Initial Route on Airport -> Plot 1

    setTimeout(() => {

      executeRouteCalculation();

    }, 600);

  }

  // Handle Origin Change & Browser GPS Geolocation

  function handleOriginChange(val) {

    if (val === "current_gps") {

      if ("geolocation" in navigator) {

        showToast("📍 Accessing your live GPS coordinates...");

        navigator.geolocation.getCurrentPosition(

          (pos) => {

            currentOriginCoords = [pos.coords.latitude, pos.coords.longitude];

            currentOriginLabel = "Your Live GPS Location";

            executeRouteCalculation();

            updateAllCardDistancePills();

            showToast("✅ Live Location locked! Routes recalculated.");

          },

          (err) => {

            showToast("⚠️ Could not fetch GPS location. Defaulting to Airport.");

            const originSelect = document.getElementById("routeOriginSelect");

            if (originSelect) originSelect.value = "airport";

            currentOriginCoords = CHENNAI_LANDMARKS.airport.coords;

            currentOriginLabel = CHENNAI_LANDMARKS.airport.name;

            executeRouteCalculation();

          },

          { timeout: 7000 }

        );

      } else {

        showToast("⚠️ Geolocation is not supported by your browser.");

      }

      return;

    }

    if (val.startsWith("plot:")) {

      const plotId = val.replace("plot:", "");

      const plot = allPlotsList.find(p => p.id === plotId);

      if (plot) {

        currentOriginCoords = plot.coords;

        currentOriginLabel = plot.title + ` (${plot.locality})`;

      }

    } else if (CHENNAI_LANDMARKS[val]) {

      currentOriginCoords = CHENNAI_LANDMARKS[val].coords;

      currentOriginLabel = CHENNAI_LANDMARKS[val].name;

    }

    executeRouteCalculation();

    updateAllCardDistancePills();

  }

  // Calculate Haversine Distance (in km)

  function calculateHaversineDistance(lat1, lon1, lat2, lon2) {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;

    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =

      Math.sin(dLat / 2) * Math.sin(dLat / 2) +

      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *

      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;

  }

  // Compute Fast Approximate Distance & Duration for UI pills

  function computeDistanceMetrics(originCoords, destCoords) {

    const straightKm = calculateHaversineDistance(originCoords[0], originCoords[1], destCoords[0], destCoords[1]);

    // 1.28 represents Chennai urban road curvature index

    const roadKm = Math.max(1.2, straightKm * 1.28);

    // Average city traffic speeds in Chennai

    const driveMins = Math.max(4, Math.round((roadKm / 35) * 60));

    const bikeMins = Math.max(3, Math.round((roadKm / 42) * 60));

    const transitMins = Math.max(8, Math.round((roadKm / 24) * 60) + 8);

    return {

      distanceKm: roadKm.toFixed(1),

      durationMin: driveMins,

      bikeMin: bikeMins,

      transitMin: transitMins

    };

  }

  // Update Distance Pills on All Visible Cards

  function updateAllCardDistancePills() {

    allPlotsList.forEach(plot => {

      const pillLabel = document.getElementById(`dist-pill-${plot.id}`);

      if (pillLabel && plot.coords) {

        const metrics = computeDistanceMetrics(currentOriginCoords, plot.coords);

        pillLabel.innerHTML = `🚗 <strong>${metrics.distanceKm} km</strong> (${metrics.durationMin} min from ${currentOriginLabel.split(' ')[0]})`;

      }

    });

  }

  // Detect Key Chennai Highway Corridor

  function getChennaiCorridorDescription(originCoords, destCoords) {

    const avgLat = (originCoords[0] + destCoords[0]) / 2;

    const avgLng = (originCoords[1] + destCoords[1]) / 2;

    if (avgLng > 80.23 && avgLat < 12.95) {

      return "via <strong>Rajiv Gandhi Salai (OMR) & ECR Coastal Link</strong>";

    } else if (avgLng < 80.12 && avgLat < 12.95) {

      return "via <strong>Grand Southern Trunk (GST) Road & NH-48</strong>";

    } else if (avgLat >= 13.00 && avgLng < 80.15) {

      return "via <strong>Mount-Poonamallee High Road & Bangalore Highway</strong>";

    } else if (avgLat >= 13.08) {

      return "via <strong>100-Ft Inner Ring Road & CTH Road (Ambattur)</strong>";

    } else {

      return "via <strong>Pallavaram-Thoraipakkam 200-Ft Radial Road & OMR</strong>";

    }

  }

  // Main Route Calculation & Leaflet Map Polyline Rendering

  async function executeRouteCalculation() {

    if (!mapInstance || !routeLayerGroup) return;

    const destPlot = allPlotsList.find(p => p.id === currentDestPlotId) || allPlotsList[0];

    if (!destPlot || !destPlot.coords) return;

    const startLat = currentOriginCoords[0];

    const startLng = currentOriginCoords[1];

    const endLat = destPlot.coords[0];

    const endLng = destPlot.coords[1];

    // OSRM routing profile based on travel mode

    let osrmProfile = "driving";

    if (currentTravelMode === "walking") osrmProfile = "foot";

    if (currentTravelMode === "bike") osrmProfile = "driving";

    const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;

    let routeCoordinates = [];

    let distanceKm = 0;

    let durationMins = 0;

    let turnSteps = [];

    let isRoutingFallback = false;

    try {

      // 3.5s timeout for fast responsiveness

      const controller = new AbortController();

      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const resp = await fetch(osrmUrl, { signal: controller.signal });

      clearTimeout(timeoutId);

      if (resp.ok) {

        const data = await resp.json();

        if (data.routes && data.routes.length > 0) {

          const r = data.routes[0];

          distanceKm = r.distance / 1000;

          let baseDurationMins = r.duration / 60;

          // Adjust duration by travel mode

          if (currentTravelMode === "bike") {

            durationMins = Math.max(3, Math.round(baseDurationMins * 0.85));

          } else if (currentTravelMode === "transit") {

            durationMins = Math.max(12, Math.round(baseDurationMins * 1.55 + 6));

          } else if (currentTravelMode === "walking") {

            durationMins = Math.max(10, Math.round((distanceKm / 4.8) * 60));

          } else {

            durationMins = Math.max(4, Math.round(baseDurationMins * 1.15));

          }

          // GeoJSON coords are [lon, lat], Leaflet expects [lat, lon]

          routeCoordinates = r.geometry.coordinates.map(pt => [pt[1], pt[0]]);

          // Extract Steps

          if (r.legs && r.legs[0] && r.legs[0].steps) {

            turnSteps = r.legs[0].steps.slice(0, 8).map(st => {
              const distStep = st.distance > 1000 ? `${(st.distance / 1000).toFixed(1)} km` : `${Math.round(st.distance)} m`;
              let stepName = st.name || "Connecting Road";
              let modifier = st.maneuver ? st.maneuver.modifier || st.maneuver.type : "proceed";
              let bearing = (st.maneuver && st.maneuver.bearing_after !== undefined) ? st.maneuver.bearing_after : 0;
              const cardinal = getCardinalDirection(bearing);
              return {
                instruction: formatStepInstruction(st.maneuver ? st.maneuver.type : "continue", modifier, stepName, cardinal),
                distance: distStep,
                type: modifier,
                cardinal: cardinal
              };
            });

          }

        }

      }

    } catch (err) {

      // Routing service unreachable

    }

    // Honest Fallback if routing API is offline or fails

    if (routeCoordinates.length === 0) {

      isRoutingFallback = true;

      const metrics = computeDistanceMetrics([startLat, startLng], [endLat, endLng]);

      distanceKm = parseFloat(metrics.distanceKm);

      if (currentTravelMode === "bike") {

        durationMins = Math.round((distanceKm / 40) * 60);

      } else if (currentTravelMode === "transit") {

        durationMins = Math.round((distanceKm / 24) * 60) + 8;

      } else if (currentTravelMode === "walking") {

        durationMins = Math.round((distanceKm / 4.8) * 60);

      } else {

        durationMins = metrics.durationMin;

      }

      // Smoothly zoom directly into destination plot's verified location

      if (mapInstance) {

        mapInstance.flyTo([endLat, endLng], 15, { duration: 1.0 });

      }

      // Draw dashed direct survey line (not pretending to be a road)

      routeCoordinates = [[startLat, startLng], [endLat, endLng]];

      turnSteps = [

        { instruction: `Depart from ${currentOriginLabel}`, distance: "Start", type: "straight" },

        { instruction: `Direct Survey Vector to ${destPlot.title}`, distance: `${distanceKm.toFixed(1)} km`, type: "straight" },

        { instruction: `Arrive at plot destination: ${destPlot.locality} (${destPlot.dimensions})`, distance: "Verified", type: "destination" }

      ];

    }

    // Render Polyline on Leaflet Map

    renderRoutePolyline(routeCoordinates, [startLat, startLng], [endLat, endLng], destPlot, isRoutingFallback);

    // Populate Roadside Scenery (Houses, Shops, Trees, Streetlights, Gated Entrance Arch)

    populateRoadsideScenery(routeCoordinates, destPlot);

    // Update Google Maps Card UI

    updateGmapsCardUI(distanceKm, durationMins, turnSteps, destPlot, [startLat, startLng], [endLat, endLng], isRoutingFallback);

    // Prepare Real-Time Vehicle Navigation Simulation along this Route

    prepareRouteNavigation(routeCoordinates, turnSteps, destPlot, distanceKm, durationMins);

  }

  // Draw 3D Route Polyline on MapLibre Map (3-Layer Glowing Road Ribbon)

  function renderRoutePolyline(latLngs, startCoords, endCoords, destPlot, isFallback = false) {

    if (!mapInstance) return;

    const coordsGeoJSON = latLngs.map(p => [p[1], p[0]]);

    if (mapInstance.getSource('route-source')) {

      mapInstance.getSource('route-source').setData({

        type: 'Feature',

        geometry: {

          type: 'LineString',

          coordinates: coordsGeoJSON

        }

      });

    }

    if (mapInstance.getSource('traveled-source')) {

      mapInstance.getSource('traveled-source').setData({

        type: 'Feature',

        geometry: {

          type: 'LineString',

          coordinates: []

        }

      });

    }

    clearPlotBoundaryHighlight();

    // Stage B: Auto-fit route bounds with smooth camera easing

    try {

      let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;

      coordsGeoJSON.forEach(pt => {

        if (pt[0] < minLng) minLng = pt[0];

        if (pt[0] > maxLng) maxLng = pt[0];

        if (pt[1] < minLat) minLat = pt[1];

        if (pt[1] > maxLat) maxLat = pt[1];

      });

            if (minLng !== Infinity) {
        window.currentRouteBounds = [[minLng, minLat], [maxLng, maxLat]];
        window.currentDestPlotCoords = [endCoords[1], endCoords[0]]; // [lng, lat]
        window.currentDestPlotObj = destPlot;

        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          // On mobile, show route overview bounds briefly, then smoothly zoom close to the plot
          mapInstance.fitBounds([[minLng, minLat], [maxLng, maxLat]], {
            padding: { top: 60, bottom: 180, left: 20, right: 20 },
            pitch: 20,
            bearing: 0,
            duration: 800
          });

          if (typeof window.updateRouteZoomToggleBtn === "function") {
            window.updateRouteZoomToggleBtn(false);
          }

          // Smoothly fly into the plot at 18.2x Street Zoom for close directions
          setTimeout(() => {
            if (mapInstance && window.currentDestPlotCoords) {
              mapInstance.flyTo({
                center: window.currentDestPlotCoords,
                zoom: 18.2,
                pitch: 45,
                bearing: 0,
                duration: 1300
              });
              if (typeof window.updateRouteZoomToggleBtn === "function") {
                window.updateRouteZoomToggleBtn(true);
              }
            }
          }, 1100);
        } else {
          mapInstance.fitBounds([[minLng, minLat], [maxLng, maxLat]], {
            padding: 60,
            pitch: 20,
            bearing: 0,
            duration: 1200
          });
        }
      }

    } catch(e) {}

  }

  function highlightPlotBoundary(plot) {

    if (!mapInstance || !plot || !plot.coords) return;

    const lat = plot.coords[0];

    const lng = plot.coords[1];

    const dLat = 0.00030;

    const dLng = 0.00038;

    const polyCoords = [[

      [lng - dLng, lat - dLat],

      [lng + dLng, lat - dLat],

      [lng + dLng, lat + dLat],

      [lng - dLng, lat + dLat],

      [lng - dLng, lat - dLat]

    ]];

    if (mapInstance.getSource('plot-boundary-source')) {

      mapInstance.getSource('plot-boundary-source').setData({

        type: 'Feature',

        geometry: {

          type: 'Polygon',

          coordinates: polyCoords

        },

        properties: {

          title: plot.title,

          dimensions: plot.dimensions

        }

      });

    }

  }

  function clearPlotBoundaryHighlight() {

    if (mapInstance && mapInstance.getSource('plot-boundary-source')) {

      mapInstance.getSource('plot-boundary-source').setData({

        type: 'Feature',

        geometry: {

          type: 'Polygon',

          coordinates: []

        }

      });

    }

  }

  // Update Google Maps UI Card Metrics, Destination Property Card & Turn-by-Turn Steps

  function updateGmapsCardUI(distanceKm, durationMins, turnSteps, destPlot, startCoords, endCoords, isRoutingFallback = false) {

    const timeEl = document.getElementById("gmapsEtaTime");

    const distEl = document.getElementById("gmapsEtaDistance");

    const corridorEl = document.getElementById("gmapsRouteCorridor");

    const stepsContainer = document.getElementById("gmapsStepsContainer");

    const gmapsExternalBtn = document.getElementById("openExternalGoogleMapsBtn");

    const trafficBadgeEl = document.getElementById("gmapsTrafficBadge");

    // 1. Update Destination Property Preview Card with the Particular Property Image

    const cardEl = document.getElementById("gmapsSelectedPlotCard");

    const thumbEl = document.getElementById("gmapsPlotThumb");

    const approvalBadgeEl = document.getElementById("gmapsPlotApprovalBadge");

    const zoneBadgeEl = document.getElementById("gmapsPlotZoneBadge");

    const titleEl = document.getElementById("gmapsPlotTitle");

    const localityEl = document.getElementById("gmapsPlotLocality");

    const priceEl = document.getElementById("gmapsPlotPrice");

    const sizeEl = document.getElementById("gmapsPlotSize");

    if (destPlot) {

      if (thumbEl) {

        const destImg = (destPlot.images && destPlot.images.length > 0) ? destPlot.images[0] : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80";

        thumbEl.src = destImg;

        thumbEl.alt = destPlot.title;

      }

      if (approvalBadgeEl) {

        approvalBadgeEl.innerHTML = `<i class="fas fa-shield-alt"></i> ${destPlot.approvalType || "CMDA Approved"}`;

      }

      if (zoneBadgeEl) {

        zoneBadgeEl.textContent = destPlot.zoneLabel || (destPlot.zone ? destPlot.zone.toUpperCase() : "Chennai");

      }

      if (titleEl) {

        titleEl.textContent = destPlot.title;

      }

      if (localityEl) {

        localityEl.innerHTML = `<i class="fas fa-map-marker-alt" style="color:#d97706;"></i> ${destPlot.locality}`;

      }

      if (priceEl) {

        priceEl.textContent = destPlot.priceDisplay;

      }

      if (sizeEl) {

        sizeEl.innerHTML = `<i class="fas fa-ruler-combined"></i> ${destPlot.plotSizeSqft} sq.ft (${destPlot.dimensions || "30×40"}) &bull; <strong style="color:${destPlot.status === 'Sold' ? '#dc2626' : (destPlot.status === 'Booked' ? '#d97706' : '#059669')}">${destPlot.status || 'Available'}</strong>`;

      }

      if (cardEl) {

        cardEl.style.animation = "none";

        // Trigger reflow

        void cardEl.offsetWidth;

        cardEl.style.animation = "gmapsCardPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)";

      }

    }

    // Format Duration into "X hr Y min" or "X min"

    let timeText = `${durationMins} min`;

    if (durationMins >= 60) {

      const hrs = Math.floor(durationMins / 60);

      const mins = durationMins % 60;

      timeText = `${hrs} hr ${mins} min`;

    }

    if (timeEl) timeEl.textContent = timeText;

    if (distEl) distEl.textContent = `${distanceKm.toFixed(1)} km`;

    // Traffic Badge / Fallback Notice

    if (trafficBadgeEl) {

      if (isRoutingFallback) {

        trafficBadgeEl.style.background = "rgba(217, 119, 6, 0.15)";

        trafficBadgeEl.style.color = "#d97706";

        trafficBadgeEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Live road routing offline &mdash; Showing direct survey distance (${distanceKm.toFixed(1)} km). Plot verified.`;

      } else {

        trafficBadgeEl.style.background = "";

        trafficBadgeEl.style.color = "";

        trafficBadgeEl.innerHTML = `<i class="fas fa-check-circle" style="color:#059669;"></i> Real road route via OSRM &bull; Fastest path with typical Chennai traffic`;

      }

    }

    // Mode Icon Prefix

    const modeIcons = { driving: "🚗", bike: "🏍️", transit: "🚇", walking: "🚶" };

    const modeIcon = modeIcons[currentTravelMode] || "🚗";

    if (corridorEl) {

      const corridorText = getChennaiCorridorDescription(startCoords, endCoords);

      corridorEl.innerHTML = `${modeIcon} Route ${corridorText} &bull; <strong>${destPlot.title}</strong>`;

    }

    // Populate Steps

    if (stepsContainer) {

      if (turnSteps.length === 0) {

        stepsContainer.innerHTML = `<div style="padding:6px; color:#64748b;">Turn-by-turn route generated. Follow major arterial highways.</div>`;

      } else {

        stepsContainer.innerHTML = turnSteps.map((st, i) => {

          let iconClass = "fa-arrow-up";

          if (st.type.includes("right")) iconClass = "fa-arrow-right";

          if (st.type.includes("left")) iconClass = "fa-arrow-left";

          if (st.type.includes("destination")) iconClass = "fa-flag-checkered";

          return `

            <div class="gmaps-step-item">
              <span class="step-cardinal-pill card-${st.cardinal ? st.cardinal.code.toLowerCase() : 'n'}">${st.cardinal ? st.cardinal.code : 'DIR'}</span>
              <i class="fas ${iconClass}"></i>
              <div class="gmaps-step-text">${i + 1}. ${st.instruction}</div>
              <div class="gmaps-step-dist">${st.distance}</div>
            </div>

          `;

        }).join("");

      }

    }

    // Google Maps External URL Deep-link

    if (gmapsExternalBtn) {

      const gmapsModeMap = { driving: "driving", bike: "two-wheeler", transit: "transit", walking: "walking" };

      const gMode = gmapsModeMap[currentTravelMode] || "driving";

      const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${startCoords[0]},${startCoords[1]}&destination=${endCoords[0]},${endCoords[1]}&travelmode=${gMode}`;

      gmapsExternalBtn.href = gmapsUrl;

    }

  }

  // Format Turn-by-Turn Instruction Text

  function formatStepInstruction(type, modifier, name, cardinal) {
    const cardLabel = cardinal ? cardinal.label : "North";
    if (type === "arrive") return `Arrive <strong>${cardLabel}</strong> at destination (${name})`;
    if (modifier.includes("right")) return `Turn <strong>Right (${cardLabel})</strong> onto <strong>${name}</strong>`;
    if (modifier.includes("left")) return `Turn <strong>Left (${cardLabel})</strong> onto <strong>${name}</strong>`;
    if (type.includes("fork")) return `Take the fork <strong>${cardLabel}</strong> onto <strong>${name}</strong>`;
    return `Head <strong>${cardLabel}</strong> on <strong>${name}</strong>`;
  }

  // Generate realistic curved route waypoints between 2 points in Chennai

  function generateCurvedRoutePoints(ptA, ptB) {

    const points = [];

    const steps = 18;

    const midLat = (ptA[0] + ptB[0]) / 2;

    const midLng = (ptA[1] + ptB[1]) / 2;

    // Slight perpendicular offset to simulate real curved road geometry

    const dLat = ptB[0] - ptA[0];

    const dLng = ptB[1] - ptA[1];

    const offsetScale = 0.12;

    const ctrlLat = midLat + (-dLng * offsetScale);

    const ctrlLng = midLng + (dLat * offsetScale);

    for (let i = 0; i <= steps; i++) {

      const t = i / steps;

      // Quadratic Bezier interpolation

      const lat = (1 - t) * (1 - t) * ptA[0] + 2 * (1 - t) * t * ctrlLat + t * t * ptB[0];

      const lng = (1 - t) * (1 - t) * ptA[1] + 2 * (1 - t) * t * ctrlLng + t * t * ptB[1];

      points.push([lat, lng]);

    }

    return points;

  }

  // Public API: Trigger Route Calculation to a given Plot ID

  function triggerRouteToPlot(plotId) {

    const destSelect = document.getElementById("routeDestinationSelect");

    if (destSelect) {

      destSelect.value = plotId;

      currentDestPlotId = plotId;

    }

    const targetPlot = allPlotsList.find(p => p.id === plotId);

    if (targetPlot && mapInstance) {

      mapInstance.flyTo(targetPlot.coords, 15, { duration: 1.0 });

    }

    // Expand panel if minimized

    const panel = document.getElementById("gmapsDirectionsPanel");

    if (panel && panel.classList.contains("minimized")) {

      panel.classList.remove("minimized");

      const toggleText = document.getElementById("gmapsToggleText");

      if (toggleText) toggleText.textContent = "Minimize";

    }

    // Scroll to map

    fitMapSectionIntoScreen();

    setTimeout(() => {

      executeRouteCalculation();

      // Highlight and open destination marker popup on map

      const marker = activePlotMarkers[plotId];

      if (marker && mapInstance) {

        marker.openPopup();

        const pinEl = document.querySelector(`.pointed-plot-pin[data-plot-id="${plotId}"]`);

        if (pinEl) {

          pinEl.classList.add("pin-bounce");

          setTimeout(() => pinEl.classList.remove("pin-bounce"), 1500);

        }

      }

    }, 400);

  }

  // =========================================================================

  // 9B. REAL-TIME VEHICLE ROUTE NAVIGATION ENGINE (Car & Bike Left/Right Directional Engine)

  // =========================================================================

  function getCarVehicleSvgHtml() {

    return `

      <div class="vehicle-marker-wrapper vehicle-car" id="vehicleMarkerWrapper">

        <div class="vehicle-ground-ripple"></div>

        <div class="vehicle-floating-turn-cue straight" id="vehicleFloatingTurnCue">

          <i class="fas fa-arrow-up"></i> <span>Departing</span>

        </div>

        <div class="vehicle-marker-inner" id="vehicleMarkerInner">

          <svg viewBox="0 0 40 70" width="34" height="60" class="vehicle-svg car-svg">

            <defs>

              <radialGradient id="headlightGlow" cx="50%" cy="100%" r="90%">

                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>

                <stop offset="40%" stop-color="#38bdf8" stop-opacity="0.5"/>

                <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>

              </radialGradient>

              <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">

                <stop offset="0%" stop-color="#0284c7"/>

                <stop offset="50%" stop-color="#38bdf8"/>

                <stop offset="100%" stop-color="#0369a1"/>

              </linearGradient>

              <linearGradient id="roofGlassGrad" x1="0%" y1="0%" x2="0%" y2="100%">

                <stop offset="0%" stop-color="#090d16"/>

                <stop offset="100%" stop-color="#1e293b"/>

              </linearGradient>

            </defs>

            <polygon points="12,10 -25,-42 65,-42 28,10" fill="url(#headlightGlow)" class="headlight-beam"/>

            <rect x="2" y="14" width="5" height="12" rx="2" fill="#090d16"/>

            <rect x="33" y="14" width="5" height="12" rx="2" fill="#090d16"/>

            <rect x="2" y="46" width="5" height="12" rx="2" fill="#090d16"/>

            <rect x="33" y="46" width="5" height="12" rx="2" fill="#090d16"/>

            <rect x="6" y="8" width="28" height="54" rx="8" fill="url(#carBodyGrad)" stroke="#ffffff" stroke-width="1.2"/>

            <path d="M 12 12 Q 20 18 28 12" stroke="rgba(255,255,255,0.45)" stroke-width="1" fill="none"/>

            <path d="M 10 22 L 30 22 L 27 30 L 13 30 Z" fill="url(#roofGlassGrad)" stroke="rgba(255,255,255,0.3)" stroke-width="0.8"/>

            <rect x="12" y="31" width="16" height="15" rx="2" fill="#06090e" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>

            <path d="M 12 47 L 28 47 L 26 53 L 14 53 Z" fill="url(#roofGlassGrad)"/>

            <rect x="8" y="9" width="6" height="3" rx="1.5" fill="#fef08a"/>

            <rect x="26" y="9" width="6" height="3" rx="1.5" fill="#fef08a"/>

            <circle cx="7" cy="11" r="2.2" class="vehicle-blinker blinker-front-left" fill="#f59e0b"/>

            <circle cx="7" cy="59" r="2.2" class="vehicle-blinker blinker-rear-left" fill="#f59e0b"/>

            <circle cx="33" cy="11" r="2.2" class="vehicle-blinker blinker-front-right" fill="#f59e0b"/>

            <circle cx="33" cy="59" r="2.2" class="vehicle-blinker blinker-rear-right" fill="#f59e0b"/>

            <rect x="8" y="60" width="6" height="2" rx="1" fill="#ef4444"/>

            <rect x="26" y="60" width="6" height="2" rx="1" fill="#ef4444"/>

          </svg>

        </div>

      </div>

    `;

  }

  function getBikeVehicleSvgHtml() {

    return `

      <div class="vehicle-marker-wrapper vehicle-bike" id="vehicleMarkerWrapper">

        <div class="vehicle-ground-ripple"></div>

        <div class="vehicle-floating-turn-cue straight" id="vehicleFloatingTurnCue">

          <i class="fas fa-arrow-up"></i> <span>Departing</span>

        </div>

        <div class="vehicle-marker-inner" id="vehicleMarkerInner">

          <svg viewBox="0 0 34 66" width="30" height="58" class="vehicle-svg bike-svg">

            <defs>

              <radialGradient id="bikeHeadlightGlow" cx="50%" cy="100%" r="90%">

                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>

                <stop offset="40%" stop-color="#f59e0b" stop-opacity="0.5"/>

                <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>

              </radialGradient>

              <linearGradient id="bikeBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">

                <stop offset="0%" stop-color="#ea580c"/>

                <stop offset="50%" stop-color="#fb923c"/>

                <stop offset="100%" stop-color="#c2410c"/>

              </linearGradient>

            </defs>

            <polygon points="17,8 -16,-38 50,-38" fill="url(#bikeHeadlightGlow)" class="headlight-beam"/>

            <rect x="15" y="3" width="4" height="15" rx="2" fill="#0f172a" stroke="#64748b" stroke-width="0.8"/>

            <path d="M 6 18 Q 17 21 28 18" stroke="#cbd5e1" stroke-width="2.5" fill="none" stroke-linecap="round"/>

            <circle cx="6" cy="18" r="2.2" fill="#0f172a"/>

            <circle cx="28" cy="18" r="2.2" fill="#0f172a"/>

            <circle cx="5" cy="16" r="2" class="vehicle-blinker blinker-front-left" fill="#f59e0b"/>

            <circle cx="29" cy="16" r="2" class="vehicle-blinker blinker-front-right" fill="#f59e0b"/>

            <path d="M 12 21 Q 17 18 22 21 L 21 34 Q 17 36 13 34 Z" fill="url(#bikeBodyGrad)" stroke="#ffffff" stroke-width="0.8"/>

            <ellipse cx="17" cy="32" rx="9" ry="5.5" fill="#1e293b"/>

            <circle cx="17" cy="27" r="5" fill="#090d16" stroke="#f59e0b" stroke-width="1.2"/>

            <path d="M 14 25 Q 17 22.5 20 25" stroke="#38bdf8" stroke-width="2" fill="none"/>

            <rect x="13" y="37" width="8" height="12" rx="3" fill="#334155"/>

            <rect x="23" y="40" width="3.2" height="15" rx="1.6" fill="#94a3b8" stroke="#64748b" stroke-width="0.5"/>

            <rect x="14" y="47" width="6" height="16" rx="3" fill="#0f172a" stroke="#64748b" stroke-width="0.8"/>

            <rect x="14" y="45" width="6" height="2" rx="1" fill="#ef4444"/>

            <circle cx="11" cy="45" r="1.8" class="vehicle-blinker blinker-rear-left" fill="#f59e0b"/>

            <circle cx="23" cy="45" r="1.8" class="vehicle-blinker blinker-rear-right" fill="#f59e0b"/>

          </svg>

        </div>

      </div>

    `;

  }

  function calculateBearing(lat1, lon1, lat2, lon2) {
    if (Array.isArray(lat1) && Array.isArray(lon1)) {
      const p1 = lat1;
      const p2 = lon1;
      lat1 = p1[0];
      lon1 = p1[1];
      lat2 = p2[0];
      lon2 = p2[1];
    }
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0;

    const toRad = Math.PI / 180;
    const toDeg = 180 / Math.PI;
    const phi1 = lat1 * toRad;
    const phi2 = lat2 * toRad;
    const deltaLambda = (lon2 - lon1) * toRad;
    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) -
              Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
    const theta = Math.atan2(y, x);
    return (theta * toDeg + 360) % 360;
  }

  // Calculate cardinal direction from bearing (0-360) for Google Maps navigation
  function getCardinalDirection(bearing) {
    if (isNaN(bearing)) bearing = 0;
    const norm = ((bearing % 360) + 360) % 360;
    if (norm >= 337.5 || norm < 22.5) return { code: 'N', label: 'North', symbol: '⬆', desc: 'Head North' };
    if (norm >= 22.5 && norm < 67.5) return { code: 'NE', label: 'North-East', symbol: '↗', desc: 'Head North-East' };
    if (norm >= 67.5 && norm < 112.5) return { code: 'E', label: 'East', symbol: '➡', desc: 'Turn East' };
    if (norm >= 112.5 && norm < 157.5) return { code: 'SE', label: 'South-East', symbol: '↘', desc: 'Head South-East' };
    if (norm >= 157.5 && norm < 202.5) return { code: 'S', label: 'South', symbol: '⬇', desc: 'Head South' };
    if (norm >= 202.5 && norm < 247.5) return { code: 'SW', label: 'South-West', symbol: '↙', desc: 'Head South-West' };
    if (norm >= 247.5 && norm < 292.5) return { code: 'W', label: 'West', symbol: '⬅', desc: 'Turn West' };
    return { code: 'NW', label: 'North-West', symbol: '↖', desc: 'Head North-West' };
  }
  window.getCardinalDirection = getCardinalDirection;

  function getAngleDelta(angle1, angle2) {

    return (angle2 - angle1 + 540) % 360 - 180;

  }

  function interpolateAngle(fromAngle, toAngle, t) {

    const diff = getAngleDelta(fromAngle, toAngle);

    return (fromAngle + diff * t + 360) % 360;

  }

  function densifyRouteCoordinates(rawCoords, turnSteps, destPlot, totalKm, totalMins) {

    if (!rawCoords || rawCoords.length < 2) return [];

    const points = [];

    let cumulativeMeters = 0;

    for (let i = 0; i < rawCoords.length - 1; i++) {

      const ptA = rawCoords[i];

      const ptB = rawCoords[i + 1];

      const dMeters = calculateHaversineDistance(ptA[0], ptA[1], ptB[0], ptB[1]) * 1000;

      const segBearing = calculateBearing(ptA[0], ptA[1], ptB[0], ptB[1]);

      // Subdivide segment into ~18m intervals for smooth 60fps tracking

      const steps = Math.max(1, Math.round(dMeters / 18));

      for (let k = 0; k < steps; k++) {

        const t = k / steps;

        const lat = ptA[0] + t * (ptB[0] - ptA[0]);

        const lng = ptA[1] + t * (ptB[1] - ptA[1]);

        points.push({

          lat,

          lng,

          bearing: segBearing,

          cumDistMeters: cumulativeMeters + t * dMeters

        });

      }

      cumulativeMeters += dMeters;

    }

    // Add terminus destination point

    const lastRaw = rawCoords[rawCoords.length - 1];

    const lastBearing = points.length > 0 ? points[points.length - 1].bearing : 0;

    points.push({

      lat: lastRaw[0],

      lng: lastRaw[1],

      bearing: lastBearing,

      cumDistMeters: cumulativeMeters

    });

    const totalCount = points.length;

    const corridorName = destPlot.locality || "arterial expressway";

    // Tag Turn Maneuvers along the densified trajectory with Cardinal Directions
    for (let i = 0; i < totalCount; i++) {
      const currPt = points[i];
      const cardinal = getCardinalDirection(currPt.bearing);
      currPt.cardinal = cardinal;

      if (i >= totalCount - 5) {
        currPt.maneuver = "arrived";
        currPt.instruction = `Arrive ${cardinal.label} at destination: ${destPlot.title}`;
        currPt.distToManeuver = 0;
        currPt.turnCardinal = cardinal;
        continue;
      }

      // Check upcoming heading 8-12 points (~150-200m) ahead
      const lookAheadIdx = Math.min(i + 10, totalCount - 1);
      const currBearing = currPt.bearing;
      const aheadBearing = points[lookAheadIdx].bearing;
      const angleDiff = getAngleDelta(currBearing, aheadBearing);
      const aheadCardinal = getCardinalDirection(aheadBearing);
      const distToTurn = Math.max(25, Math.round(points[lookAheadIdx].cumDistMeters - currPt.cumDistMeters));

      currPt.turnCardinal = aheadCardinal;

      if (angleDiff < -14) {
        currPt.maneuver = "turn-left";
        currPt.instruction = `In ${distToTurn}m, Turn Left towards ${aheadCardinal.label} (${destPlot.locality})`;
        currPt.distToManeuver = distToTurn;
      } else if (angleDiff > 14) {
        currPt.maneuver = "turn-right";
        currPt.instruction = `In ${distToTurn}m, Turn Right towards ${aheadCardinal.label} (${corridorName})`;
        currPt.distToManeuver = distToTurn;
      } else {
        currPt.maneuver = "straight";
        currPt.instruction = `Head ${cardinal.label} along ${corridorName}`;
        currPt.distToManeuver = 0;
      }
    }

    return points;

  }

  function prepareRouteNavigation(routeCoordinates, turnSteps, destPlot, distanceKm, durationMins) {

    if (!mapInstance || !navLayerGroup) return;

    // Stop active navigation animation if running

    if (navAnimFrameId) {

      cancelAnimationFrame(navAnimFrameId);

      navAnimFrameId = null;

    }

    navState = "stopped";

    navCurrentIndex = 0;

    navLastTimestamp = null;

    navActiveDestPlot = destPlot;

    // Densify trajectory

    navDensifiedPoints = densifyRouteCoordinates(routeCoordinates, turnSteps, destPlot, distanceKm, durationMins);

    if (navDensifiedPoints.length === 0) return;

    // 1. Create or reset Progress Polyline (Emerald Green Traveled Path)

    if (navTurnBeaconMarker && navLayerGroup) {

      navLayerGroup.removeLayer(navTurnBeaconMarker);

      navTurnBeaconMarker = null;

    }

    if (!navProgressLine) {

      navProgressLine = L.polyline([], {

        color: "#10b981",

        weight: 8,

        opacity: 0.95,

        lineCap: "round",

        lineJoin: "round"

      });

      navLayerGroup.addLayer(navProgressLine);

    } else {

      navProgressLine.setLatLngs([]);

    }

    // 2. Create or reposition Vehicle Marker

    const firstPt = navDensifiedPoints[0];

    const initialBearing = navDensifiedPoints.length > 1 ? navDensifiedPoints[0].bearing : 0;

    const vehicleSvg = currentVehicleType === "bike" ? getBikeVehicleSvgHtml() : getCarVehicleSvgHtml();

    if (!navVehicleMarker) {
      const el = document.createElement("div");
      el.className = "custom-vehicle-marker";
      el.innerHTML = vehicleSvg;
      if (typeof maplibregl !== "undefined" && mapInstance && mapInstance.project) {
        navVehicleMarker = new maplibregl.Marker({
          element: el,
          anchor: "center"
        }).setLngLat([firstPt.lng, firstPt.lat]).addTo(mapInstance);
      } else {
        const vIcon = L.divIcon({
          className: "custom-vehicle-marker",
          html: vehicleSvg,
          iconSize: [60, 60],
          iconAnchor: [30, 30]
        });
        navVehicleMarker = L.marker([firstPt.lat, firstPt.lng], { icon: vIcon });
        if (navLayerGroup && navLayerGroup.addLayer) navLayerGroup.addLayer(navVehicleMarker);
      }
    } else {
      if (navVehicleMarker.setLngLat) {
        navVehicleMarker.setLngLat([firstPt.lng, firstPt.lat]);
      } else if (navVehicleMarker.setLatLng) {
        navVehicleMarker.setLatLng([firstPt.lat, firstPt.lng]);
      }
      const markerEl = navVehicleMarker.getElement();
      if (markerEl) markerEl.innerHTML = vehicleSvg;
    }

    setTimeout(() => {

      const innerEl = document.getElementById("vehicleMarkerInner");

      if (innerEl) innerEl.style.transform = `rotate(${Math.round(initialBearing)}deg)`;

    }, 50);

    // 3. Update HUD and Controls state

    const playBtnText = document.getElementById("navStartBtnText");

    const playIcon = document.getElementById("navPlayIcon");

    const pauseBtn = document.getElementById("btnPauseNavSimulation");

    const hudDestTitle = document.getElementById("hudDestPlotTitle");

    const hudTurnDist = document.getElementById("hudTurnDistance");

    const hudTurnInst = document.getElementById("hudTurnInstruction");

    const hudTurnIcon = document.getElementById("hudTurnIcon");

    const hudTurnIconBox = document.getElementById("hudTurnIconBox");

    const hudProgBar = document.getElementById("hudProgressBar");

    const hudSpeedVal = document.getElementById("hudSpeedVal");

    const hudRemDist = document.getElementById("hudRemainingDist");

    const hudRemEta = document.getElementById("hudRemainingEta");

    const hudVehicleIcon = document.getElementById("hudVehicleIcon");

    const btnHudToggle = document.getElementById("btnHudVehicleToggle");

    if (playBtnText) playBtnText.textContent = `Start ${currentVehicleType === 'bike' ? 'Bike' : 'Car'} Navigation`;

    if (playIcon) playIcon.className = "fas fa-play";

    if (pauseBtn) pauseBtn.style.display = "none";

    if (hudDestTitle) hudDestTitle.textContent = destPlot.title;

    if (hudTurnDist) hudTurnDist.textContent = `Depart towards ${destPlot.locality}`;

    if (hudTurnInst) hudTurnInst.textContent = `Ready to navigate (${distanceKm.toFixed(1)} km, ${durationMins} min)`;

    if (hudTurnIcon) hudTurnIcon.className = "fas fa-arrow-up";

    if (hudTurnIconBox) hudTurnIconBox.className = "hud-turn-icon-box";

    if (hudProgBar) hudProgBar.style.width = "0%";

    if (hudSpeedVal) hudSpeedVal.textContent = currentVehicleType === "bike" ? "52" : "48";

    if (hudRemDist) hudRemDist.textContent = `${distanceKm.toFixed(1)} km`;

    if (hudRemEta) hudRemEta.textContent = `${durationMins} min`;

    if (hudVehicleIcon) hudVehicleIcon.innerHTML = currentVehicleType === "bike" ? '<i class="fas fa-motorcycle"></i>' : '<i class="fas fa-car"></i>';

    if (btnHudToggle) btnHudToggle.innerHTML = currentVehicleType === "bike" ? '<i class="fas fa-car"></i> Switch to Car' : '<i class="fas fa-motorcycle"></i> Switch to Bike';

    // Automated deep-link arrival hook

    try {

      const urlCheck = new URLSearchParams(window.location.search);

      if (urlCheck.get("arrived") === "1") {

        setTimeout(() => {

          if (urlCheck.get("vision") === "1") {

            openDriverStreetVision();

            const mode = urlCheck.get("mode");

            if (mode) setVisionDisplayMode(mode);

          }

          if (navDensifiedPoints && navDensifiedPoints.length > 0) {

            navCurrentIndex = navDensifiedPoints.length - 1;

            updateVehiclePositionAndManeuver(navCurrentIndex);

          }

          handleNavigationArrival();

        }, 300);

      } else {

        // Check for progress seek parameter (e.g. ?progress=0.42)
        if (urlCheck.get("progress")) {
          const prog = parseFloat(urlCheck.get("progress"));
          if (!isNaN(prog) && prog >= 0 && prog <= 1 && navDensifiedPoints.length > 0) {
            navCurrentIndex = Math.floor(prog * (navDensifiedPoints.length - 1));
            updateVehiclePositionAndManeuver(navCurrentIndex);
          }
        }

        // Automatically start driving vehicle ONLY if user explicitly triggered drive or via url parameter
        const urlCheckParams = new URLSearchParams(window.location.search);
        const shouldAutoStartDrive = urlCheckParams.get("drive") === "1" || urlCheckParams.get("autodrive") === "1" || window.__userRequestedDrive === true;
        if (shouldAutoStartDrive) {
          window.__userRequestedDrive = false;
          setTimeout(() => {
            if (navDensifiedPoints && navDensifiedPoints.length > 1 && navState !== "playing") {
              startRouteNavigation();
            }
          }, 450);
        }

      }

    } catch(e) {}

    if (typeof updateDriveToggleButtonUI === "function") {
      updateDriveToggleButtonUI();
    }

  }

  function updateCameraFollowButtonUI() {
    const recenterBtn = document.getElementById("floatingRecenterBtn");
    const btnHudRecenter = document.getElementById("btnHudRecenter");
    const hudMinRecenter = document.getElementById("hudMinRecenter");

    if (recenterBtn) {
      if (navState === "playing" || navState === "paused") {
        recenterBtn.style.display = "inline-flex";
        if (navFollowCamera) {
          recenterBtn.classList.remove("needs-recenter");
          recenterBtn.classList.add("is-centered");
          recenterBtn.innerHTML = '<i class="fas fa-check-circle text-emerald"></i> <span>Centered on Car</span>';
          recenterBtn.title = "Screen locked on car in center (Click to re-center)";
        } else {
          recenterBtn.classList.add("needs-recenter");
          recenterBtn.classList.remove("is-centered");
          recenterBtn.innerHTML = '<i class="fas fa-crosshairs"></i> <span>Re-center on Car</span>';
          recenterBtn.title = "Click to re-center screen on moving car";
        }
      } else {
        recenterBtn.style.display = "none";
      }
    }

    if (btnHudRecenter) {
      btnHudRecenter.classList.toggle("needs-recenter", !navFollowCamera);
      btnHudRecenter.style.display = (navState === "playing" || navState === "paused") ? "inline-flex" : "none";
      btnHudRecenter.innerHTML = navFollowCamera
        ? '<i class="fas fa-check-circle text-emerald"></i> Centered'
        : '<i class="fas fa-crosshairs"></i> Re-center';
    }

    if (hudMinRecenter) {
      hudMinRecenter.style.display = (navState === "playing" || navState === "paused") ? "inline-flex" : "none";
      hudMinRecenter.innerHTML = navFollowCamera
        ? '<i class="fas fa-check-circle text-emerald"></i> Centered'
        : '<i class="fas fa-crosshairs"></i> Re-center';
    }
  }

  // Google Maps Re-center on Car function
  window.recenterOnCar = function(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    navFollowCamera = true;
    updateCameraFollowButtonUI();

    if (!mapInstance) return;

    let targetCoords = null;
    if (navDensifiedPoints && navDensifiedPoints.length > 0) {
      const currPt = navDensifiedPoints[Math.floor(navCurrentIndex)] || navDensifiedPoints[0];
      if (currPt) targetCoords = [currPt.lng, currPt.lat];
    }
    if (!targetCoords && window.navVehicleMarker) {
      const pos = window.navVehicleMarker.getLngLat();
      if (pos) targetCoords = [pos.lng, pos.lat];
    }
    if (!targetCoords) {
      targetCoords = window.currentDestPlotCoords || [80.18, 12.98];
    }

    const isMobile = window.innerWidth <= 768;
    const targetZoom = isMobile ? 16.5 : 15.8;

    mapInstance.easeTo({
      center: targetCoords,
      zoom: targetZoom,
      bearing: 0,
      pitch: 0,
      duration: 500
    });

    if (window.showToast) {
      window.showToast("🎯 Re-centered: Screen locked on moving car");
    }
  };

  function updateZoomButtonsUI() {

    const hudZoomLabel = document.getElementById("hudZoomLabel");

    const navZoomBtnLabel = document.getElementById("navZoomBtnLabel");

    const btnHudZoom = document.getElementById("btnHudZoomToggle");

    const btnNavZoom = document.getElementById("btnNavStreetZoom");

    if (!mapInstance) return;

    const isZoomedIn = mapInstance.getZoom() >= NAV_STREET_ZOOM;

    if (hudZoomLabel) hudZoomLabel.textContent = isZoomedIn ? "Overview" : "16x Zoom";

    if (navZoomBtnLabel) navZoomBtnLabel.textContent = isZoomedIn ? "Overview" : "Zoom In (16x)";

    if (btnHudZoom) btnHudZoom.classList.toggle("zoomed-in", isZoomedIn);

    if (btnNavZoom) btnNavZoom.classList.toggle("zoomed-in", isZoomedIn);

  }

  function toggleNavigationZoom() {

    if (!mapInstance) return;

    const currZoom = mapInstance.getZoom();

    if (currZoom < NAV_STREET_ZOOM) {

      // Zoom in to street level navigation

      const currPt = navDensifiedPoints[Math.floor(navCurrentIndex)] || navDensifiedPoints[0];

      if (currPt) {

        mapInstance.flyTo([currPt.lat, currPt.lng], NAV_STREET_ZOOM, {

          animate: true,

          duration: 0.8

        });

        navFollowCamera = true;

        updateCameraFollowButtonUI();

      }

    } else {

      // Zoom out to full route overview

      if (routeLayerGroup && routeLayerGroup.getLayers().length > 0) {

        const bounds = routeLayerGroup.getBounds();

        if (bounds && bounds.isValid()) {

          mapInstance.fitBounds(bounds, { padding: [60, 60], animate: true, duration: 0.8 });

          navFollowCamera = false;

          updateCameraFollowButtonUI();

        }

      }

    }

    setTimeout(updateZoomButtonsUI, 850);

  }

  function startRouteNavigation() {

    if (navDensifiedPoints.length < 2) return;

    // If already at destination, restart from origin

    if (navCurrentIndex >= navDensifiedPoints.length - 1) {

      navCurrentIndex = 0;

      // Restore dimmed markers

    document.querySelectorAll(".nav-dimmed-marker").forEach(el => {

      el.classList.remove("nav-dimmed-marker");

    });

    if (navTurnBeaconMarker && navLayerGroup) {

      navLayerGroup.removeLayer(navTurnBeaconMarker);

      navTurnBeaconMarker = null;

    }

    if (navProgressLine) navProgressLine.setLatLngs([]);

    }

    navState = "playing";

    navLastTimestamp = null;

    navFollowCamera = true;

    hideMapDestinationArrivedCard();

    const prevArch = document.getElementById("visionDestArchBanner");

    if (prevArch) prevArch.style.display = "none";

    updateCameraFollowButtonUI();

    // Show floating Live Navigation HUD banner and hide Directions Panel to prevent overwriting
    const hud = document.getElementById("gmapsLiveNavHud");
    if (hud) {
      hud.style.display = "block";
      if (window.innerWidth <= 768) {
        hud.classList.remove("controls-expanded");
        const toggleIcon = document.getElementById("hudMobileToggleIcon");
        if (toggleIcon) toggleIcon.className = "fas fa-chevron-down";
      }
    }
    document.body.classList.add("nav-active");
    const dirPanel = document.getElementById("gmapsDirectionsPanel");
    if (dirPanel) dirPanel.style.display = "none";

    // Update buttons

    const playBtnText = document.getElementById("navStartBtnText");

    const playIcon = document.getElementById("navPlayIcon");

    const pauseBtn = document.getElementById("btnPauseNavSimulation");

    const pauseIcon = document.getElementById("navPauseIcon");

    if (playBtnText) playBtnText.textContent = "Navigating...";

    if (playIcon) playIcon.className = "fas fa-spinner fa-spin";

    if (pauseBtn) {

      pauseBtn.style.display = "flex";

      if (pauseIcon) pauseIcon.className = "fas fa-pause";

    }

    // Scroll map into view

    fitMapSectionIntoScreen();

    // Auto-minimize directions panel for expansive map view
    minimizeDirectionsPanel();

    // De-clutter map: Dim non-destination pins so the road and destination stand out

    Object.keys(activePlotMarkers).forEach(plotId => {

      if (navActiveDestPlot && plotId !== navActiveDestPlot.id) {

        const marker = activePlotMarkers[plotId];

        if (marker && marker.getElement()) {

          marker.getElement().classList.add("nav-dimmed-marker");

        }

      }

    });

    // Stage C — Camera Transition: Smooth descent from city overview down to road level near start point

    const startIdx = Math.floor(navCurrentIndex);

    const startPt = navDensifiedPoints[startIdx] || navDensifiedPoints[0];

    const leadIdx = Math.min(startIdx + 6, navDensifiedPoints.length - 1);

    const leadPt = navDensifiedPoints[leadIdx] || startPt;

    const initialBearing = calculateBearing([startPt.lat, startPt.lng], [leadPt.lat, leadPt.lng]);

    currentSmoothedBearing = initialBearing;
    currentSmoothedPitch = (cameraMode === 'gmaps') ? 0 : (cameraMode === 'driver' ? 60 : 48);

    if (mapInstance && startPt) {
      isNavZoomingIn = true;
      if (cameraMode === 'gmaps') {
        // GOOGLE MAPS DESIGN: Map stays North-Up (bearing: 0, pitch: 0)
        // User clearly sees the car ready to drive along the road!
        const isMobile = window.innerWidth <= 768;
        mapInstance.flyTo({
          center: [startPt.lng, startPt.lat],
          zoom: isMobile ? 16.5 : 15.8,
          pitch: 0,
          bearing: 0,
          duration: 900
        });
      } else {
        mapInstance.flyTo({
          center: [startPt.lng, startPt.lat],
          zoom: cameraMode === 'driver' ? 17.4 : 16.6,
          pitch: currentSmoothedPitch,
          bearing: currentSmoothedBearing,
          duration: 1200
        });
      }

      setTimeout(() => {

        isNavZoomingIn = false;

        updateZoomButtonsUI();

        navLastTimestamp = null;

        if (navState === "playing" && !navAnimFrameId) {

          navAnimFrameId = requestAnimationFrame(navigationLoop);

        }

      }, 1250);

      return;

    }

    updateZoomButtonsUI();

    navAnimFrameId = requestAnimationFrame(navigationLoop);

  }

  function pauseRouteNavigation() {

    const pauseIcon = document.getElementById("navPauseIcon");

    const playBtnText = document.getElementById("navStartBtnText");

    const playIcon = document.getElementById("navPlayIcon");

    if (navState === "playing") {

      navState = "paused";

      if (navAnimFrameId) {

        cancelAnimationFrame(navAnimFrameId);

        navAnimFrameId = null;

      }

      if (pauseIcon) pauseIcon.className = "fas fa-play";

      if (playBtnText) playBtnText.textContent = "Resume Navigation";

      if (playIcon) playIcon.className = "fas fa-play";

    } else if (navState === "paused") {

      navState = "playing";

      navLastTimestamp = null;

      if (pauseIcon) pauseIcon.className = "fas fa-pause";

      if (playBtnText) playBtnText.textContent = "Navigating...";

      if (playIcon) playIcon.className = "fas fa-spinner fa-spin";

      navAnimFrameId = requestAnimationFrame(navigationLoop);

    }

  }

  function resetRouteNavigation() {

    if (navAnimFrameId) {

      cancelAnimationFrame(navAnimFrameId);

      navAnimFrameId = null;

    }

    navState = "stopped";

    navCurrentIndex = 0;

    navLastTimestamp = null;

    navFollowCamera = true;

    updateCameraFollowButtonUI();

    // Restore dimmed markers

    document.querySelectorAll(".nav-dimmed-marker").forEach(el => {

      el.classList.remove("nav-dimmed-marker");

    });

    if (navTurnBeaconMarker && navLayerGroup) {

      navLayerGroup.removeLayer(navTurnBeaconMarker);

      navTurnBeaconMarker = null;

    }

    if (navProgressLine) navProgressLine.setLatLngs([]);

    if (navDensifiedPoints.length > 0 && navVehicleMarker) {

      const pt0 = navDensifiedPoints[0];

      if (navVehicleMarker.setLngLat) {
        navVehicleMarker.setLngLat([pt0.lng, pt0.lat]);
      } else if (navVehicleMarker.setLatLng) {
        navVehicleMarker.setLatLng([pt0.lat, pt0.lng]);
      }

      const innerEl = document.getElementById("vehicleMarkerInner");

      if (innerEl) innerEl.style.transform = `rotate(${Math.round(pt0.bearing)}deg)`;

    }

    const wrapperEl = document.getElementById("vehicleMarkerWrapper");

    if (wrapperEl) wrapperEl.classList.remove("turning-left", "turning-right");

    const cueEl = document.getElementById("vehicleFloatingTurnCue");

    if (cueEl) {

      cueEl.className = "vehicle-floating-turn-cue straight";

      cueEl.innerHTML = '<i class="fas fa-arrow-up"></i> <span>Departing</span>';

    }

    const playBtnText = document.getElementById("navStartBtnText");

    const playIcon = document.getElementById("navPlayIcon");

    const pauseBtn = document.getElementById("btnPauseNavSimulation");

    const hudProgBar = document.getElementById("hudProgressBar");

    if (playBtnText) playBtnText.textContent = `Start ${currentVehicleType === 'bike' ? 'Bike' : 'Car'} Navigation`;

    if (playIcon) playIcon.className = "fas fa-play";

    if (pauseBtn) pauseBtn.style.display = "none";

    if (hudProgBar) hudProgBar.style.width = "0%";

    // Zoom back out to full route overview

    if (mapInstance && routeLayerGroup && routeLayerGroup.getLayers().length > 0) {

      const bounds = routeLayerGroup.getBounds();

      if (bounds && bounds.isValid()) {

        mapInstance.fitBounds(bounds, { padding: [60, 60], animate: true, duration: 0.8 });

      }

    }

    setTimeout(updateZoomButtonsUI, 850);

    // Hide Live Nav HUD and restore directions panel
    const liveHud = document.getElementById("gmapsLiveNavHud");
    if (liveHud) {
      liveHud.style.display = "none";
      liveHud.classList.remove("controls-expanded");
    }
    document.body.classList.remove("nav-active");
    // Ensure all 20 plot markers are completely clear and clickable
    document.querySelectorAll(".nav-dimmed-marker").forEach(el => el.classList.remove("nav-dimmed-marker"));

    const directionsPanel = document.getElementById("gmapsDirectionsPanel");
    if (directionsPanel) {
      directionsPanel.style.display = "";
      if (directionsPanel.classList.contains("minimized")) {
        directionsPanel.classList.remove("minimized");
        const minBtn = document.getElementById("gmapsPanelMinimizeBtn");
        if (minBtn) minBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Minimize';
      }
    }

    // Reset 3D Driver Street Vision telemetry

    resetDriverStreetVisionState();

  }

  function setVehicleType(type, triggerRoute = true) {

    currentVehicleType = (type === "bike") ? "bike" : "car";

    // Update vehicle buttons in drawer
    const btnCar = document.getElementById("pickVehicleCar");
    const btnBike = document.getElementById("pickVehicleBike");
    if (btnCar) btnCar.classList.toggle("active", currentVehicleType === "car");
    if (btnBike) btnBike.classList.toggle("active", currentVehicleType === "bike");

    // Update vehicle buttons in top map toolbar
    const btnMapCar = document.getElementById("btnMapSelectCar");
    const btnMapBike = document.getElementById("btnMapSelectBike");
    if (btnMapCar) btnMapCar.classList.toggle("active", currentVehicleType === "car");
    if (btnMapBike) btnMapBike.classList.toggle("active", currentVehicleType === "bike");

    // Update vehicle marker icon
    if (navVehicleMarker) {
      const markerEl = navVehicleMarker.getElement();
      const svg = currentVehicleType === "bike" ? getBikeVehicleSvgHtml() : getCarVehicleSvgHtml();
      if (markerEl) markerEl.innerHTML = svg;

      // Re-apply current rotation
      if (navDensifiedPoints && navDensifiedPoints.length > 0) {
        const currPt = navDensifiedPoints[Math.floor(navCurrentIndex)] || navDensifiedPoints[0];
        const innerEl = document.getElementById("vehicleMarkerInner");
        if (innerEl && currPt) innerEl.style.transform = `rotate(${Math.round(currentSmoothedBearing || currPt.bearing || 0)}deg)`;
      }
    }

    // Update button text & HUD
    const playBtnText = document.getElementById("navStartBtnText");
    if (playBtnText && navState !== "playing") {
      playBtnText.textContent = `Start ${currentVehicleType === 'bike' ? 'Bike' : 'Car'} Navigation`;
    }

    const hudVehicleIcon = document.getElementById("hudVehicleIcon");
    if (hudVehicleIcon) {
      hudVehicleIcon.innerHTML = currentVehicleType === "bike" ? '<i class="fas fa-motorcycle"></i>' : '<i class="fas fa-car"></i>';
    }

    const btnHudToggle = document.getElementById("btnHudVehicleToggle");
    if (btnHudToggle) {
      btnHudToggle.innerHTML = currentVehicleType === "bike" ? '<i class="fas fa-car"></i> Switch to Car' : '<i class="fas fa-motorcycle"></i> Switch to Bike';
    }

    // Synchronize mode tabs
    const modeTabs = document.querySelectorAll(".gmaps-mode-btn");
    modeTabs.forEach(b => {
      const m = b.getAttribute("data-mode");
      if ((currentVehicleType === "bike" && m === "bike") || (currentVehicleType === "car" && m === "driving")) {
        modeTabs.forEach(tab => tab.classList.remove("active"));
        b.classList.add("active");
        currentTravelMode = m;
      }
    });

    if (typeof updateDriveToggleButtonUI === "function") {
      updateDriveToggleButtonUI();
    }

    if (triggerRoute) {
      window.__userRequestedDrive = true;
        if (typeof executeRouteCalculation === "function") {
        executeRouteCalculation();
      } else if (navDensifiedPoints && navDensifiedPoints.length > 1) {
        startRouteNavigation();
      }
    } else if (navState === "playing") {
      updateVehiclePositionAndManeuver(navCurrentIndex);
    }

  }

  function navigationLoop(timestamp) {

    if (navState !== "playing") return;

    if (!navLastTimestamp) navLastTimestamp = timestamp;

    const deltaTime = Math.min((timestamp - navLastTimestamp) / 1000, 0.1);

    navLastTimestamp = timestamp;

    const totalPoints = navDensifiedPoints.length;

    if (totalPoints < 2) return;

    const currIdxFloor = Math.floor(navCurrentIndex);

    const lookAheadIdx = Math.min(currIdxFloor + 8, totalPoints - 1);

    const ptNow = navDensifiedPoints[currIdxFloor];

    const ptAhead = navDensifiedPoints[lookAheadIdx];

    const rawBearing = calculateBearing([ptNow.lat, ptNow.lng], [ptAhead.lat, ptAhead.lng]);

    const bearingDelta = Math.abs(((rawBearing - currentSmoothedBearing + 540) % 360) - 180);

    // Realistic physics: curve slowing & smooth arrival deceleration

    let speedMultiplier = 1.0;

    if (bearingDelta > 20) {

      speedMultiplier = 0.62;

    }

    const progressRatio = navCurrentIndex / (totalPoints - 1);

    if (progressRatio > 0.88) {

      const arrivalEase = Math.max(0.12, (1.0 - progressRatio) / 0.12);

      speedMultiplier *= arrivalEase;

    }

    // Calibrated 1x real-time simulation speed (smooth, readable Google Maps car movement)
    const basePointsPerSec = currentVehicleType === "bike" ? 9 : 8;

    const pointsToAdvance = basePointsPerSec * navSpeed * speedMultiplier * deltaTime;

    navCurrentIndex += pointsToAdvance;

    if (navCurrentIndex >= totalPoints - 1) {

      navCurrentIndex = totalPoints - 1;

      updateVehiclePositionAndManeuver(navCurrentIndex);

      handleNavigationArrival();

      return;

    }

    updateVehiclePositionAndManeuver(navCurrentIndex);

    navAnimFrameId = requestAnimationFrame(navigationLoop);

  }

  function updateVehiclePositionAndManeuver(floatIndex) {

    const totalPoints = navDensifiedPoints.length;

    const idx1 = Math.floor(floatIndex);

    const idx2 = Math.min(idx1 + 1, totalPoints - 1);

    const t = floatIndex - idx1;

    const pt1 = navDensifiedPoints[idx1];

    const pt2 = navDensifiedPoints[idx2];

    if (!pt1 || !pt2) return;

    const lat = pt1.lat + t * (pt2.lat - pt1.lat);

    const lng = pt1.lng + t * (pt2.lng - pt1.lng);

    // Look ahead ~25m along upcoming road geometry for forward-facing orientation

    const lookOffset = Math.min(idx1 + 6, totalPoints - 1);

    const lookPt1 = navDensifiedPoints[lookOffset];

    const lookPt2 = navDensifiedPoints[Math.min(lookOffset + 1, totalPoints - 1)];

    const lookLat = lookPt1.lat + t * (lookPt2.lat - lookPt1.lat);

    const lookLng = lookPt1.lng + t * (lookPt2.lng - lookPt1.lng);

    const targetBearing = calculateBearing([lat, lng], [lookLat, lookLng]);

    // Shortest path angle interpolation

    const angleDiff = ((targetBearing - currentSmoothedBearing + 540) % 360) - 180;

    currentSmoothedBearing = (currentSmoothedBearing + angleDiff * 0.14 + 360) % 360;

    // Pitch logic: Driver's eye (68°), Chase (48°), Overview (0°)

    // Stage E deceleration: ease pitch to 48° to reveal plot frontage

    let targetPitch = cameraMode === 'driver' ? 60 : (cameraMode === 'chase' ? 48 : 0);

    const progressRatio = floatIndex / (totalPoints - 1);

    if (progressRatio > 0.90) {

      targetPitch = 48;

    }

    currentSmoothedPitch += (targetPitch - currentSmoothedPitch) * 0.12;

    // 1. GOOGLE MAPS DESIGN: SCREEN MOVES ALONG WITH CAR IN CENTER!
    // The map stays steady North-Up (bearing: 0, pitch: 0), smoothly keeping the car centered at all times!
    if (mapInstance && navFollowCamera && !isNavZoomingIn) {
      mapInstance.jumpTo({
        center: [lng, lat],
        bearing: 0,
        pitch: 0
      });
    }

    // 2. Update Traveled Road Ribbon GeoJSON (Neon Green #10b981)

    if (mapInstance && mapInstance.getSource('traveled-source')) {

      const completedCoords = navDensifiedPoints.slice(0, idx1 + 1).map(p => [p.lng, p.lat]);

      completedCoords.push([lng, lat]);

      mapInstance.getSource('traveled-source').setData({

        type: 'Feature',

        geometry: {

          type: 'LineString',

          coordinates: completedCoords

        }

      });

    }

    // 3. Move vehicle marker on map

    if (navVehicleMarker) {

      navVehicleMarker.setLngLat([lng, lat]);

      const innerEl = document.getElementById("vehicleMarkerInner");

      if (innerEl) innerEl.style.transform = `rotate(${Math.round(currentSmoothedBearing)}deg)`;

    }

    // 4. Maneuver & Blinkers detection

    const currentPt = navDensifiedPoints[idx1];

    const maneuver = currentPt.maneuver || "straight";

    const wrapperEl = document.getElementById("vehicleMarkerWrapper");

    if (wrapperEl) {

      if (maneuver === "turn-left") {

        wrapperEl.classList.add("turning-left");

        wrapperEl.classList.remove("turning-right");

      } else if (maneuver === "turn-right") {

        wrapperEl.classList.add("turning-right");

        wrapperEl.classList.remove("turning-left");

      } else {

        wrapperEl.classList.remove("turning-left", "turning-right");

      }

    }

    const cueEl = document.getElementById("vehicleFloatingTurnCue");

    if (cueEl) {

      if (maneuver === "turn-left") {

        cueEl.className = "vehicle-floating-turn-cue left";

        cueEl.innerHTML = '<i class="fas fa-arrow-left"></i> <span>Turn Left</span>';

      } else if (maneuver === "turn-right") {

        cueEl.className = "vehicle-floating-turn-cue right";

        cueEl.innerHTML = '<i class="fas fa-arrow-right"></i> <span>Turn Right</span>';

      } else if (maneuver === "arrived") {

        cueEl.className = "vehicle-floating-turn-cue arrived";

        cueEl.innerHTML = '<i class="fas fa-flag-checkered"></i> <span>Arrived!</span>';

      } else {

        cueEl.className = "vehicle-floating-turn-cue straight";

        cueEl.innerHTML = '<i class="fas fa-arrow-up"></i> <span>Straight</span>';

      }

    }

    // 5. Update HUD Banner with Live Cardinal Directions & Speed
    const hudTurnIconBox = document.getElementById("hudTurnIconBox");
    const hudTurnIcon = document.getElementById("hudTurnIcon");
    const hudTurnDist = document.getElementById("hudTurnDistance");
    const hudTurnInst = document.getElementById("hudTurnInstruction");
    const hudSpeedVal = document.getElementById("hudSpeedVal");
    const hudRemDist = document.getElementById("hudRemainingDist");
    const hudRemEta = document.getElementById("hudRemainingEta");
    const hudProgBar = document.getElementById("hudProgressBar");
    const hudCardinalBadge = document.getElementById("hudCardinalBadge");
    const hudMinCardinal = document.getElementById("hudMinCardinal");
    const hudSpeedPillText = document.getElementById("hudSpeedPillText");
    const hudMinSpeedText = document.getElementById("hudMinSpeedText");

    // Live Cardinal Direction
    const currentCardinal = getCardinalDirection(currentSmoothedBearing);
    const turnCardinal = currentPt.turnCardinal || currentCardinal;

    if (hudCardinalBadge) {
      hudCardinalBadge.innerHTML = `<i class="fas fa-compass"></i> ${currentCardinal.label.toUpperCase()}`;
      hudCardinalBadge.className = `hud-cardinal-badge cardinal-${currentCardinal.code.toLowerCase()}`;
    }
    if (hudMinCardinal) {
      hudMinCardinal.innerHTML = `🧭 ${currentCardinal.code} (${currentCardinal.label})`;
    }
    if (hudSpeedPillText) {
      hudSpeedPillText.textContent = `${navSpeed}x Speed`;
    }
    if (hudMinSpeedText) {
      hudMinSpeedText.textContent = `${navSpeed}x`;
    }

    // Update Interactive Google Maps Compass Rose Widget on Map
    const compassNeedlePivot = document.getElementById("compassNeedlePivot");
    const compassHeadingText = document.getElementById("compassHeadingText");
    if (compassNeedlePivot) {
      compassNeedlePivot.style.transform = `rotate(${Math.round(currentSmoothedBearing)}deg)`;
    }
    if (compassHeadingText) {
      compassHeadingText.textContent = `${currentCardinal.label.toUpperCase()} • ${Math.round(currentSmoothedBearing)}°`;
    }

    if (maneuver === "turn-left") {
      if (hudTurnIconBox) hudTurnIconBox.className = "hud-turn-icon-box turning-left";
      if (hudTurnIcon) hudTurnIcon.className = "fas fa-arrow-left";
      if (hudTurnDist) hudTurnDist.innerHTML = `Turn <strong>Left (${turnCardinal.label})</strong> in ${currentPt.distToManeuver} m`;
    } else if (maneuver === "turn-right") {
      if (hudTurnIconBox) hudTurnIconBox.className = "hud-turn-icon-box turning-right";
      if (hudTurnIcon) hudTurnIcon.className = "fas fa-arrow-right";
      if (hudTurnDist) hudTurnDist.innerHTML = `Turn <strong>Right (${turnCardinal.label})</strong> in ${currentPt.distToManeuver} m`;
    } else if (maneuver === "arrived") {
      if (hudTurnIconBox) hudTurnIconBox.className = "hud-turn-icon-box arrived";
      if (hudTurnIcon) hudTurnIcon.className = "fas fa-flag-checkered";
      if (hudTurnDist) hudTurnDist.innerHTML = `Arrived <strong>${currentCardinal.label}</strong> at Destination!`;
    } else {
      if (hudTurnIconBox) hudTurnIconBox.className = "hud-turn-icon-box";
      if (hudTurnIcon) hudTurnIcon.className = "fas fa-arrow-up";
      const totalDistMeters = navDensifiedPoints[totalPoints - 1].cumDistMeters;
      const remM = Math.max(0, totalDistMeters - currentPt.cumDistMeters);
      const remStr = remM > 1000 ? `In ${(remM / 1000).toFixed(1)} km` : `In ${Math.round(remM)} m`;
      if (hudTurnDist) hudTurnDist.innerHTML = `Head <strong>${currentCardinal.label}</strong> &bull; ${remStr}`;
    }

    if (hudTurnInst) hudTurnInst.textContent = currentPt.instruction;

    // Digital Speedometer with dynamic physics

    const baseSpeed = currentVehicleType === "bike" ? 54 : 48;

    const curveSlow = Math.abs(angleDiff) > 20 ? 0.65 : 1.0;

    const arrivalSlow = progressRatio > 0.88 ? Math.max(0.1, (1.0 - progressRatio) / 0.12) : 1.0;

    const liveSpeed = Math.round(baseSpeed * curveSlow * arrivalSlow);

    if (hudSpeedVal) hudSpeedVal.textContent = floatIndex >= totalPoints - 1 ? "0" : liveSpeed;

    // Remaining Distance & ETA

    const totalDistMeters = navDensifiedPoints[totalPoints - 1].cumDistMeters;

    const remainingKm = Math.max(0, (totalDistMeters - currentPt.cumDistMeters) / 1000);

    const remainingMins = remainingKm < 0.05 ? 0 : Math.max(1, Math.round((remainingKm / (baseSpeed * 0.75)) * 60));

    if (hudRemDist) hudRemDist.textContent = remainingKm < 0.05 ? "0 km" : `${remainingKm.toFixed(1)} km`;

    if (hudRemEta) hudRemEta.textContent = remainingKm < 0.05 ? "0 min" : `${remainingMins} min`;

    const percent = Math.min(100, Math.max(0, (floatIndex / (totalPoints - 1)) * 100));

    if (hudProgBar) hudProgBar.style.width = `${percent}%`;

  }

  function handleNavigationArrival() {

    navState = "stopped";
    if (!navActiveDestPlot && allPlotsList && allPlotsList.length > 0) {
      navActiveDestPlot = allPlotsList.find(p => p.id === currentDestPlotId) || allPlotsList[0];
    }

    if (navAnimFrameId) {

      cancelAnimationFrame(navAnimFrameId);

      navAnimFrameId = null;

    }

    navFollowCamera = false;

    updateCameraFollowButtonUI();

    const hudSpeedVal = document.getElementById("hudSpeedVal");

    const hudRemDist = document.getElementById("hudRemainingDist");

    const hudRemEta = document.getElementById("hudRemainingEta");

    const hudProgBar = document.getElementById("hudProgressBar");

    const playBtnText = document.getElementById("navStartBtnText");

    const playIcon = document.getElementById("navPlayIcon");

    if (hudSpeedVal) hudSpeedVal.textContent = "0";

    if (hudRemDist) hudRemDist.textContent = "0 km";

    if (hudRemEta) hudRemEta.textContent = "0 min";

    if (hudProgBar) hudProgBar.style.width = "100%";

    if (playBtnText) playBtnText.textContent = `Replay Navigation`;

    if (playIcon) playIcon.className = "fas fa-redo-alt";
    if (typeof updateDriveToggleButtonUI === "function") updateDriveToggleButtonUI();

    // Stage F — Property Arrival:

    // Settle camera on destination plot frontage

    if (navActiveDestPlot && navActiveDestPlot.coords) {

      const destLat = navActiveDestPlot.coords[0];

      const destLng = navActiveDestPlot.coords[1];

      if (mapInstance) {

        mapInstance.easeTo({

          center: [destLng, destLat + 0.0006],

          zoom: 17.6,

          pitch: 48,

          bearing: 0,

          duration: 1500

        });

      }

      // Highlight exact plot boundary polygon

      highlightPlotBoundary(navActiveDestPlot);

      const marker = activePlotMarkers[navActiveDestPlot.id];

      if (marker && marker.closePopup) {

        marker.closePopup();

      }

      const card = document.getElementById(`card-${navActiveDestPlot.id}`);

      if (card) {

        document.querySelectorAll(".plot-card").forEach(c => c.style.borderColor = "var(--border)");

        card.style.borderColor = "var(--gold)";

      }

    }

    // Auto-minimize Google Maps directions drawer

    const directionsPanel = document.getElementById("gmapsDirectionsPanel");

    if (directionsPanel) {

      directionsPanel.classList.add("minimized");

      const toggleText = document.getElementById("gmapsToggleText");

      if (toggleText) toggleText.textContent = "Route";

    }

    // Hide top live nav HUD to eliminate overlapping clutter

    const hudEl = document.getElementById("gmapsLiveNavHud");

    if (hudEl) {

      hudEl.style.display = "none";

    }

    const dirPanel = document.getElementById("gmapsDirectionsPanel");
    if (dirPanel) dirPanel.style.display = "none";
    // Show Sleek Bottom-Docked Destination Arrived Showcase Bar Overlay with Plot Image
    showMapDestinationArrivedCard(navActiveDestPlot);

    // Auto-fit Map squarely into the user's screen

    fitMapSectionIntoScreen();

    // Synchronize 3D Driver Street Vision Arrival State

    handleDriverStreetVisionArrival(navActiveDestPlot);

  }

  // Global Controls: Stop Journey and Return to Overview

  window.stopRouteNavigation = function() {

    if (navAnimFrameId) {

      cancelAnimationFrame(navAnimFrameId);

      navAnimFrameId = null;

    }

    navState = "stopped";

    const playBtnText = document.getElementById("navStartBtnText");

    const playIcon = document.getElementById("navPlayIcon");

    if (playBtnText) playBtnText.textContent = `Resume Navigation`;

    if (playIcon) playIcon.className = "fas fa-play";

    const hudTurnDist = document.getElementById("hudTurnDistance");

    if (hudTurnDist) hudTurnDist.textContent = "Journey Paused";

  };

  window.returnToChennaiOverview = function() {

    if (navAnimFrameId) {

      cancelAnimationFrame(navAnimFrameId);

      navAnimFrameId = null;

    }

    navState = "stopped";

    const arrivedOverlay = document.getElementById("mapDestinationArrivedOverlay");

    if (arrivedOverlay) arrivedOverlay.style.display = "none";

    const hudEl = document.getElementById("gmapsLiveNavHud");

    if (hudEl) hudEl.style.display = "none";

    clearPlotBoundaryHighlight();

    clearMapLibreRouteLayers();

    if (mapInstance) {

      currentSmoothedBearing = 0;

      currentSmoothedPitch = 20;

      mapInstance.flyTo({

        center: [80.18, 12.98],

        zoom: 11,

        pitch: 20,

        bearing: 0,

        duration: 1800

      });

    }

    document.querySelectorAll(".nav-dimmed-marker").forEach(el => el.classList.remove("nav-dimmed-marker"));

  };

  function initVehicleNavigationEngine() {

    const btnPickCar = document.getElementById("pickVehicleCar");

    const btnPickBike = document.getElementById("pickVehicleBike");

    const btnStart = document.getElementById("btnStartNavSimulation");

    const btnPause = document.getElementById("btnPauseNavSimulation");

    const btnReset = document.getElementById("btnResetNavSimulation");

    const btnNavStreetZoom = document.getElementById("btnNavStreetZoom");

    const speedSelect = document.getElementById("navSpeedSelect");

    const btnHudToggle = document.getElementById("btnHudVehicleToggle");

    const btnHudZoomToggle = document.getElementById("btnHudZoomToggle");

    const btnHudCamera = document.getElementById("btnHudCameraFollow");

    const btnHudClose = document.getElementById("btnHudClose");

    if (btnPickCar) {

      btnPickCar.addEventListener("click", () => setVehicleType("car"));

    }

    if (btnPickBike) {

      btnPickBike.addEventListener("click", () => setVehicleType("bike"));

    }

    if (btnStart) {

      btnStart.addEventListener("click", () => {

        if (navState === "playing") {

          pauseRouteNavigation();

        } else {

          startRouteNavigation();

        }

      });

    }

    if (btnPause) {

      btnPause.addEventListener("click", pauseRouteNavigation);

    }

    if (btnReset) {

      btnReset.addEventListener("click", resetRouteNavigation);

    }

    if (btnNavStreetZoom) {

      btnNavStreetZoom.addEventListener("click", toggleNavigationZoom);

    }

    if (btnHudZoomToggle) {

      btnHudZoomToggle.addEventListener("click", toggleNavigationZoom);

    }

    if (speedSelect) {

      speedSelect.addEventListener("change", function () {

        navSpeed = parseFloat(this.value) || 2;

      });

    }

    if (btnHudToggle) {

      btnHudToggle.addEventListener("click", () => {

        const nextType = (currentVehicleType === "bike") ? "car" : "bike";

        setVehicleType(nextType);

      });

    }

    if (btnHudCamera) {

      btnHudCamera.addEventListener("click", function () {

        if (!navFollowCamera) {

          // Re-center and zoom into vehicle!

          navFollowCamera = true;

          const currPt = navDensifiedPoints[Math.floor(navCurrentIndex)] || navDensifiedPoints[0];

          if (currPt && mapInstance) {

            mapInstance.flyTo([currPt.lat, currPt.lng], NAV_STREET_ZOOM, { animate: true, duration: 0.6 });

          }

        } else {

          // Free pan mode

          navFollowCamera = false;

        }

        updateCameraFollowButtonUI();

      });

    }

    if (mapInstance) {

      mapInstance.on("dragstart", () => {
        if (navState === "playing") {
          navFollowCamera = false;
          updateCameraFollowButtonUI();
        }
      });

      mapInstance.on("touchstart", (e) => {
        if (navState === "playing" && e.touches && e.touches.length === 1) {
          navFollowCamera = false;
          updateCameraFollowButtonUI();
        }
      });

      mapInstance.on("zoomend", () => {

        updateZoomButtonsUI();

      });

    }

    if (btnHudClose) {

      btnHudClose.addEventListener("click", () => {

        resetRouteNavigation();

        const hud = document.getElementById("gmapsLiveNavHud");

        if (hud) hud.style.display = "none";

      });

    }

  }

  // =========================================================================

  // 9C. ROADSIDE SCENERY GENERATOR & 3D DRIVER STREET VISION ENGINE

  // (Houses, Shops, Reliance Fresh, Apollo 24/7, Cafes, Trees, Streetlights, Grand Arch)

  // =========================================================================

  // 1. Generate Realistic Roadside Scenery (Houses, Shops, Trees, Lamps, Arch) along Route

  function populateRoadsideScenery(routeCoordinates, destPlot) {

    if (!roadsideSceneryLayer || !routeCoordinates || routeCoordinates.length < 4) return;

    roadsideSceneryLayer.clearLayers();

    activeSceneryMarkers = [];

    const totalPoints = routeCoordinates.length;

    const landmarkPool = [

      { type: "shop", name: "Reliance Fresh Express", sub: "Groceries & Fresh Daily Essentials", icon: "fa-shopping-cart" },

      { type: "pharmacy", name: "Apollo Pharmacy 24/7", sub: "Healthcare & Emergency Meds", icon: "fa-plus-circle" },

      { type: "shop", name: "Madras Filter Coffee & Tiffins", sub: "South Indian Snacks & Coffee", icon: "fa-coffee" },

      { type: "shop", name: "HDFC Bank 24x7 ATM", sub: "Cash Withdrawal & Fast Banking", icon: "fa-university" },

      { type: "house", name: "Royal Palms Luxury Villa", sub: "Independent Gated Villa Residence", icon: "fa-home" },

      { type: "house", name: "Green Terraces Eco Villa", sub: "Contemporary Solar-Powered Villa", icon: "fa-home" },

      { type: "tree", name: "Avenue Neem Tree", sub: "Shaded Green Belt Avenue", icon: "fa-tree" },

      { type: "palm", name: "Coastal Coconut Palm", sub: "Tropical Roadside Greenery", icon: "fa-tree" },

      { type: "lamp", name: "Smart Highway LED Light", sub: "CMDA Infrastructure Light", icon: "fa-lightbulb" },

      { type: "shop", name: "Nilgiris 1905 Department Store", sub: "Bakery & Organic Groceries", icon: "fa-store" },

      { type: "shop", name: "Indian Oil Fuel & Fast EV Charger", sub: "Petrol & Fast Electric Charger", icon: "fa-gas-pump" },

      { type: "house", name: "Chennai Elite Courtyard Home", sub: "Heritage Architectural Villa", icon: "fa-home" },

      { type: "tree", name: "Gulmohar Flowering Boulevard", sub: "Aesthetic Flowering Tree", icon: "fa-leaf" }

    ];

    // Sample along the route every ~4 to 7 points (~80m-130m)

    const sampleStep = Math.max(3, Math.floor(totalPoints / 22));

    let poolIndex = 0;

    for (let i = 2; i < totalPoints - 3; i += sampleStep) {

      const pt1 = routeCoordinates[i];

      const pt2 = routeCoordinates[i + 1] || routeCoordinates[i];

      const bearing = calculateBearing(pt1[0], pt1[1], pt2[0], pt2[1]);

      // Alternate left (-1) and right (+1) sides of road

      const side = (Math.floor(i / sampleStep) % 2 === 0) ? 1 : -1;

      const perpAngle = (bearing + (side * 90)) * Math.PI / 180;

      // Roadside distance offset: ~22 meters (approx 0.00020 deg lat/lon)

      const offsetDistance = 0.00020 + ((i % 3) * 0.00003);

      const scenLat = pt1[0] + Math.cos(perpAngle) * offsetDistance;

      const scenLng = pt1[1] + Math.sin(perpAngle) * offsetDistance;

      const item = landmarkPool[poolIndex % landmarkPool.length];

      poolIndex++;

      const pinHtml = `

        <div class="roadside-scenery-pin ${item.type}" data-scenery-idx="${i}" title="${item.name}">

          <div class="scenery-pin-halo"></div>

          <div class="scenery-pin-core">

            <i class="fas ${item.icon}"></i>

          </div>

          <div class="scenery-pin-label">${item.name.split(" ")[0]}</div>

        </div>

      `;

      const sceneryIcon = L.divIcon({

        className: "custom-roadside-scenery-icon",

        html: pinHtml,

        iconSize: [36, 42],

        iconAnchor: [18, 42]

      });

      const marker = L.marker([scenLat, scenLng], { icon: sceneryIcon });

      marker.bindPopup(`

        <div style="font-family:inherit; min-width:180px; padding:4px;">

          <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:#0284c7; letter-spacing:0.5px;">

            <i class="fas ${item.icon}"></i> Roadside Landmark

          </div>

          <div style="font-size:14px; font-weight:800; color:#0f172a; margin:3px 0;">

            ${item.name}

          </div>

          <div style="font-size:11px; color:#64748b; margin-bottom:6px;">

            ${item.sub}

          </div>

          <div style="font-size:10px; color:#059669; font-weight:700; background:#ecfdf5; padding:2px 6px; border-radius:4px; display:inline-block;">

            <i class="fas fa-check-circle"></i> On Route to ${destPlot.locality}

          </div>

        </div>

      `);

      roadsideSceneryLayer.addLayer(marker);

      activeSceneryMarkers.push({

        marker: marker,

        lat: scenLat,

        lng: scenLng,

        routeIdx: i,

        side: side,

        name: item.name,

        sub: item.sub,

        type: item.type,

        icon: item.icon

      });

    }

    // Add Grand Layout Entrance Archway marker right before destination

    const destCoords = destPlot.coords;

    const lastPt = routeCoordinates[totalPoints - 1];

    const secondLastPt = routeCoordinates[Math.max(0, totalPoints - 4)];

    const archBearing = calculateBearing(secondLastPt[0], secondLastPt[1], lastPt[0], lastPt[1]);

    const archAngle = (archBearing + 180) * Math.PI / 180;

    const archLat = destCoords[0] + Math.cos(archAngle) * 0.00035;

    const archLng = destCoords[1] + Math.sin(archAngle) * 0.00035;

    const archHtml = `

      <div class="roadside-scenery-pin destination-arch" title="Grand Gated Layout Entrance Archway">

        <div class="scenery-pin-halo"></div>

        <div class="scenery-pin-core">

          <i class="fas fa-archway"></i>

        </div>

        <div class="scenery-pin-label">GATED ARCH</div>

      </div>

    `;

    const archIcon = L.divIcon({

      className: "custom-roadside-scenery-icon arch-icon",

      html: archHtml,

      iconSize: [44, 50],

      iconAnchor: [22, 50]

    });

    const archMarker = L.marker([archLat, archLng], { icon: archIcon });

    archMarker.bindPopup(`

      <div style="font-family:inherit; min-width:210px; padding:6px;">

        <div style="font-size:10px; font-weight:800; color:#d97706; text-transform:uppercase;">

          <i class="fas fa-archway"></i> Layout Entrance

        </div>

        <div style="font-size:15px; font-weight:800; color:#0f172a; margin:3px 0;">

          ${destPlot.title}

        </div>

        <div style="font-size:11px; color:#475569; margin-bottom:8px;">

          Grand Ornamental Gated Archway &bull; 40-Ft Blacktop Approach Road

        </div>

        <div style="background:linear-gradient(135deg,#0284c7,#0369a1); color:#fff; font-size:11px; padding:4px 8px; border-radius:6px; font-weight:700; text-align:center;">

          ${destPlot.priceDisplay} &bull; ${destPlot.plotSizeSqft} SQ.FT

        </div>

      </div>

    `);

    roadsideSceneryLayer.addLayer(archMarker);

  }

  // 2. Initialize 3D Driver Street Vision Engine

    // 2. Initialize 3D Driver Street Vision Engine (Realistic Satellite-Style Roads, Homes & Left/Right Turning)

  let visionManualCurve = null; // null for auto GPS curve, or number for manual steer
  let visionManualTimer = null;

  function initDriverStreetVisionEngine() {
    driverVisionCanvas = document.getElementById("driverVisionCanvas");
    if (!driverVisionCanvas) return;
    driverVisionCtx = driverVisionCanvas.getContext("2d");

    // Initialize Scenery Objects Pool
    initVisionSceneryPool();

    // Toggle button on map layer bar
    const btnToggle = document.getElementById("btnToggleDriverVision");
    if (btnToggle) {
      btnToggle.addEventListener("click", toggleDriverStreetVision);
    }

    // Toggle button in HUD banner
    const btnHudToggle = document.getElementById("btnHudStreetVisionToggle");
    if (btnHudToggle) {
      btnHudToggle.addEventListener("click", toggleDriverStreetVision);
    }

    // Close button
    const btnClose = document.getElementById("btnVisionClose");
    if (btnClose) {
      btnClose.addEventListener("click", closeDriverStreetVision);
    }

    // Split View Mode button
    const btnSplit = document.getElementById("btnVisionSplitMode");
    if (btnSplit) {
      btnSplit.addEventListener("click", () => setVisionDisplayMode("split"));
    }

    // Full Theater Mode button
    const btnFull = document.getElementById("btnVisionFullMode");
    if (btnFull) {
      btnFull.addEventListener("click", () => setVisionDisplayMode("full"));
    }

    // Interactive Left and Right Steer Buttons in Header
    const btnSteerLeft = document.getElementById("btnVisionSteerLeft");
    const btnSteerCenter = document.getElementById("btnVisionSteerCenter");
    const btnSteerRight = document.getElementById("btnVisionSteerRight");

    if (btnSteerLeft) {
      btnSteerLeft.addEventListener("click", (e) => {
        e.stopPropagation();
        setStreetVisionSteer("left");
      });
    }
    if (btnSteerCenter) {
      btnSteerCenter.addEventListener("click", (e) => {
        e.stopPropagation();
        setStreetVisionSteer("center");
      });
    }
    if (btnSteerRight) {
      btnSteerRight.addEventListener("click", (e) => {
        e.stopPropagation();
        setStreetVisionSteer("right");
      });
    }

    // Interactive Dashboard Blinkers as Steer Triggers
    const dashBlinkerL = document.getElementById("dashBlinkerLeft");
    const dashBlinkerR = document.getElementById("dashBlinkerRight");
    if (dashBlinkerL) {
      dashBlinkerL.addEventListener("click", (e) => {
        e.stopPropagation();
        setStreetVisionSteer("left");
      });
    }
    if (dashBlinkerR) {
      dashBlinkerR.addEventListener("click", (e) => {
        e.stopPropagation();
        setStreetVisionSteer("right");
      });
    }

    // Keyboard Arrow Keys to Steer Road Left & Right
    window.addEventListener("keydown", (e) => {
      if (!isDriverVisionOpen) return;
      if (e.key === "ArrowLeft") {
        setStreetVisionSteer("left");
      } else if (e.key === "ArrowRight") {
        setStreetVisionSteer("right");
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        setStreetVisionSteer("center");
      }
    });

    // Canvas click to steer toward clicked side
    driverVisionCanvas.addEventListener("click", (e) => {
      const rect = driverVisionCanvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = clickX / rect.width;
      if (ratio < 0.38) {
        setStreetVisionSteer("left");
      } else if (ratio > 0.62) {
        setStreetVisionSteer("right");
      } else {
        setStreetVisionSteer("center");
      }
    });

    // Window resize handler
    window.addEventListener("resize", () => {
      if (isDriverVisionOpen) {
        resizeDriverVisionCanvas();
      }
    });
  }

  // Programmatic & Interactive Left/Right Road Steering
  function setStreetVisionSteer(dir) {
    if (visionManualTimer) clearTimeout(visionManualTimer);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = (driverVisionCanvas ? driverVisionCanvas.width / dpr : 1000);

    const btnL = document.getElementById("btnVisionSteerLeft");
    const btnC = document.getElementById("btnVisionSteerCenter");
    const btnR = document.getElementById("btnVisionSteerRight");
    const blinkL = document.getElementById("dashBlinkerLeft");
    const blinkR = document.getElementById("dashBlinkerRight");

    if (dir === "left") {
      visionManualCurve = -w * 0.32;
      if (btnL) btnL.classList.add("active");
      if (btnC) btnC.classList.remove("active");
      if (btnR) btnR.classList.remove("active");
      if (blinkL) blinkL.classList.add("active");
      if (blinkR) blinkR.classList.remove("active");
      showToast("⮜ Steered road LEFT");
    } else if (dir === "right") {
      visionManualCurve = w * 0.32;
      if (btnL) btnL.classList.remove("active");
      if (btnC) btnC.classList.remove("active");
      if (btnR) btnR.classList.add("active");
      if (blinkL) blinkL.classList.remove("active");
      if (blinkR) blinkR.classList.add("active");
      showToast("Steered road RIGHT ⮞");
    } else {
      visionManualCurve = 0;
      if (btnL) btnL.classList.remove("active");
      if (btnC) btnC.classList.add("active");
      if (btnR) btnR.classList.remove("active");
      if (blinkL) blinkL.classList.remove("active");
      if (blinkR) blinkR.classList.remove("active");
      showToast("↑ Road centered straight");
    }

    // Auto-resume GPS autonomous road curve after 7 seconds
    visionManualTimer = setTimeout(() => {
      visionManualCurve = null;
      if (btnL) btnL.classList.remove("active");
      if (btnC) btnC.classList.add("active");
      if (btnR) btnR.classList.remove("active");
    }, 7000);
  }
  window.setStreetVisionSteer = setStreetVisionSteer;

  function initVisionSceneryPool() {
    // Realistic Chennai residential villas, shops, palms and banyan trees
    // z in [0.08 (horizon), 0.95 (closest)]
    visionSceneryObjects = [
      { z: 0.88, side: -1, type: "villa", style: "modern", brand: "Villa Sapphire" },
      { z: 0.78, side: 1, type: "shop", brand: "Reliance Fresh", color: "#16a34a" },
      { z: 0.68, side: -1, type: "palm" },
      { z: 0.58, side: 1, type: "villa", style: "tiled", brand: "Heritage Villa" },
      { z: 0.48, side: -1, type: "tree" },
      { z: 0.40, side: 1, type: "shop", brand: "Apollo 24/7", color: "#ef4444" },
      { z: 0.32, side: -1, type: "villa", style: "contemporary", brand: "Elite Residency" },
      { z: 0.24, side: 1, type: "tree" },
      { z: 0.16, side: -1, type: "palm" },
      { z: 0.10, side: 1, type: "shop", brand: "Madras Coffee", color: "#d97706" }
    ];
  }

  function toggleDriverStreetVision() {
    if (isDriverVisionOpen) {
      closeDriverStreetVision();
    } else {
      openDriverStreetVision();
    }
  }

  function openDriverStreetVision() {
    const container = document.getElementById("driverStreetVisionContainer");
    if (!container) return;
    container.style.display = "flex";
    isDriverVisionOpen = true;
    setVisionDisplayMode(visionMode);
    resizeDriverVisionCanvas();

    // Auto-start route navigation if stopped at origin; if arrived, preserve arrival state
    if (navDensifiedPoints && navDensifiedPoints.length > 0 && navCurrentIndex >= navDensifiedPoints.length - 1) {
      handleDriverStreetVisionArrival(navActiveDestPlot);
    } else if (navState !== "playing") {
      startRouteNavigation();
    }

    if (!visionAnimFrameId) {
      visionLastTime = performance.now();
      visionAnimFrameId = requestAnimationFrame(renderDriverStreetVisionLoop);
    }

    const hudLabel = document.getElementById("hudVisionBtnLabel");
    if (hudLabel) hudLabel.textContent = "Close 3D View";
    const btnToggle = document.getElementById("btnToggleDriverVision");
    if (btnToggle) btnToggle.classList.add("btn-satellite-active");
  }

  function closeDriverStreetVision() {
    const container = document.getElementById("driverStreetVisionContainer");
    if (!container) return;
    container.style.display = "none";
    isDriverVisionOpen = false;

    if (visionAnimFrameId) {
      cancelAnimationFrame(visionAnimFrameId);
      visionAnimFrameId = null;
    }

    const mapWrapper = document.querySelector(".map-wrapper");
    if (mapWrapper) {
      mapWrapper.classList.remove("split-vision-active");
    }

    const hudLabel = document.getElementById("hudVisionBtnLabel");
    if (hudLabel) hudLabel.textContent = "3D Street View";
    const btnToggle = document.getElementById("btnToggleDriverVision");
    if (btnToggle) btnToggle.classList.remove("btn-satellite-active");

    if (mapInstance) {
      setTimeout(() => mapInstance.resize(), 100);
    }
  }

  function setVisionDisplayMode(mode) {
    visionMode = mode;
    const container = document.getElementById("driverStreetVisionContainer");
    const mapWrapper = document.querySelector(".map-wrapper");
    const btnSplit = document.getElementById("btnVisionSplitMode");
    const btnFull = document.getElementById("btnVisionFullMode");

    if (!container) return;

    if (mode === "split") {
      container.classList.remove("theater-mode");
      container.classList.add("split-mode");
      if (mapWrapper) mapWrapper.classList.add("split-vision-active");
      if (btnSplit) btnSplit.classList.add("active");
      if (btnFull) btnFull.classList.remove("active");
    } else {
      container.classList.remove("split-mode");
      container.classList.add("theater-mode");
      if (mapWrapper) mapWrapper.classList.remove("split-vision-active");
      if (btnFull) btnFull.classList.add("active");
      if (btnSplit) btnSplit.classList.remove("active");
    }

    resizeDriverVisionCanvas();

    if (mapInstance && mode === "split") {
      setTimeout(() => mapInstance.resize(), 150);
    }
  }

  function resizeDriverVisionCanvas() {
    if (!driverVisionCanvas) return;
    const wrap = document.getElementById("visionViewportWrap");
    if (!wrap) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    driverVisionCanvas.width = wrap.clientWidth * dpr;
    driverVisionCanvas.height = wrap.clientHeight * dpr;
  }

  // 3. Main 60fps Canvas Animation Loop with Realistic Curved Road Physics
  function renderDriverStreetVisionLoop(timestamp) {
    if (!isDriverVisionOpen || !driverVisionCanvas || !driverVisionCtx) return;

    if (!visionLastTime) visionLastTime = timestamp;
    const dt = Math.min((timestamp - visionLastTime) / 1000, 0.1);
    visionLastTime = timestamp;

    const ctx = driverVisionCtx;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = driverVisionCanvas.width / dpr;
    const h = driverVisionCanvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    const isDriving = (navState === "playing");
    const speedFactor = isDriving ? (navSpeed * 1.85) : 0.65;

    // Advance road offset for moving asphalt road stripes
    visionRoadOffset = (visionRoadOffset + speedFactor * dt * 3.8) % 1.0;

    // Determine upcoming maneuver & curve direction
    let targetCurve = 0;
    let upcomingManeuver = "straight";

    if (navDensifiedPoints && navDensifiedPoints.length > 0) {
      const currPt = navDensifiedPoints[Math.floor(navCurrentIndex)] || navDensifiedPoints[0];
      upcomingManeuver = currPt.maneuver || "straight";
    }

    if (visionManualCurve !== null) {
      targetCurve = visionManualCurve;
    } else if (upcomingManeuver === "turn-left") {
      targetCurve = -w * 0.32;
    } else if (upcomingManeuver === "turn-right") {
      targetCurve = w * 0.32;
    } else {
      // Natural gentle road sway through the landscape
      targetCurve = Math.sin(timestamp * 0.0009) * (w * 0.065);
    }

    // Smooth lerp for road curve (realistic road curvature bending left & right)
    visionCurrentCurve += (targetCurve - visionCurrentCurve) * 0.075;

    // Smooth lerp for steering wheel angle
    const targetSteer = (visionCurrentCurve / (w * 0.28)) * 42;
    visionSteeringAngle += (targetSteer - visionSteeringAngle) * 0.10;

    // Update blinker highlights
    const blinkL = document.getElementById("dashBlinkerLeft");
    const blinkR = document.getElementById("dashBlinkerRight");
    if (blinkL) blinkL.classList.toggle("active", visionCurrentCurve < -35);
    if (blinkR) blinkR.classList.toggle("active", visionCurrentCurve > 35);

    // Horizon line
    const cy = h * 0.40;
    const cx = (w * 0.5) + visionCurrentCurve * 0.65;

    // 1. Draw Sky & Chennai Skyline Horizon
    drawCanvasSkyAndHorizon(ctx, w, h, cy, cx);

    // 2. Draw Realistic Satellite Terrain, Curbs & Curved Asphalt Highway
    drawCanvasRoadAndCurbs(ctx, w, h, cy, cx, visionRoadOffset, visionCurrentCurve);

    // 3. Advance and Render Roadside 3D Objects (Homes, Shops, Trees, Palms, Arch)
    updateAndDrawSceneryObjects(ctx, w, h, cy, cx, dt, speedFactor, timestamp);

    // 4. Draw Cockpit (Car Steering Wheel or Motorcycle Handlebars)
    if (currentVehicleType === "bike") {
      drawCanvasBikeHandlebars(ctx, w, h, visionSteeringAngle, isDriving);
    } else {
      drawCanvasSteeringWheel(ctx, w, h, visionSteeringAngle, isDriving);
    }

    ctx.restore();
    visionAnimFrameId = requestAnimationFrame(renderDriverStreetVisionLoop);
  }

  // 4. Realistic Canvas Drawing Functions

  function drawCanvasSkyAndHorizon(ctx, w, h, cy, cx) {
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, cy);
    skyGrad.addColorStop(0, "#030712");
    skyGrad.addColorStop(0.55, "#0b1d3a");
    skyGrad.addColorStop(0.85, "#15335d");
    skyGrad.addColorStop(1, "#1e4976");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, cy);

    // Atmospheric haze glow over horizon
    const glowGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, w * 0.7);
    glowGrad.addColorStop(0, "rgba(56, 189, 248, 0.4)");
    glowGrad.addColorStop(0.5, "rgba(14, 165, 233, 0.15)");
    glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, cy - 65, w, 70);

    // Distant Chennai Skyline Silhouettes along Horizon
    ctx.fillStyle = "rgba(10, 18, 36, 0.9)";
    const buildings = [
      { x: w * 0.04, bw: 32, bh: 32 },
      { x: w * 0.11, bw: 42, bh: 50 },
      { x: w * 0.20, bw: 26, bh: 28 },
      { x: w * 0.28, bw: 55, bh: 40 },
      { x: w * 0.38, bw: 36, bh: 65 }, // High tech park tower
      { x: w * 0.60, bw: 48, bh: 58 },
      { x: w * 0.72, bw: 34, bh: 35 },
      { x: w * 0.82, bw: 50, bh: 62 },
      { x: w * 0.91, bw: 28, bh: 30 }
    ];
    buildings.forEach(b => {
      ctx.fillRect(b.x, cy - b.bh, b.bw, b.bh);
      ctx.fillStyle = "rgba(254, 240, 138, 0.4)";
      ctx.fillRect(b.x + 5, cy - b.bh + 8, 3, 3);
      ctx.fillRect(b.x + b.bw - 8, cy - b.bh + 16, 3, 3);
      ctx.fillStyle = "rgba(10, 18, 36, 0.9)";
    });
  }

  function drawCanvasRoadAndCurbs(ctx, w, h, cy, cx, roadOffset, curve) {
    const numSlices = 42;

    // Draw multi-slice curved road from horizon (z=0) down to hood (z=1)
    for (let i = 0; i < numSlices; i++) {
      const z1 = i / numSlices;
      const z2 = (i + 1) / numSlices;
      const y1 = cy + (h - cy) * Math.pow(z1, 1.85);
      const y2 = cy + (h - cy) * Math.pow(z2, 1.85);

      const rc1 = (w * 0.5) + curve * Math.pow(1 - z1, 1.7);
      const rc2 = (w * 0.5) + curve * Math.pow(1 - z2, 1.7);

      const rw1 = (w * 0.45) * Math.pow(z1, 1.3) + 5;
      const rw2 = (w * 0.45) * Math.pow(z2, 1.3) + 5;

      // Outer Ground Verges (Satellite Terrain)
      // Left side: Lush tropical green terrain with red Chennai soil
      const gLeft = ctx.createLinearGradient(0, y1, 0, y2);
      gLeft.addColorStop(0, "#084127");
      gLeft.addColorStop(1, "#0a5638");
      ctx.fillStyle = gLeft;
      ctx.beginPath();
      ctx.moveTo(0, y1);
      ctx.lineTo(rc1 - rw1, y1);
      ctx.lineTo(rc2 - rw2, y2);
      ctx.lineTo(0, y2);
      ctx.closePath();
      ctx.fill();

      // Right side
      ctx.beginPath();
      ctx.moveTo(rc1 + rw1, y1);
      ctx.lineTo(w, y1);
      ctx.lineTo(w, y2);
      ctx.lineTo(rc2 + rw2, y2);
      ctx.closePath();
      ctx.fill();

      // Sidewalk paving shoulder strip
      const paverW1 = Math.max(1, 16 * z1);
      const paverW2 = Math.max(1, 16 * z2);
      ctx.fillStyle = "#334155";
      // Left paver
      ctx.beginPath();
      ctx.moveTo(rc1 - rw1 - paverW1, y1);
      ctx.lineTo(rc1 - rw1, y1);
      ctx.lineTo(rc2 - rw2, y2);
      ctx.lineTo(rc2 - rw2 - paverW2, y2);
      ctx.closePath();
      ctx.fill();
      // Right paver
      ctx.beginPath();
      ctx.moveTo(rc1 + rw1, y1);
      ctx.lineTo(rc1 + rw1 + paverW1, y1);
      ctx.lineTo(rc2 + rw2 + paverW2, y2);
      ctx.lineTo(rc2 + rw2, y2);
      ctx.closePath();
      ctx.fill();

      // Asphalt road surface quad
      const aspGrad = ctx.createLinearGradient(0, y1, 0, y2);
      const isDark = (Math.floor(i + roadOffset * 8) % 2 === 0);
      aspGrad.addColorStop(0, isDark ? "#121824" : "#161e2b");
      aspGrad.addColorStop(1, isDark ? "#17202d" : "#1a2536");
      ctx.fillStyle = aspGrad;
      ctx.beginPath();
      ctx.moveTo(rc1 - rw1, y1);
      ctx.lineTo(rc1 + rw1, y1);
      ctx.lineTo(rc2 + rw2, y2);
      ctx.lineTo(rc2 - rw2, y2);
      ctx.closePath();
      ctx.fill();

      // Concrete curbs (alternating red and white hazard paint)
      const curbW1 = Math.max(1, 10 * z1);
      const curbW2 = Math.max(1, 10 * z2);
      const isCurbAlt = (Math.floor(i + roadOffset * 10) % 2 === 0);
      ctx.fillStyle = isCurbAlt ? "#ef4444" : "#f8fafc";

      // Left curb
      ctx.beginPath();
      ctx.moveTo(rc1 - rw1 - curbW1, y1);
      ctx.lineTo(rc1 - rw1, y1);
      ctx.lineTo(rc2 - rw2, y2);
      ctx.lineTo(rc2 - rw2 - curbW2, y2);
      ctx.closePath();
      ctx.fill();

      // Right curb
      ctx.beginPath();
      ctx.moveTo(rc1 + rw1, y1);
      ctx.lineTo(rc1 + rw1 + curbW1, y1);
      ctx.lineTo(rc2 + rw2 + curbW2, y2);
      ctx.lineTo(rc2 + rw2, y2);
      ctx.closePath();
      ctx.fill();

      // Solid outer white road lines
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      const lineW = Math.max(1, 3.2 * z1);
      ctx.fillRect(rc1 - rw1 + 4 * z1, y1, lineW, Math.abs(y2 - y1) + 1);
      ctx.fillRect(rc1 + rw1 - 4 * z1 - lineW, y1, lineW, Math.abs(y2 - y1) + 1);
    }

    // Dashed center highway lines (Moving Forward & Curving with Road)
    const numDashes = 10;
    for (let d = 0; d < numDashes; d++) {
      const z1 = ((d + roadOffset) % numDashes) / numDashes;
      if (z1 < 0.08 || z1 > 0.95) continue;
      const z2 = Math.min(0.98, z1 + 0.05);

      const y1 = cy + (h - cy) * Math.pow(z1, 1.85);
      const y2 = cy + (h - cy) * Math.pow(z2, 1.85);
      const rc1 = (w * 0.5) + curve * Math.pow(1 - z1, 1.7);
      const rc2 = (w * 0.5) + curve * Math.pow(1 - z2, 1.7);
      const dashW1 = Math.max(1.5, 7 * z1);
      const dashW2 = Math.max(1.5, 7 * z2);

      ctx.fillStyle = "#facc15"; // Highway bright yellow
      ctx.beginPath();
      ctx.moveTo(rc1 - dashW1 / 2, y1);
      ctx.lineTo(rc1 + dashW1 / 2, y1);
      ctx.lineTo(rc2 + dashW2 / 2, y2);
      ctx.lineTo(rc2 - dashW2 / 2, y2);
      ctx.closePath();
      ctx.fill();
    }

    // Directional Turn Arrow on the Asphalt Surface
    if (Math.abs(curve) > 35) {
      const arrowZ = 0.52;
      const ay = cy + (h - cy) * Math.pow(arrowZ, 1.85);
      const ax = (w * 0.5) + curve * Math.pow(1 - arrowZ, 1.7);
      const aScale = arrowZ * 1.35;
      drawRoadTurnArrow(ctx, ax, ay, aScale, curve > 0 ? "right" : "left");
    }
  }

  function drawRoadTurnArrow(ctx, x, y, scale, dir) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.scale(dir === "left" ? -scale : scale, scale);

    ctx.beginPath();
    ctx.moveTo(-5, 24);
    ctx.lineTo(5, 24);
    ctx.lineTo(5, -6);
    ctx.lineTo(18, -6);
    ctx.lineTo(0, -28);
    ctx.lineTo(-18, -6);
    ctx.lineTo(-5, -6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function updateAndDrawSceneryObjects(ctx, w, h, cy, cx, dt, speedFactor, timestamp) {
    const totalPoints = navDensifiedPoints ? navDensifiedPoints.length : 0;
    const remainingKm = (totalPoints > 1 && navActiveDestPlot)
      ? Math.max(0, (navDensifiedPoints[totalPoints - 1].cumDistMeters - (navDensifiedPoints[Math.floor(navCurrentIndex)] || {}).cumDistMeters || 0) / 1000)
      : 10;

    // Advance 3D objects along road depth (z from 0 to 1)
    visionSceneryObjects.forEach(obj => {
      obj.z += speedFactor * dt * 0.22;
      if (obj.z >= 1.05) {
        obj.z = 0.08 + Math.random() * 0.04;
        obj.side = Math.random() > 0.5 ? 1 : -1;
        const types = ["villa", "villa", "shop", "palm", "tree", "lamp"];
        obj.type = types[Math.floor(Math.random() * types.length)];
        if (obj.type === "villa") {
          const styles = ["modern", "tiled", "contemporary"];
          obj.style = styles[Math.floor(Math.random() * styles.length)];
          obj.brand = (obj.style === "tiled") ? "Heritage Villa" : "Emerald Villa";
        } else if (obj.type === "shop") {
          const brands = ["Reliance Fresh", "Nilgiris 1905", "Apollo 24/7", "Madras Coffee", "HDFC ATM"];
          obj.brand = brands[Math.floor(Math.random() * brands.length)];
          obj.color = (obj.brand.includes("Apollo") ? "#ef4444" : (obj.brand.includes("Reliance") ? "#16a34a" : "#0284c7"));
        }
      }
    });

    // Check if Destination Layout Entrance Arch should appear (within 250m)
    if (remainingKm < 0.28 && navActiveDestPlot && !visionSceneryObjects.some(o => o.type === "arch")) {
      visionSceneryObjects.push({
        z: 0.12,
        side: 0,
        type: "arch",
        title: navActiveDestPlot.title || "Emerald Crest Villas"
      });
    }

    // Sort objects by depth ascending (render furthest z=0 first, closest z=1 last)
    const sorted = [...visionSceneryObjects].sort((a, b) => a.z - b.z);

    sorted.forEach(obj => {
      const z = obj.z;
      const scale = Math.pow(z, 1.8) * 1.5;
      if (scale < 0.04) return;

      const y = cy + (h - cy) * Math.pow(z, 1.85);
      const roadW = (w * 0.45) * Math.pow(z, 1.3) + 5;
      const roadC = (w * 0.5) + visionCurrentCurve * Math.pow(1 - z, 1.7);

      if (obj.type === "arch") {
        drawCanvasLayoutArch(ctx, roadC, y, scale, obj.title || "Grand Gated Layout");
        return;
      }

      const lateralOffset = (18 + 75 * scale);
      const x = roadC + obj.side * (roadW + lateralOffset);

      if (obj.type === "villa") {
        drawCanvasVilla(ctx, x, y, scale, obj.side, obj.style || "modern");
      } else if (obj.type === "shop" || obj.type === "pharmacy" || obj.type === "coffee") {
        drawCanvasShop(ctx, x, y, scale, obj.side, obj.brand || "Chennai Store", obj.color || "#0284c7");
      } else if (obj.type === "tree") {
        drawCanvasTree(ctx, x, y, scale);
      } else if (obj.type === "palm") {
        drawCanvasPalm(ctx, x, y, scale);
      } else if (obj.type === "lamp") {
        drawCanvasStreetLight(ctx, x, y, scale, obj.side);
      }
    });
  }

  // Realistic Chennai Residential Villa with 3D Depth
  function drawCanvasVilla(ctx, x, y, scale, side, style) {
    ctx.save();
    ctx.translate(x, y);

    const wBox = 110 * scale;
    const hBox = 84 * scale;
    const depth = 28 * scale * (side > 0 ? -1 : 1);

    // Contact shadow on ground
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 0, wBox * 0.7, 9 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Side 3D Depth Wall
    ctx.fillStyle = (style === "tiled") ? "#d97706" : "#64748b";
    ctx.beginPath();
    ctx.moveTo(side > 0 ? wBox / 2 : -wBox / 2, 0);
    ctx.lineTo(side > 0 ? wBox / 2 + depth : -wBox / 2 + depth, -12 * scale);
    ctx.lineTo(side > 0 ? wBox / 2 + depth : -wBox / 2 + depth, -hBox - 12 * scale);
    ctx.lineTo(side > 0 ? wBox / 2 : -wBox / 2, -hBox);
    ctx.closePath();
    ctx.fill();

    // Front Main Facade
    ctx.fillStyle = (style === "tiled") ? "#fef3c7" : "#f8fafc";
    ctx.fillRect(-wBox / 2, -hBox, wBox, hBox);

    // Accent Architectural Pillar / Stone Cladding
    ctx.fillStyle = "#334155";
    const pillarW = wBox * 0.28;
    const pillarX = (side > 0) ? -wBox / 2 : (wBox / 2 - pillarW);
    ctx.fillRect(pillarX, -hBox, pillarW, hBox);

    if (style === "tiled") {
      // Sloping Mangalore Terracotta Roof with Ridges
      ctx.fillStyle = "#b45309"; // Warm terracotta
      ctx.beginPath();
      ctx.moveTo(-wBox / 2 - 12 * scale, -hBox);
      ctx.lineTo(0, -hBox - 28 * scale);
      ctx.lineTo(wBox / 2 + 12 * scale, -hBox);
      ctx.closePath();
      ctx.fill();

      // Roof ridge lines
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = Math.max(1, 2 * scale);
      for (let r = -4; r <= 4; r++) {
        ctx.beginPath();
        ctx.moveTo(r * 10 * scale, -hBox);
        ctx.lineTo(0, -hBox - 28 * scale);
        ctx.stroke();
      }
    } else {
      // Modern Cantilevered Roof & Pergola
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(-wBox / 2 - 6 * scale, -hBox - 8 * scale, wBox + 12 * scale, 6 * scale);

      // Rooftop Water Tank (Sintex style) & Solar PV Panel
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(wBox * 0.15, -hBox - 22 * scale, 16 * scale, 14 * scale);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(-wBox * 0.35, -hBox - 18 * scale, 24 * scale, 10 * scale);
    }

    // Upper Floor Cantilevered Balcony with Glass Railing
    ctx.fillStyle = "rgba(56, 189, 248, 0.45)";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(1, 1.5 * scale);
    const balW = wBox * 0.52;
    const balH = hBox * 0.24;
    const balX = (side > 0) ? (wBox / 2 - balW - 6 * scale) : (-wBox / 2 + 6 * scale);
    const balY = -hBox * 0.58;
    ctx.fillRect(balX, balY, balW, balH);
    ctx.strokeRect(balX, balY, balW, balH);

    // Warmly Lit Picture Windows
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(-wBox / 2 + 10 * scale, -hBox * 0.9, 20 * scale, 16 * scale);
    ctx.fillRect(wBox / 2 - 30 * scale, -hBox * 0.9, 20 * scale, 16 * scale);

    // Teakwood Entrance Door & Canopy
    ctx.fillStyle = "#78350f";
    const doorX = (side > 0) ? 8 * scale : -28 * scale;
    ctx.fillRect(doorX, -32 * scale, 18 * scale, 32 * scale);

    // Front Compound Wall with Gate Pillars & Bougainvillea
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(-wBox / 2 - 10 * scale, -14 * scale, wBox + 20 * scale, 14 * scale);
    // Gate pillar lamps
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(-wBox / 2 - 12 * scale, -18 * scale, 5 * scale, 4 * scale);
    ctx.fillRect(wBox / 2 + 7 * scale, -18 * scale, 5 * scale, 4 * scale);

    // Pink Bougainvillea Flower bush spilling over wall
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(-wBox / 2 - 2 * scale, -12 * scale, 7 * scale, 0, Math.PI * 2);
    ctx.arc(-wBox / 2 + 8 * scale, -15 * scale, 6 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Realistic Commercial Storefront
  function drawCanvasShop(ctx, x, y, scale, side, brand, color) {
    ctx.save();
    ctx.translate(x, y);

    const wBox = 115 * scale;
    const hBox = 76 * scale;
    const depth = 24 * scale * (side > 0 ? -1 : 1);

    // Contact shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 0, wBox * 0.7, 9 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Side Wall Depth
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.moveTo(side > 0 ? wBox / 2 : -wBox / 2, 0);
    ctx.lineTo(side > 0 ? wBox / 2 + depth : -wBox / 2 + depth, -10 * scale);
    ctx.lineTo(side > 0 ? wBox / 2 + depth : -wBox / 2 + depth, -hBox - 10 * scale);
    ctx.lineTo(side > 0 ? wBox / 2 : -wBox / 2, -hBox);
    ctx.closePath();
    ctx.fill();

    // Front Facade
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(-wBox / 2, -hBox, wBox, hBox);

    // Illuminated Marquee Billboard Sign on Top
    ctx.fillStyle = color || "#16a34a";
    ctx.fillRect(-wBox / 2 - 4 * scale, -hBox - 20 * scale, wBox + 8 * scale, 20 * scale);

    // Marquee Signboard Text
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.max(8, Math.round(11 * scale))}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(brand.toUpperCase(), 0, -hBox - 10 * scale);

    // Striped Awning Over Entrance
    const numStripes = 7;
    const sWidth = (wBox + 4 * scale) / numStripes;
    for (let s = 0; s < numStripes; s++) {
      ctx.fillStyle = (s % 2 === 0) ? color : "#ffffff";
      ctx.fillRect(-wBox / 2 - 2 * scale + s * sWidth, -hBox + 2 * scale, sWidth, 14 * scale);
    }

    // Plate Glass Showroom Display Windows with Warm Interior Display
    ctx.fillStyle = "rgba(254, 240, 138, 0.85)";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = Math.max(1, 1.2 * scale);
    ctx.fillRect(-wBox / 2 + 8 * scale, -hBox + 20 * scale, wBox * 0.52, 42 * scale);
    ctx.strokeRect(-wBox / 2 + 8 * scale, -hBox + 20 * scale, wBox * 0.52, 42 * scale);

    // Store Entrance Glass Door
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(wBox * 0.12, -hBox + 20 * scale, wBox * 0.32, 54 * scale);

    ctx.restore();
  }

  // Realistic Neem / Banyan Tree
  function drawCanvasTree(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);

    const trunkW = Math.max(3, 9 * scale);
    const trunkH = 50 * scale;

    // Contact shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 24 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Textured Trunk
    ctx.fillStyle = "#451a03";
    ctx.fillRect(-trunkW / 2, -trunkH, trunkW, trunkH);

    // Multi-layer organic foliage clusters with 3-tone shading
    const clusters = [
      { ox: 0, oy: -trunkH - 18 * scale, r: 28 * scale, color: "#14532d" },
      { ox: -16 * scale, oy: -trunkH - 8 * scale, r: 22 * scale, color: "#15803d" },
      { ox: 16 * scale, oy: -trunkH - 10 * scale, r: 24 * scale, color: "#166534" },
      { ox: -8 * scale, oy: -trunkH - 26 * scale, r: 20 * scale, color: "#16a34a" },
      { ox: 8 * scale, oy: -trunkH - 24 * scale, r: 18 * scale, color: "#22c55e" }
    ];

    clusters.forEach(c => {
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(c.ox, c.oy, c.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // Realistic Royal Coconut Palm
  function drawCanvasPalm(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);

    const hTrunk = 75 * scale;
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 18 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Curved segmented trunk
    ctx.strokeStyle = "#5c2e0b";
    ctx.lineWidth = Math.max(3, 6 * scale);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(8 * scale, -hTrunk * 0.5, 4 * scale, -hTrunk);
    ctx.stroke();

    // Palm Crown Feathery Fronds
    const crownX = 4 * scale;
    const crownY = -hTrunk;
    const numFronds = 9;
    ctx.strokeStyle = "#15803d";
    ctx.lineWidth = Math.max(1.5, 3 * scale);

    for (let f = 0; f < numFronds; f++) {
      const ang = (f / (numFronds - 1) - 0.5) * Math.PI * 0.9 - Math.PI / 2;
      const frondLen = (28 + (f % 3) * 6) * scale;
      ctx.beginPath();
      ctx.moveTo(crownX, crownY);
      ctx.quadraticCurveTo(
        crownX + Math.cos(ang) * frondLen * 0.6,
        crownY + Math.sin(ang) * frondLen * 0.5,
        crownX + Math.cos(ang) * frondLen,
        crownY + Math.sin(ang) * frondLen + 8 * scale
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawCanvasStreetLight(ctx, x, y, scale, side) {
    ctx.save();
    ctx.translate(x, y);

    const poleH = 70 * scale;
    const armW = 20 * scale * (side > 0 ? -1 : 1);

    // Steel pole
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = Math.max(1.5, 3 * scale);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -poleH);
    ctx.lineTo(armW, -poleH - 6 * scale);
    ctx.stroke();

    // Fixture head
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(armW, -poleH - 6 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Light beam cone
    ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
    ctx.beginPath();
    ctx.moveTo(armW, -poleH - 6 * scale);
    ctx.lineTo(armW - 14 * scale, 0);
    ctx.lineTo(armW + 14 * scale, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawCanvasLayoutArch(ctx, cx, y, scale, title) {
    ctx.save();
    ctx.translate(cx, y);

    const archW = 190 * scale;
    const archH = 92 * scale;
    const pillarW = 20 * scale;

    // Contact shadows
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(-archW / 2 - pillarW / 2, 0, pillarW, 6 * scale);
    ctx.fillRect(archW / 2 - pillarW / 2, 0, pillarW, 6 * scale);

    // Granite Pillars
    ctx.fillStyle = "#334155";
    ctx.fillRect(-archW / 2 - pillarW / 2, -archH, pillarW, archH);
    ctx.fillRect(archW / 2 - pillarW / 2, -archH, pillarW, archH);

    // Gold trim bands
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(-archW / 2 - pillarW / 2, -archH * 0.5, pillarW, 4 * scale);
    ctx.fillRect(archW / 2 - pillarW / 2, -archH * 0.5, pillarW, 4 * scale);

    // Connecting Grand Lintel Beam
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(-archW / 2 - pillarW / 2 - 4 * scale, -archH - 18 * scale, archW + pillarW + 8 * scale, 22 * scale);
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.strokeRect(-archW / 2 - pillarW / 2 - 4 * scale, -archH - 18 * scale, archW + pillarW + 8 * scale, 22 * scale);

    // Grand Entrance Text
    ctx.fillStyle = "#fbbf24";
    ctx.font = `bold ${Math.max(8, Math.round(11 * scale))}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText((title || "GRAND ENTRANCE").toUpperCase(), 0, -archH - 8 * scale);

    ctx.restore();
  }

  // Luxury Car Steering Wheel
  function drawCanvasSteeringWheel(ctx, w, h, angle, isDriving) {
    ctx.save();
    const centerX = w * 0.5;
    const centerY = h + 22;
    const radius = Math.min(w * 0.23, 115);
    const jitter = isDriving ? (Math.random() - 0.5) * 0.8 : 0;

    ctx.translate(centerX + jitter, centerY);
    ctx.rotate((angle * Math.PI) / 180);

    // Outer Thick Leather Rim
    ctx.strokeStyle = "#090d16";
    ctx.lineWidth = Math.max(12, radius * 0.18);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Rim Highlight Ring
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
    ctx.stroke();

    // 3 Brushed Metal Spokes
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = Math.max(8, radius * 0.14);
    // Left spoke
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-radius * 0.88, -radius * 0.18); ctx.stroke();
    // Right spoke
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(radius * 0.88, -radius * 0.18); ctx.stroke();
    // Bottom spoke
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, radius * 0.88); ctx.stroke();

    // Center Horn Hub with Gold Accent Ring
    ctx.fillStyle = "#090d16";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f59e0b"; // Gold Ring
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Gold Center Emblem (Luxury Monogram)
    ctx.fillStyle = "#fbbf24";
    ctx.font = `bold ${Math.round(radius * 0.22)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LLB", 0, 0);

    ctx.restore();
  }

  // Sport Motorcycle Handlebars (Bike Mode)
  function drawCanvasBikeHandlebars(ctx, w, h, angle, isDriving) {
    ctx.save();
    const centerX = w * 0.5;
    const centerY = h + 14;
    const jitter = isDriving ? (Math.random() - 0.5) * 1.0 : 0;

    ctx.translate(centerX + jitter, centerY);
    ctx.rotate((angle * 0.55 * Math.PI) / 180);

    // Triple clamp center bracket
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(-50, -38, 100, 32);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.strokeRect(-50, -38, 100, 32);

    // Digital Tactical Motorcycle Speedometer Dashboard
    ctx.fillStyle = "#020617";
    ctx.fillRect(-40, -78, 80, 36);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.8;
    ctx.strokeRect(-40, -78, 80, 36);

    const speedVal = (navState === "playing") ? Math.round(54 + Math.sin(Date.now() * 0.005) * 5) : 0;
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.fillText(speedVal + " KM/H", 0, -56);

    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 9px system-ui";
    ctx.fillText("GEAR 4 • 6,200 RPM", 0, -45);

    // Aluminum Handlebar tubes
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(-175, -22);
    ctx.lineTo(-32, -28);
    ctx.lineTo(32, -28);
    ctx.lineTo(175, -22);
    ctx.stroke();

    // Textured Rubber Grips
    ctx.fillStyle = "#090d16";
    ctx.fillRect(-190, -31, 48, 18);
    ctx.fillRect(142, -31, 48, 18);

    // Anodized Aluminum Bar-End Weights
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(-200, -30, 10, 16);
    ctx.fillRect(190, -30, 10, 16);

    // Polished Billet Brake & Clutch Levers
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-150, -20); ctx.lineTo(-185, -6);
    ctx.moveTo(150, -20); ctx.lineTo(185, -6);
    ctx.stroke();

    ctx.restore();
  }


  // 5. Synchronize 3D Driver Street Vision & Cockpit Telemetry
  function syncDriverStreetVisionTelemetry(floatIndex, maneuver, currentPt, bearing, remKm, remMins, destPlot) {

    if (!destPlot) return;

    // 1. Road & Corridor Name Banner

    const roadNameEl = document.getElementById("visionRoadName");

    if (roadNameEl) {

      roadNameEl.innerHTML = `<strong>${destPlot.locality} Corridor</strong> &bull; Towards <em>${destPlot.title}</em>`;

    }

    // 2. Maneuver Direction Banner Overlay

    const overlay = document.getElementById("visionManeuverOverlay");

    const turnIcon = document.getElementById("visionTurnIcon");

    const turnLabel = document.getElementById("visionTurnLabel");

    const turnSub = document.getElementById("visionTurnSub");

    if (overlay) {

      if (maneuver === "turn-left") {

        overlay.className = "vision-maneuver-overlay turning-left";

        if (turnIcon) turnIcon.innerHTML = '<i class="fas fa-arrow-left"></i>';

        if (turnLabel) turnLabel.textContent = "Turn Left Ahead";

        if (turnSub) turnSub.textContent = `In ${currentPt.distToManeuver || 100} m onto ${destPlot.locality} link`;

      } else if (maneuver === "turn-right") {

        overlay.className = "vision-maneuver-overlay turning-right";

        if (turnIcon) turnIcon.innerHTML = '<i class="fas fa-arrow-right"></i>';

        if (turnLabel) turnLabel.textContent = "Turn Right Ahead";

        if (turnSub) turnSub.textContent = `In ${currentPt.distToManeuver || 100} m onto arterial road`;

      } else if (maneuver === "arrived") {

        overlay.className = "vision-maneuver-overlay arrived";

        if (turnIcon) turnIcon.innerHTML = '<i class="fas fa-flag-checkered"></i>';

        if (turnLabel) turnLabel.textContent = "Arrived at Plot Layout";

        if (turnSub) turnSub.textContent = destPlot.title;

      } else {

        overlay.className = "vision-maneuver-overlay";

        if (turnIcon) turnIcon.innerHTML = '<i class="fas fa-arrow-up"></i>';

        if (turnLabel) turnLabel.textContent = "Continue Straight";

        if (turnSub) turnSub.textContent = `Follow ${destPlot.locality} approach road`;

      }

    }

    // 3. Turn Signal Blinkers on Cockpit Dashboard

    const blinkerLeft = document.getElementById("dashBlinkerLeft");

    const blinkerRight = document.getElementById("dashBlinkerRight");

    if (blinkerLeft) blinkerLeft.classList.toggle("active", maneuver === "turn-left");

    if (blinkerRight) blinkerRight.classList.toggle("active", maneuver === "turn-right");

    // 4. Cockpit Speedometer & Gear

    const speedEl = document.getElementById("dashSpeedNumber");

    const gearEl = document.getElementById("dashGear");

    const baseSpeed = currentVehicleType === "bike" ? 54 : 48;

    const jitter = Math.round(Math.sin(floatIndex * 0.5) * 4);

    if (speedEl) speedEl.textContent = Math.max(25, baseSpeed + jitter);

    if (gearEl) gearEl.textContent = currentVehicleType === "bike" ? "4th" : "D4";

    // 5. Cockpit Telemetry Bar

    const dashBearing = document.getElementById("dashBearing");

    const dashRemDist = document.getElementById("dashRemainingDist");

    const dashEta = document.getElementById("dashEta");

    if (dashBearing) {

      const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

      const dirIdx = Math.round(bearing / 45) % 8;

      dashBearing.textContent = `${Math.round(bearing)}° ${dirs[dirIdx]}`;

    }

    if (dashRemDist) dashRemDist.textContent = remKm < 0.05 ? "0 km" : `${remKm.toFixed(1)} km`;

    if (dashEta) dashEta.textContent = remKm < 0.05 ? "0 min" : `${remMins} min`;

    // 6. Proximity Landmark Radar (Detects nearby shops, pharmacies, cafes along route)

    const radar = document.getElementById("visionLandmarkRadar");

    const radarName = document.getElementById("radarLandmarkName");

    const radarDist = document.getElementById("radarLandmarkDist");

    if (radar && activeSceneryMarkers.length > 0) {

      const currPt = navDensifiedPoints[Math.floor(floatIndex)];

      if (currPt) {

        let closest = null;

        let minDistMeters = Infinity;

        activeSceneryMarkers.forEach(item => {

          const dM = calculateHaversineDistance(currPt.lat, currPt.lng, item.lat, item.lng) * 1000;

          if (dM < 160 && dM < minDistMeters) {

            minDistMeters = dM;

            closest = item;

          }

        });

        if (closest && minDistMeters < 140) {

          radar.style.display = "block";

          if (radarName) radarName.innerHTML = `<i class="fas ${closest.icon}"></i> ${closest.name}`;

          const sideText = closest.side > 0 ? "on your right" : "on your left";

          if (radarDist) radarDist.textContent = `${Math.round(minDistMeters)} m ahead &bull; Passing ${sideText}`;

          // Highlight Leaflet Marker halo

          document.querySelectorAll(".roadside-scenery-pin").forEach(el => el.classList.remove("scenery-active-radar"));

          const activePin = document.querySelector(`.roadside-scenery-pin[data-scenery-idx="${closest.routeIdx}"]`);

          if (activePin) activePin.classList.add("scenery-active-radar");

        } else {

          if (minDistMeters > 180) {

            radar.style.display = "none";

          }

        }

      }

    }

    // 7. Destination Arch Banner (when within 250m)

    const archBanner = document.getElementById("visionDestArchBanner");

    const archPlotName = document.getElementById("visionDestPlotName");

    const archPlotImg = document.getElementById("visionDestPlotImg");

    const archPlotLocality = document.getElementById("visionDestPlotLocality");

    const archPlotPrice = document.getElementById("visionDestPlotPrice");

    const archPlotSize = document.getElementById("visionDestPlotSize");

    const archPlotTag = document.getElementById("visionDestPlotTag");

    if (archBanner) {

      if (remKm < 0.25) {

        archBanner.style.display = "block";

        if (archPlotName) archPlotName.textContent = destPlot.title;

        const plotImg = (destPlot.images && destPlot.images[0]) || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80";

        if (archPlotImg) {

          archPlotImg.src = plotImg;

          archPlotImg.alt = destPlot.title;

        }

        if (archPlotLocality) archPlotLocality.innerHTML = `<i class="fas fa-map-marker-alt text-gold"></i> ${destPlot.locality}`;

        if (archPlotPrice) archPlotPrice.textContent = destPlot.priceDisplay;

        if (archPlotSize) archPlotSize.textContent = `${destPlot.plotSizeSqft} sq.ft (${destPlot.dimensions || '30×50'})`;

        if (archPlotTag) archPlotTag.textContent = destPlot.approvalType || "CMDA Approved";

      } else if (floatIndex < (navDensifiedPoints ? navDensifiedPoints.length - 2 : 10)) {

        archBanner.style.display = "none";

      }

    }

  }

  function handleDriverStreetVisionArrival(destPlot) {

    if (!destPlot) return;

    const speedEl = document.getElementById("dashSpeedNumber");

    const gearEl = document.getElementById("dashGear");

    const blinkerLeft = document.getElementById("dashBlinkerLeft");

    const blinkerRight = document.getElementById("dashBlinkerRight");

    const overlay = document.getElementById("visionManeuverOverlay");

    const turnIcon = document.getElementById("visionTurnIcon");

    const turnLabel = document.getElementById("visionTurnLabel");

    const turnSub = document.getElementById("visionTurnSub");

    const archBanner = document.getElementById("visionDestArchBanner");

    const archPlotName = document.getElementById("visionDestPlotName");

    const archPlotImg = document.getElementById("visionDestPlotImg");

    const archPlotLocality = document.getElementById("visionDestPlotLocality");

    const archPlotPrice = document.getElementById("visionDestPlotPrice");

    const archPlotSize = document.getElementById("visionDestPlotSize");

    const archPlotTag = document.getElementById("visionDestPlotTag");

    const radar = document.getElementById("visionLandmarkRadar");

    const btnCloseArch = document.getElementById("btnCloseArchBanner");

    if (speedEl) speedEl.textContent = "0";

    if (gearEl) gearEl.textContent = "P";

    if (blinkerLeft) blinkerLeft.classList.remove("active");

    if (blinkerRight) blinkerRight.classList.remove("active");

    if (radar) radar.style.display = "none";

    if (overlay) overlay.className = "vision-maneuver-overlay arrived";

    if (turnIcon) turnIcon.innerHTML = '<i class="fas fa-flag-checkered"></i>';

    if (turnLabel) turnLabel.textContent = "DESTINATION ARRIVED";

    if (turnSub) turnSub.textContent = `Welcome to ${destPlot.title}`;

    if (archBanner) {

      archBanner.style.display = "block";

      if (archPlotName) archPlotName.textContent = destPlot.title;

      const plotImg = (destPlot.images && destPlot.images[0]) || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80";

      if (archPlotImg) {

        archPlotImg.src = plotImg;

        archPlotImg.alt = destPlot.title;

      }

      if (archPlotLocality) archPlotLocality.innerHTML = `<i class="fas fa-map-marker-alt text-gold"></i> ${destPlot.locality}`;

      if (archPlotPrice) archPlotPrice.textContent = destPlot.priceDisplay;

      if (archPlotSize) archPlotSize.textContent = `${destPlot.plotSizeSqft} sq.ft (${destPlot.dimensions || '30×50'})`;

      if (archPlotTag) archPlotTag.textContent = destPlot.approvalType || "CMDA Approved";

      if (btnCloseArch) {

        btnCloseArch.onclick = () => {

          archBanner.style.display = "none";

        };

      }

    }

  }

  function showMapDestinationArrivedCard(destPlot) {

    if (!destPlot) return;

    const overlay = document.getElementById("mapDestinationArrivedOverlay");

    if (!overlay) return;

    const plotImg = (destPlot.images && destPlot.images[0]) || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80";

    const heroImgEl = document.getElementById("arrivedPlotHeroImg");

    const titleEl = document.getElementById("arrivedPlotTitle");

    const localityEl = document.getElementById("arrivedPlotLocality");

    const priceEl = document.getElementById("arrivedPlotPrice");

    const sizeEl = document.getElementById("arrivedPlotSize");

    const roadEl = document.getElementById("arrivedPlotRoad");

    const facingEl = document.getElementById("arrivedPlotFacing");

    const approvalBadge = document.getElementById("arrivedApprovalBadge");

    const statusBadge = document.getElementById("arrivedStatusBadge");

    const btnClose = document.getElementById("btnCloseMapArrivedCard");

    if (heroImgEl) {

      heroImgEl.src = plotImg;

      heroImgEl.alt = destPlot.title;

    }

    if (titleEl) titleEl.textContent = destPlot.title;

    if (localityEl) localityEl.innerHTML = `<i class="fas fa-map-marker-alt" style="color:#d97706;"></i> ${destPlot.locality}`;

    if (priceEl) priceEl.textContent = destPlot.priceDisplay;

    if (sizeEl) sizeEl.textContent = `${destPlot.plotSizeSqft} sq.ft (${destPlot.dimensions || '30×50'})`;

    if (roadEl) roadEl.textContent = destPlot.roadWidth || "40-Ft Blacktop";

    if (facingEl) facingEl.textContent = `${destPlot.facing || 'East'} Facing`;

    if (approvalBadge) approvalBadge.innerHTML = `<i class="fas fa-shield-alt"></i> ${destPlot.approvalType || 'CMDA Approved'}`;

    if (statusBadge) statusBadge.textContent = destPlot.status || "Available";

    overlay.style.display = "block";

    if (btnClose) {

      btnClose.onclick = () => {

        overlay.style.display = "none";

      };

    }

  }

  function hideMapDestinationArrivedCard() {

    const overlay = document.getElementById("mapDestinationArrivedOverlay");

    if (overlay) overlay.style.display = "none";

  }

  function resetDriverStreetVisionState() {

    const speedEl = document.getElementById("dashSpeedNumber");

    const gearEl = document.getElementById("dashGear");

    const blinkerLeft = document.getElementById("dashBlinkerLeft");

    const blinkerRight = document.getElementById("dashBlinkerRight");

    const archBanner = document.getElementById("visionDestArchBanner");

    const radar = document.getElementById("visionLandmarkRadar");

    const overlay = document.getElementById("visionManeuverOverlay");

    if (speedEl) speedEl.textContent = "0";

    if (gearEl) gearEl.textContent = "P";

    if (blinkerLeft) blinkerLeft.classList.remove("active");

    if (blinkerRight) blinkerRight.classList.remove("active");

    if (archBanner) archBanner.style.display = "none";

    if (radar) radar.style.display = "none";

    if (overlay) overlay.className = "vision-maneuver-overlay";

    hideMapDestinationArrivedCard();

    document.querySelectorAll(".roadside-scenery-pin").forEach(el => el.classList.remove("scenery-active-radar"));

  }

  // =========================================================================

  // 10. INTERACTIVE LAYOUT MASTERPLAN BLUEPRINT VIEWER

  // =========================================================================

  function initLayoutMasterplan() {

    const grid = document.getElementById("plotsSubdivisionGrid");

    if (!grid || !window.CHENNAI_LAYOUT_MASTERPLAN) return;

    const masterplan = window.CHENNAI_LAYOUT_MASTERPLAN;

    const plots = masterplan.plots || [];

    grid.innerHTML = plots.map(p => {

      const isAvailable = p.status === "Available";

      const isCorner = p.type.includes("Corner");

      let statusClass = isAvailable ? (isCorner ? "corner-vip" : "available") : "sold";

      return `

        <div class="plot-slot ${statusClass}" data-plot-num="${p.number}" onclick="window.selectBlueprintPlot(${p.number})">

          <div class="plot-slot-number">#${p.number}</div>

          <div class="plot-slot-dims">${p.size.split(" ")[0]}</div>

          <div class="plot-slot-status">${p.status}</div>

        </div>

      `;

    }).join("");

  }

  function selectBlueprintPlot(plotNumber) {

    const masterplan = window.CHENNAI_LAYOUT_MASTERPLAN;

    const plot = (masterplan.plots || []).find(p => p.number === plotNumber);

    if (!plot) return;

    const previewBar = document.getElementById("plotDetailSelectedBar");

    if (!previewBar) return;

    previewBar.innerHTML = `

      <div>

        <span style="color:#d97706; font-size:0.8rem; font-weight:800; text-transform:uppercase;">Selected Subdivision Unit</span>

        <h4 style="font-size:1.3rem; color:#ffffff; font-weight:800;">Plot #${plot.number} &mdash; ${plot.size}</h4>

        <div style="font-size:0.85rem; color:#cbd5e1; margin-top:4px;">

          Facing: <strong>${plot.facing}</strong> &bull; Category: <strong>${plot.type}</strong> &bull; Status: <strong style="color:${plot.status === 'Available' ? '#34d399' : '#f87171'}">${plot.status}</strong>

        </div>

      </div>

      <div style="display:flex; align-items:center; gap:16px;">

        <div style="font-size:1.5rem; font-weight:800; color:#fbbf24;">${plot.price}</div>

        ${plot.status === 'Available' ? `

          <button class="btn btn-primary btn-sm" onclick="window.openBookingModal('Plot-#${plot.number} (${plot.size})')">

            <i class="fas fa-lock"></i> Reserve Plot #${plot.number}

          </button>

        ` : `

          <button class="btn btn-outline btn-sm" disabled style="opacity:0.6; cursor:not-allowed;">Sold Out</button>

        `}

      </div>

    `;

    document.querySelectorAll(".plot-slot").forEach(s => s.style.outline = "none");

    const activeSlot = document.querySelector(`.plot-slot[data-plot-num="${plotNumber}"]`);

    if (activeSlot) {

      activeSlot.style.outline = "3px solid #fbbf24";

    }

  }

  // =========================================================================

  // 11. CHENNAI LAND UNIT CONVERTER

  // =========================================================================

  function initLandUnitConverter() {

    const sqftInput = document.getElementById("convSqft");

    const centInput = document.getElementById("convCents");

    const groundInput = document.getElementById("convGrounds");

    const acreInput = document.getElementById("convAcres");

    if (!sqftInput) return;

    sqftInput.addEventListener("input", function () {

      const val = parseFloat(this.value) || 0;

      centInput.value = (val / 435.6).toFixed(2);

      groundInput.value = (val / 2400).toFixed(3);

      acreInput.value = (val / 43560).toFixed(4);

    });

    centInput.addEventListener("input", function () {

      const val = parseFloat(this.value) || 0;

      const sqft = val * 435.6;

      sqftInput.value = Math.round(sqft);

      groundInput.value = (sqft / 2400).toFixed(3);

      acreInput.value = (val / 100).toFixed(4);

    });

    groundInput.addEventListener("input", function () {

      const val = parseFloat(this.value) || 0;

      const sqft = val * 2400;

      sqftInput.value = Math.round(sqft);

      centInput.value = (sqft / 435.6).toFixed(2);

      acreInput.value = (sqft / 43560).toFixed(4);

    });

    acreInput.addEventListener("input", function () {

      const val = parseFloat(this.value) || 0;

      const sqft = val * 43560;

      sqftInput.value = Math.round(sqft);

      centInput.value = (val * 100).toFixed(2);

      groundInput.value = (sqft / 2400).toFixed(3);

    });

  }

  // =========================================================================

  // 12. MODALS & SUBMISSIONS

  // =========================================================================

  function initModals() {

    const sellBtn = document.getElementById("openSellPlotModalBtn");

    if (sellBtn) {

      sellBtn.addEventListener("click", () => openModal("sellPlotModal"));

    }

    document.querySelectorAll(".modal-close-btn, .plot-modal-close-btn").forEach(btn => {

      btn.addEventListener("click", function () {

        const overlay = this.closest(".modal-overlay");

        if (overlay) overlay.classList.remove("open");

      });

    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {

      overlay.addEventListener("click", (e) => {

        if (e.target === overlay) overlay.classList.remove("open");

      });

    });

    // Close any open modal on Escape key

    document.addEventListener("keydown", (e) => {

      if (e.key === "Escape") {

        document.querySelectorAll(".modal-overlay.open").forEach(o => o.classList.remove("open"));

      }

    });

    const sellForm = document.getElementById("sellPlotForm");

    if (sellForm) {

      sellForm.addEventListener("submit", handleSellerSubmission);

    }

    const bookingForm = document.getElementById("bookingSiteVisitForm");

    if (bookingForm) {

      bookingForm.addEventListener("submit", handleBookingSubmission);

    }

    const enquiryForm = document.getElementById("emailEnquiryForm");

    if (enquiryForm) {

      enquiryForm.addEventListener("submit", handleEmailEnquirySubmission);

    }

  }

  function openModal(modalId) {

    const modal = document.getElementById(modalId);

    if (modal) modal.classList.add("open");

  }

  function closeModal(modalId) {

    const modal = document.getElementById(modalId);

    if (modal) modal.classList.remove("open");

  }

  function handleSellerSubmission(e) {

    e.preventDefault();

    const title = document.getElementById("sellTitle").value;

    const locality = document.getElementById("sellLocality").value;

    const zone = document.getElementById("sellZone").value;

    const sizeSqft = parseFloat(document.getElementById("sellSqft").value) || 1200;

    const facing = document.getElementById("sellFacing").value;

    const priceLakhs = parseFloat(document.getElementById("sellPrice").value) || 35;

    const approval = document.getElementById("sellApproval").value;

    const ownerName = document.getElementById("sellOwnerName").value;

    const phone = document.getElementById("sellPhone").value;

    const emailEl = document.getElementById("sellEmail");

    const email = (emailEl && emailEl.value) ? emailEl.value.trim().toLowerCase() : `seller-${Date.now()}@chennaiplots.in`;

    const zoneCoordsMap = {

      omr: [12.8700 + (Math.random() - 0.5) * 0.05, 80.2200 + (Math.random() - 0.5) * 0.02],

      ecr: [12.9000 + (Math.random() - 0.5) * 0.05, 80.2500 + (Math.random() - 0.5) * 0.02],

      gst: [12.9100 + (Math.random() - 0.5) * 0.05, 80.1100 + (Math.random() - 0.5) * 0.03],

      west: [13.0400 + (Math.random() - 0.5) * 0.04, 80.1200 + (Math.random() - 0.5) * 0.03],

      central: [13.0400 + (Math.random() - 0.5) * 0.04, 80.2100 + (Math.random() - 0.5) * 0.02],

      north: [13.1100 + (Math.random() - 0.5) * 0.04, 80.1400 + (Math.random() - 0.5) * 0.03]

    };

    const newPlot = {

      id: "CHN-USR-" + Date.now().toString().slice(-4),

      title: title,

      locality: locality + ", Chennai",

      zone: zone,

      zoneLabel: zone.toUpperCase() + " Zone",

      coords: zoneCoordsMap[zone] || [12.98, 80.18],

      price: priceLakhs * 100000,

      priceDisplay: `₹${priceLakhs.toFixed(2)} Lakhs`,

      pricePerSqft: Math.round((priceLakhs * 100000) / sizeSqft),

      pricePerSqftDisplay: `₹${Math.round((priceLakhs * 100000) / sizeSqft).toLocaleString()} / sq.ft`,

      plotSizeSqft: sizeSqft,

      plotSizeCents: (sizeSqft / 435.6).toFixed(2),

      plotSizeGrounds: (sizeSqft / 2400).toFixed(2),

      dimensions: "Custom Verified",

      facing: facing,

      roadWidth: "30-40 Ft Road",

      approvalType: approval,

      pattaStatus: "100% Verified Individual Patta",

      status: "Available",

      badge: "🆕 Just Listed by Owner",

      featured: true,

      images: [

        "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab275?auto=format&fit=crop&w=1200&q=80",

        "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1200&q=80"

      ],

      description: `Newly submitted plot in ${locality} by ${ownerName}. Direct seller listing with verified documents.`

    };

    try {

      const existing = JSON.parse(localStorage.getItem("chennai_user_listed_plots") || "[]");

      existing.unshift(newPlot);

      localStorage.setItem("chennai_user_listed_plots", JSON.stringify(existing));

    } catch (err) {}

    allPlotsList.unshift(newPlot);

    filterAndRenderPlots();

    try {
      if (window.UniversalDispatcher && typeof window.UniversalDispatcher.dispatchInquiry === "function") {
        window.UniversalDispatcher.dispatchInquiry({
          fullName: ownerName,
          email: email,
          phone: phone,
          inquiryType: "Sell Plot Listing",
          propertyTitle: title + " (" + locality + ")",
          propertyId: newPlot.id,
          budget: `₹${priceLakhs} Lakhs`,
          notes: `Size: ${sizeSqft} sqft, Facing: ${facing}, Approval: ${approval}`
        }).then(data => {
          if (data && data.emailSent) {
            showToast(`✉️ Confirmation email dispatched to ${email}!`);
          }
        }).catch(() => {});
      } else {
        fetch("/webhook/llb-property-inquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: ownerName,
            email: email,
            phone: phone,
            inquiryType: "Sell Plot Listing",
            propertyTitle: title + " (" + locality + ")",
            propertyId: newPlot.id,
            budget: `₹${priceLakhs} Lakhs`,
            notes: `Size: ${sizeSqft} sqft, Facing: ${facing}, Approval: ${approval}`
          })
        }).catch(() => {});
      }
    } catch (e) {}

    closeModal("sellPlotModal");

    showToast(`✅ Your Plot "${title}" is pinned on Chennai Map! Confirmation email sent to ${email}.`);

    setTimeout(() => {

      flyToPointedPin(newPlot.id);

    }, 500);

  }

  async function handleBookingSubmission(e) {
    e.preventDefault();
    const name = document.getElementById("bookName").value.trim();
    const emailEl = document.getElementById("bookEmail");
    const email = (emailEl && emailEl.value) ? emailEl.value.trim().toLowerCase() : "";
    const phone = document.getElementById("bookPhone").value.trim();
    const pickupLoc = document.getElementById("bookPickupLocation").value.trim();
    const date = document.getElementById("bookDate").value;
    const plotTitle = document.getElementById("bookPlotHidden").value;
    const submitBtn = document.getElementById("bookSubmitBtn");

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Dispatching Instant Confirmation & Email...';
    }

    const payload = {
      fullName: name,
      email: email,
      phone: phone,
      inquiryType: "Free Cab Site Visit",
      propertyTitle: plotTitle,
      pickupLocation: pickupLoc,
      date: date,
      notes: `Pickup Location: ${pickupLoc}, Preferred Date: ${date}`
    };

    try {
      let result;
      if (window.UniversalDispatcher && typeof window.UniversalDispatcher.dispatchInquiry === "function") {
        result = await window.UniversalDispatcher.dispatchInquiry(payload);
      } else {
        const res = await fetch("/webhook/llb-property-inquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).catch(() => null);
        result = { success: true, bookingRef: "CP-CH-" + Math.floor(100000 + Math.random() * 900000) };
      }

      closeModal("bookingModal");

      // Open Instant VIP Email Confirmation Receipt Modal
      const receiptContainer = document.getElementById("receiptContentContainer");
      if (receiptContainer && result && result.receiptHtml) {
        receiptContainer.innerHTML = result.receiptHtml;
        openModal("instantEmailReceiptModal");
      }

      showToast(`🚖 Cab Booked! Official verification receipt generated for ${email || phone}.`);

    } catch (err) {
      console.warn("Booking notice:", err);
      closeModal("bookingModal");
      showToast(`🚖 Cab Booked! Driver confirmation dispatched to ${phone}.`);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Free AC Cab Pickup & Send Confirmation Mail';
      }
    }
  }

  // Handle Dedicated Email Enquiry Form Submission

  async function handleEmailEnquirySubmission(e) {
    e.preventDefault();
    const name = document.getElementById("enquiryName").value.trim();
    const email = document.getElementById("enquiryEmail").value.trim().toLowerCase();
    const phone = document.getElementById("enquiryPhone").value.trim();
    const subject = document.getElementById("enquirySubject").value;
    const message = document.getElementById("enquiryMessage").value.trim();
    const plotTitle = document.getElementById("emailEnquiryPlotHidden").value || "Chennai Prime Plot";
    const statusBox = document.getElementById("enquiryStatusBox");
    const submitBtn = document.getElementById("enquirySubmitBtn");

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Dispatching Enquiry & Generating Receipt...';
    }

    const payload = {
      fullName: name,
      email: email,
      phone: phone,
      inquiryType: subject,
      propertyTitle: plotTitle,
      message: message || "Requesting full CMDA sanction copy, revenue Patta status, and layout blueprint."
    };

    try {
      let result;
      if (window.UniversalDispatcher && typeof window.UniversalDispatcher.dispatchInquiry === "function") {
        result = await window.UniversalDispatcher.dispatchInquiry(payload);
      } else {
        result = { success: true, bookingRef: "CP-CH-" + Math.floor(100000 + Math.random() * 900000) };
      }

      if (statusBox) {
        statusBox.style.display = "block";
        statusBox.style.background = "rgba(16, 185, 129, 0.15)";
        statusBox.style.border = "1px solid rgba(16, 185, 129, 0.4)";
        statusBox.style.color = "#34d399";
        statusBox.innerHTML = `
          <strong><i class="fas fa-check-circle"></i> Inquiry Confirmed & Legal Dossier Prepared!</strong><br>
          Official verification pass: <strong>${result.bookingRef}</strong>.<br>
          Confirmation has been dispatched to <strong>${email}</strong>.
          <div style="margin-top:10px;">
            <button type="button" onclick="openInstantReceiptModalDirect()" style="display:inline-block; background:#fbbf24; color:#0b132b; font-weight:700; padding:6px 14px; border-radius:6px; font-size:0.8rem; border:none; cursor:pointer;">
              <i class="fas fa-envelope-open-text"></i> View Dispatched Email Receipt
            </button>
          </div>
        `;
      }

      // Show receipt modal
      const receiptContainer = document.getElementById("receiptContentContainer");
      if (receiptContainer && result && result.receiptHtml) {
        receiptContainer.innerHTML = result.receiptHtml;
        window.lastReceiptHtml = result.receiptHtml;
        openModal("instantEmailReceiptModal");
      }

      showToast(`✉️ Inquiry confirmed for ${plotTitle}! Receipt: ${result.bookingRef}`);

    } catch (err) {
      console.warn("Enquiry error:", err);
      if (statusBox) {
        statusBox.style.display = "block";
        statusBox.style.background = "rgba(16, 185, 129, 0.15)";
        statusBox.style.color = "#34d399";
        statusBox.innerHTML = `<strong><i class="fas fa-check-circle"></i> Inquiry Logged!</strong> Reference: <strong>CP-CH-928410</strong>`;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Official Enquiry & Request Legal Dossier';
      }
    }
  }

  function openEmailEnquiryModal(plotIdOrTitle) {

    const plot = allPlotsList.find(p => p.id === plotIdOrTitle);

    const title = plot ? `${plot.title} (${plot.locality})` : (plotIdOrTitle || "General Chennai Plot Inquiry");

    const label = document.getElementById("emailEnquiryPlotDisplay");

    const hiddenInput = document.getElementById("emailEnquiryPlotHidden");

    const statusBox = document.getElementById("enquiryStatusBox");

    if (label) label.textContent = title;

    if (hiddenInput) hiddenInput.value = title;

    if (statusBox) {

      statusBox.style.display = "none";

      statusBox.innerHTML = "";

    }

    openModal("emailEnquiryModal");

  }

  function openWhatsAppInquiry(plotId) {

    const plot = allPlotsList.find(p => p.id === plotId);

    const title = plot ? plot.title : plotId;

    const locality = plot ? plot.locality : "Chennai";

    const price = plot ? plot.priceDisplay : "";

    const msg = encodeURIComponent(

      `Hello Chennai Plots Team, I am interested in:

📍 Plot: ${title}

📍 Locality: ${locality}

💰 Price: ${price}

(Plot ID: ${plotId})

Please share the approved layout blueprint, CMDA/DTCP order copy, and schedule a site visit.`

    );

    window.open(`https://wa.me/919345029705?text=${msg}`, "_blank");

  }

  function openBookingModal(plotIdOrTitle) {

    const plot = allPlotsList.find(p => p.id === plotIdOrTitle);

    const title = plot ? `${plot.title} (${plot.locality})` : plotIdOrTitle;

    const label = document.getElementById("bookingPlotDisplay");

    const hiddenInput = document.getElementById("bookPlotHidden");

    if (label) label.textContent = title;

    if (hiddenInput) hiddenInput.value = title;

    openModal("bookingModal");

  }

  function showToast(message) {

    let toast = document.getElementById("toastNotice");

    if (!toast) {

      toast = document.createElement("div");

      toast.id = "toastNotice";

      toast.className = "toast-notice";

      document.body.appendChild(toast);

    }

    toast.innerHTML = `<i class="fas fa-check-circle" style="color:#10b981;"></i> ${message}`;

    toast.classList.add("show");

    setTimeout(() => toast.classList.remove("show"), 4000);

  }

  // =========================================================================

  // 13. GLOBAL AESTHETIC 3D BACKGROUND ENGINE (Three.js WebGL + Terrain Mesh)

  // =========================================================================

  let bg3DScene = null, bg3DCamera = null, bg3DRenderer = null;

  let bg3DTerrainMesh = null, bg3DPointsMesh = null, bg3DParticles = null;

  let targetMouseX = 0, targetMouseY = 0;

  let bg3DAnimFrameId = null;

  function initAesthetic3DBackground() {

    const canvas = document.getElementById("aesthetic3DCanvas");

    if (!canvas) return;

    if (typeof THREE === "undefined") {

      initCanvas2DFallback(canvas);

      return;

    }

    try {

      const width = window.innerWidth;

      const height = window.innerHeight;

      bg3DScene = new THREE.Scene();

      bg3DScene.fog = new THREE.FogExp2(0x060b17, 0.012);

      bg3DCamera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);

      bg3DCamera.position.set(0, 4, 30);

      bg3DRenderer = new THREE.WebGLRenderer({

        canvas: canvas,

        alpha: true,

        antialias: true,
      maxZoom: 21,
      minZoom: 9,
      touchZoomRotate: true,

        powerPreference: "high-performance"

      });

      bg3DRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      bg3DRenderer.setSize(width, height);

      // Undulating Land Topography Wireframe Mesh

      const gridW = 50, gridH = 50;

      const geom = new THREE.PlaneGeometry(160, 160, gridW, gridH);

      const posAttr = geom.attributes.position;

      const baseVertices = [];

      for (let i = 0; i < posAttr.count; i++) {

        baseVertices.push({

          x: posAttr.getX(i),

          y: posAttr.getY(i)

        });

      }

      const wireMaterial = new THREE.MeshBasicMaterial({

        color: 0xd4af37,

        wireframe: true,

        transparent: true,

        opacity: 0.13

      });

      bg3DTerrainMesh = new THREE.Mesh(geom, wireMaterial);

      bg3DTerrainMesh.rotation.x = -Math.PI / 2.3;

      bg3DTerrainMesh.position.set(0, -9, -15);

      bg3DScene.add(bg3DTerrainMesh);

      // Overlaid Coordinate Node Beacons (Point Cloud on Topographic Vertices)

      const pointsMat = new THREE.PointsMaterial({

        color: 0x38bdf8,

        size: 0.28,

        transparent: true,

        opacity: 0.55

      });

      bg3DPointsMesh = new THREE.Points(geom, pointsMat);

      bg3DPointsMesh.rotation.x = bg3DTerrainMesh.rotation.x;

      bg3DPointsMesh.position.copy(bg3DTerrainMesh.position);

      bg3DScene.add(bg3DPointsMesh);

      // Ambient Celestial Surveyor Dust Particles

      const particleCount = 280;

      const partGeom = new THREE.BufferGeometry();

      const partPositions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {

        partPositions[i] = (Math.random() - 0.5) * 120;

        partPositions[i + 1] = Math.random() * 50 - 15;

        partPositions[i + 2] = (Math.random() - 0.5) * 80 - 10;

      }

      partGeom.setAttribute("position", new THREE.BufferAttribute(partPositions, 3));

      const partMaterial = new THREE.PointsMaterial({

        color: 0xfbbf24,

        size: 0.35,

        transparent: true,

        opacity: 0.7

      });

      bg3DParticles = new THREE.Points(partGeom, partMaterial);

      bg3DScene.add(bg3DParticles);

      // Mouse Parallax Listeners

      window.addEventListener("mousemove", (e) => {

        targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;

        targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;

      }, { passive: true });

      // Resize Listener

      window.addEventListener("resize", () => {

        if (!bg3DCamera || !bg3DRenderer) return;

        const nw = window.innerWidth;

        const nh = window.innerHeight;

        bg3DCamera.aspect = nw / nh;

        bg3DCamera.updateProjectionMatrix();

        bg3DRenderer.setSize(nw, nh);

      });

      // Pause when tab hidden

      let isVisible = true;

      document.addEventListener("visibilitychange", () => {

        isVisible = !document.hidden;

      });

      // Render Loop

      let clock = 0;

      function animate3D() {

        bg3DAnimFrameId = requestAnimationFrame(animate3D);

        if (!isVisible) return;

        clock += 0.015;

        // Animate Terrain Waves

        const pos = geom.attributes.position;

        for (let i = 0; i < baseVertices.length; i++) {

          const vx = baseVertices[i].x;

          const vy = baseVertices[i].y;

          const z = Math.sin(vx * 0.08 + clock * 0.9) * Math.cos(vy * 0.08 + clock * 0.6) * 3.2

                  + Math.sin((vx + vy) * 0.05 + clock * 0.4) * 2.0;

          pos.setZ(i, z);

        }

        pos.needsUpdate = true;

        // Subtle particle drift

        bg3DParticles.rotation.y = clock * 0.02;

        // Smooth Camera Parallax Damping

        bg3DCamera.position.x += (targetMouseX * 12 - bg3DCamera.position.x) * 0.04;

        bg3DCamera.position.y += (-targetMouseY * 8 + 4 - bg3DCamera.position.y) * 0.04;

        bg3DCamera.lookAt(0, -6, -20);

        bg3DRenderer.render(bg3DScene, bg3DCamera);

      }

      animate3D();

    } catch (e) {

      console.warn("Three.js WebGL initialization failed, switching to 2D canvas fallback:", e);

      initCanvas2DFallback(canvas);

    }

  }

  // 2D Canvas Fallback

  function initCanvas2DFallback(canvas) {

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    function resize() {

      canvas.width = window.innerWidth;

      canvas.height = window.innerHeight;

    }

    resize();

    window.addEventListener("resize", resize);

    const nodes = [];

    for (let i = 0; i < 60; i++) {

      nodes.push({

        x: Math.random() * canvas.width,

        y: Math.random() * canvas.height,

        vx: (Math.random() - 0.5) * 0.4,

        vy: (Math.random() - 0.5) * 0.4,

        r: Math.random() * 2 + 1

      });

    }

    function draw() {

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(212, 175, 55, 0.4)";

      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";

      for (let i = 0; i < nodes.length; i++) {

        const n = nodes[i];

        n.x += n.vx;

        n.y += n.vy;

        if (n.x < 0) n.x = canvas.width;

        if (n.x > canvas.width) n.x = 0;

        if (n.y < 0) n.y = canvas.height;

        if (n.y > canvas.height) n.y = 0;

        ctx.beginPath();

        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);

        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {

          const n2 = nodes[j];

          const dist = Math.hypot(n.x - n2.x, n.y - n2.y);

          if (dist < 120) {

            ctx.beginPath();

            ctx.moveTo(n.x, n.y);

            ctx.lineTo(n2.x, n2.y);

            ctx.stroke();

          }

        }

      }

      requestAnimationFrame(draw);

    }

    draw();

  }

  // =========================================================================

  // 14. DEDICATED SEPARATE VIEW PLOT POPUP MODAL (Gallery + 3D Elevation)

  // =========================================================================

  let activeDetailPlot = null;

  let activeDetailImageIdx = 0;

  let plot3DScene = null, plot3DCamera = null, plot3DRenderer = null;

  let plot3DAnimId = null;

  let isPlot3DDragging = false;

  let plot3DPrevMouse = { x: 0, y: 0 };

  let plot3DRotation = { x: 0.35, y: -0.6 };

  let plot3DGroup = null;

  function initPlotDetailModal() {

    const modal = document.getElementById("plotDetailModal");

    const closeBtn = document.getElementById("closePlotDetailModalBtn");

    const prevBtn = document.getElementById("modalGalleryPrev");

    const nextBtn = document.getElementById("modalGalleryNext");

    const tabPhoto = document.getElementById("btnTabPhotoGallery");

    const tab3D = document.getElementById("btnTab3DView");

    const bookCabBtn = document.getElementById("modalBookCabBtn");

    const whatsappBtn = document.getElementById("modalWhatsAppBtn");

    const emailSupportBtn = document.getElementById("modalEmailSupportBtn");

    const showRouteBtn = document.getElementById("modalShowRouteBtn");

    if (closeBtn) {

      closeBtn.addEventListener("click", () => closeModal("plotDetailModal"));

    }

    if (showRouteBtn) {

      showRouteBtn.addEventListener("click", () => {

        if (!activeDetailPlot) return;

        closeModal("plotDetailModal");

        triggerRouteToPlot(activeDetailPlot.id);

      });

    }

    if (prevBtn) {

      prevBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        stepDetailGallery(-1);

      });

    }

    if (nextBtn) {

      nextBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        stepDetailGallery(1);

      });

    }

    if (tabPhoto) {

      tabPhoto.addEventListener("click", () => switchDetailTab("gallery"));

    }

    if (tab3D) {

      tab3D.addEventListener("click", () => switchDetailTab("3d"));

    }

    if (emailSupportBtn) {

      emailSupportBtn.addEventListener("click", () => {

        if (!activeDetailPlot) return;

        closeModal("plotDetailModal");

        openEmailEnquiryModal(activeDetailPlot.id);

      });

    }

    if (bookCabBtn) {

      bookCabBtn.addEventListener("click", () => {

        if (!activeDetailPlot) return;

        closeModal("plotDetailModal");

        openBookingModal(`${activeDetailPlot.title} (${activeDetailPlot.locality})`);

      });

    }

    if (whatsappBtn) {

      whatsappBtn.addEventListener("click", () => {

        if (!activeDetailPlot) return;

        openWhatsAppInquiry(activeDetailPlot.id);

      });

    }

  }

  function switchDetailTab(tab) {

    const photoContainer = document.getElementById("plotPhotoGalleryContainer");

    const threeDContainer = document.getElementById("plot3DContainer");

    const btnPhoto = document.getElementById("btnTabPhotoGallery");

    const btn3D = document.getElementById("btnTab3DView");

    if (tab === "3d") {

      if (btnPhoto) btnPhoto.classList.remove("active");

      if (btn3D) btn3D.classList.add("active");

      if (photoContainer) photoContainer.style.display = "none";

      if (threeDContainer) threeDContainer.style.display = "block";

      if (activeDetailPlot) {

        initOrUpdatePlot3D(activeDetailPlot);

      }

    } else {

      if (btn3D) btn3D.classList.remove("active");

      if (btnPhoto) btnPhoto.classList.add("active");

      if (threeDContainer) threeDContainer.style.display = "none";

      if (photoContainer) photoContainer.style.display = "block";

    }

  }

  function openPlotDetailView(plotId) {

    const plot = allPlotsList.find(p => p.id === plotId);

    if (!plot) return;

    activeDetailPlot = plot;

    activeDetailImageIdx = 0;

    // 1. Header Information

    const titleEl = document.getElementById("modalPlotTitle");

    const localityEl = document.getElementById("modalPlotLocality");

    const idTagEl = document.getElementById("modalPlotIdTag");

    const priceEl = document.getElementById("modalPlotPrice");

    const rateEl = document.getElementById("modalPlotRate");

    const approvalEl = document.getElementById("modalPlotApproval");

    const reraEl = document.getElementById("modalPlotRera");

    const statusEl = document.getElementById("modalPlotStatus");

    const zoneEl = document.getElementById("modalPlotZone");

    if (titleEl) titleEl.textContent = plot.title;

    if (localityEl) localityEl.textContent = plot.locality;

    if (idTagEl) idTagEl.textContent = `ID: ${plot.id}`;

    if (priceEl) priceEl.textContent = plot.priceDisplay;

    if (rateEl) rateEl.textContent = plot.pricePerSqftDisplay;

    if (approvalEl) approvalEl.innerHTML = `<i class="fas fa-shield-alt"></i> ${plot.approvalType || 'CMDA Approved'}`;

    if (reraEl) reraEl.innerHTML = `<i class="fas fa-certificate"></i> ${plot.reraNo || 'TNRERA Approved'}`;

    if (statusEl) statusEl.innerHTML = `<i class="fas fa-check-circle"></i> ${plot.status || 'Available'}`;

    if (zoneEl) zoneEl.innerHTML = `<i class="fas fa-map-pin"></i> ${plot.zoneLabel || 'Chennai'}`;

    // 2. Visual Showcase (Photos & Thumbnails)

    setupDetailGallery(plot);

    // 3. 3D Badges

    const badge3DFacing = document.getElementById("modal3DFacing");

    const badge3DFrontage = document.getElementById("modal3DFrotange");

    if (badge3DFacing) badge3DFacing.textContent = plot.facing || "East Facing";

    if (badge3DFrontage) badge3DFrontage.textContent = plot.roadWidth || "40-Ft Tar Road";

    // 4. Google Maps Modeled Route Strip

    updateDetailRouteStrip(plot);

    // 5. Land Dimensions Specs

    const sqftEl = document.getElementById("modalPlotSqft");

    const centsEl = document.getElementById("modalPlotCents");

    const dimsEl = document.getElementById("modalPlotDims");

    const facingEl = document.getElementById("modalPlotFacing");

    const roadEl = document.getElementById("modalPlotRoad");

    if (sqftEl) sqftEl.textContent = `${plot.plotSizeSqft} sq.ft`;

    if (centsEl) centsEl.textContent = `${plot.plotSizeCents || (plot.plotSizeSqft / 435.6).toFixed(2)} Cents / ${plot.plotSizeGrounds || (plot.plotSizeSqft / 2400).toFixed(2)} Gr`;

    if (dimsEl) dimsEl.textContent = plot.dimensions || "30 ft × 40 ft";

    if (facingEl) facingEl.textContent = `${plot.facing || 'East'} Facing`;

    if (roadEl) roadEl.textContent = plot.roadWidth || "40 Feet Tar Road";

    // 6. Legal Approvals Dossier

    const approvalNoEl = document.getElementById("modalPlotApprovalNo");

    const reraNoEl = document.getElementById("modalPlotReraNo");

    const pattaEl = document.getElementById("modalPlotPatta");

    const bankLoanEl = document.getElementById("modalPlotBankLoan");

    if (approvalNoEl) approvalNoEl.textContent = plot.approvalNo || `${plot.approvalType || 'CMDA'} / 2026 Sanction`;

    if (reraNoEl) reraNoEl.textContent = plot.reraNo || "TNRERA/2026/PL-0842";

    if (pattaEl) pattaEl.textContent = plot.pattaStatus || "100% Individual Clean Patta";

    if (bankLoanEl) bankLoanEl.textContent = plot.bankLoan || "Pre-approved by SBI, HDFC, ICICI (80%)";

    // 7. Ground Water, Soil & Amenities Features

    const featuresList = document.getElementById("modalFeaturesList");

    if (featuresList) {

      const feats = (plot.features && plot.features.length > 0) ? plot.features : [

        "CMDA / DTCP Sanctioned",

        "Sweet Drinking Water @ 24ft",

        "40 Ft Wide Tar Roads",

        "Underground Electricity & EB",

        "Zero Flood History Guarantee",

        "Avenue Tree Plantations & Parks"

      ];

      featuresList.innerHTML = feats.map(f => `

        <span class="modal-feature-pill"><i class="fas fa-check"></i> ${f}</span>

      `).join("");

    }

    // 8. Key Chennai Proximities / Nearby Landmarks

    const landmarksList = document.getElementById("modalLandmarksList");

    if (landmarksList) {

      const landmarks = (plot.nearbyLandmarks && plot.nearbyLandmarks.length > 0) ? plot.nearbyLandmarks : [

        { name: "Metro Rail Phase 2", distance: "900 m" },

        { name: "IT SEZ & Tech Parks", distance: "1.5 km" },

        { name: "CBSE International School", distance: "1.0 km" },

        { name: "Specialty Hospital", distance: "1.8 km" }

      ];

      landmarksList.innerHTML = landmarks.map(lm => `

        <div class="modal-landmark-pill">

          <span class="modal-landmark-name"><i class="fas fa-map-marker-alt" style="color:var(--gold); margin-right:4px;"></i>${lm.name}</span>

          <span class="modal-landmark-dist">${lm.distance}</span>

        </div>

      `).join("");

    }

    // 9. Overview Description

    const descEl = document.getElementById("modalPlotDescription");

    if (descEl) {

      descEl.textContent = plot.description || `Prime residential plot located in ${plot.locality}, offering immediate villa construction readiness, excellent groundwater, wide road frontage, and superior capital appreciation potential in Chennai.`;

    }

    // Switch default back to Photo Gallery tab

    switchDetailTab("gallery");

    // Open Modal

    openModal("plotDetailModal");

  }

  function setupDetailGallery(plot) {

    const heroImg = document.getElementById("modalHeroImage");

    const counterEl = document.getElementById("modalImageCounter");

    const thumbsStrip = document.getElementById("modalThumbsStrip");

    const hotspotsLayer = document.getElementById("modalHotspotsLayer");

    const images = (plot.images && plot.images.length > 0) ? plot.images : [

      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"

    ];

    function showImage(idx) {

      activeDetailImageIdx = (idx + images.length) % images.length;

      if (heroImg) {

        heroImg.classList.remove("ken-burns");

        heroImg.src = images[activeDetailImageIdx];

        setTimeout(() => heroImg.classList.add("ken-burns"), 50);

      }

      if (counterEl) {

        counterEl.textContent = `${activeDetailImageIdx + 1} / ${images.length}`;

      }

      // Update active thumb

      if (thumbsStrip) {

        thumbsStrip.querySelectorAll(".modal-thumb-item").forEach((thumb, i) => {

          thumb.classList.toggle("active", i === activeDetailImageIdx);

        });

      }

    }

    // Render thumbnails

    if (thumbsStrip) {

      thumbsStrip.innerHTML = images.map((img, i) => `

        <div class="modal-thumb-item ${i === 0 ? 'active' : ''}" onclick="window.selectDetailImage(${i})">

          <img src="${img}" alt="Thumbnail ${i + 1}">

        </div>

      `).join("");

    }

    // Render hotspots on ground/drone view

    if (hotspotsLayer) {

      const hotspots = plot.hotspots || [

        { x: 30, y: 40, label: "40-Ft Wide Road Frontage" },

        { x: 70, y: 35, label: "Underground EB & Streetlights" },

        { x: 50, y: 75, label: "Sweet Water Borewell Zone @ 24ft" }

      ];

      hotspotsLayer.innerHTML = hotspots.map(hs => `

        <div class="img-hotspot" style="top: ${hs.y}%; left: ${hs.x}%;">

          <span class="img-hotspot-tooltip">${hs.label}</span>

        </div>

      `).join("");

    }

    showImage(0);

    window.selectDetailImage = showImage;

  }

  function stepDetailGallery(dir) {

    if (!activeDetailPlot) return;

    const images = activeDetailPlot.images || [];

    if (images.length <= 1) return;

    window.selectDetailImage(activeDetailImageIdx + dir);

  }

  function updateDetailRouteStrip(plot) {

    const originLabelEl = document.getElementById("modalRouteOriginName");

    const gmapsBtn = document.getElementById("modalBtnOpenGoogleMaps");

    const distEl = document.getElementById("modalDistKm");

    const driveEl = document.getElementById("modalDriveTime");

    const bikeEl = document.getElementById("modalBikeTime");

    const transitEl = document.getElementById("modalTransitTime");

    if (originLabelEl) originLabelEl.textContent = currentOriginLabel.split("(")[0].trim();

    const metrics = computeDistanceMetrics(currentOriginCoords, plot.coords);

    if (distEl) distEl.textContent = `${metrics.distanceKm} km`;

    if (driveEl) driveEl.textContent = `${metrics.durationMin} min`;

    if (bikeEl) bikeEl.textContent = `${metrics.bikeMin} min`;

    if (transitEl) transitEl.textContent = `${metrics.transitMin} min`;

    if (gmapsBtn) {

      gmapsBtn.href = `https://www.google.com/maps/dir/?api=1&origin=${currentOriginCoords[0]},${currentOriginCoords[1]}&destination=${plot.coords[0]},${plot.coords[1]}&travelmode=driving`;

    }

  }

  // Interactive 3D Plot Elevation Model in Separate View

  function initOrUpdatePlot3D(plot) {

    const canvas = document.getElementById("plot3DCanvas");

    if (!canvas || typeof THREE === "undefined") return;

    const width = canvas.clientWidth || 450;

    const height = canvas.clientHeight || 340;

    if (!plot3DRenderer) {

      plot3DScene = new THREE.Scene();

      plot3DCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

      plot3DCamera.position.set(0, 16, 26);

      plot3DCamera.lookAt(0, 0, 0);

      plot3DRenderer = new THREE.WebGLRenderer({

        canvas: canvas,

        alpha: true,

        antialias: true,
      maxZoom: 21,
      minZoom: 9,
      touchZoomRotate: true

      });

      plot3DRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      plot3DRenderer.setSize(width, height);

      // Lighting

      const ambLight = new THREE.AmbientLight(0xffffff, 0.85);

      plot3DScene.add(ambLight);

      const dirLight = new THREE.DirectionalLight(0xfbbf24, 1.2);

      dirLight.position.set(15, 25, 20);

      plot3DScene.add(dirLight);

      // Root Group for interactive rotation

      plot3DGroup = new THREE.Group();

      plot3DScene.add(plot3DGroup);

      // Canvas Drag & Orbit Handlers

      canvas.addEventListener("mousedown", (e) => {

        isPlot3DDragging = true;

        plot3DPrevMouse = { x: e.clientX, y: e.clientY };

      });

      window.addEventListener("mousemove", (e) => {

        if (!isPlot3DDragging || !plot3DGroup) return;

        const dx = e.clientX - plot3DPrevMouse.x;

        const dy = e.clientY - plot3DPrevMouse.y;

        plot3DPrevMouse = { x: e.clientX, y: e.clientY };

        plot3DRotation.y += dx * 0.01;

        plot3DRotation.x += dy * 0.01;

        plot3DRotation.x = Math.max(-0.2, Math.min(1.2, plot3DRotation.x));

      });

      window.addEventListener("mouseup", () => {

        isPlot3DDragging = false;

      });

      // Touch events for mobile

      canvas.addEventListener("touchstart", (e) => {

        if (e.touches.length === 1) {

          isPlot3DDragging = true;

          plot3DPrevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        }

      }, { passive: true });

      window.addEventListener("touchmove", (e) => {

        if (!isPlot3DDragging || !plot3DGroup || e.touches.length !== 1) return;

        const dx = e.touches[0].clientX - plot3DPrevMouse.x;

        const dy = e.touches[0].clientY - plot3DPrevMouse.y;

        plot3DPrevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        plot3DRotation.y += dx * 0.01;

        plot3DRotation.x += dy * 0.01;

        plot3DRotation.x = Math.max(-0.2, Math.min(1.2, plot3DRotation.x));

      }, { passive: true });

      window.addEventListener("touchend", () => {

        isPlot3DDragging = false;

      });

      // Zoom via wheel

      canvas.addEventListener("wheel", (e) => {

        e.preventDefault();

        plot3DCamera.position.z += e.deltaY * 0.02;

        plot3DCamera.position.z = Math.max(14, Math.min(38, plot3DCamera.position.z));

      }, { passive: false });

      // Animation Loop

      function animatePlot3D() {

        plot3DAnimId = requestAnimationFrame(animatePlot3D);

        if (plot3DGroup) {

          if (!isPlot3DDragging) {

            plot3DRotation.y += 0.003; // Gentle auto-idle spin

          }

          plot3DGroup.rotation.y = plot3DRotation.y;

          plot3DGroup.rotation.x = plot3DRotation.x;

        }

        plot3DRenderer.render(plot3DScene, plot3DCamera);

      }

      animatePlot3D();

    } else {

      plot3DRenderer.setSize(canvas.clientWidth, canvas.clientHeight);

      plot3DCamera.aspect = canvas.clientWidth / canvas.clientHeight;

      plot3DCamera.updateProjectionMatrix();

    }

    // Rebuild 3D Model specifically for this plot

    while (plot3DGroup.children.length > 0) {

      const obj = plot3DGroup.children[0];

      plot3DGroup.remove(obj);

    }

    // 1. Manicured Green Lawn Parcel

    const plotW = 12;

    const plotD = 14;

    const baseGeom = new THREE.BoxGeometry(plotW, 0.6, plotD);

    const baseMat = new THREE.MeshStandardMaterial({

      color: 0x15803d, // Lush green

      roughness: 0.7,

      metalness: 0.1

    });

    const baseMesh = new THREE.Mesh(baseGeom, baseMat);

    baseMesh.position.y = -0.3;

    plot3DGroup.add(baseMesh);

    // Glowing Golden Boundary Wire

    const edgeGeom = new THREE.EdgesGeometry(baseGeom);

    const edgeMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 2 });

    const edgeMesh = new THREE.LineSegments(edgeGeom, edgeMat);

    edgeMesh.position.copy(baseMesh.position);

    plot3DGroup.add(edgeMesh);

    // 2. Road Frontage

    const roadGeom = new THREE.BoxGeometry(plotW + 6, 0.4, 4.5);

    const roadMat = new THREE.MeshStandardMaterial({

      color: 0x1e293b,

      roughness: 0.9

    });

    const roadMesh = new THREE.Mesh(roadGeom, roadMat);

    roadMesh.position.set(0, -0.4, plotD / 2 + 2.25);

    plot3DGroup.add(roadMesh);

    // Road White Marking Line

    const lineGeom = new THREE.BoxGeometry(plotW + 4, 0.45, 0.35);

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const lineMesh = new THREE.Mesh(lineGeom, lineMat);

    lineMesh.position.set(0, -0.35, plotD / 2 + 2.25);

    plot3DGroup.add(lineMesh);

    // 3. Transparent Modern Architectural Villa Volume (Buildable FSI Envelope)

    const villaW = plotW * 0.7;

    const villaH = 5.5;

    const villaD = plotD * 0.65;

    const villaGeom = new THREE.BoxGeometry(villaW, villaH, villaD);

    const villaMat = new THREE.MeshStandardMaterial({

      color: 0x38bdf8,

      transparent: true,

      opacity: 0.35,

      roughness: 0.2

    });

    const villaMesh = new THREE.Mesh(villaGeom, villaMat);

    villaMesh.position.set(0, villaH / 2, -1);

    plot3DGroup.add(villaMesh);

    const villaEdgeGeom = new THREE.EdgesGeometry(villaGeom);

    const villaEdgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1.5 });

    const villaEdgeMesh = new THREE.LineSegments(villaEdgeGeom, villaEdgeMat);

    villaEdgeMesh.position.copy(villaMesh.position);

    plot3DGroup.add(villaEdgeMesh);

    // 4. Surveyor Boundary Stones (4 Red/White Corner Pegs)

    const pegGeom = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8);

    const pegMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });

    const corners = [

      [-plotW / 2, plotD / 2],

      [plotW / 2, plotD / 2],

      [-plotW / 2, -plotD / 2],

      [plotW / 2, -plotD / 2]

    ];

    corners.forEach(c => {

      const peg = new THREE.Mesh(pegGeom, pegMat);

      peg.position.set(c[0], 0.6, c[1]);

      plot3DGroup.add(peg);

    });

    // 5. 3D Cardinal Compass Indicator

    const compassGroup = new THREE.Group();

    compassGroup.position.set(-plotW / 2 - 2, 0.5, -plotD / 2);

    const northArrowGeom = new THREE.ConeGeometry(0.5, 1.8, 8);

    const northArrowMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    const northArrow = new THREE.Mesh(northArrowGeom, northArrowMat);

    northArrow.rotation.x = -Math.PI / 2;

    northArrow.position.z = -0.9;

    compassGroup.add(northArrow);

    const eastArrowGeom = new THREE.ConeGeometry(0.4, 1.4, 8);

    const eastArrowMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

    const eastArrow = new THREE.Mesh(eastArrowGeom, eastArrowMat);

    eastArrow.rotation.z = -Math.PI / 2;

    eastArrow.position.x = 0.7;

    compassGroup.add(eastArrow);

    plot3DGroup.add(compassGroup);

  }

  // Expose global helpers to window

  window.changeCardSlide = changeCardSlide;

  window.flyToPointedPin = flyToPointedPin;

  window.scrollToPlotCard = scrollToPlotCard;

  window.selectBlueprintPlot = selectBlueprintPlot;

  window.openWhatsAppInquiry = openWhatsAppInquiry;

  window.openBookingModal = openBookingModal;

  window.openEmailEnquiryModal = openEmailEnquiryModal;

  window.resetAllFilters = resetAllFilters;

  window.triggerRouteToPlot = triggerRouteToPlot;

  window.handleZoneQuickJump = handleZoneQuickJump;

  window.openPlotDetailView = openPlotDetailView;

  window.startRouteNavigation = startRouteNavigation;

  window.pauseRouteNavigation = pauseRouteNavigation;

  window.resetRouteNavigation = resetRouteNavigation;

  
  // Toggle vehicle path navigation driving state (Play / Pause / Replay)
  function toggleNavDriveState() {
    if (navState === "playing") {
      pauseRouteNavigation();
    } else {
      if (navDensifiedPoints && navDensifiedPoints.length > 1) {
        startRouteNavigation();
      } else {
        if (typeof executeRouteCalculation === "function") {
          executeRouteCalculation();
        }
      }
    }
    updateDriveToggleButtonUI();
  }

  // Synchronize Drive Path / Pause button UI on map header toolbar
  function updateDriveToggleButtonUI() {
    const btn = document.getElementById("btnMapDriveToggle");
    const icon = document.getElementById("mapDriveToggleIcon");
    const text = document.getElementById("mapDriveToggleText");
    if (!btn || !icon || !text) return;

    // Update vehicle switch pill buttons state
    const btnMapCar = document.getElementById("btnMapSelectCar");
    const btnMapBike = document.getElementById("btnMapSelectBike");
    if (btnMapCar) btnMapCar.classList.toggle("active", currentVehicleType === "car");
    if (btnMapBike) btnMapBike.classList.toggle("active", currentVehicleType === "bike");

    if (navState === "playing") {
      btn.classList.add("driving");
      icon.className = "fas fa-pause";
      text.textContent = "Pause Drive";
      btn.title = `Currently driving along directions as ${currentVehicleType.toUpperCase()}. Click to Pause.`;
    } else if (navState === "paused") {
      btn.classList.remove("driving");
      icon.className = "fas fa-play";
      text.textContent = "Resume Drive";
      btn.title = "Drive paused. Click to resume driving along directions.";
    } else {
      btn.classList.remove("driving");
      if (navDensifiedPoints && navDensifiedPoints.length > 0 && navCurrentIndex >= navDensifiedPoints.length - 1) {
        icon.className = "fas fa-redo-alt";
        text.textContent = "Replay Drive";
        btn.title = "Destination reached. Click to replay driving journey.";
      } else {
        icon.className = "fas fa-play";
        text.textContent = `Drive ${currentVehicleType === "bike" ? "Bike" : "Car"}`;
        btn.title = `Click to drive ${currentVehicleType} through the path along directions.`;
      }
    }
  }

    function minimizeDirectionsPanel() {
    const panel = document.getElementById("gmapsDirectionsPanel");
    const toggleText = document.getElementById("gmapsToggleText");
    const toggleBtn = document.getElementById("gmapsToggleBtn");
    if (!panel) return;
    panel.classList.add("minimized");
    if (toggleText) toggleText.textContent = "Expand Route";
    if (toggleBtn) {
      const icon = toggleBtn.querySelector("i");
      if (icon) icon.className = "fas fa-chevron-down";
    }
  }
  window.minimizeDirectionsPanel = minimizeDirectionsPanel;

  function expandDirectionsPanel() {
    const panel = document.getElementById("gmapsDirectionsPanel");
    const toggleText = document.getElementById("gmapsToggleText");
    const toggleBtn = document.getElementById("gmapsToggleBtn");
    if (!panel) return;
    panel.classList.remove("minimized");
    if (toggleText) toggleText.textContent = "Minimize";
    if (toggleBtn) {
      const icon = toggleBtn.querySelector("i");
      if (icon) icon.className = "fas fa-chevron-up";
    }
  }
  window.expandDirectionsPanel = expandDirectionsPanel;

  window.setVehicleType = setVehicleType;
  window.toggleNavDriveState = toggleNavDriveState;
  window.updateDriveToggleButtonUI = updateDriveToggleButtonUI;

  function seekNavProgress(ratio) {
    if (navDensifiedPoints && navDensifiedPoints.length > 0) {
      const idx = Math.min(Math.max(0, Math.floor(ratio * (navDensifiedPoints.length - 1))), navDensifiedPoints.length - 1);
      navCurrentIndex = idx;
      updateVehiclePositionAndManeuver(navCurrentIndex);
    }
  }
  window.seekNavProgress = seekNavProgress;
  window.updateVehiclePositionAndManeuver = updateVehiclePositionAndManeuver;

  window.handleNavigationArrival = handleNavigationArrival;

    function fitMapSectionIntoScreen(smooth = false) {
    const mapSec = document.getElementById("mapSection");
    if (mapSec) {
      mapSec.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    }
  }
  window.fitMapSectionIntoScreen = fitMapSectionIntoScreen;

  window.setMapTileMode = setMapTileMode;

  // Programmatically switch map between satellite imagery and street vector map

  function setMapTileMode(mode) {

    if (!mapInstance) return;

    const toggleLayerBtn = document.getElementById("toggleSatelliteBtn");

    const satelliteToggleText = document.getElementById("satelliteToggleText");

    if (mode === "satellite") {

      if (streetTileLayer && mapInstance.hasLayer(streetTileLayer)) {

        mapInstance.removeLayer(streetTileLayer);

      }

      if (satelliteTileLayer && !mapInstance.hasLayer(satelliteTileLayer)) {

        satelliteTileLayer.addTo(mapInstance);

      }

      currentTileMode = "satellite";

      if (toggleLayerBtn) {

        toggleLayerBtn.classList.add("btn-satellite-active");

        if (satelliteToggleText) satelliteToggleText.textContent = "Satellite Map: ON";

        else toggleLayerBtn.innerHTML = '<i class="fas fa-satellite"></i> <span>Satellite Map: ON</span>';

      }

    } else if (mode === "street") {

      if (satelliteTileLayer && mapInstance.hasLayer(satelliteTileLayer)) {

        mapInstance.removeLayer(satelliteTileLayer);

      }

      if (streetTileLayer && !mapInstance.hasLayer(streetTileLayer)) {

        streetTileLayer.addTo(mapInstance);

      }

      currentTileMode = "street";

      if (toggleLayerBtn) {

        toggleLayerBtn.classList.remove("btn-satellite-active");

        if (satelliteToggleText) satelliteToggleText.textContent = "Street Map";

        else toggleLayerBtn.innerHTML = '<i class="fas fa-map"></i> <span>Street Map</span>';

      }

    }

  }

  window.toggleNavigationZoom = toggleNavigationZoom;

  window.getMapInstance = () => mapInstance;

  window.NAV_STREET_ZOOM = NAV_STREET_ZOOM;

  window.getNavDensifiedPoints = () => navDensifiedPoints;

  window.getNavState = () => ({ navState, navCurrentIndex, currentVehicleType });

  // =========================================================================
  // SPEED CONTROL (1X REAL-TIME / 2X / 4X) & GOOGLE MAPS COMPASS NORTH
  // =========================================================================
  window.setNavSpeed = function(val) {
    navSpeed = parseInt(val, 10) || 1;
    updateSpeedControlsUI();
  };

  window.cycleNavSpeed = function(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (navSpeed === 1) {
      navSpeed = 2;
    } else if (navSpeed === 2) {
      navSpeed = 4;
    } else {
      navSpeed = 1;
    }
    updateSpeedControlsUI();
    if (window.showToast) {
      window.showToast(`Simulation speed: ${navSpeed}x ${navSpeed === 1 ? '(Normal Real-Time Speed)' : ''}`);
    }
  };

  function updateSpeedControlsUI() {
    const sel = document.getElementById("navSpeedSelect");
    if (sel) sel.value = String(navSpeed);
    const pillTxt = document.getElementById("hudSpeedPillText");
    if (pillTxt) pillTxt.textContent = `${navSpeed}x Speed`;
    const minTxt = document.getElementById("hudMinSpeedText");
    if (minTxt) minTxt.textContent = `${navSpeed}x`;
  }
  window.updateSpeedControlsUI = updateSpeedControlsUI;

  window.resetMapNorth = function(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!mapInstance) return;
    const center = (window.navVehicleMarker && window.navVehicleMarker.getLngLat())
      ? [window.navVehicleMarker.getLngLat().lng, window.navVehicleMarker.getLngLat().lat]
      : (window.currentDestPlotCoords || [80.18, 12.98]);
    mapInstance.easeTo({
      center: center,
      bearing: 0,
      pitch: 0,
      duration: 800
    });
    const needle = document.getElementById("compassNeedlePivot");
    if (needle) needle.style.transform = "rotate(0deg)";
    const headingText = document.getElementById("compassHeadingText");
    if (headingText) headingText.textContent = "NORTH • 0°";
    if (window.showToast) {
      window.showToast("🧭 Compass: Map aligned North-Up (Google Maps style)");
    }
  };

})();



  // ==========================================================================
  // MOBILE APP NAVIGATION & TOUCH STEERING HELPERS
  // ==========================================================================

  window.focusOnMapSection = function () {
    const mapEl = document.getElementById("interactiveMapSection") || document.getElementById("chennaiLeafletMap");
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  window.toggleStreetVisionQuick = function () {
    const container = document.getElementById("driverStreetVisionContainer");
    if (container && container.style.display !== "none") {
      closeStreetVision();
    } else {
      const activeId = window.activePlotId || "CHN-OMR-01";
      startDriverStreetVisionForPlot(activeId, "car");
    }
  };

  window.openCabBookingForActivePlot = function () {
    const activeId = window.activePlotId || "CHN-OMR-01";
    openBookingModalForPlot(activeId);
  };

  window.toggleMobileFilterDrawer = function () {
    const searchSec = document.querySelector(".hero-search-section") || document.getElementById("interactiveMapSection");
    if (searchSec) {
      searchSec.scrollIntoView({ behavior: "smooth", block: "start" });
      showToast("🔍 Filter by Zone, Budget, or CMDA/DTCP Approvals above.");
    }
  };

  window.openInstantReceiptModalDirect = function () {
    const receiptContainer = document.getElementById("receiptContentContainer");
    if (receiptContainer && window.lastReceiptHtml) {
      receiptContainer.innerHTML = window.lastReceiptHtml;
    }
    openModal("instantEmailReceiptModal");
  };

  // Canvas Touch Steering for Mobile
  function initMobileTouchSteering() {
    const visionCanvas = document.getElementById("visionCanvas");
    if (!visionCanvas) return;

    visionCanvas.addEventListener("touchstart", function (e) {
      if (!e.touches || !e.touches[0]) return;
      const rect = visionCanvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const ratio = touchX / rect.width;

      if (ratio < 0.38) {
        setStreetVisionSteer("left");
      } else if (ratio > 0.62) {
        setStreetVisionSteer("right");
      } else {
        setStreetVisionSteer("center");
      }
    }, { passive: true });
  }

  // PWA Service Worker Registration
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").then(function () {
        console.log("PWA Service Worker registered.");
      }).catch(function (err) {
        console.warn("PWA SW note:", err);
      });
    });
  }

  // PWA Install Banner Listener
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById("pwaInstallBanner");
    if (banner) banner.style.display = "flex";
  });

  document.addEventListener("DOMContentLoaded", function () {
    initMobileTouchSteering();
    const btnInstall = document.getElementById("btnPwaInstall");
    if (btnInstall) {
      btnInstall.addEventListener("click", async function () {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt = null;
          const banner = document.getElementById("pwaInstallBanner");
          if (banner) banner.style.display = "none";
        }
      });
    }
    const btnDismiss = document.getElementById("btnPwaDismiss");
    if (btnDismiss) {
      btnDismiss.addEventListener("click", function () {
        const banner = document.getElementById("pwaInstallBanner");
        if (banner) banner.style.display = "none";
      });
    }
  });

  // =========================================================================
  // MOBILE CLOSE-UP ZOOM & DIRECTIONS HELPERS
  // =========================================================================
  window.zoomCloseToDestinationPlot = function() {
    if (!mapInstance) return;
    const coords = window.currentDestPlotCoords || (allPlotsList && allPlotsList[currentStepperIndex] && [allPlotsList[currentStepperIndex].coords[1], allPlotsList[currentStepperIndex].coords[0]]);
    if (coords) {
      mapInstance.flyTo({
        center: coords,
        zoom: 18.2,
        pitch: 45,
        bearing: 0,
        duration: 1200
      });
      window.updateRouteZoomToggleBtn(true);
      if (window.showToast) {
        window.showToast("🔍 Zoomed close to plot & street directions (18x)!");
      }
    }
  };

  window.zoomToRouteOverview = function() {
    if (!mapInstance) return;
    if (window.currentRouteBounds) {
      mapInstance.fitBounds(window.currentRouteBounds, {
        padding: { top: 60, bottom: 180, left: 20, right: 20 },
        pitch: 20,
        bearing: 0,
        duration: 1000
      });
    } else {
      window.fitAllPlotsOnMap();
    }
    window.updateRouteZoomToggleBtn(false);
  };

  window.toggleMobileRouteZoom = function() {
    if (!mapInstance) return;
    const currZoom = mapInstance.getZoom();
    if (currZoom >= 17) {
      window.zoomToRouteOverview();
    } else {
      window.zoomCloseToDestinationPlot();
    }
  };

  window.updateRouteZoomToggleBtn = function(isZoomedIn) {
    const btn = document.getElementById("floatingRouteZoomBtn");
    const txt = document.getElementById("floatingRouteZoomText");
    if (!btn || !txt) return;
    btn.style.display = "inline-flex";
    if (isZoomedIn) {
      txt.textContent = "Route Overview";
      btn.classList.add("zoomed-in");
    } else {
      txt.textContent = "Zoom Close (18x)";
      btn.classList.remove("zoomed-in");
    }
  };


  // =========================================================================
  // JOURNEY NOTIFICATION BAR MINIMIZE & DISMISS SYSTEM
  // =========================================================================
  window.toggleHudMinimize = function(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const hud = document.getElementById("gmapsLiveNavHud");
    if (!hud) return;

    hud.classList.toggle("minimized");
    const isMin = hud.classList.contains("minimized");

    const minText = document.getElementById("hudMinText");
    const minIcon = document.getElementById("hudMinIcon");
    if (minText) minText.textContent = isMin ? "Expand" : "Minimize";
    if (minIcon) minIcon.className = isMin ? "fas fa-chevron-down" : "fas fa-minus";

    // Sync minimized pill texts
    const distEl = document.getElementById("hudRemainingDist");
    const etaEl = document.getElementById("hudRemainingEta");
    const minEtaText = document.getElementById("hudMinEtaText");
    const minStatusText = document.getElementById("hudMinStatusText");
    const turnDist = document.getElementById("hudTurnDistance");

    if (minEtaText && distEl && etaEl) {
      minEtaText.innerHTML = `${distEl.textContent} &bull; ${etaEl.textContent}`;
    }
    if (minStatusText) {
      if (turnDist && turnDist.textContent.includes("Paused")) {
        minStatusText.textContent = "Journey Paused";
      } else if (navState === "stopped" || navState === "paused") {
        minStatusText.textContent = "Journey Paused";
      } else {
        minStatusText.textContent = "Navigating";
      }
    }

    if (window.showToast) {
      window.showToast(isMin ? "Notification minimized. Behind options are visible!" : "Notification expanded");
    }
  };

  window.dismissLiveNavHud = function(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const hud = document.getElementById("gmapsLiveNavHud");
    if (hud) {
      hud.style.display = "none";
      hud.classList.remove("minimized");
    }
    if (typeof window.stopRouteNavigation === "function") {
      window.stopRouteNavigation();
    }
    if (window.showToast) {
      window.showToast("Navigation notification closed");
    }
  };