const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9444;
const artifactDir = 'C:\\Users\\chand\\.gemini\\antigravity\\brain\\db202e10-d3f5-4fc2-a5a2-2e795e33db3b';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function run() {
  const userDir = path.join(artifactDir, 'scratch', 'chrome_multipage_profile');
  const proc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDir}`,
    '--window-size=1440,950',
    'http://127.0.0.1:8080/index.html'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const tabs = await fetchJson(`http://127.0.0.1:${port}/json`);
    const tab = tabs.find(t => t.url && t.url.includes('127.0.0.1:8080')) || tabs[0];
    if (!tab) throw new Error('No target tab found');

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === msgId) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    const pagesToTest = [
      { name: 'desktop_home_new', url: 'http://127.0.0.1:8080/index.html', width: 1440, height: 950 },
      { name: 'desktop_guarantee', url: 'http://127.0.0.1:8080/guarantee.html', width: 1440, height: 950 },
      { name: 'desktop_verified_land', url: 'http://127.0.0.1:8080/verified-land.html', width: 1440, height: 950 },
      { name: 'desktop_login', url: 'http://127.0.0.1:8080/login.html', width: 1440, height: 950 },
      { name: 'desktop_admin_login', url: 'http://127.0.0.1:8080/admin-login.html', width: 1440, height: 950 },
      { name: 'desktop_contact', url: 'http://127.0.0.1:8080/contact.html', width: 1440, height: 950 },
      { name: 'mobile_land_375', url: 'http://127.0.0.1:8080/verified-land.html', width: 375, height: 812, mobile: true },
      { name: 'mobile_guarantee_375', url: 'http://127.0.0.1:8080/guarantee.html', width: 375, height: 812, mobile: true },
      { name: 'mobile_login_375', url: 'http://127.0.0.1:8080/login.html', width: 375, height: 812, mobile: true }
    ];

    for (const p of pagesToTest) {
      if (p.mobile) {
        await send('Emulation.setDeviceMetricsOverride', {
          width: p.width,
          height: p.height,
          deviceScaleFactor: 2,
          mobile: true
        });
      } else {
        await send('Emulation.setDeviceMetricsOverride', {
          width: p.width,
          height: p.height,
          deviceScaleFactor: 1,
          mobile: false
        });
      }

      await send('Page.navigate', { url: p.url });
      await new Promise(r => setTimeout(r, 800));

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const outPath = path.join(artifactDir, `${p.name}.png`);
      fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
      console.log(`Saved ${p.name}.png`);
    }

    ws.close();
  } finally {
    proc.kill();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
