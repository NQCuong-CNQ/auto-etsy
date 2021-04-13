const puppeteer = require('puppeteer');
const http = require('http');


async function startProfile() {
  let profileId = 'db11261d-aaa2-4a5e-9ffe-00fc570c5825';
  let mlaPort = 35000;

  http.get(`http://127.0.0.1:${mlaPort}/api/v1/profile/start?automation=true&puppeteer=true&profileId=${profileId}`, (resp) => {
    let data = '';
    let ws = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      try {
        ws = JSON.parse(data);
      } catch (err) {
        console.log(err);
      }
      if (typeof ws === 'object' && ws.hasOwnProperty('value')) {
        console.log(`Browser websocket endpoint: ${ws.value}`);
        run(ws.value);
      }
    });

  }).on("error", (err) => {
    console.log(err.message);
  });
}
async function run(ws) {
  try {
    const browser = await puppeteer.connect({ browserWSEndpoint: ws, defaultViewport: null });
    const page = await browser.newPage();
    await page.goto('https://multilogin.com');
    // await browser.close();
  } catch (err) {
    console.log(err.message);
  }
}

startProfile()