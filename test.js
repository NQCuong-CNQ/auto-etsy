const puppeteer = require('puppeteer');
var robot = require("robotjs");
// Speed up the mouse.
robot.setMouseDelay(1000)

robot.moveMouse(471,1060);
robot.mouseClick("left", false);
robot.moveMouse(847, 378);
robot.mouseClick("left", false);
robot.moveMouse(939, 586);
robot.mouseClick("left", false);
robot.moveMouse(752, 693);
robot.mouseClick("left", false);
robot.moveMouse(1021, 20);
robot.mouseClick("left", false);
robot.moveMouse(688,163);
robot.mouseToggle("down");
robot.dragMouse(982, 655);
robot.mouseToggle("up");
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