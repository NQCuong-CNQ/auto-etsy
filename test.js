const puppeteer = require('puppeteer');
const http = require('http');


async function startProfile(){
  //Replace profileId value with existing browser profile ID.
  let profileId = 'edac386e-761c-4cb0-bb08-422dc4a4c428';
  let mlaPort = 35000;

  /*Send GET request to start the browser profile by profileId.
  Returns web socket as response which should be passed to puppeteer.connect*/
  http.get(`http://127.0.0.1:${mlaPort}/api/v1/profile/start?automation=true&puppeteer=true&profileId=${profileId}`, (resp) => {
  let data = '';
  let ws = '';

  //Receive response data by chunks
  resp.on('data', (chunk) => {
    data += chunk;
  });

  /*The whole response data has been received. Handling JSON Parse errors,
  verifying if ws is an object and contains the 'value' parameter.*/
  resp.on('end', () => {
    let ws;
    try {
      ws = JSON.parse(data);
    } catch(err) {
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
  try{
    //Connecting Puppeteer with Mimic instance and performing simple automation.
    const browser = await puppeteer.connect({browserWSEndpoint: ws, defaultViewport:null});
    const page = await browser.newPage();
    await page.goto('https://multilogin.com');
    await page.screenshot({ path: `/home/${process.env.USER}/Desktop/multiloginScreenshot.png` });
    await browser.close();
  } catch(err){
    console.log(err.message);
  }
}

startProfile();