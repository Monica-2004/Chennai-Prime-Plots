/**
 * Chennai Prime Plots Dataset
 * Comprehensive portfolio of CMDA & DTCP approved plots across all major Chennai zones.
 */

const CHENNAI_PLOTS_DATA = [
  // --- ZONE 1: OMR (IT CORRIDOR) ---
  {
    id: "CHN-OMR-01",
    title: "Emerald Crest Villa Plots",
    locality: "Sholinganallur, OMR",
    zone: "omr",
    zoneLabel: "OMR IT Corridor",
    coords: [12.9010, 80.2279],
    price: 4800000,
    priceDisplay: "₹48.00 Lakhs",
    pricePerSqft: 4000,
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
    status: "Available",
    badge: "🔥 Fast Selling - Corner Option",
    featured: true,
    nearbyLandmarks: [
      { name: "Sholinganallur ELCOT IT Park", distance: "1.2 km" },
      { name: "Upcoming Metro Phase-2 Station", distance: "800 m" },
      { name: "Apollo Cradle & Specialty Hospital", distance: "1.5 km" },
      { name: "BVM Global CBSE School", distance: "900 m" }
    ],
    features: [
      "CMDA & TNRERA Approved",
      "Gated Community with Arch",
      "40 Ft Wide Tar Roads",
      "Sweet Drinking Water @ 24ft",
      "Underground EB & Drainage",
      "Avenue Trees & Landscaped Park"
    ],
    hotspots: [
      { x: 32, y: 45, label: "40-Ft Blacktop Main Road Access" },
      { x: 68, y: 35, label: "Underground EB & Streetlights" },
      { x: 50, y: 75, label: "Sweet Water Borewell Zone @ 24ft" }
    ],
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    droneVideo: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-green-fields-and-trees-42998-large.mp4",
    description: "Prime residential layout nestled in the thriving heart of Sholinganallur, right behind the ELCOT IT SEZ. Fully secured gated layout with CMDA sanction, ready for immediate luxury villa construction. High appreciation guarantee due to Metro Phase 2 station within walking distance."
  },
  {
    id: "CHN-OMR-02",
    title: "Navalur Tech Palms Luxury Layout",
    locality: "Navalur, OMR",
    zone: "omr",
    zoneLabel: "OMR IT Corridor",
    coords: [12.8468, 80.2265],
    price: 3840000,
    priceDisplay: "₹38.40 Lakhs",
    pricePerSqft: 3200,
    pricePerSqftDisplay: "₹3,200 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "North",
    roadWidth: "30 Feet Concrete Road",
    approvalType: "DTCP & TNRERA",
    approvalNo: "DTCP/Chengalpattu/2026/89",
    reraNo: "TNRERA/2026/PL-1102",
    pattaStatus: "Clear Computerized Patta",
    bankLoan: "Approved by Axis, HDFC & Canara Bank",
    status: "Available",
    badge: "⭐ Ready for Construction",
    featured: true,
    nearbyLandmarks: [
      { name: "Vivira Mall & AGS Cinemas", distance: "950 m" },
      { name: "SIPCOT IT Park Siruseri", distance: "3.0 km" },
      { name: "Hiranandani Upscale School", distance: "1.4 km" }
    ],
    features: [
      "DTCP Sanctioned Layout",
      "Compound Wall with 24/7 Security",
      "Solar Street Lighting",
      "24x7 Sweet Potable Groundwater",
      "Stormwater Drains Installed"
    ],
    hotspots: [
      { x: 25, y: 40, label: "Concrete 30ft Internal Road" },
      { x: 75, y: 60, label: "Parks & Children Play Area" }
    ],
    images: [
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Located 5 minutes off the main OMR expressway in Navalur, Tech Palms provides serene green living while keeping you right next to tech hubs, malls, and prestigious colleges. 100% vaastu compliant orientation with sweet water."
  },
  {
    id: "CHN-OMR-03",
    title: "Siruseri Cyber Enclave Plots",
    locality: "Siruseri SIPCOT, OMR",
    zone: "omr",
    zoneLabel: "OMR IT Corridor",
    coords: [12.8226, 80.2197],
    price: 3240000,
    priceDisplay: "₹32.40 Lakhs",
    pricePerSqft: 2700,
    pricePerSqftDisplay: "₹2,700 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "North-East Corner",
    roadWidth: "40 Feet Main Road + 30 Feet Cross",
    approvalType: "DTCP & TNRERA",
    approvalNo: "DTCP/2026/PL-512",
    reraNo: "TNRERA/2026/PL-0791",
    pattaStatus: "Clean Title & Individual Patta",
    bankLoan: "SBI & HDFC 85% Plot Loans",
    status: "Booked",
    badge: "⏳ Booked - Advance Token Received",
    featured: false,
    nearbyLandmarks: [
      { name: "TCS Siruseri Campus (Asia's Largest)", distance: "1.1 km" },
      { name: "SIPCOT Main Gate", distance: "800 m" },
      { name: "PSBB Millennium School", distance: "2.0 km" }
    ],
    features: [
      "Direct SIPCOT Adjacency",
      "Dual Corner Road Frontage",
      "Streetlights & Underground Cabling",
      "Secured Gated Entry Gate"
    ],
    images: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Corner plot in prime Siruseri just outside the SIPCOT tech campus. Highly sought after by senior software professionals and investors seeking rapid rental yield and land appreciation."
  },
  {
    id: "CHN-OMR-04",
    title: "Lakeview County Kelambakkam",
    locality: "Kelambakkam, OMR-GST Link",
    zone: "omr",
    zoneLabel: "OMR IT Corridor",
    coords: [12.7876, 80.2201],
    price: 2640000,
    priceDisplay: "₹26.40 Lakhs",
    pricePerSqft: 2200,
    pricePerSqftDisplay: "₹2,200 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "East",
    roadWidth: "30 Feet Road",
    approvalType: "DTCP Approved",
    approvalNo: "DTCP/2026/7821",
    reraNo: "TNRERA/2026/PL-304",
    pattaStatus: "Immediate Patta Transfer",
    bankLoan: "Pre-approved by Indian Bank & SBI",
    status: "Available",
    badge: "💰 High ROI Budget Choice",
    featured: false,
    nearbyLandmarks: [
      { name: "Chettinad Health City & Hospital", distance: "1.8 km" },
      { name: "Vandalur-Kelambakkam 6-Lane Road", distance: "400 m" }
    ],
    features: [
      "Scenic Lake Breeze",
      "Clear Title with 30-year Search",
      "Ready Water & Power Connections"
    ],
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527030280862-64139fba04ca?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Budget-friendly villa plot located right at the Kelambakkam junction connecting OMR and GST Road. Exceptional connectivity to Chettinad Health City and VIT Chennai."
  },

  // --- ZONE 2: ECR (SCENIC COASTAL CORRIDOR) ---
  {
    id: "CHN-ECR-01",
    title: "Ocean Breeze Coastal Villa Plots",
    locality: "Injambakkam, ECR",
    zone: "ecr",
    zoneLabel: "ECR Coastal Strip",
    coords: [12.9202, 80.2520],
    price: 13500000,
    priceDisplay: "₹1.35 Crores",
    pricePerSqft: 7500,
    pricePerSqftDisplay: "₹7,500 / sq.ft",
    plotSizeSqft: 1800,
    plotSizeCents: 4.13,
    plotSizeGrounds: 0.75,
    dimensions: "36 ft × 50 ft",
    facing: "East (Sea Facing)",
    roadWidth: "40 Feet Private Avenue",
    approvalType: "CMDA & CRZ Clearance",
    approvalNo: "CMDA/ECR/2026/019",
    reraNo: "TNRERA/2026/PL-0055",
    pattaStatus: "Ancestral Clean Patta with Zero Encumbrance",
    bankLoan: "All Nationalized Banks Approved",
    status: "Available",
    badge: "🌊 Ultra-Luxury Sea Breeze",
    featured: true,
    nearbyLandmarks: [
      { name: "Prarthana Beach Drive-in", distance: "1.0 km" },
      { name: "VGP Marine Kingdom", distance: "2.1 km" },
      { name: "Thiruvanmiyur RTO & Beach", distance: "4.5 km" }
    ],
    features: [
      "Walking Distance to Pristine Beach",
      "Private Gated Enclave for VIPs",
      "Lush Coconut Grove Setting",
      "Exclusive Club House Access",
      "24/7 Monitored CCTV Security"
    ],
    hotspots: [
      { x: 45, y: 25, label: "Private 400m Walkway to Beach" },
      { x: 70, y: 70, label: "Gated Security Checkpoint" }
    ],
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Rare and prestigious coastal villa plot on the beachside of Injambakkam. Pure sea breeze, serene privacy, and zero CRZ violations with full CMDA sanction. Ideal for bespoke luxury holiday villas or retirement estates."
  },
  {
    id: "CHN-ECR-02",
    title: "Golden Shore Enclave Uthandi",
    locality: "Uthandi, ECR",
    zone: "ecr",
    zoneLabel: "ECR Coastal Strip",
    coords: [12.8631, 80.2458],
    price: 8400000,
    priceDisplay: "₹84.00 Lakhs",
    pricePerSqft: 5600,
    pricePerSqftDisplay: "₹5,600 / sq.ft",
    plotSizeSqft: 1500,
    plotSizeCents: 3.44,
    plotSizeGrounds: 0.625,
    dimensions: "30 ft × 50 ft",
    facing: "North-East",
    roadWidth: "30 Feet Paver Road",
    approvalType: "CMDA Approved",
    approvalNo: "CMDA/2026/UTH-33",
    reraNo: "TNRERA/2026/PL-0914",
    pattaStatus: "Patta in Seller's Name Ready",
    bankLoan: "HDFC & ICICI 80% Loan Approved",
    status: "Available",
    badge: "🏖️ Beachside Community",
    featured: false,
    nearbyLandmarks: [
      { name: "Mayajaal Multiplex", distance: "1.5 km" },
      { name: "PVR ECR Heritage", distance: "2.8 km" }
    ],
    features: [
      "Quiet Coastal Neighborhood",
      "Interlocking Paver Block Roads",
      "Abundant Potable Water Aquifer"
    ],
    images: [
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Well-demarcated residential plot in quiet Uthandi along Chennai's famous East Coast Road. Surrounded by celebrity villas, private beach retreats, and lush palm plantations."
  },

  // --- ZONE 3: SOUTH CHENNAI & GST ROAD (TAMBARAM / GUDUVANCHERY / MEDAVAKKAM) ---
  {
    id: "CHN-GST-01",
    title: "Royal Gardenia Grand Layout",
    locality: "Tambaram West, GST Road",
    zone: "gst",
    zoneLabel: "South Chennai & GST",
    coords: [12.9249, 80.1000],
    price: 4560000,
    priceDisplay: "₹45.60 Lakhs",
    pricePerSqft: 3800,
    pricePerSqftDisplay: "₹3,800 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "North",
    roadWidth: "40 Feet Blacktop Road",
    approvalType: "CMDA & TNRERA",
    approvalNo: "CMDA/TBM/2026/771",
    reraNo: "TNRERA/2026/PL-0433",
    pattaStatus: "Guaranteed Clear Patta & Legal Title",
    bankLoan: "SBI, Indian Bank, LIC Housing Finance",
    status: "Available",
    badge: "🚆 5 Mins to Tambaram Railway",
    featured: true,
    nearbyLandmarks: [
      { name: "Tambaram Railway Junction & Bus Terminus", distance: "2.3 km" },
      { name: "MCC (Madras Christian College)", distance: "3.0 km" },
      { name: "Chennai Outer Ring Road (400ft)", distance: "1.8 km" },
      { name: "Hindu Mission Hospital", distance: "2.5 km" }
    ],
    features: [
      "Fully Developed Gated Township",
      "Children's Park & Jogging Track",
      "Individual Water Connection Tap",
      "Underground Drainage Installed",
      "Concrete Storm Water Drains"
    ],
    hotspots: [
      { x: 30, y: 50, label: "40-Ft Blacktop Wide Avenue" },
      { x: 75, y: 30, label: "Landscaped Community Park" }
    ],
    images: [
      "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1498429089284-41f8cf3ffd39?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Exceptional CMDA layout in Tambaram West with rapid multi-modal connectivity. Just 5 minutes from Tambaram Railway Junction, MEPZ, and the 400ft Outer Ring Road. Fully secured with entry arch, grand park, and children's play court."
  },
  {
    id: "CHN-GST-02",
    title: "Grand City Satellite Township",
    locality: "Guduvanchery, GST Road",
    zone: "gst",
    zoneLabel: "South Chennai & GST",
    coords: [12.8440, 80.0610],
    price: 2640000,
    priceDisplay: "₹26.40 Lakhs",
    pricePerSqft: 2200,
    pricePerSqftDisplay: "₹2,200 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "East",
    roadWidth: "30 Feet Tar Road",
    approvalType: "DTCP Approved",
    approvalNo: "DTCP/GDV/2026/102",
    reraNo: "TNRERA/2026/PL-0821",
    pattaStatus: "Immediate Individual Patta",
    bankLoan: "Approved by SBI, Axis, HDFC (up to 85%)",
    status: "Available",
    badge: "🔥 Super Budget Seller",
    featured: true,
    nearbyLandmarks: [
      { name: "Kalaignar Centenary Bus Terminus (KCBT Kilambakkam)", distance: "3.5 km" },
      { name: "SRM University & Medical College", distance: "4.0 km" },
      { name: "Guduvanchery Railway Station", distance: "1.5 km" }
    ],
    features: [
      "Direct Link to Kilambakkam New Bus Terminus",
      "DTCP Sanction with Layout Blueprint",
      "Sweet Drinking Water at Shallow Depth",
      "High Resale Growth Potential"
    ],
    images: [
      "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Rapidly appreciating DTCP plots in Guduvanchery, only 10 minutes from the massive Kilambakkam Bus Terminus (KCBT). Unbeatable connectivity to SRM University and GST corporate SEZs."
  },
  {
    id: "CHN-GST-03",
    title: "Flora Avenue Villa Plots",
    locality: "Medavakkam, South Chennai",
    zone: "gst",
    zoneLabel: "South Chennai & GST",
    coords: [12.9171, 80.1923],
    price: 5400000,
    priceDisplay: "₹54.00 Lakhs",
    pricePerSqft: 4500,
    pricePerSqftDisplay: "₹4,500 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "North",
    roadWidth: "30 Feet Road",
    approvalType: "CMDA & TNRERA",
    approvalNo: "CMDA/MED/2026/89",
    reraNo: "TNRERA/2026/PL-0641",
    pattaStatus: "Clean Title & Individual Patta",
    bankLoan: "Pre-approved by All Leading Banks",
    status: "Available",
    badge: "🏡 High Residential Demand",
    featured: false,
    nearbyLandmarks: [
      { name: "Medavakkam Junction Flyover", distance: "1.0 km" },
      { name: "Global Hospitals Perumbakkam", distance: "2.5 km" },
      { name: "Velachery MRTS Station", distance: "5.5 km" }
    ],
    features: [
      "Prime Residential Locality",
      "CMDA Approved with FSI 2.0",
      "Fully Inhabited Neighborhood",
      "Sweet Water & Storm Water Line"
    ],
    images: [
      "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Located in the bustling residential heart of Medavakkam, equidistant to OMR IT Corridor and Velachery. Fully built-up upscale surroundings with quick access to supermarkets, schools, and hospitals."
  },
  {
    id: "CHN-GST-04",
    title: "Silicon Valley Plots Perumbakkam",
    locality: "Perumbakkam, South Chennai",
    zone: "gst",
    zoneLabel: "South Chennai & GST",
    coords: [12.9038, 80.1873],
    price: 4920000,
    priceDisplay: "₹49.20 Lakhs",
    pricePerSqft: 4100,
    pricePerSqftDisplay: "₹4,100 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "East",
    roadWidth: "30 Feet Tar Road",
    approvalType: "CMDA Approved",
    approvalNo: "CMDA/2026/PBK-11",
    reraNo: "TNRERA/2026/PL-0523",
    pattaStatus: "Clear Patta with Chitta Extract",
    bankLoan: "HDFC, SBI, Kotak Mahindra Bank",
    status: "Sold",
    badge: "🏷️ 100% Sold Out",
    featured: false,
    nearbyLandmarks: [
      { name: "Gleneagles Global Health City", distance: "1.2 km" },
      { name: "Sholinganallur Junction", distance: "3.2 km" }
    ],
    features: [
      "Direct Access to Medavakkam-Sholinganallur Main Road",
      "Clear Title Checked by Senior High Court Advocate",
      "Ready for Independent Villa Building"
    ],
    images: [
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Peaceful villa plots situated right behind Global Hospitals in Perumbakkam. Ideal home site for healthcare professionals and IT leaders working along the OMR-Medavakkam belt."
  },
  {
    id: "CHN-GST-05",
    title: "Zoo View Township Vandalur",
    locality: "Vandalur, GST Road",
    zone: "gst",
    zoneLabel: "South Chennai & GST",
    coords: [12.8914, 80.0815],
    price: 3600000,
    priceDisplay: "₹36.00 Lakhs",
    pricePerSqft: 3000,
    pricePerSqftDisplay: "₹3,000 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "South-East",
    roadWidth: "40 Feet Avenue",
    approvalType: "CMDA & DTCP",
    approvalNo: "CMDA/VAN/2026/405",
    reraNo: "TNRERA/2026/PL-0312",
    pattaStatus: "100% Legal Clear Title",
    bankLoan: "SBI & HDFC 80% Loan Sanctioned",
    status: "Available",
    badge: "🌳 Green Hills & Fresh Air",
    featured: false,
    nearbyLandmarks: [
      { name: "Arignar Anna Zoological Park", distance: "1.5 km" },
      { name: "Crescent Institute of Technology", distance: "2.0 km" },
      { name: "Outer Ring Road (ORR) Interchange", distance: "1.2 km" }
    ],
    features: [
      "Surrounded by Reserve Forest & Fresh Air",
      "Direct Access to Outer Ring Road",
      "Gated Community with Security Gate"
    ],
    images: [
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Nestled in pristine greenery near Vandalur Hill and the Zoo, this layout offers tranquil unpolluted air coupled with fast connection to the 6-lane Outer Ring Road and Kilambakkam Bus Terminus."
  },

  // --- ZONE 4: WEST CHENNAI (PORUR / POONAMALLEE / THIRUMAZHISAI / SRIPERUMBUDUR) ---
  {
    id: "CHN-WST-01",
    title: "Lotus Orchid Enclave Porur",
    locality: "Porur, West Chennai",
    zone: "west",
    zoneLabel: "West Chennai Corridor",
    coords: [13.0358, 80.1565],
    price: 6600000,
    priceDisplay: "₹66.00 Lakhs",
    pricePerSqft: 5500,
    pricePerSqftDisplay: "₹5,500 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "North-East",
    roadWidth: "40 Feet Tar Road",
    approvalType: "CMDA & TNRERA",
    approvalNo: "CMDA/POR/2026/301",
    reraNo: "TNRERA/2026/PL-0718",
    pattaStatus: "Clear Patta with Encumbrance Certificate for 35 Years",
    bankLoan: "All Scheduled Commercial Banks",
    status: "Available",
    badge: "🚇 Near Porur Metro Station",
    featured: true,
    nearbyLandmarks: [
      { name: "Upcoming Porur Junction Metro Station", distance: "700 m" },
      { name: "Sri Ramachandra Hospital & Medical University", distance: "1.5 km" },
      { name: "DLF Cybercity & L&T Infotech", distance: "2.8 km" }
    ],
    features: [
      "Prime Urban Core Location",
      "Walking Distance to Upcoming Metro",
      "Protected Gated Layout with Intercom",
      "Underground Drainage & Water Lines",
      "High Rental Yield Potential"
    ],
    hotspots: [
      { x: 35, y: 40, label: "40-Ft Blacktop Wide Road" },
      { x: 70, y: 65, label: "Underground Storm Drainage" }
    ],
    images: [
      "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521783988139-89397d761dce?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Premium CMDA residential plots in Porur, one of Chennai's most sought-after western hubs. Minutes away from Sri Ramachandra Hospital, DLF Cybercity, and the elevated Metro corridor."
  },
  {
    id: "CHN-WST-02",
    title: "Metro Gateway Plots Poonamallee",
    locality: "Poonamallee, West Chennai",
    zone: "west",
    zoneLabel: "West Chennai Corridor",
    coords: [13.0489, 80.0933],
    price: 3960000,
    priceDisplay: "₹39.60 Lakhs",
    pricePerSqft: 3300,
    pricePerSqftDisplay: "₹3,300 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "East",
    roadWidth: "30 Feet Road",
    approvalType: "CMDA & TNRERA",
    approvalNo: "CMDA/PNM/2026/812",
    reraNo: "TNRERA/2026/PL-0677",
    pattaStatus: "100% Clean Patta Ready for Transfer",
    bankLoan: "SBI, HDFC, Bank of Baroda",
    status: "Available",
    badge: "⚡ Chennai Metro Phase-2 Terminal",
    featured: true,
    nearbyLandmarks: [
      { name: "Poonamallee Metro Depot & Station", distance: "900 m" },
      { name: "Bangalore National Highway (NH-48)", distance: "500 m" },
      { name: "Saveetha Medical College", distance: "3.5 km" }
    ],
    features: [
      "Direct Bangalore Highway Access",
      "Next to Metro Phase-2 Terminal",
      "Tar Roads with Concrete Kerbs",
      "Street Lights & Green Plantations"
    ],
    images: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1473800447596-01729482b8eb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Prime CMDA plots located right beside Poonamallee Bypass and the new Chennai Metro Phase-2 Terminal. A major western transit point witnessing tremendous commercial and residential explosion."
  },
  {
    id: "CHN-WST-03",
    title: "Satellite City Green Enclave Thirumazhisai",
    locality: "Thirumazhisai, Outer West",
    zone: "west",
    zoneLabel: "West Chennai Corridor",
    coords: [13.0560, 80.0270],
    price: 2760000,
    priceDisplay: "₹27.60 Lakhs",
    pricePerSqft: 2300,
    pricePerSqftDisplay: "₹2,300 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "North",
    roadWidth: "40 Feet Avenue",
    approvalType: "DTCP & CMDA Fringe",
    approvalNo: "DTCP/TMS/2026/65",
    reraNo: "TNRERA/2026/PL-0954",
    pattaStatus: "Individual Patta & Chitta",
    bankLoan: "Approved by SBI & Canara Bank",
    status: "Available",
    badge: "🚀 High Growth Satellite City",
    featured: false,
    nearbyLandmarks: [
      { name: "TNHB New Satellite Township", distance: "1.2 km" },
      { name: "Outer Ring Road (ORR) Thirumazhisai", distance: "1.8 km" }
    ],
    features: [
      "Tamil Nadu Govt Mega Satellite City Zone",
      "40 Feet Blacktop Roads with Footpaths",
      "Underground Drainage and Water Storage"
    ],
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Part of the visionary Thirumazhisai Satellite City planned by the Tamil Nadu government. Massive infrastructural investments make this an unparalleled wealth-multiplier for land buyers."
  },
  {
    id: "CHN-WST-04",
    title: "Industrial Aero City Sriperumbudur",
    locality: "Sriperumbudur, Industrial Corridor",
    zone: "west",
    zoneLabel: "West Chennai Corridor",
    coords: [12.9690, 79.9490],
    price: 2160000,
    priceDisplay: "₹21.60 Lakhs",
    pricePerSqft: 1800,
    pricePerSqftDisplay: "₹1,800 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "East",
    roadWidth: "30 Feet Road",
    approvalType: "DTCP Approved",
    approvalNo: "DTCP/SRP/2026/902",
    reraNo: "TNRERA/2026/PL-0119",
    pattaStatus: "Clean Title Guaranteed",
    bankLoan: "Pre-approved 85% Plot Loan",
    status: "Available",
    badge: "🏭 Near Parandur Airport & SIPCOT",
    featured: false,
    nearbyLandmarks: [
      { name: "Proposed Parandur Greenfield International Airport", distance: "12 km" },
      { name: "Hyundai & Samsung SIPCOT Industrial Parks", distance: "2.5 km" }
    ],
    features: [
      "Massive Industrial Employment Belt",
      "High Rental Housing Demand for Engineers",
      "Ready for Immediate Registration"
    ],
    images: [
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Strategic investment plot situated in the Sriperumbudur industrial belt, home to Hyundai, Samsung, and Foxconn, and directly positioned to benefit from the upcoming Parandur Greenfield International Airport."
  },

  // --- ZONE 5: CENTRAL CHENNAI (VELACHERY / ANNA NAGAR / GUINDY) ---
  {
    id: "CHN-CTR-01",
    title: "Phoenix Park Plots Velachery",
    locality: "Velachery, Central-South Chennai",
    zone: "central",
    zoneLabel: "Central Chennai",
    coords: [12.9750, 80.2207],
    price: 10800000,
    priceDisplay: "₹1.08 Crores",
    pricePerSqft: 9000,
    pricePerSqftDisplay: "₹9,000 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "North",
    roadWidth: "30 Feet Corporation Tar Road",
    approvalType: "CMDA Approved",
    approvalNo: "CMDA/VEL/2026/108",
    reraNo: "TNRERA/2026/PL-0012",
    pattaStatus: "Town Survey Land Record (TSLR) & Individual Patta",
    bankLoan: "All Commercial & Private Banks",
    status: "Available",
    badge: "🛍️ 3 Mins to Phoenix Marketcity",
    featured: true,
    nearbyLandmarks: [
      { name: "Phoenix Marketcity Mall", distance: "1.2 km" },
      { name: "Velachery MRTS Railway Station", distance: "1.5 km" },
      { name: "Grand Square Mall", distance: "1.0 km" },
      { name: "IIT Madras Research Park", distance: "2.8 km" }
    ],
    features: [
      "Heart of Prime Urban Chennai",
      "High Density Commercial & Residential Permissible",
      "Metrowater and Corporation Sewerage Connected",
      "Concrete Road Frontage"
    ],
    hotspots: [
      { x: 40, y: 35, label: "Corporation Metrowater & Sewerage Line" },
      { x: 65, y: 60, label: "Concrete 30ft Frontage" }
    ],
    images: [
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Extremely scarce freehold plot inside urban Velachery, just 3 minutes from Phoenix Marketcity. Connected to Chennai Metrowater, underground sewage lines, and the MRTS/Metro network."
  },
  {
    id: "CHN-CTR-02",
    title: "Platinum Enclave Anna Nagar West Extn",
    locality: "Anna Nagar West Extn, Chennai",
    zone: "central",
    zoneLabel: "Central Chennai",
    coords: [13.0890, 80.1920],
    price: 15600000,
    priceDisplay: "₹1.56 Crores",
    pricePerSqft: 13000,
    pricePerSqftDisplay: "₹13,000 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "East",
    roadWidth: "40 Feet Corporation Avenue",
    approvalType: "CMDA Approved",
    approvalNo: "CMDA/ANR/2026/05",
    reraNo: "TNRERA/2026/PL-0003",
    pattaStatus: "TSLR Clean Patta Documented",
    bankLoan: "All Major Banks Instant Sanction",
    status: "Booked",
    badge: "⏳ Booked - Token Advance",
    featured: true,
    nearbyLandmarks: [
      { name: "Thirumangalam Metro Station & VR Mall", distance: "1.8 km" },
      { name: "Anna Nagar Tower Park", distance: "2.4 km" },
      { name: "Kendriya Vidyalaya & SBOA School", distance: "1.1 km" }
    ],
    features: [
      "Chennai's Most Prestigious Western Address",
      "Wide Tree-Lined Avenues",
      "Full Corporation Infrastructure",
      "Exceptional Appreciation & Luxury Living"
    ],
    images: [
      "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "The crown jewel of central Chennai. A trophy residential plot in Anna Nagar West Extension surrounded by diplomatic residences, gourmet dining, and top educational institutions."
  },

  // --- ZONE 6: NORTH CHENNAI (AMBATTUR / AVADI / KOLATHUR) ---
  {
    id: "CHN-NTH-01",
    title: "Green Industrial Park Plots Ambattur",
    locality: "Ambattur, North-West Chennai",
    zone: "north",
    zoneLabel: "North Chennai",
    coords: [13.1143, 80.1481],
    price: 4560000,
    priceDisplay: "₹45.60 Lakhs",
    pricePerSqft: 3800,
    pricePerSqftDisplay: "₹3,800 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "North",
    roadWidth: "30 Feet Blacktop Road",
    approvalType: "CMDA Approved",
    approvalNo: "CMDA/AMB/2026/410",
    reraNo: "TNRERA/2026/PL-0482",
    pattaStatus: "Clean Title & Individual Patta",
    bankLoan: "Approved by SBI, Indian Overseas Bank",
    status: "Available",
    badge: "🏭 Near Ambattur OT & Industrial Estate",
    featured: false,
    nearbyLandmarks: [
      { name: "Ambattur Industrial Estate & IT Park", distance: "2.0 km" },
      { name: "Ambattur Railway Station", distance: "1.5 km" },
      { name: "Madras Medical Mission Hospital", distance: "4.0 km" }
    ],
    features: [
      "CMDA Approved Layout",
      "High Rental Demand from Industrial Execs",
      "24 Hours Potable Groundwater",
      "Tar Roads with Electric Poles"
    ],
    images: [
      "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584738766473-61c083514bf4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Located within short commuting distance to Ambattur Industrial Estate (one of South Asia's largest small scale industrial hubs) and IT tech parks. Highly reliable appreciation track record."
  },
  {
    id: "CHN-NTH-02",
    title: "Defence Enclave Avadi",
    locality: "Avadi, North-West Chennai",
    zone: "north",
    zoneLabel: "North Chennai",
    coords: [13.1147, 80.1018],
    price: 3120000,
    priceDisplay: "₹31.20 Lakhs",
    pricePerSqft: 2600,
    pricePerSqftDisplay: "₹2,600 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "East",
    roadWidth: "30 Feet Road",
    approvalType: "CMDA & TNRERA",
    approvalNo: "CMDA/AVD/2026/220",
    reraNo: "TNRERA/2026/PL-0331",
    pattaStatus: "100% Freehold Title with Patta",
    bankLoan: "Pre-approved by SBI Defence Banking Branch",
    status: "Sold",
    badge: "🏷️ 100% Sold Out",
    featured: false,
    nearbyLandmarks: [
      { name: "Avadi Railway Station & Bus Depot", distance: "1.8 km" },
      { name: "HVF (Heavy Vehicles Factory)", distance: "2.5 km" },
      { name: "Kendriya Vidyalaya HVF Avadi", distance: "2.2 km" }
    ],
    features: [
      "CMDA Sanctioned Gated Layout",
      "Serene & Highly Secure Environment",
      "Broad Tar Roads & Street Lamps",
      "Abundant Ground Water Quality"
    ],
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Secure, serene, and family-friendly residential plots in Avadi. Close to Avadi Railway Station with frequent suburban trains to Chennai Central, Heavy Vehicles Factory, and premier Kendriya Vidyalayas."
  },
  {
    id: "CHN-NTH-03",
    title: "Lake Vista Enclave Kolathur",
    locality: "Kolathur, North Chennai",
    zone: "north",
    zoneLabel: "North Chennai",
    coords: [13.1235, 80.2173],
    price: 6240000,
    priceDisplay: "₹62.40 Lakhs",
    pricePerSqft: 5200,
    pricePerSqftDisplay: "₹5,200 / sq.ft",
    plotSizeSqft: 1200,
    plotSizeCents: 2.75,
    plotSizeGrounds: 0.50,
    dimensions: "30 ft × 40 ft",
    facing: "North",
    roadWidth: "30 Feet Tar Road",
    approvalType: "CMDA Approved",
    approvalNo: "CMDA/KOL/2026/18",
    reraNo: "TNRERA/2026/PL-0599",
    pattaStatus: "Clean Title & Individual Patta",
    bankLoan: "All Major Banks Approved",
    status: "Available",
    badge: "🏞️ Scenic Lake Frontage",
    featured: false,
    nearbyLandmarks: [
      { name: "Retteri Junction & Inner Ring Road", distance: "1.1 km" },
      { name: "DRJ Hospital", distance: "1.5 km" },
      { name: "Don Bosco Higher Secondary School", distance: "2.0 km" }
    ],
    features: [
      "Scenic Lake Views & Fresh Air",
      "Quick Access to 100ft Inner Ring Road",
      "Metrowater & Drainage Ready",
      "High Resale & Rental Demand"
    ],
    images: [
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "A tranquil lake-facing haven within city limits. Positioned right off Retteri Junction on the 100-ft Inner Ring Road, providing frictionless travel to Anna Nagar, Perambur, and Chennai Central."
  }
];

// Interactive Layout Masterplan Subdivision Dataset
const CHENNAI_LAYOUT_MASTERPLAN = {
  layoutName: "Emerald Crest & Grand Heights Luxury Layout",
  location: "Sholinganallur & Tambaram West Corridors",
  totalPlots: 24,
  availableCount: 16,
  soldCount: 8,
  plots: [
    { number: 1, size: "1200 sq.ft (30×40)", facing: "North", status: "Available", price: "₹48.0 L", type: "Standard" },
    { number: 2, size: "1200 sq.ft (30×40)", facing: "North", status: "Available", price: "₹48.0 L", type: "Standard" },
    { number: 3, size: "1500 sq.ft (30×50)", facing: "North-East Corner", status: "Available", price: "₹60.0 L", type: "Corner VIP" },
    { number: 4, size: "1200 sq.ft (30×40)", facing: "East", status: "Sold", price: "Sold", type: "Standard" },
    { number: 5, size: "1200 sq.ft (30×40)", facing: "East", status: "Available", price: "₹48.0 L", type: "Standard" },
    { number: 6, size: "1200 sq.ft (30×40)", facing: "East", status: "Available", price: "₹48.0 L", type: "Standard" },
    { number: 7, size: "1800 sq.ft (36×50)", facing: "East", status: "Sold", price: "Sold", type: "Premium" },
    { number: 8, size: "1200 sq.ft (30×40)", facing: "East", status: "Available", price: "₹48.0 L", type: "Standard" },
    { number: 9, size: "1500 sq.ft (30×50)", facing: "South-East Corner", status: "Available", price: "₹60.0 L", type: "Corner VIP" },
    { number: 10, size: "1200 sq.ft (30×40)", facing: "South", status: "Sold", price: "Sold", type: "Standard" },
    { number: 11, size: "1200 sq.ft (30×40)", facing: "South", status: "Available", price: "₹48.0 L", type: "Standard" },
    { number: 12, size: "1200 sq.ft (30×40)", facing: "South", status: "Sold", price: "Sold", type: "Standard" },
    { number: 13, size: "1200 sq.ft (30×40)", facing: "North", status: "Available", price: "₹48.0 L", type: "Standard" },
    { number: 14, size: "1200 sq.ft (30×40)", facing: "North", status: "Available", price: "₹48.0 L", type: "Standard" },
    { number: 15, size: "2400 sq.ft (1 Ground)", facing: "North-East", status: "Available", price: "₹96.0 L", type: "Commercial / Grand Villa" },
    { number: 16, size: "1200 sq.ft (30×40)", facing: "West", status: "Sold", price: "Sold", type: "Standard" },
    { number: 17, size: "1200 sq.ft (30×40)", facing: "West", status: "Available", price: "₹48.0 L", type: "Standard" },
    { number: 18, size: "1200 sq.ft (30×40)", facing: "West", status: "Available", price: "₹48.0 L", type: "Standard" },
    { number: 19, size: "1200 sq.ft (30×40)", facing: "West", status: "Sold", price: "Sold", type: "Standard" },
    { number: 20, size: "1500 sq.ft (30×50)", facing: "North-West Corner", status: "Available", price: "₹60.0 L", type: "Corner VIP" },
    { number: 21, size: "1200 sq.ft (30×40)", facing: "South", status: "Available", price: "₹48.0 L", type: "Standard" },
    { number: 22, size: "1200 sq.ft (30×40)", facing: "South", status: "Sold", price: "Sold", type: "Standard" },
    { number: 23, size: "1200 sq.ft (30×40)", facing: "South", status: "Available", price: "₹48.0 L", type: "Standard" },
    { number: 24, size: "1800 sq.ft (36×50)", facing: "East", status: "Available", price: "₹72.0 L", type: "Premium Grand Plot" }
  ]
};

// Export to window
if (typeof window !== "undefined") {
  window.CHENNAI_PLOTS_DATA = CHENNAI_PLOTS_DATA;
  window.CHENNAI_LAYOUT_MASTERPLAN = CHENNAI_LAYOUT_MASTERPLAN;
}
