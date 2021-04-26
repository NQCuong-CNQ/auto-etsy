const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const d3 = require('d3-dsv')
const fs = require('fs')
const PuppUtils = require('./lib/PuppUtils')
const fetch = require('node-fetch')
const { nanoid } = require('nanoid');
const { exec } = require('child_process')
const http = require('http')

const SLOW_MO = 1000
var browser
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

async function checkAccountValid() {
    if (iNumCurrentAccount < infos.length) {
        let info = infos[iNumCurrentAccount]
        console.log(info.mail)
        if (info.status == "Suspended" || info.status == "Success" || info.status == "Abandon"|| info.status == "WaitForwardEmail") {
            console.log("This account is Passed")
            iNumCurrentAccount++
            await checkAccountValid()
        } else if (info.status == "WaitForwardEmail" || info.ip != ""){
            await startRegAccount(info)
        } else {
            await changeIp(info)
        }
        return
        // await startRegAccount(info)
    } else {
        console.log("Done All!!!")
        return
    }
}

function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}

async function changeIp(info) {
    // console.log("start toggle")
    // await toggleHome()
    // await toggleTetherSettings()
    // await toggleTab()
    // await toggleTab()
    // await toggleTab()
    // await toggleEnter()
    // await sleep(10000)
    // await toggleHome()
    // await toggleAPMSettings()
    // await toggleTab()
    // await toggleEnter()
    // await toggleHome()
    // await toggleAPMSettings()
    // await sleep(3000)
    // await toggleEnter()
    // await toggleHome()
    // await toggleCheckAPM()
    // await toggleTetherSettings()
    // await toggleTab()
    // await toggleTab()
    // await toggleTab()
    // await toggleEnter()
    // await sleep(10000)
    // await toggleHome()
    // console.log("Done!")
    // await sleep(10000)
    http.get({ 'host': 'api.ipify.org', 'port': 80, 'path': '/' }, function (resp) {
        resp.on('data', async function (ip) {
            console.log("My current IP address is: " + ip)
            await checkIp(ip, info)
        })
    })
}
async function toggleCheckAPM() {
    console.log("toggleCheckAPM")
    exec('adb.exe shell settings get global airplane_mode_on', { cwd: './adb' }, async function (err, stdout, stderr) {
        if (err) {
            console.error(err)
        } else {
            if (stdout == 1) {
                console.log("Retry turn off airplane mode!")
                await toggleHome()
                await toggleAPMSettings()
                await toggleEnter()
                await toggleHome()
            } else {
                console.log("Success!")
            }
        }
    })
    await sleep(1000)
}
async function toggleHome() {
    exec('adb.exe shell input keyevent 3', { cwd: './adb' }, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
        } else {
        }
    })
    await sleep(1000)
}
async function toggleTetherSettings() {
    exec('adb.exe shell am start -n com.android.settings/.TetherSettings', { cwd: './adb' }, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
        } else {
        }
    })
    await sleep(1000)
}
async function toggleAPMSettings() {
    exec('adb.exe shell am start -a android.settings.AIRPLANE_MODE_SETTINGS', { cwd: './adb' }, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
        } else {
        }
    })
    await sleep(1000)
}

async function toggleEnter() {
    exec('adb.exe shell input keyevent 66', { cwd: './adb' }, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
        } else {
        }
    })
    await sleep(3000)
}

async function toggleTab() {
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
        // await changeIp(ip, info)
        return
    }
    if (ip.length < 20) {
        console.log("Save IP address: " + ip);
        infos[iNumCurrentAccount].ip = ip
        saveInfos()
    } else {
        console.log("get Ip addr failed!")
    }

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
    let profileId = info.profileID
    console.log('profileId: ' + profileId)
    http.get(`http://127.0.0.1:35000/api/v1/profile/start?automation=true&puppeteer=true&profileId=${profileId}`, async function (resp) {
        let data = ''
        let ws = ''

        resp.on('data', (chunk) => {
            data += chunk
        })

        resp.on('end', async function () {
            try {
                ws = JSON.parse(data)
            } catch (err) {
                console.log(err)
                await sleep(8000)
                startRegAccount(info)
                return
            }
            if (typeof ws === 'object' && ws.hasOwnProperty('value')) {
                await runBrowser(ws.value, info)
            }
        })

    }).on("error", async (err) => {
        console.log(err.message)
        console.log("err start")
        await sleep(15000)
        startRegAccount(info)
        return
    })
}

async function runBrowser(ws, info) {
    try {
        sleep(30000)
        browser = await puppeteer.connect({
            browserWSEndpoint: ws,
            defaultViewport: null,
            slowMo: 50,
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
        sleep(5000)
        const page = await browser.newPage()
        await page.waitForTimeout(SLOW_MO)
        await page.setDefaultNavigationTimeout(0)
        if (info.status == "WaitForwardEmail"){
            await forwardEmail(info)
            await finishReg(info)
        } else {
            await page.goto('https://accounts.google.com/signin/v2/identifier?passive=1209600&continue=https%3A%2F%2Faccounts.google.com%2Fb%2F1%2FAddMailService&followup=https%3A%2F%2Faccounts.google.com%2Fb%2F1%2FAddMailService&flowName=GlifWebSignIn&flowEntry=ServiceLogin', { waitUntil: 'domcontentloaded' })
            await checkLoginProgress(page, info)
        }
        return
    } catch (err) {
        console.log(err.message)
        console.log("err run browser")
        browser.close()
        console.log("retrying run browser...")
        await sleep(15000)
        startRegAccount(info)
        return
    }
}

async function checkLoginProgress(page, info) {
    console.log('launch success')
    await page.waitForTimeout(10000)
    if (page.url().includes('https://mail.google.com/mail/u/')) {
        if (await PuppUtils.isElementVisbile(page, '.T-I.T-I-JN')) {
            await PuppUtils.click(page, '.T-I.T-I-JN:last-child')
            await page.waitForTimeout(SLOW_MO)
        }
        await loginEtsy(page, info)
        return
    } else if (page.url().includes('https://myaccount.google.com/interstitials/birthday')) {
        await addGoogleBirthday(page, info)
    } else if (page.url().includes('https://gds.google.com/web/chip')) {
        await addGoogleChip(page, info)
    } else if (page.url().includes('https://accounts.google.com/signin/v2/challenge/selection')) {
        await confirmRecoveryEmail(page, info)
    } else if (page.url().includes('https://myaccount.google.com/signinoptions/recovery-options-collection?')) {
        await confirmRecoveryOption(page)
    }else {
        await loginGoogle(page, info)
    }
    checkLoginProgress(page, info)
}

async function confirmRecoveryEmail(page, info) {
    await PuppUtils.click(page, 'li:nth-child(2)')
    await page.waitForTimeout(3000)
    await PuppUtils.typeText(page, '#knowledge-preregistered-email-response', info.recoveryMail)
    await PuppUtils.click(page, 'button[type="button"]:first-child')
}

async function addGoogleChip(page) {
    await PuppUtils.click(page, '[data-ogpc] > div>div>div>div:nth-child(2)>div:nth-child(4) [role="button"]:first-child')
}

async function addGoogleBirthday(page, info) {
    await PuppUtils.typeText(page, 'input[placeholder="DD"]', getDateOfBirth(1, info).toString())

    let element = await page.$(`div[role="combobox"]`)
    await element.click()
    await page.waitForTimeout(SLOW_MO)

    for (let i = 0; i < parseInt(getDateOfBirth(0, info)); i++) {
        await page.keyboard.press('ArrowDown', 500)
    } await page.keyboard.press('Enter', 500)

    await PuppUtils.typeText(page, 'input[placeholder="YYYY"]', getDateOfBirth(2, info).toString())
    await page.waitForTimeout(SLOW_MO)
    await PuppUtils.click(page, 'button:first-child')
    await page.waitForTimeout(2000)
    await PuppUtils.click(page, '[data-mdc-dialog-action="ok"]')
    await page.waitForTimeout(SLOW_MO)
    await PuppUtils.click(page, 'div[jscontroller] div:last-child div div button')
}

async function loginGoogle(page, info) {
    await PuppUtils.typeText(page, '#identifierId', info.mail.trim().toLowerCase())
    await PuppUtils.waitNextUrl(page, '#identifierNext')
    await PuppUtils.jsWaitForSelector(page, '[name="password"]', 3000)
    await page.waitForTimeout(3000)
    await PuppUtils.typeText(page, '[name="password"]', info.password.trim())
    await PuppUtils.waitNextUrl(page, '#passwordNext')
}

async function loginEtsy(page, info) {
    await page.goto('https://www.etsy.com')
    await page.waitForTimeout(8000)
    if (await PuppUtils.isElementVisbile(page, '.select-signin')) {
    } else {
        await registerShop(page, info)
        return
    }
    let element = ''

    element = await page.$('.select-signin')
    await element.click()
    await page.waitForTimeout(8000)

    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())))
    await PuppUtils.click(page, 'button[data-google-button="true"]')
    const newPage = await newPagePromise
    await newPage.bringToFront()
    await page.waitForTimeout(8000)
    await PuppUtils.click(newPage, '[data-identifier]')

    await page.waitForTimeout(15000)
    if (await PuppUtils.isElementVisbile(page, '[data-ge-nav-event-name="gnav_show_user_menu"]')) {
        await registerShop(page, info)
        return
    } else {
        console.log("khong thay")
        await registerShop(page, info)
        return
    }
}

async function registerShop(page, info) {
    await page.goto('https://www.etsy.com/your/shop/create?us_sell_create_value', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    onNextStep(page, info)
}

async function onNextStep(page, info) {
    if (await checkStatusAccount(page)) {
        console.log("Suspended")
        await browser.close()
        iNumCurrentAccount++
        await checkAccountValid()
        return
    }
    // Step 1
    if (await PuppUtils.isElementVisbile(page, '[data-onboarding-step="set-preferences"]')) {
        await submitShoppreferences(page, info)  // Step 1
    } else if (await PuppUtils.isElementVisbile(page, '[data-onboarding-step="shop-name"]')) {   // Step 2
        await submitShopName(page, info)
    } else if (await PuppUtils.isElementVisbile(page, '[data-onboarding-step="list-items"]')) {   // Step 3
        await createNewListing(page, info)
    } else if (await PuppUtils.isElementVisbile(page, '[data-ui="bank-country-selection"]')) {   // Step 3
        await submitBussinessInfo(page, info)
    } else if (await PuppUtils.isElementVisbile(page, '[data-onboarding-step="setup-billing"]')) {   // Step 4
        await setupBilling(page, info)
    } else if (page.url().includes('/shop/')) {
        var datetime = new Date();
        infos[iNumCurrentAccount].dayREG = datetime.toISOString().slice(0, 10)
        infos[iNumCurrentAccount].status = "WaitForwardEmail"
        saveInfos()
        // await forwardEmail(info)
        await finishReg(info)
        return
    }

    infos[iNumCurrentAccount].status = "Pending"
    saveInfos()

    await page.waitForTimeout(5000)
    await onNextStep(page, info)
}

async function finishReg(info) {
    // if(info.status == "Success"){
        iNumCurrentAccount++
        await browser.close();
        console.log("done!")
        await checkAccountValid()
    // }
    return
}

async function forwardEmailProcess(page2, info){
    await page2.waitForTimeout(13000)
    if (page2.url().includes('https://myaccount.google.com/signinoptions/recovery-options-collection?')) {
        await confirmRecoveryOption(page2)
    } if (page2.url().includes('https://myaccount.google.com/interstitials/birthday')) {
        await addGoogleBirthday(page2, info)
    } if (page2.url().includes('https://gds.google.com/web/chip')) {
        await addGoogleChip(page2)
    } if (page2.url().includes('https://accounts.google.com/signin/v2/challenge/selection')) {
        await confirmRecoveryEmail(page2, info)
    } if (await page2.url().includes('https://mail.google.com/mail/u/0/#settings/fwdandpop')){
        if (await PuppUtils.isElementVisbile(page2, '[role="alertdialog"]')) {
            await PuppUtils.click(page2, '.T-I.T-I-JN:last-child')
        } if (await PuppUtils.isElementVisbile(page2, '#link_enable_notifications')){
            await PuppUtils.click(page2, '#link_enable_notifications')
        }
        return
    }
    await forwardEmailProcess(page2, info)
}

async function forwardEmail(info) {
    const page2 = await browser.newPage()
    await page2.goto('https://mail.google.com/mail/u/0/#settings/fwdandpop', { waitUntil: 'domcontentloaded' })
    await page2.bringToFront()

    await forwardEmailProcess(page2, info)
    
    await page2.waitForTimeout(SLOW_MO)
    await PuppUtils.click(page2, 'input[value="Add a forwarding address"]')
    await page2.waitForTimeout(2000)
    await PuppUtils.typeText(page2, '[role="alertdialog"] input', info.forwardEmail)

    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())))
    await PuppUtils.click(page2, '[role="alertdialog"] button[name="next"]')
    const newPage = await newPagePromise
    await newPage.bringToFront()
    await page2.waitForTimeout(8000)
    await PuppUtils.click(newPage, 'form input[value="Proceed"]')

    await page2.waitForTimeout(3000)
    await PuppUtils.click(page2, 'button[name="ok"]')
    await page2.waitForTimeout(2000)
    await page2.goto('https://accounts.google.com/AddSession?hl=en&continue=https://mail.google.com/mail&service=mail&ec=GAlAFw', { waitUntil: 'domcontentloaded' })

    await page2.waitForTimeout(3000)

    await PuppUtils.typeText(page2, '#identifierId', info.forwardEmail.trim().toLowerCase())
    await PuppUtils.waitNextUrl(page2, '#identifierNext')
    await PuppUtils.jsWaitForSelector(page2, '[name="password"]', 4000)
    await page2.waitForTimeout(5000)
    await PuppUtils.typeText(page2, '[name="password"]', info.passForward.trim())
    await PuppUtils.click(page2, '#passwordNext')

    await page2.waitForTimeout(3000)
    if (page2.url().includes('https://accounts.google.com/signin/v2/challenge/selection')) {
        await PuppUtils.click(page2, 'li:first-child')
        await page2.waitForTimeout(3000)
        await PuppUtils.typeText(page2, '#knowledge-preregistered-email-response', info.recoveryForwardMail)
        await PuppUtils.click(page2, 'button[type="button"]:first-child')
    }
    await page2.waitForTimeout(13000)

    codeForward = await page2.evaluateHandle((info) => {
        let index = 0
        let result = document.querySelectorAll('span[data-legacy-last-non-draft-message-id]')[index].innerHTML.trim().indexOf(`Gmail Forwarding Confirmation - Receive Mail from ${info.mail}`)
        do {
            index++
            result = document.querySelectorAll('span[data-legacy-last-non-draft-message-id]')[index].innerHTML.trim().indexOf(`Gmail Forwarding Confirmation - Receive Mail from ${info.mail}`)
        } while (result == -1)
        return document.querySelectorAll('span[data-legacy-last-non-draft-message-id]')[index]
    }, info)
    let res = await (await codeForward.getProperty('innerHTML')).jsonValue()

    await page2.goto('https://mail.google.com/mail/u/0/#settings/fwdandpop')
    await page2.bringToFront()
    await page2.waitForTimeout(13000)

    await PuppUtils.typeText(page2, 'input[act="verifyText"]', getCodeForward(res))
    await PuppUtils.click(page2, 'input[value="Verify"]')
    await page2.waitForTimeout(2000)
    await PuppUtils.click(page2, 'input[value="1"]:first-child')
    await page2.waitForTimeout(1000)
    await PuppUtils.click(page2, '[guidedhelpid="save_changes_button"]')
    await page2.waitForTimeout(3000)

    infos[iNumCurrentAccount].status = "Success"
    saveInfos()
}

function getCodeForward(codeForward) {
    return codeForward.split(")")[0].split("#")[1]
}

async function setupBilling(page, info) {
    await PuppUtils.typeText(page, '#billing-cc-num', getCreditCard(info.card, 0))

    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#billing-cc-exp-mon')
    await element.click()
    await page.waitForTimeout(SLOW_MO)
    await page.evaluate(() => {
        $('#billing-cc-exp-mon').get(0).size = 1000
    })
    element = await page.$(`#billing-cc-exp-mon option[value="${getCreditCard(info.card, 1)}"]`)
    await element.click()

    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#billing-cc-exp-year')
    await element.click()
    await page.waitForTimeout(SLOW_MO)
    await page.evaluate(() => {
        $('#billing-cc-exp-year').get(0).size = 1000
    })
    element = await page.$(`#billing-cc-exp-year option[value="${getCreditCard(info.card, 2)}"]`)
    await element.click()

    await page.waitForTimeout(SLOW_MO)
    await PuppUtils.typeText(page, '#billing-cc-ccv', getCreditCard(info.card, 3))
    await PuppUtils.typeText(page, '#billing-name', capitalizeLetter(info.firstName) + " " + capitalizeLetter(info.middleName) + " " + capitalizeLetter(info.lastName))
    await PuppUtils.typeText(page, 'input[name="billing[address]"]', info.address)
    await PuppUtils.typeText(page, 'input[name="billing[city]"]', capitalizeLetter(info.city))

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
    await PuppUtils.typeText(page, 'input[name="billing[zip]"]', info.zip)
    await page.waitForTimeout(SLOW_MO)

    await PuppUtils.waitNextUrl(page, 'button[data-subway-final]')
}

function getCreditCard(card, num) {
    let crCard = card.trim().split("|")
    if (num == 1) {
        return parseInt(crCard[num])
    }
    return crCard[num]
}

async function checkStatusAccount(page) {
    console.log("checking StatusAccount")
    if ((await page.content()).includes('Your account is currently suspended')) {
        infos[iNumCurrentAccount].status = "Suspended"
        saveInfos()
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

function capitalizeLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

async function generateShopName(page, info, reGen = 0) {
    try {
        let shopName = ""
        shopName = capitalizeLetter(info.firstName).trim() + capitalizeLetter(info.lastName).trim()
        if (reGen == 1) {
            shopName += getFirstLetterShopName(info)
        } else if (reGen == 2) {
            shopName += getFirstLetterShopName(info) + "Shop"
        } else if (reGen >= 3) {
            shopName += getFirstLetterShopName(info) + "Shop" + nanoid(2).replace(/[^a-zA-Z0-9]/g, "")
        }

        await PuppUtils.typeText(page, '#onboarding-shop-name-input', shopName)
        await PuppUtils.click(page, '[data-action="check-availability"]')
        await page.waitForTimeout(1500)

        if (await PuppUtils.isElementVisbile(page, '#not-available') || await PuppUtils.isElementVisbile(page, 'data-region="name-suggester-container"')) {
            console.log('Not Available', shopName)
            reGen++
            await generateShopName(page, info, reGen)
            return Promise.resolve()
        } else {
            console.log('Available', shopName)
            infos[iNumCurrentAccount].nameShop = shopName
            saveInfos()
            return Promise.resolve()
        }
    } catch (err) {
        return Promise.reject(err)
    }
}

function getFirstLetterShopName(info) {
    let fShopName = info.firstName.trim().charAt(0) + info.lastName.trim().charAt(0)
    return fShopName.toUpperCase()
}

async function createNewListing(page, info) {
    await page.goto(`https://www.etsy.com/your/shops/${info.shopName}/onboarding/listings/create`, { waitUntil: 'domcontentloaded' })
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
    await PuppUtils.typeText(page, "#SKU-input", nanoid(10).replace(/[^a-zA-Z0-9]/g, ""))
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

                await element.type(nanoid(10).replace(/[^a-zA-Z0-9]/g, ""))

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
    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#shipping_country [value="209"]')
    await element.click()
    await page.waitForTimeout(SLOW_MO)
    await PuppUtils.typeText(page, '#origin_postal_code', "90001")

    await page.waitForTimeout(SLOW_MO)
    element = await page.$('#processing_time_select')
    await element.click()
    await page.evaluate(() => {
        $(`#processing_time_select`).get(0).size = 1000
    })
    element = await page.$('#processing_time_select [value="4"]')
    await element.click()
    // Xoa canada
    await page.waitForTimeout(SLOW_MO)
    element = await page.evaluateHandle(() => {
        return $(`div.wt-grid.wt-pt-xs-4.wt-pb-xs-4:contains("Canada")`).find('.wt-grid__item-md-9 .wt-btn.wt-btn--transparent.wt-btn--icon')[0]
    })
    await element.click()
    // Chon shipping carrier
    await page.waitForTimeout(SLOW_MO)
    element = await page.evaluateHandle(() => {
        return $(`div.wt-grid.wt-pt-xs-4.wt-pb-xs-4:contains("United States")`).find('#shipping_carrier')[0]
    })
    await element.click()
    await page.evaluate((element) => {
        element.size = 1000
    }, element)
    element = await page.evaluateHandle(() => {
        return $(`div.wt-grid.wt-pt-xs-4.wt-pb-xs-4:contains("United States")`).find('#shipping_carrier option[value="2"]')[0]
    })
    await element.click()

    //Chon fix price shipping
    await page.waitForTimeout(SLOW_MO)
    element = await page.evaluateHandle(() => {
        return $(`div.wt-grid.wt-pt-xs-4.wt-pb-xs-4:contains("United States")`).find('#charge_option')[0]
    })
    await element.click()
    await page.evaluate((element) => {
        element.size = 1000
    }, element)
    element = await page.evaluateHandle(() => {
        return $(`div.wt-grid.wt-pt-xs-4.wt-pb-xs-4:contains("United States")`).find('#charge_option option[value="fixed"]')[0]
    })
    await element.click()
    //Nhap Price one item
    await page.waitForTimeout(SLOW_MO)
    await PuppUtils.click(page, '.wt-text-body-01.wt-grid__item-xs-12 > div:nth-child(1) >div:nth-child(2)>div:nth-child(2)>div:nth-child(2) >div >div:nth-child(1) input')
    await PuppUtils.typeText(page, '.wt-text-body-01.wt-grid__item-xs-12 > div:nth-child(1) >div:nth-child(2)>div:nth-child(2)>div:nth-child(2) >div >div:nth-child(1) input', "8.99")
    await PuppUtils.click(page, '.wt-text-body-01.wt-grid__item-xs-12 > div:nth-child(1) >div:nth-child(2)>div:nth-child(2)>div:nth-child(2) >div >div:nth-child(2) input')
    await PuppUtils.typeText(page, '.wt-text-body-01.wt-grid__item-xs-12 > div:nth-child(1) >div:nth-child(2)>div:nth-child(2)>div:nth-child(2) >div >div:nth-child(2) input', "3.99")

    await page.waitForTimeout(SLOW_MO)
    element = await page.evaluateHandle(() => {
        return $(`div.wt-grid.wt-pt-xs-4.wt-pb-xs-4:contains("Everywhere else")`).find('#shipping_carrier')[0]
    })
    await element.click()
    await page.evaluate((element) => {
        element.size = 1000
    }, element)
    element = await page.evaluateHandle(() => {
        return $(`div.wt-grid.wt-pt-xs-4.wt-pb-xs-4:contains("Everywhere else")`).find('#shipping_carrier option[value="2"]')[0]
    })
    await element.click()
    //Chon fix price shipping
    await page.waitForTimeout(SLOW_MO)
    element = await page.evaluateHandle(() => {
        return $(`div.wt-grid.wt-pt-xs-4.wt-pb-xs-4:contains("Everywhere else")`).find('#charge_option')[0]
    })
    await element.click()
    await page.evaluate((element) => {
        element.size = 1000
    }, element)
    element = await page.evaluateHandle(() => {
        return $(`div.wt-grid.wt-pt-xs-4.wt-pb-xs-4:contains("Everywhere else")`).find('#charge_option option[value="fixed"]')[0]
    })
    await element.click()
    await page.waitForTimeout(SLOW_MO)

    await PuppUtils.click(page, '.wt-text-body-01.wt-grid__item-xs-12 > div:nth-child(2) >div:nth-child(2)>div:nth-child(2)>div:nth-child(2) >div >div:nth-child(1) input')
    await PuppUtils.typeText(page, '.wt-text-body-01.wt-grid__item-xs-12 > div:nth-child(2) >div:nth-child(2)>div:nth-child(2)>div:nth-child(2) >div >div:nth-child(1) input', "19.99")
    await PuppUtils.click(page, '.wt-text-body-01.wt-grid__item-xs-12 > div:nth-child(2) >div:nth-child(2)>div:nth-child(2)>div:nth-child(2) >div >div:nth-child(2) input')
    await PuppUtils.typeText(page, '.wt-text-body-01.wt-grid__item-xs-12 > div:nth-child(2) >div:nth-child(2)>div:nth-child(2)>div:nth-child(2) >div >div:nth-child(2) input', "10.99")
    await page.waitForTimeout(SLOW_MO)

    await PuppUtils.click(page, '[data-region="shipping-profiles"] button.wt-btn--outline')
    await page.waitForTimeout(2000)
    await PuppUtils.click(page, '[aria-label="Overlay warning that domestic shipping cost increases with this change"] button.wt-btn.wt-btn--filled')
    await page.waitForTimeout(SLOW_MO)
    await PuppUtils.typeText(page, 'input[placeholder="Name of the profile"]', "CANVAS CC")

    await PuppUtils.click(page, '[aria-label="Overlay to save an unshared profile"] button.wt-btn--filled')
    await page.waitForTimeout(3000)

    await PuppUtils.click(page, '.page-footer [data-save]')
    await page.waitForTimeout(4000)
    if (await PuppUtils.jsIsSelectorExisted(page, '[data-region="listings-container"] a')) {
        await PuppUtils.click(page, '[data-subway-next="true"] ')
    }
}

async function submitBussinessInfo(page, info) {
    await page.waitForTimeout(4000)
    await page.evaluate(() => {
        element = document.querySelector('#bank-country-id')
        if (element) {
            element.scrollTop = element.offsetHeight
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
    if (!await PuppUtils.isElementVisbile(page, '[data-ui="bank_account_legal_name"]')) {
        await PuppUtils.typeText(page, "#bank-name-on-account", capitalizeLetter(info.firstName) + " " + capitalizeLetter(info.middleName) + " " + capitalizeLetter(info.lastName))
    }
    await PuppUtils.typeText(page, "#bank-routing-number", getRoutingNumber(info))
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
    await PuppUtils.typeText(page, "#identity-first-name", capitalizeLetter(info.firstName))
    await PuppUtils.typeText(page, "#identity-last-name", capitalizeLetter(info.lastName))
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

function getRoutingNumber(info) {
    if (info.routingNumber.length == 8) {
        return "0" + info.routingNumber
    } return info.routingNumber
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

function getDateOfBirth(num, info) {
    let dob = info.dob.trim().split("/")
    if (num == 1) {
        if (dob[num].length == 1) {
            dob[num] = "0" + dob[num]
            return dob[num]
        }
    }
    if (num == 2) {
        if (dob[num].length == 2) {
            dob[num] = "19" + dob[num]
            return dob[num]
        }
    }
    return parseInt(dob[num])
}

function saveInfos() {
    fs.writeFileSync('./input/infos.tsv', d3.tsvFormat(infos), 'utf8')
}

async function confirmRecoveryOption(page) {
    await PuppUtils.click(page, '[role="presentation"]>div>div>div:nth-child(2)>div:nth-child(3)>div>div:nth-child(2) [role="button"]')
}