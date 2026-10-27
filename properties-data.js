/**
 * LLB Real Estate - Curated Property Portfolio Dataset
 * High-definition luxury, residential, and commercial listings.
 */

const LLB_PROPERTIES = [
  {
    id: "llb-prop-01",
    title: "The Grand Horizon Sky Penthouse",
    tagline: "Panoramic 360° Skyline Views with Private Infinity Pool",
    category: "penthouse",
    type: "sale",
    price: 4850000,
    priceDisplay: "$4,850,000",
    location: "Downtown Metropolis",
    address: "740 Avenue of the Arts, 52nd Floor, Metropolis",
    beds: 4,
    baths: 5,
    sqft: 5200,
    parking: 3,
    yearBuilt: 2024,
    featured: true,
    status: "Available",
    badge: "Exclusive Penthouse",
    legalVerification: {
      verified: true,
      titleDeedNo: "TD-NYC-98421-V",
      encumbranceFree: true,
      reraApproved: true,
      zoningType: "Ultra-Luxury Residential",
    },
    images: {
      cover: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    amenities: [
      "Private Heated Sky Pool",
      "Biometric Direct Elevator Access",
      "Wine Cellar & Tasting Lounge",
      "Smart Automation by Crestron",
      "24/7 Dedicated Concierge",
      "Floor-to-Ceiling Thermal Glass"
    ],
    description: "Perched above the city skyline, The Grand Horizon Sky Penthouse is the pinnacle of modern architectural achievement. Features custom Italian marble, soaring 14-foot ceilings, bespoke acoustic design, and an expansive 1,200 sq.ft wrap-around terrace with heated infinity pool overlooking the waterfront."
  },
  {
    id: "llb-prop-02",
    title: "Villa Solaria Waterfront Estate",
    tagline: "Private Dock, Mediterranean Architecture & Lush Botanical Grounds",
    category: "villa",
    type: "sale",
    price: 6200000,
    priceDisplay: "$6,200,000",
    location: "Palm Bay Coast",
    address: "12 Marina Palm Boulevard, Bay Haven",
    beds: 6,
    baths: 7,
    sqft: 7800,
    parking: 4,
    yearBuilt: 2023,
    featured: true,
    status: "Available",
    badge: "Waterfront Villa",
    legalVerification: {
      verified: true,
      titleDeedNo: "TD-FL-88203-W",
      encumbranceFree: true,
      reraApproved: true,
      zoningType: "Coastal Residential",
    },
    images: {
      cover: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    amenities: [
      "Deep-Water Private Yacht Dock",
      "Olympic-Sized Lap Pool",
      "Gourmet Chef's Kitchen (Sub-Zero/Wolf)",
      "Detached Guest Cottage",
      "Private Security Perimeter",
      "Solar & Tesla Powerwall Integration"
    ],
    description: "An oasis of tranquility, Villa Solaria merges classical Mediterranean majesty with high-tech coastal engineering. Boasts seamless indoor-outdoor transitions, towering palm garden pathways, and a private deep-water dock capable of hosting vessels up to 85 feet."
  },
  {
    id: "llb-prop-03",
    title: "The Lumina Glass Pavilion",
    tagline: "Mid-Century Modernist Masterpiece in Scenic Woodlands",
    category: "villa",
    type: "sale",
    price: 3450000,
    priceDisplay: "$3,450,000",
    location: "Silicon Hills",
    address: "88 Pinecrest Ridge, Silicon Hills",
    beds: 4,
    baths: 4.5,
    sqft: 4600,
    parking: 3,
    yearBuilt: 2024,
    featured: false,
    status: "Available",
    badge: "Architectural Landmark",
    legalVerification: {
      verified: true,
      titleDeedNo: "TD-CA-40291-L",
      encumbranceFree: true,
      reraApproved: true,
      zoningType: "Estate Residential",
    },
    images: {
      cover: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    amenities: [
      "Architectural Glass Walls",
      "Cantilevered Infinity Edge Spa",
      "Automated Solar Louvers",
      "Home Theater with Dolby Atmos",
      "Underfloor Radiant Heating",
      "EV Fast Charging Multi-Car Garage"
    ],
    description: "Designed by renowned architectural visionaries, The Lumina Glass Pavilion rests harmoniously among protected woodland ridges. The property utilizes sustainable cross-laminated timber, passive solar orientation, and seamless floor-to-ceiling double-glazed walls."
  },
  {
    id: "llb-prop-04",
    title: "Aura Prime Corporate Tower Suites",
    tagline: "Grade-A LEED Platinum Commercial Headquarters & Executive Floors",
    category: "commercial",
    type: "rent",
    price: 18500,
    priceDisplay: "$18,500 / month",
    location: "Financial District",
    address: "200 Financial Plaza, 38th Floor, Metro Central",
    beds: 0,
    baths: 6,
    sqft: 6800,
    parking: 10,
    yearBuilt: 2023,
    featured: true,
    status: "Available",
    badge: "Grade-A Commercial",
    legalVerification: {
      verified: true,
      titleDeedNo: "TD-COMM-77194-C",
      encumbranceFree: true,
      reraApproved: true,
      zoningType: "Commercial / Corporate HQ",
    },
    images: {
      cover: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    amenities: [
      "LEED Platinum Certified Building",
      "Tier-3 Fiber Redundant Infrastructure",
      "Boardroom with 4K Video Conferencing",
      "Executive Restrooms & Private Showers",
      "Dedicated Secure Server Vault",
      "Valet Parking & Executive Lounge Access"
    ],
    description: "Position your enterprise at the epicenter of financial power. Aura Prime provides high-density column-free floor plates, redundant enterprise power grids, high-speed acoustic isolation, and prestige corporate branding rights in the lobby."
  },
  {
    id: "llb-prop-05",
    title: "The Azure Modernist Loft",
    tagline: "Sun-Drenched High Ceilings & Industrial Chic Finish",
    category: "apartment",
    type: "rent",
    price: 7200,
    priceDisplay: "$7,200 / month",
    location: "Tribeca Arts Quarter",
    address: "44 Franklin Street, Tribeca Arts Quarter",
    beds: 2,
    baths: 2.5,
    sqft: 2200,
    parking: 1,
    yearBuilt: 2022,
    featured: false,
    status: "Available",
    badge: "Designer Loft",
    legalVerification: {
      verified: true,
      titleDeedNo: "TD-NY-19034-L",
      encumbranceFree: true,
      reraApproved: true,
      zoningType: "Luxury Multi-Family",
    },
    images: {
      cover: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    amenities: [
      "Original Exposed Brick & Timber Beams",
      "Cast-Iron Oversized Windows",
      "Polished Terrazzo Flooring",
      "Custom Boffi Kitchen",
      "Building Rooftop Garden & Dog Spa",
      "Keycard Elevator Access"
    ],
    description: "A meticulously restored 19th-century cast-iron building converted into high-end luxury lofts. Featuring museum-quality gallery lighting, oversized arched windows, and seamless soundproofing in one of the most vibrant cultural enclaves."
  },
  {
    id: "llb-prop-06",
    title: "Bellevue Manor Country Estate",
    tagline: "5-Acre Gated Private Compound with Tennis Court & Stables",
    category: "villa",
    type: "sale",
    price: 5400000,
    priceDisplay: "$5,400,000",
    location: "Suburban Greens",
    address: "105 Equestrian Way, Green Valley",
    beds: 5,
    baths: 6,
    sqft: 6500,
    parking: 4,
    yearBuilt: 2023,
    featured: true,
    status: "Available",
    badge: "Private Estate",
    legalVerification: {
      verified: true,
      titleDeedNo: "TD-GV-62910-E",
      encumbranceFree: true,
      reraApproved: true,
      zoningType: "Single Family Agricultural / Estate",
    },
    images: {
      cover: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    amenities: [
      "Championship Regulation Tennis Court",
      "Heated Swimming Pool & Cabana Bar",
      "Organic Vineyard & Orchard",
      "4-Horse Climate-Controlled Stables",
      "Gated Double Security Checkpoint",
      "Private Borewell & Water Filtration"
    ],
    description: "Offering total privacy and equestrian distinction, Bellevue Manor spans 5 fully landscaped manicured acres. Master suite includes dual walk-in dressing suites, Finnish cedar sauna, and panoramic views of rolling pastures."
  }
];

const LLB_LAND_PARCELS = [
  {
    id: "land-01",
    title: "Silicon Hills Crest — Approved Luxury Residential Plots",
    tagline: "RERA & DTCP Sanctioned Villa Plots with Panoramic Mountain Vistas",
    category: "residential",
    price: 890000,
    priceDisplay: "$890,000",
    location: "Silicon Hills Ridge",
    address: "Plots 14-22, Summit Crest Boulevard, Silicon Hills",
    plotSizeSqft: 10800,
    plotSizeAcres: "0.25 Acres",
    surveyNo: "Survey #412/2A & 412/2B",
    titleDeedNo: "TD-LAND-90421-R",
    approvalAuthority: "DTCP & Urban Planning Commission",
    approvalOrderNo: "Ord. No. UDA/2026/PL-8492",
    reraNo: "RERA-LAND-CA-849204",
    fsiRatio: "2.0 FSI Approved",
    zoning: "Low-Density Luxury Residential",
    soilTest: "Certified Grade-A Granitic Bedrock (Zero Settlement)",
    demarcation: "GPS-Tagged Concrete Pillars with Certified Survey Map",
    utilities: ["Underground Power 3-Phase", "Municipal High-Pressure Water", "Fiber Optic Line", "Stormwater Drainage"],
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    description: "Ready-for-construction prime residential land parcel nestled on an elevated ridge. Complete legal clearance from municipal planners with 100% unencumbered title deed. Suitable for custom luxury villas up to 9,000 sq.ft."
  },
  {
    id: "land-02",
    title: "Metro Central Commercial Development Site",
    tagline: "High-FSI Commercial Land Parcel for Corporate Headquarters or Hotel",
    category: "commercial",
    price: 4950000,
    priceDisplay: "$4,950,000",
    location: "Financial District Corridor",
    address: "Block 8, Financial Center Arterial, Metro Central",
    plotSizeSqft: 65340,
    plotSizeAcres: "1.50 Acres",
    surveyNo: "Survey #109/4C & 110/1A",
    titleDeedNo: "TD-LAND-77140-C",
    approvalAuthority: "Metro Central Municipal Development Board",
    approvalOrderNo: "Ord. No. MDB/COMM-2026/0411",
    reraNo: "RERA-COMM-NY-902144",
    fsiRatio: "4.5 FSI Permitted",
    zoning: "C-4 High-Density Commercial",
    soilTest: "Certified Engineered Bedrock for High-Rise Structures",
    demarcation: "Sealed Municipal Boundary Verification & Dual-Cadastral Survey",
    utilities: ["Dual-Grid High Voltage", "Chilled Water Municipal Loop", "Gigabit Enterprise Fiber", "Direct Highway Access"],
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    description: "An extraordinary sovereign commercial site located along the core transit axis. Fully sanctioned for corporate office towers, luxury hotels, or mixed-use retail complexes. Free from all environmental and municipal encumbrances."
  },
  {
    id: "land-03",
    title: "Palm Coast Oceanfront Estate Parcel",
    tagline: "Direct Beach Access Coastal Land with Coastal Regulatory Clearance",
    category: "residential",
    price: 2450000,
    priceDisplay: "$2,450,000",
    location: "Palm Bay Coast",
    address: "Lot 7, Pelican Bay Cove, Palm Coast",
    plotSizeSqft: 26136,
    plotSizeAcres: "0.60 Acres",
    surveyNo: "Survey #88/19 & 88/20",
    titleDeedNo: "TD-LAND-55219-W",
    approvalAuthority: "Coastal Zone Management & City Council",
    approvalOrderNo: "Ord. No. CZM/2026/EST-1049",
    reraNo: "RERA-LAND-FL-771029",
    fsiRatio: "1.5 FSI Permitted",
    zoning: "Ultra-Prime Coastal Single Family",
    soilTest: "Deep Helical Piling Tested & Certified Storm Surge Embankment",
    demarcation: "Certified High-Water Line Survey & Riparian Rights Deed",
    utilities: ["Desalinated Water Municipal Tie-in", "Underground Solar-Ready Grid", "Private Dock Rights"],
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    description: "Rare pristine oceanfront plot with full environmental and coastal regulatory permits. Features 140 linear feet of private beach frontage with deeded riparian privileges for personal dock construction."
  },
  {
    id: "land-04",
    title: "Green Valley Organic Vineyard & Farmhouse Estate",
    tagline: "Agricultural & Farmhouse Sanctioned Land with Senior Water Rights",
    category: "agricultural",
    price: 1850000,
    priceDisplay: "$1,850,000",
    location: "Green Valley Country",
    address: "440 Orchard Creek Road, Green Valley",
    plotSizeSqft: 348480,
    plotSizeAcres: "8.00 Acres",
    surveyNo: "Survey #214/5 to 214/12",
    titleDeedNo: "TD-LAND-33018-A",
    approvalAuthority: "Department of Agriculture & Rural Planning",
    approvalOrderNo: "Ord. No. AGR/2026/V-8812",
    reraNo: "RERA-AGR-TX-440188",
    fsiRatio: "Farmhouse + Agricultural Processing Permitted",
    zoning: "Agricultural / Agro-Tourism Permitted",
    soilTest: "Class-1 Loam & Volcanic Mineral Rich Subsoil (Soil Health Index: 98/100)",
    demarcation: "Reinforced Cedar Post Fencing & Municipal Cadastral Map",
    utilities: ["Artesian Aquifer Well (120 GPM)", "Solar Irrigation Grid", "3-Phase Agricultural Power"],
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    description: "Expansive fertile estate land with certified organic status for 14 years. Includes grandfathered riparian senior water allocation rights, fully cleared topography, and sanctioned permit for luxury estate manor."
  },
  {
    id: "land-05",
    title: "Apex Logistics & Industrial Park Parcel",
    tagline: "Approved Heavy Industrial & Freight Warehousing Land",
    category: "industrial",
    price: 3200000,
    priceDisplay: "$3,200,000",
    location: "Metro Freight Hub",
    address: "Interstate Junction 14, Apex Industrial Corridor",
    plotSizeSqft: 174240,
    plotSizeAcres: "4.00 Acres",
    surveyNo: "Survey #551/1 & 551/2",
    titleDeedNo: "TD-LAND-11094-I",
    approvalAuthority: "State Industrial Development Corporation (SIDC)",
    approvalOrderNo: "Ord. No. SIDC/IND-2026/993",
    reraNo: "RERA-IND-IL-660211",
    fsiRatio: "3.0 FSI Industrial Permitted",
    zoning: "M-2 Heavy Industrial & Logistics",
    soilTest: "Industrial Compaction Certified for Heavy Machinery & Cranes",
    demarcation: "State Highway Department Certified ROW Clearance",
    utilities: ["High-Capacity Gas Pipeline", "11KV Dedicated Substation", "Heavy Vehicle Turning Radius Clearance"],
    coverImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    description: "Strategic logistics development land directly adjacent to the interstate interchange and rail freight spur. Pre-approved for cold storage, e-commerce fulfillment, or high-tech manufacturing facilities."
  },
  {
    id: "land-06",
    title: "Highland Pine Crest Private Mountain Sanctuary",
    tagline: "Ultra-Private Gated Mountain Plot with Forest Reserve Boundary",
    category: "residential",
    price: 1250000,
    priceDisplay: "$1,250,000",
    location: "Highland Ridge Reserve",
    address: "Parcel 3, Aspen Ridge Pass, Highland Reserve",
    plotSizeSqft: 43560,
    plotSizeAcres: "1.00 Acre",
    surveyNo: "Survey #99/3A",
    titleDeedNo: "TD-LAND-44102-M",
    approvalAuthority: "County Conservation & Building Council",
    approvalOrderNo: "Ord. No. CBC/2026/M-7710",
    reraNo: "RERA-RES-CO-551980",
    fsiRatio: "1.8 FSI Permitted",
    zoning: "Protected Mountain Residential",
    soilTest: "Solid Granitic Core Foundation Clearance",
    demarcation: "Surveyor's Stone Cairns with Satellite Boundary Locks",
    utilities: ["Underground Geo-Thermal Grid Ready", "Pure Mountain Spring Water Rights", "Fiber Broadband"],
    coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    description: "An idyllic 1-acre sanctuary bordered by protected national wilderness. Complete residential development permits in place with unobstructed 40-mile horizon vistas and crystal mountain air."
  }
];

if (typeof window !== "undefined") {
  window.LLB_PROPERTIES = LLB_PROPERTIES;
  window.LLB_LAND_PARCELS = LLB_LAND_PARCELS;
}
