const puppeteer = require('puppeteer');

main()
async function main() {
	try {
const browser = await puppeteer.launch({ headless: false,  defaultViewport: null, slowMo: 50})
	const page = await browser.newPage()
	await page.goto('https://etsy.com')
	await page.waitForSelector('.select-signin')
	// await page.goto('https://www.etsy.com/your/shops/ShopTestByCng/tools/listings')
	let element = ''

	element = await page.$('.select-signin')
	element.click()

	await page.waitForSelector('#join_neu_email_field')

	element = await page.$('#join_neu_email_field')
	await element.type('mymail@gmail.com')
	await page.waitForTimeout(500)
	element = await page.$('#join_neu_password_field')
	await element.type('fdsafdsa')

	element = await page.$('button[value="sign-in"]')

	await element.click()
	} catch (err) {
		console.error(err)
	}
}