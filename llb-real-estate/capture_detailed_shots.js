const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9333;
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
  const userDir = path.join(artifactDir, 'scratch', 'chrome_shot_profile');
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

    // 1. Scroll to properties section
    await send('Runtime.evaluate', {
      expression: `document.getElementById('properties').scrollIntoView({ behavior: 'instant', block: 'start' });`
    });
    await new Promise(r => setTimeout(r, 600));

    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'desktop_properties_official.png'), Buffer.from(shot1.data, 'base64'));
    console.log('Saved desktop_properties_official.png');

    // 2. Open Credentials Modal
    await send('Runtime.evaluate', {
      expression: `window.openCredentialsModal();`
    });
    await new Promise(r => setTimeout(r, 600));

    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'desktop_credentials_modal.png'), Buffer.from(shot2.data, 'base64'));
    console.log('Saved desktop_credentials_modal.png');

    // 3. Mobile Hero & Overflow Check
    await send('Runtime.evaluate', {
      expression: `window.closeCredentialsModal();`
    });
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Runtime.evaluate', {
      expression: `window.scrollTo(0, 0);`
    });
    await new Promise(r => setTimeout(r, 600));

    const overflowInfo = await send('Runtime.evaluate', {
      expression: `({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyScrollWidth: document.body.scrollWidth,
        bodyClientWidth: document.body.clientWidth
      })`,
      returnByValue: true
    });
    console.log('Mobile 375 Overflow Info:', JSON.stringify(overflowInfo.result.value));

    const shotHero = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'mobile_hero_official.png'), Buffer.from(shotHero.data, 'base64'));
    console.log('Saved mobile_hero_official.png');

    // 4. Mobile properties view
    await send('Runtime.evaluate', {
      expression: `document.getElementById('properties').scrollIntoView({ behavior: 'instant', block: 'start' });`
    });
    await new Promise(r => setTimeout(r, 600));

    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'mobile_properties_official.png'), Buffer.from(shot3.data, 'base64'));
    console.log('Saved mobile_properties_official.png');

    ws.close();
  } finally {
    proc.kill();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
