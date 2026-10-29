// Vercel Serverless Function: GET /api/properties & POST /api/properties
import fs from 'fs';
import path from 'path';

let masterPlots = null;

function getMasterPlots() {
  if (masterPlots) return masterPlots;
  try {
    const dataPath = path.join(process.cwd(), 'data', 'chennai_plots_master.json');
    if (fs.existsSync(dataPath)) {
      masterPlots = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      return masterPlots;
    }
  } catch (e) {}
  return [];
}

function getUserPlots() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'user_properties.json');
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
  } catch (e) {}
  return [];
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const title = body.title || 'Direct Owner Listing';
    const locality = body.locality || 'Chennai Prime';
    const price = parseInt(body.price || 3500000, 10);
    const lakhs = price / 100000.0;
    const priceDisplay = lakhs < 100 ? `₹${lakhs.toFixed(2)} Lakhs` : `₹${(lakhs/100).toFixed(2)} Crores`;

    const newProp = {
      id: `POST-${Date.now()}`,
      title,
      locality,
      zone: body.zone || 'omr',
      zoneLabel: body.zoneLabel || 'Chennai Prime',
      category: body.category || 'plot',
      homeDesign: body.homeDesign || 'modern_duplex',
      bhk: body.bhk || '3 BHK',
      designTitle: body.designTitle || 'Custom Villa Design',
      facing: body.facing || 'East',
      price,
      priceDisplay,
      plotSizeSqft: parseInt(body.plotSizeSqft || 1200, 10),
      brokerage: '0% Brokerage (Direct Owner Listing)',
      approvalType: body.approvalType || 'CMDA Approved',
      contactPhone: body.contactPhone || '+91 98401 23456',
      status: 'Available',
      badge: '🌟 New Direct Owner Ad',
      featured: true,
      images: body.images || [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
      ],
      description: body.description || 'Direct owner listing posted on mobile app.',
      postedDate: new Date().toISOString().split('T')[0],
      postedBy: body.postedBy || 'Verified User'
    };

    return res.status(200).json({
      success: true,
      message: 'Property ad posted live with 0% brokerage!',
      property: newProp
    });
  }

  // GET handler with filtering & sorting
  let props = [...getUserPlots(), ...getMasterPlots()];
  const q = req.query || {};

  if (q.design && q.design !== 'all') {
    props = props.filter(p => (p.homeDesign || '').toLowerCase() === q.design.toLowerCase());
  }
  if (q.bhk && q.bhk !== 'all') {
    props = props.filter(p => (p.bhk || '').toLowerCase().includes(q.bhk.toLowerCase()));
  }
  if (q.facing && q.facing !== 'all') {
    props = props.filter(p => (p.facing || '').toLowerCase() === q.facing.toLowerCase());
  }
  if (q.zone && q.zone !== 'all') {
    props = props.filter(p => (p.zone || '').toLowerCase() === q.zone.toLowerCase());
  }
  if (q.minPrice) {
    props = props.filter(p => (p.price || 0) >= parseFloat(q.minPrice));
  }
  if (q.maxPrice) {
    props = props.filter(p => (p.price || 0) <= parseFloat(q.maxPrice));
  }
  if (q.search) {
    const s = q.search.toLowerCase().trim();
    props = props.filter(p => 
      (p.title || '').toLowerCase().includes(s) ||
      (p.locality || '').toLowerCase().includes(s) ||
      (p.zone || '').toLowerCase().includes(s) ||
      (p.designTitle || '').toLowerCase().includes(s)
    );
  }

  // Sorting
  const sort = q.sort || 'popular';
  if (sort === 'price_asc') props.sort((a, b) => (a.price || 0) - (b.price || 0));
  else if (sort === 'price_desc') props.sort((a, b) => (b.price || 0) - (a.price || 0));
  else if (sort === 'size_asc') props.sort((a, b) => (a.plotSizeSqft || 0) - (b.plotSizeSqft || 0));
  else if (sort === 'size_desc') props.sort((a, b) => (b.plotSizeSqft || 0) - (a.plotSizeSqft || 0));

  return res.status(200).json({
    success: true,
    count: props.length,
    properties: props
  });
}
