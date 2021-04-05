// Script Name: {Untitled Test Case}

const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 }, args: ['--start-maximized'] });
    const page = await browser.newPage();
    let element, formElement, tabs;

    await page.goto(`https://www.etsy.com/signin?from_page=https%3A%2F%2Fwww.etsy.com%2Fyour%2Fshops%2FShopTestByCng%2Ftools%2Flistings`, { waitUntil: 'networkidle0' });
    element = await page.$x(`//*[@id="join_neu_email_field"]`);
    await element[0].click();
    element = await page.$x(`//*[@id="join_neu_email_field"]`);
    await element[0].type(`nqcuong9a5@gmail.com`);
    element = await page.$x(`//*[@id="join_neu_password_field"]`);
    await element[0].click();
    element = await page.$x(`//*[@id="join_neu_password_field"]`);
    await element[0].type(`cuong23101998`);
    formElement = await page.$x(`//*[@id="join-neu-form"]`);
    await page.evaluate(form => form.submit(), formElement[0]);
    await page.waitForNavigation();
    element = await page.$x(`//form[@id='join-neu-form']/div[3]/div[2]/div/button`);
    await element[0].click();
    tabs = await browser.pages();
    console.log(tabs);


    // WARNING: unsupported command close. Object= {"command":"close","target":"win_ser_1","value":""}

    tabs = await browser.pages();
    console.log(tabs);
    element = await page.$x(`//div[@id='page-region']/div/div/div[2]/div/div/div/div[9]/div/div/ul/li/div/div/div[3]/button`);
    await element[0].click();
    element = await page.$x(`//*[@id="mask"]`);
    await element[0].click();
    element = await page.$x(`//div[@id='page-region']/div/div/div/header/div/div/div[3]/div/div/a/span[2]`);
    await element[0].click();
    element = await page.$x(`//*[@id="listing-edit-image-upload"]`);
    await element[0].click();
    element = await page.$x(`//*[@id="title-input"]`);
    await element[0].click();
    element = await page.$x(`//*[@id="title-input"]`);
    await element[0].type(`fdafdsa`);
    element = await page.$x(`//*[@id="who_made-input"]`);
    await element[0].click();


    // WARNING: unsupported command select. Object= {"command":"select","target":"id=who_made-input","value":"label=I did"}

    element = await page.$x(`//*[@id="who_made-input"]`);
    await element[0].click();
    element = await page.$x(`//*[@id="is_supply-input"]`);
    await element[0].click();


    // WARNING: unsupported command select. Object= {"command":"select","target":"id=is_supply-input","value":"label=A finished product"}

    element = await page.$x(`//*[@id="is_supply-input"]`);
    await element[0].click();
    element = await page.$x(`//*[@id="when_made-input"]`);
    await element[0].click();
    element = await page.$x(`//*[@id="when_made-input"]`);
    await element[0].click();


    // WARNING: unsupported command select. Object= {"command":"select","target":"id=when_made-input","value":"label=2020 - 2021"}

    element = await page.$x(`//*[@id="when_made-input"]`);
    await element[0].click();
    element = await page.$x(`//*[@id="taxonomy-search"]`);
    await element[0].click();
    element = await page.$x(`//*[@id="taxonomy-search"]`);
    await element[0].type(`Mugs`);
    element = await page.$x(`//li[@id='taxonomy-search-results-option-0']/a/span/strong`);
    await element[0].click();
    element = await page.$x(`//div[@id='page-region']/div/div/div[2]/div/div/div/div[5]/div[12]/div/div/div/div/div[2]/fieldset/div[2]/div/div/ul/li[2]/label/span`);
    await element[0].click();
    element = await page.$x(`//*[@id="description-text-area-input"]`);
    await element[0].click();
    element = await page.$x(`//*[@id="description-text-area-input"]`);
    await element[0].type(`fdafdsaf`);
    element = await page.$x(`//*[@id="price_retail-input"]`);
    await element[0].click();
    element = await page.$x(`//*[@id="price_retail-input"]`);
    await element[0].type(`243244324`);
    element = await page.$x(`//*[@id="SKU-input"]`);
    await element[0].click();
    element = await page.$x(`//*[@id="SKU-input"]`);
    await element[0].type(`fdsaf`);
    element = await page.$x(`//div[@id='page-region']/div/div/div[2]/div/div/div/div[12]/div/div/div/div/div/div/div[3]/div/div/div/div/div/div/label/span/span`);
    await element[0].click();
    element = await page.$x(`(//button[@type='button'])[8]`);
    await element[0].click();
    element = await page.$x(`(//button[@type='button'])[12]`);
    await element[0].click();
    await browser.close();
})();