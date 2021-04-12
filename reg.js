const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const d3 = require('d3-dsv')
const fs = require('fs')
const PuppUtils = require('./lib/PuppUtils')
const fetch = require('node-fetch')
const { nanoid } = require('nanoid')
const { exec } = require('child_process');

const SLOW_MO = 1000

var storage
var infos = []
var iNumCurrentAccount = 0

const MUG_VARIATION = {
    "Size": {
        '11oz': {
            price: 13.95
        },
        '15oz': {
            price: 16.95
        }
    },
    "Color": {
        'Black': {
            price: 0
        },
        'White': {
            price: 0
        }
    }
}

main()
async function main() {
    try {
        storage = JSON.parse(fs.readFileSync('./input/storage.txt', 'utf-8'))
        const tsvObject = d3.tsvParse(fs.readFileSync('./input/infos.tsv', 'utf-8'))

        for (const temp in tsvObject) {
            if (temp == 'columns') {
                continue
            }
            infos[Number(temp)] = tsvObject[temp]
        }
        await checkAccountValid()
    } catch (err) {
        console.error(err)
    }
}

async function checkAccountValid(){
    if (iNumCurrentAccount <= infos.length) {
        let info = infos[iNumCurrentAccount]
        console.log(info.mail)
        if (infos[iNumCurrentAccount].status == "Suspended" || infos[iNumCurrentAccount].status == "Successful") {
            console.log("This account is Passed")
            iNumCurrentAccount++
            checkAccountValid()
            return
        }
        await changeIp(info)
    }
}

function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}

async function changeIp(info) {
    console.log("start toggle")
    await toggleHome()
    await toggleTetherSettings()
    await toggleTab()
    await toggleTab()
    await toggleTab()
    await toggleTab()
    await toggleEnter()
    await sleep(5000)
    await toggleHome()
    await toggleAPMSettings()
    await toggleTab()
    await toggleTab()
    await toggleEnter()
    await toggleHome()
    await toggleAPMSettings()
    await toggleTab()
    await toggleTab()
    await toggleEnter()
    await toggleHome()
    await toggleCheckAPM()
    //thieu buoc bạt lại
    console.log("Done!")
    await sleep(2000)
    var http = require('http')
    http.get({ 'host': 'api.ipify.org', 'port': 80, 'path': '/' }, function (resp) {
        resp.on('data', async function (ip) {
            console.log("My current IP address is: " + ip);
            await checkIp(ip, info);
        });
    });
}
async function toggleCheckAPM(){
    console.log("toggleCheckAPM")
    exec('adb.exe shell settings get global airplane_mode_on', { cwd: './adb' }, async function(err, stdout, stderr) {
        console.log(stdout)

        if (err) {
            console.error(err)
        } else {
            if(stdout == 1){
                console.log("Retry turn off airplane mode!")
                await toggleHome()
                await toggleAPMSettings()
                await toggleTab()
                await toggleTab()
                await toggleEnter()
                await toggleHome()
            }else{
                console.log("Success!")
            }
        }
    })
    await sleep(1000)
}
async function toggleHome(){
    exec('adb.exe shell input keyevent 3', { cwd: './adb' }, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
        } else {
        }
    })
    await sleep(1000)
}
async function toggleTetherSettings(){
    exec('adb.exe shell am start -n com.android.settings/.TetherSettings', { cwd: './adb' }, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
        } else {
        }
    })
    await sleep(1000)
}
async function toggleAPMSettings(){
    exec('adb.exe shell am start -a android.settings.AIRPLANE_MODE_SETTINGS', { cwd: './adb' }, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
        } else {
        }
    })
    await sleep(1000)
}

async function toggleEnter(){
    exec('adb.exe shell input keyevent 66', { cwd: './adb' }, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
        } else {
        }
    })
    await sleep(3000)
}

async function toggleTab(){
    exec('adb.exe shell input keyevent 61', { cwd: './adb' }, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
        } else {
        }
    })
    await sleep(1000)
}

async function checkIp(ip, info) {
    if (isIpExist(ip)) {
        console.log("Duplicate IP: " + ip);
        await changeIp(ip, info)
        return
    }
    console.log("Save IP address: " + ip);
    infos[iNumCurrentAccount].ip = ip
    fs.writeFileSync('./input/infos.tsv', d3.tsvFormat(infos), 'utf8')

    await sleep(1000);
    await startRegAccount(info)
}

function isIpExist(ip) {
    for (let i = 0; i < infos.length; i++) {
        if (infos[i].ip == ip) {
            return true
        }
    }
}

async function startRegAccount(info) {
    const browser = await puppeteer.launch({
        headless: false, defaultViewport: null, slowMo: 50,
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        userDataDir: `./CR/${info.mail.trim().toLowerCase()}`,
        args: ['--no-sandbox', '--start-maximized']
    })
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0); 
    await page.goto('https://accounts.google.com/signin/v2/identifier?passive=1209600&continue=https%3A%2F%2Faccounts.google.com%2Fb%2F1%2FAddMailService&followup=https%3A%2F%2Faccounts.google.com%2Fb%2F1%2FAddMailService&flowName=GlifWebSignIn&flowEntry=ServiceLogin')

    await page.waitForTimeout(15000)
    if (page.url().includes('https://mail.google.com/mail/u/0/')) {
        await loginEtsy(browser, page, info)
    } else {
        await loginGoogle(page, info)
        await page.waitForTimeout(10000)
        if (page.url().includes('https://mail.google.com/mail/u/0/')) {
            await loginEtsy(browser, page, info)
        } else if (page.url().includes('https://myaccount.google.com/signinoptions/recovery-options-collection?')) {
            await confirmRecoveryOption(browser, page, info)
        }
        else{
            await page.waitForTimeout(5000)
            if (page.url().includes('https://mail.google.com/mail/u/0/')) {
                await loginEtsy(browser, page, info)
            }
            return
        }
    }
    return
}

async function loginGoogle(page, info) {
    await PuppUtils.typeText(page, '#identifierId', info.mail.trim().toLowerCase())
    await PuppUtils.waitNextUrl(page, '#identifierNext')
    await PuppUtils.jsWaitForSelector(page, '[name="password"]', 4000)
    await page.waitForTimeout(5000)
    await PuppUtils.typeText(page, '[name="password"]', info.password.trim())
    await PuppUtils.waitNextUrl(page, '#passwordNext')
}

async function loginEtsy(browser, page, info) {
    await page.goto('https://www.etsy.com')
    await page.waitForTimeout(5000)
    if (await PuppUtils.isElementVisbile(page, '.select-signin')) {

    } else {
        await registerShop(page, info)
        return
    }
    let element = ''

    element = await page.$('.select-signin')
    await element.click()
    await page.waitForTimeout(3000)
    await PuppUtils.click(page, 'button[data-google-button="true"]')

    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())))
    const newPage = await newPagePromise
    await newPage.setDefaultNavigationTimeout(0); 
    console.log("cho")
    await page.waitForTimeout(8000)
    console.log("click")
    await PuppUtils.click(newPage, `[data-identifier="${info.mail}"]`)

    await page.waitForTimeout(5000)
    console.log("registerShop")
    if (await PuppUtils.isElementVisbile(page, '[aria-describedby="ge-tooltip-label-you-menu"]')) {
        await registerShop(page, info)
        return
    }
}

async function registerShop(page, info) {
    await page.goto('https://www.etsy.com/sell?ref=hdr-sell&from_page=https%3A%2F%2Fwww.etsy.com%2F')
    await page.goto('https://www.etsy.com/your/shop/create?us_sell_create_value')

    onNextStep(page, info)
}

async function onNextStep(page, info) {
    if (await checkStatusAccount(page)) {
        console.log("Suspended")
        iNumCurrentAccount++
        await checkAccountValid()
        return
    }
    // Step 1
    if (await PuppUtils.isElementVisbile(page, '#address-country')) {
        await submitShoppreferences(page, info)  // Step 1
    } else if (await PuppUtils.isElementVisbile(page, '#onboarding-shop-name-input')) {   // Step 2
        await submitShopName(page, info)
    } else if (await PuppUtils.jsIsSelectorExisted(page, '[data-region="listings-container"] a')) {   // Step 3
        await createNewListing(page, info)
    } else if (await PuppUtils.isElementVisbile(page, '[data-ui="business-or-individual"]')) {   // Step 3
        await submitBussinessInfo(page, info)
    }else if (await PuppUtils.isElementVisbile(page, '[data-region="credit-card-row"]')){   // Step 4
        await setupBilling(page, info)
    }

    else if (false) {
        iNumCurrentAccount++
        console.log("done!")
        await checkAccountValid()
    }

    await page.waitForTimeout(3000)
    await onNextStep(page, info)
}

async function setupBilling(page, info){
    await PuppUtils.typeText(page, '#billing-cc-num', getCreditCard(info.card, 0))

    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#billing-cc-exp-mon')
    await element.click()
    await page.waitForTimeout(SLOW_MO)
    await page.evaluate(() => {
        $('#billing-cc-exp-mon').get(0).size = 1000
    })
    element = await page.$(`#billing-cc-exp-mon [${getCreditCard(info.card, 1)}]`)
    await element.click()

    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#billing-cc-exp-year')
    await element.click()
    await page.waitForTimeout(SLOW_MO)
    await page.evaluate(() => {
        $('#billing-cc-exp-year').get(0).size = 1000
    })
    element = await page.$(`#billing-cc-exp-year [${getCreditCard(info.card, 2)}]`)
    await element.click()

    await page.waitForTimeout(SLOW_MO)
    await PuppUtils.typeText(page, '#billing-cc-ccv', getCreditCard(info.card, 3))
    await PuppUtils.typeText(page, '#billing-name', info.firstName + " "+ info.middleName + " "+ info.lastName)
    await PuppUtils.typeText(page, 'input[name="billing[address]"]', info.address)
    await PuppUtils.typeText(page, 'input[name="billing[city]"]', info.city)

    await page.waitForTimeout(SLOW_MO)
    element = await page.$('[name="billing[state]"]')
    await element.click()
    await page.waitForTimeout(SLOW_MO)
    await page.evaluate(() => {
        $('[name="billing[state]"]').get(0).size = 1000
    })
    element = await page.$(`[name="billing[state]"] option[value="${info.state}"]`)
    await element.click()

    await page.waitForTimeout(SLOW_MO)
    await PuppUtils.click(page, 'button[data-subway-final]') 
}

function getCreditCard(card, num){
    let crCard = card.trim().split("|")
    if(num == 3){
        return crCard[num]
    }
    return parseInt(crCard[num])
}

async function checkStatusAccount(page) {
    console.log("checking StatusAccount")
    if ((await page.content()).includes('Your account is currently suspended')) {
        infos[iNumCurrentAccount].status = "Suspended"
        fs.writeFileSync('./input/infos.tsv', d3.tsvFormat(infos), 'utf8')
        return Promise.resolve(true)
    } return Promise.resolve(false)
}

async function submitShoppreferences(page, info) {
    //Change language step 1
    await PuppUtils.click(page, 'button[aria-controls="wt-locale-picker-overlay"]')
    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#locale-overlay-select-region_code')
    await element.click()
    await page.waitForTimeout(SLOW_MO)
    await page.evaluate(() => {
        $('#locale-overlay-select-region_code').get(0).size = 1000
    })
    element = await page.$('#locale-overlay-select-region_code [value="CA"]')
    await element.click()
    //Change language step 2
    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#locale-overlay-select-language_code')
    await element.click()
    await page.waitForTimeout(SLOW_MO)
    await page.evaluate(() => {
        $('#locale-overlay-select-language_code').get(0).size = 1000
    })
    element = await page.$('#locale-overlay-select-language_code [value="en-US"]')
    await element.click()
    //Change language step 3
    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#locale-overlay-select-currency_code')
    await element.click()
    await page.waitForTimeout(SLOW_MO)
    await page.evaluate(() => {
        $('#locale-overlay-select-currency_code').get(0).size = 1000
    })
    element = await page.$('#locale-overlay-select-currency_code [value="USD"]')
    await element.click()

    await PuppUtils.click(page, '#locale-overlay-save')

    await page.waitForTimeout(2500)

    element = await page.$('#onboard-shop-currency')
    await element.click()
    await page.waitForTimeout(SLOW_MO)
    await page.evaluate(() => {
        $('#onboard-shop-currency').get(0).size = 1000
    })
    element = await page.$(`[value="USD"]`)
    await element.click()

    await page.waitForTimeout(SLOW_MO)
    await page.evaluate(() => {
        $('[name="intention"]:eq(0)').click()
    })

    await PuppUtils.click(page, 'button[data-subway-next="true"]')
    await page.waitForTimeout(SLOW_MO)
}

async function submitShopName(page, info) {
    await page.waitForSelector('#onboarding-shop-name-input')
    await generateShopName(page, info)

    await PuppUtils.click(page, 'button[data-subway-next="true"]')
}

async function generateShopName(page, info, reGen = false) {
    try {
        let shopName = ""
        shopName = info.firstName + info.lastName + getDateOfBirth(0, info) + getDateOfBirth(1, info)
        if(reGen) {
            shopName += nanoid(2)
        }

        await PuppUtils.typeText(page, '#onboarding-shop-name-input', shopName)
        await PuppUtils.click(page, '[data-action="check-availability"]')
        await page.waitForTimeout(2000)

        if (await PuppUtils.isElementVisbile(page, '#available[style="display: block;"]')) {
            console.log('Available', shopName)
            saveInfos()
            return Promise.resolve()
        } else {
            console.log('Not Available', shopName)
            generateShopName(page, info, true)
            return Promise.resolve()
        }
    } catch (err) {
        return Promise.reject(err)
    }
}

async function createNewListing(page, info) {
    await page.goto(`https://www.etsy.com/your/shops/${info.shopName}/onboarding/listings/create`)
    let imagesFolderName = './input/' + String(storage.dataCount)
    let imageFiles = fs.readdirSync(imagesFolderName)

    for (let i = 0, l = imageFiles.length; i < l; i++) {
        let imageFile = imagesFolderName + '/' + imageFiles[i]
        let element = await page.$("#listing-edit-image-upload")
        await element.uploadFile(imageFile)
        await page.waitForTimeout(1500)
    }

    await PuppUtils.typeText(page, "#title-input", info.title)

    await page.waitForTimeout(SLOW_MO)
    let element = await page.$('#who_made-input')
    await element.click()
    await page.evaluate(() => {
        $(`#who_made-input`).get(0).size = 1000
    })
    element = await page.$('#who_made-input option[value="i_did"]')
    await element.click()

    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#is_supply-input')
    await element.click()
    await page.evaluate(() => {
        $(`#is_supply-input`).get(0).size = 1000
    })
    element = await page.$('#is_supply-input option[value="false"]')
    await element.click()

    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#when_made-input')
    await element.click()
    await page.evaluate(() => {
        $(`#when_made-input`).get(0).size = 1000
    })
    element = await page.$('#when_made-input option[value="made_to_order"]')
    await element.click()

    await page.waitForTimeout(SLOW_MO)

    await PuppUtils.typeText(page, "#taxonomy-search", info.category)
    await page.waitForTimeout(2000)
    await page.keyboard.press('Enter')

    await PuppUtils.typeText(page, "#description-text-area-input", info.description)
    await PuppUtils.typeText(page, "#price_retail-input", info.price)
    await PuppUtils.typeText(page, "#quantity_retail-input", "999")
    await PuppUtils.typeText(page, "#SKU-input", nanoid(10).replace(/-/g, ''))
    await PuppUtils.click(page, '#add_variations_button')

    await page.waitForTimeout(SLOW_MO)
    element = await page.$(`[name="variation_property"]`)
    await element.click()
    await page.waitForTimeout(SLOW_MO)
    await page.evaluate(() => {
        $(`[name="variation_property"]`).get(0).size = 1000
    })
    element = await page.$(`[value="__custom"]`)
    await element.click()

    await page.waitForTimeout(SLOW_MO)
    for (variationType in MUG_VARIATION) {
        
        let element = await page.$(`[name="variation_property"]`)
        await element.click()
        await page.waitForTimeout(SLOW_MO)
        await page.evaluate(() => {
            $(`[name="variation_property"]`).get(0).size = 1000
        })
        element = await page.$(`[value="__custom"]`)
        await element.click()

        await page.waitForTimeout(SLOW_MO)
        await PuppUtils.typeText(page, '[name="custom-property-input"]', variationType)
        element = await page.evaluateHandle(() => {
            return $(`[name="variation_property"]`).parent().parent().find('[name="add-custom"]')[0]
        })
        await element.click()

        await page.waitForTimeout(SLOW_MO)
        let flag = true
        for (const option in MUG_VARIATION[variationType]) {
            let parentBox = await page.evaluateHandle((variationType) => {
                return $(`[data-property-id] .strong [data-test-id="unsanitize"]:contains(${variationType})`).parent().parent().parent().parent().get(0)
            }, variationType)

            if (flag) {
                element = await parentBox.$('[name="price-control"]')
                await element.click()
                element = await parentBox.$('[name="sku-control"]')
                await element.click()

                flag = false
            }

            element = await parentBox.$('#undefined-input')
            await element.type(option)
            element = await parentBox.$('[name="add-custom"]')
            await element.click()
        }

    }
    await PuppUtils.click(page, '#save')
    await page.waitForTimeout(SLOW_MO)

    let variationTypes = Object.keys(MUG_VARIATION)
    if (variationTypes.length == 1) {

    } else if (variationTypes.length == 2) {
        let variationType1 = Object.keys(MUG_VARIATION)[0]
        let variationType2 = Object.keys(MUG_VARIATION)[1]

        let variationOptions1 = Object.keys(MUG_VARIATION[variationType1])
        let variationOptions2 = Object.keys(MUG_VARIATION[variationType2])

        for (let i = 0, l = variationOptions1.length; i < l; i++) {
            for (let j = 0, l2 = variationOptions2.length; j < l2; j++) {
                let option1 = variationOptions1[i]
                let option2 = variationOptions2[j]
                let price = String(MUG_VARIATION[variationType1][option1].price)

                let parentRow = await page.evaluateHandle((option1, option2) => {
                    let rows = $(`#variations-unified-table tbody tr`)
                    for (let k = 0, l3 = rows.length; k < l3; k++) {
                        let row = rows.eq(k)
                        if (row.find('td.width-20:eq(0)').text().trim() == option1 && row.find('td.width-20:eq(1)').text().trim() == option2) {
                            return row
                        }
                    }
                }, option1, option2)

                element = await page.evaluateHandle((parentRow) => {
                    return parentRow.find('[name="sku-input"]').get(0)
                }, parentRow)

                await element.type(nanoid(10).replace(/-/g, ''))

                element = await page.evaluateHandle((parentRow) => {
                    return parentRow.find('[name="price-input"]').get(0)
                }, parentRow)

                await element.type(price)
            }
        }
    }
    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#profile_type')
    await element.click()
    await page.evaluate(() => {
        $(`#profile_type`).get(0).size = 1000
    })
    element = await page.$('#profile_type [value="manual"]')
    await element.click()

    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#shipping_country')
    await element.click()
    await page.evaluate(() => {
        $(`#shipping_country`).get(0).size = 1000
    })
    element = await page.$('#shipping_country [value="209"]')
    await element.click()
    await PuppUtils.typeText(page, '#origin_postal_code', "10001")

    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#processing_time_select')
    await element.click()
    await page.evaluate(() => {
        $(`#processing_time_select`).get(0).size = 1000
    })
    element = await page.$('#processing_time_select [value="4"]')
    await element.click()

    await page.waitForTimeout(SLOW_MO)
    element = await page.evaluateHandle(() => {
        return $(`div.wt-grid.wt-pt-xs-4.wt-pb-xs-4:contains("Canada")`).find('.wt-grid__item-md-9 .wt-btn.wt-btn--transparent.wt-btn--icon')[0]
    })
    await element.click()

    await page.waitForTimeout(SLOW_MO)
    await PuppUtils.click(page, '[data-region="shipping-with-profile-management"] button')
    await PuppUtils.typeText(page, '#weight_primary', '1')
    await PuppUtils.typeText(page, '#item_length', '1')
    await PuppUtils.typeText(page, '#item_width', '1')
    await PuppUtils.typeText(page, '#item_height', '1')
    await PuppUtils.click(page, '.page-footer [data-save]')

    await page.waitForTimeout(4000)
    if (await PuppUtils.jsIsSelectorExisted(page, '[data-region="listings-container"] a')) {
        await PuppUtils.click(page, '[data-subway-next="true"] ')
    }
}

async function submitBussinessInfo(page, info) {
    await page.waitForTimeout(4000)
    await page.evaluate(() => {
        element = document.querySelector('#bank-country-id');
        if (element) {
            element.scrollTop = element.offsetHeight;
            console.error(`Scrolled to selector}`)
        } else {
            console.error(`cannot find selector`)
        }
    })


    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#bank-country-id')
    await element.click()
    await page.evaluate(() => {
        $(`#bank-country-id`).get(0).size = 1000
    })
    element = await page.$('#bank-country-id [value="209"]')
    await element.click()

    await page.waitForTimeout(SLOW_MO)
    await PuppUtils.typeText(page, "#bank-name-on-account", info.firstName + " " + info.middleName + " " + info.lastName)
    await PuppUtils.typeText(page, "#bank-routing-number", info.rountingNumber)
    await PuppUtils.typeText(page, "#bank-account-number", info.accountNumber)

    await page.evaluate(() => {
        element = document.querySelector('#identity-country-id');
        if (element) {
            element.scrollTop = element.offsetHeight;
            console.error(`Scrolled to selector}`)
        } else {
            console.error(`cannot find selector`)
        }
    })

    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#identity-country-id')
    await element.click()
    await page.evaluate(() => {
        $(`#identity-country-id`).get(0).size = 1000
    })
    element = await page.$('#identity-country-id [value="79"]')
    await element.click()
    
    await page.waitForTimeout(SLOW_MO)
    await PuppUtils.typeText(page, "#identity-first-name", info.firstName)
    await PuppUtils.typeText(page, "#identity-last-name", info.lastName)
    //dob month
    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#dob-container-month')
    await element.click()
    await page.evaluate(() => {
        $(`#dob-container-month`).get(0).size = 1000
    })
    element = await page.$(`#dob-container-month option[value="${getDateOfBirth(0, info)}"]`)
    await element.click()
    //dob date
    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#dob-container-day')
    await element.click()
    await page.evaluate(() => {
        $(`#dob-container-day`).get(0).size = 1000
    })
    element = await page.$(`#dob-container-day option[value="${getDateOfBirth(1, info)}"]`)
    await element.click()
    //dob year
    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#dob-container-year')
    await element.click()
    await page.evaluate(() => {
        $(`#dob-container-year`).get(0).size = 1000
    })
    element = await page.$(`#dob-container-year option[value="${getDateOfBirth(2, info)}"]`)
    await element.click()
    await page.waitForTimeout(SLOW_MO)

    await PuppUtils.typeText(page, 'input[name="street_number"]', getAddress(0, info))
    await PuppUtils.typeText(page, 'input[name="street_name"]', getAddress(1, info))
    await PuppUtils.typeText(page, '.address-container input[name="city"]', info.city)
    //dob state
    await page.waitForTimeout(SLOW_MO)
    element = await page.$('.address-container [name="state"]')
    await element.click()
    await page.evaluate(() => {
        $(`.address-container [name="state"]`).get(0).size = 1000
    })
    element = await page.$(`.address-container [name="state"] [value="${info.state}"]`)
    await element.click()
    await page.waitForTimeout(SLOW_MO)

    await PuppUtils.typeText(page, '.address-container input[name="zip"]', info.zip)
    await PuppUtils.typeText(page, '.address-container input[name="phone"]', info.phone)
    await PuppUtils.click(page, 'button[data-ui="dc-submit"]')
}

function getAddress(order, info) {
    let address = info.address.trim().split(" ")
    if (order == 0) {
        return address[order]
    } else {
        let streetName = "";
        for (let i = 1; i < address.length; i++) {
            streetName += address[i] + " "
        }
        return streetName.trim()
    }
}

function getDateOfBirth(order, info) {
    let dob = info.dob.trim().split("/")
    return parseInt(dob[order])
}

function saveInfos() {
    infos[iNumCurrentAccount].nameShop = shopName
    fs.writeFileSync('./input/infos.tsv', d3.tsvFormat(infos), 'utf8')
}

function confirmRecoveryOption(browser, page, info) {

}