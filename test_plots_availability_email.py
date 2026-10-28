# -*- coding: utf-8 -*-
import urllib.request
import json

test_plots = [
    ('CHN-OMR-01', 'Emerald Crest Villa Plots', 'Tomorrow, Oct 29, 2026', '10:00 AM', 'Anna Nagar West, Chennai'),
    ('CHN-ECR-01', 'Bay Breeze Oceanview Plots', 'This Saturday, Oct 31, 2026', '02:00 PM', 'Adyar / Thiruvanmiyur, Chennai'),
    ('CHN-GST-01', 'Grand Corridor Expressway Plots', 'This Sunday, Nov 01, 2026', '11:30 AM', 'Airport / Guindy Kathipara, Chennai')
]

for plot_id, title, date, time_slot, pickup in test_plots:
    payload = {
        'plotId': plot_id,
        'propertyTitle': title,
        'fullName': 'Monica Perumal',
        'email': 'monicaperumal2004@gmail.com',
        'phone': '+91 93450 29705',
        'visitDate': date,
        'visitTime': time_slot,
        'needCab': True,
        'pickupLocation': pickup
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8080/api/plots/verify-availability-email', data=data, headers={'Content-Type': 'application/json'})
    res = urllib.request.urlopen(req)
    out = json.loads(res.read().decode('utf-8'))
    print(f"Plot: {plot_id} | Success: {out.get('success')} | Email Sent: {out.get('emailSent')} | Ref: {out.get('visitRef')} | View: {out.get('viewUrl')}")
