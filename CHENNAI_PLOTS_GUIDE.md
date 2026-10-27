# 📍 Chennai Prime Plots — Interactive Map & Selling Portal

> **Comprehensive Portal to Sell & Buy Plots Across All Chennai Localities**  
> Integrated with an **Interactive Leaflet Map with Custom Pointed Symbols**, **Animated Drone & Ground Images**, **3D Card Tilt Effects**, and **Instant WhatsApp & Cab Booking**.

---

## 🚀 Live Access & Quick Start

The website is currently **live** and accessible locally:

- **Portal URL**: [http://localhost:8080/chennai-plots.html](http://localhost:8080/chennai-plots.html)
- **1-Click Windows Launcher**: Double-click [`run_chennai_plots.bat`](file:///c:/Users/chand/Downloads/ai-agent-1/ai-agent-1/run_chennai_plots.bat)

---

## 🌟 Key Features Built

### 1. 🗺️ Google Maps Modeled Routing & Live Distance Engine
- **Floating Google Maps Direction Panel**: Positioned directly on the map just like Google Maps desktop & mobile.
- **Location-to-Location Route Planning**:
  - **Origin (Point A)**: Select from major Chennai landmarks (*Airport, Central Station, Tidel Park OMR, Phoenix Marketcity, Kilambakkam Bus Terminus, Koyambedu, Porur, Guindy*), choose another plotted land, or click **"Use My Live GPS Location"** to automatically locate via device GPS.
  - **Destination (Point B)**: Select from all 20+ available plots.
  - **Swap Button (⇅)**: Instantly swap origin and destination points.
- **Multi-Modal Travel Modes**:
  - 🚗 **Drive (Car / Cab)**: Real traffic ETA and major highway routing.
  - 🏍️ **Two-Wheeler (Bike)**: Faster rush-hour travel times.
  - 🚇 **Transit (Metro / Suburban)**: Multi-modal transit travel times.
  - 🚶 **Walking**: Pedestrian distance and walking duration.
- **Distance & ETA Calculation**:
  - Computes exact road distance (e.g. `17.6 km`) and estimated travel time (e.g. `28 min`).
  - Identifies the primary arterial corridor (e.g. *"via Pallavaram-Thoraipakkam 200-Ft Radial Road & OMR"*).
  - Expandable **Turn-by-Turn Directions** with maneuver icons.
- **Google Maps App Integration**:
  - Direct 1-click button to open the route directly in the **official Google Maps App** on mobile or desktop with coordinates pre-populated.
- **Live Highway Polyline**: Draws the authentic Google Maps blue route line (`#1a73e8`) with dark blue border casing and auto-fits map camera bounds to the journey.
- **Interactive Card Distance Badges**: Every plot card in the catalog showcases live distance and driving time from the active starting point (e.g. `🚗 17.6 km (28 min from Airport)`) with a quick "Route Map" button.

### 2. 📍 Interactive Chennai Master Map with Pointed Needle Symbols
- **Custom Pointed Pin Markers**: Designed with an SVG sharp needle pointer pointing directly to the surveyed plot coordinates, an attached live price badge (e.g. `₹48 L`, `₹1.35 Cr`), and an animated **pulsing radar beacon wave** beneath the pointer.
- **Color-Coded Status**:
  - 🟢 **Emerald Pointed Pin**: Active Available Sanctioned Plot
  - 🟡 **Golden Pointed Pin**: Ultra-Prime Corner VIP / High Appreciation Asset
- **Interactive Marker Clicks**:
  - Smooth camera flight (`flyTo`) centering the map at 15x zoom.
  - Floating card popup featuring property thumbnail, CMDA sanction badge, size in Sq.Ft, rate/sq.ft, facing, road width, and direct "View Plot" & "WhatsApp Chat" buttons.
  - Automatically scrolls down and flashes the matching plot card in the listing grid.
- **Layer Switcher**: Toggle with 1 click between **Street Map (OpenStreetMap)** and **High-Resolution Satellite Imagery (Esri World Imagery)**.
- **Zone Quick Jump**: One-touch pills to glide across Chennai corridors:
  - *All Chennai • OMR Corridor • ECR Coastal • Tambaram & GST • Porur & West • Central (Anna Nagar) • North (Ambattur) • Sriperumbudur Hub*

---

### 2. 🎬 Animated Selling Plot Visuals
- **Ken Burns Animated Image Slider**:
  - High-definition plot photographs (aerial layout view, blacktop road approach, boundary demarcation, and surrounding landmarks).
  - Smooth continuous crossfade with subtle cinematic zoom and pan (`kenBurnsZoom`).
  - Next/Previous controls and animated progress dots.
- **Interactive 3D Card Hover Tilt**:
  - Real-time perspective tilt reacting to mouse position with dynamic holographic specular reflection (`--mouse-x`, `--mouse-y`).
- **Interactive Pulsing Hotspot Markers**:
  - Hotspots positioned directly over plot images highlighting:
    - *40-Ft Blacktop Wide Avenue*
    - *Underground EB & Streetlights*
    - *Potable Sweet Water Borewell Zone @ 24ft*
    - *Corporation Metrowater & Drainage Lines*
  - Hovering displays animated informational tooltips.
- **Shimmering Badges**: "🔥 FAST SELLING - CORNER OPTION", "⭐ READY FOR CONSTRUCTION", "💎 PRIME CORNER PLOT", "🌊 ULTRA-LUXURY SEA BREEZE".

---

### 3. 🏙️ Complete Coverage of All Chennai Real Estate Corridors
| Chennai Corridor | Key Localities Covered | Sample Pricing Range |
| :--- | :--- | :--- |
| **OMR (IT Expressway)** | Sholinganallur, Navalur, Siruseri SIPCOT, Kelambakkam | ₹26.40 L – ₹48.00 Lakhs |
| **ECR (Scenic Coastal Road)** | Injambakkam, Uthandi, Neelankarai | ₹84.00 L – ₹1.35 Crores |
| **South Chennai & GST Road** | Tambaram West, Guduvanchery, Vandalur, Medavakkam, Perumbakkam | ₹26.40 L – ₹54.00 Lakhs |
| **West Chennai Corridor** | Porur, Poonamallee Bypass, Thirumazhisai Satellite City | ₹27.60 L – ₹66.00 Lakhs |
| **Central Urban Chennai** | Velachery (Phoenix Mall area), Anna Nagar West Extn | ₹1.08 Cr – ₹1.56 Crores |
| **North Chennai Hub** | Ambattur OT & Industrial, Avadi Defence, Kolathur Lake | ₹31.20 L – ₹62.40 Lakhs |
| **High Growth Industrial** | Sriperumbudur (Near proposed Parandur Greenfield Airport) | ₹21.60 Lakhs |

---

### 4. 📐 Interactive Layout Masterplan Subdivision Blueprint
- Visual architectural subdivision blueprint displaying **Plots #1 to #24**.
- Color-coded:
  - 🟢 **Available (Standard)**
  - 🟡 **Available (Corner VIP)**
  - ⚫ **Sold Out**
- Clicking any plot number dynamically populates the **Selected Subdivision Unit Drawer**, showing exact dimensions (e.g. 30×40 ft, 36×50 ft), facing direction, category, price, and instant reservation trigger.

---

### 5. 🧮 Chennai Land Unit Converter
- Real-time bidirectional converter specifically tailored to Tamil Nadu land measurement standards:
  - **Square Feet (Sq.Ft)**
  - **Cents** (1 Cent = 435.60 Sq.Ft)
  - **Grounds** (1 Ground = 2,400.00 Sq.Ft)
  - **Acres** (1 Acre = 43,560.00 Sq.Ft / 100 Cents)

---

### 6. 📝 "Sell Your Plot" Owner Portal & Lead Generation
- **Sell Your Plot Modal**: Chennai plot owners can list their land directly by entering title, area, zone, square footage, facing, asking price, and contact info.
- Automatically places a new pointed pin onto the interactive Chennai map and prepends the card to the live showcase grid (persisted via `localStorage`).
- **Free Cab Site Visit Modal**: Allows interested buyers to book complimentary sanitized AC cab pickup anywhere in Chennai.
- **1-Click WhatsApp Direct Chat**: Pre-fills the plot ID, title, locality, and price to connect with the owner/sales desk.

---

## 📁 Source Files Created

- [`chennai-plots.html`](file:///c:/Users/chand/Downloads/ai-agent-1/ai-agent-1/llb-real-estate/chennai-plots.html): Main responsive HTML portal
- [`chennai-plots.css`](file:///c:/Users/chand/Downloads/ai-agent-1/ai-agent-1/llb-real-estate/chennai-plots.css): Advanced CSS styling, animations, Leaflet overrides, and 3D effects
- [`chennai-plots-data.js`](file:///c:/Users/chand/Downloads/ai-agent-1/ai-agent-1/llb-real-estate/chennai-plots-data.js): Comprehensive 20-plot dataset with exact GPS coordinates and specs
- [`chennai-plots.js`](file:///c:/Users/chand/Downloads/ai-agent-1/ai-agent-1/llb-real-estate/chennai-plots.js): Leaflet map logic, custom pointed icons, 3D card tilt, Ken Burns slider, and filtering
- [`run_chennai_plots.bat`](file:///c:/Users/chand/Downloads/ai-agent-1/ai-agent-1/run_chennai_plots.bat): 1-click launcher for Windows
