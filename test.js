// const puppeteer = require('puppeteer');
const d3 = require('d3-dsv')
const fs = require('fs')
const { exec } = require('child_process');

var ipHistory = []
const tsvObject = d3.tsvParse(fs.readFileSync('./input/ipHistory.tsv', 'utf-8'))
for (const temp in tsvObject) {
    if (temp == 'columns') {
        continue
    }
    ipHistory[Number(temp)] = tsvObject[temp]
}


exec('adb.exe shell svc wifi disable', {cwd: './adb'}, (err, stdout, stderr) => {
    if (err) {
      console.error(err)
    } else {
     console.log(`stdout: ${stdout}`);
     console.log(`stderr: ${stderr}`);
    }
  });
exec('adb.exe shell svc data enable', {cwd: './adb'}, (err, stdout, stderr) => {
    if (err) {
      console.error(err)
    } else {
     console.log(`stdout: ${stdout}`);
     console.log(`stderr: ${stderr}`);
    }
  });

var http = require('http');
const { now } = require('lodash');

http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
resp.on('data', function(ip) {
    console.log("My public IP address is: " + ip);
    checkIp(ip);
});
});


function checkIp(ip){
    for(let i = 0; i < ipHistory.length; i++) {
        if(ipHistory[i].ip==ip){
            recreateIp()
            return
        }
    }
    console.log("Done: " + ip);
    var newIp = { 'ip,time': 'fddf,ddr' }
    fs.appendFileSync('./input/ipHistory.tsv', d3.tsvFormat(newIp), 'utf8')
}

function recreateIp(){
    exec('adb.exe shell svc data disable', {cwd: './adb'}, (err, stdout, stderr) => {
        if (err) {
          console.error(err)
        } else {
         console.log(`stdout: ${stdout}`);
         console.log(`stderr: ${stderr}`);
        }
      });


    exec('adb.exe shell svc data enable', {cwd: './adb'}, (err, stdout, stderr) => {
        if (err) {
          console.error(err)
        } else {
         console.log(`stdout: ${stdout}`);
         console.log(`stderr: ${stderr}`);
        }
    });
    checkIp(ip);
}

// main()
// async function main() {
// 	try {
// const browser = await puppeteer.launch({ headless: false,  defaultViewport: null, slowMo: 50})
// 	const page = await browser.newPage()
// 	await page.goto('https://etsy.com')
// 	await page.waitForSelector('.select-signin')
// 	// await page.goto('https://www.etsy.com/your/shops/ShopTestByCng/tools/listings')
// 	let element = ''

// 	element = await page.$('.select-signin')
// 	element.click()

// 	await page.waitForSelector('#join_neu_email_field')

// 	element = await page.$('#join_neu_email_field')
// 	await element.type('mymail@gmail.com')
// 	await page.waitForTimeout(500)
// 	element = await page.$('#join_neu_password_field')
// 	await element.type('fdsafdsa')

// 	element = await page.$('button[value="sign-in"]')

// 	await element.click()
// 	} catch (err) {
// 		console.error(err)
// 	}
// }

// function temp() {
// 	    // element = await page.$('[name="variation_property"]')
// 		console.log(element)
// 		let box = await element.boundingBox()
// 		console.log(box)
// 		const x = box.x + (box.width / 2)
// 		const y = box.y + (box.height / 2) + 30
// 		console.log(x,y)
// 		await page.mouse.move(x, y)
	
// 		// await page.mouse.wheel({ deltaY: -200 })
// }