const _ = require('lodash')
const TIMEOUT = 2000

class PuppUtils {

    static async isElementVisbile(page, selector, timeout = 200) {
        return new Promise(async (resolve, reject) => {
            try {
                await page.waitForSelector(selector, {
                    timeout: timeout,
                    visible: true,
                    hidden: false,
                })

                resolve(true)
            } catch (err) {
                resolve(false)
            }
        })
    }

    static async click(page, selector, timeout = TIMEOUT, skip = false, visible = true) {
        return new Promise(async (resolve, reject) => {
            try {
                try {
                    await page.waitForSelector(selector, {
                        timeout: timeout,
                        ...(visible && {
                            visible: true
                        }),
                        ...(!visible && {
                            hidden: true
                        })
                    })
                } catch (err) {
                    if (skip) {
                        resolve(true)
                    } else {
                        reject(err)
                    }
                }

                await page.click(selector)

                resolve(true)
            } catch (err) {
                reject(err)
            }
        })
    }

    static async jsClick(page, selector, timeout = TIMEOUT, skip = false) {
        return new Promise(async (resolve, reject) => {
            try {
                try {
                    await PuppUtils.jsWaitForSelector(page, selector, timeout)
                } catch (err) {
                    if (skip) {
                        resolve(true)
                    } else {
                        reject(err)
                    }
                }


                await page.evaluate((selector) => {
                    window.document.querySelector(selector).click()
                }, selector)

                resolve(true)
            } catch (err) {
                reject(err)
            }
        })
    }

    static async jsWaitForSelector(page, selector, timeout = TIMEOUT) {
        return new Promise(async (resolve, reject) => {
            try {
                let now = Date.now()
                let itv = setInterval(async () => {
                    try {
                        if (Date.now() - now >= timeout) {
                            reject(new Error(`!!! jsWaitForSeletor: Timeout ${timeout}`))
                        }
                        let isExisted = await page.evaluate((selector) => {
                            return (window.document.querySelector(selector) != null)
                        }, selector)
                        if (isExisted) {
                            clearInterval(itv)
                            resolve(true)
                        }

                    } catch (err) {
                        reject(err)
                    }
                }, 200)
            } catch (err) {
                reject(err)
            }
        })
    }

    static async jsIsSelectorNowExisted(page, selector) {
        return new Promise(async (resolve, reject) => {
            try {
                let isExisted = await page.evaluate((selector) => {
                    return (window.document.querySelector(selector) != null)
                }, selector)

                resolve(isExisted)
            } catch (err) {
                resolve(false)
            }
        })
    }
    
    static async jsIsSelectorExisted(page, selector, timeout = TIMEOUT) {
        return new Promise(async (resolve, reject) => {
            try {
                await PuppUtils.jsWaitForSelector(page, selector, timeout)
                resolve(true)
            } catch (err) {
                resolve(false)
            }
        })
    }

    static async jsWaitForUrlContains(page, value, timeout = TIMEOUT) {
        return new Promise(async (resolve, reject) => {
            try {
                let now = Date.now()
                let itv = setInterval(async () => {
                    try {
                        if (Date.now() - now >= timeout) {
                            reject(new Error(`!!! jsWaitForUrlContains: Timeout ${timeout}`))
                        }
                        if (page.url().includes(value)) {
                            clearInterval(itv)
                            resolve(true)
                        }
                    } catch (err) {
                        reject(err)
                    }
                }, 100)
            } catch (err) {
                reject(err)
            }
        })
    }

    static async jsSetValue(page, selector, value, timeout = TIMEOUT, visible = true) {
        return new Promise(async (resolve, reject) => {
            try {
                // await page.waitForSelector(selector, {
                //     timeout: timeout,
                //     ...(visible && {
                //         visible: true
                //     })
                // })

                await PuppUtils.jsWaitForSelector(page, selector, timeout)

                await page.evaluate((selector, value) => {
                    window.document.querySelector(selector).value = value
                    // window.document.querySelector(selector).scrollTop = window.document.querySelector(selector).scrollHeight
                }, selector, value)

                resolve(true)
            } catch (err) {
                reject(err)
            }
        })
    }

    static async jsSetHtml(page, selector, value, timeout = TIMEOUT, visible = true) {
        return new Promise(async (resolve, reject) => {
            try {
                await page.waitForSelector(selector, {
                    timeout: timeout,
                    ...(visible && {
                        visible: true
                    })
                })

                await page.evaluate((selector, value) => {
                    window.document.querySelector(selector)[removed] = value
                }, selector, value)

                resolve(true)
            } catch (err) {
                reject(err)
            }
        })
    }

    static async jsAlert(page, message) {
        return new Promise(async (resolve, reject) => {
            try {
                await page.evaluate((message) => {
                    window.alert(message)
                }, message)

                resolve(true)
            } catch (err) {
                reject(err)
            }
        })
    }

    static async jsSetTittle(page, value) {
        return new Promise(async (resolve, reject) => {
            try {
                await page.evaluate((value) => {
                    window.document.title = value
                }, value)

                resolve(true)
            } catch (err) {
                reject(err)
            }
        })
    }

    static async preventExit(page) {
        return new Promise(async (resolve, reject) => {
            try {
                await page.evaluate(() => {
                    [removed] = function () {
                        return 'Are you sure you want exit?'
                    }
                })

                resolve(true)
            } catch (err) {
                reject(err)
            }
        })
    }

    static async jsScrollIntoview(page, selector, timeout = TIMEOUT) {
        return new Promise(async (resolve, reject) => {
            try {
                await PuppUtils.jsWaitForSelector(page, selector, timeout)

                await page.evaluate((selector) => {
                    window.document.querySelector(selector).scrollIntoView()
                }, selector)

                resolve(true)
            } catch (err) {
                reject(err)
            }
        })
    }

    static async jsAutoScroll(page) {
        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                let totalHeight = 0
                let distance = 200
                let timer = setInterval(() => {
                    let scrollHeight = document.body.scrollHeight
                    window.scrollBy(0, distance)
                    totalHeight += distance

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer)
                        resolve()
                    }
                }, 50)
            })
        })
    }

    static async typeText(page, selector, value, delay = 0, timeout = 2000) {
        await page.waitForSelector(selector, {
            timeout: timeout
        })
        await PuppUtils.jsSetValue(page, selector, '')
        await page.click(selector)
        await page.type(selector, value, {
            delay: delay
        })
    }

    static async waitNextUrl(page, selector, timeout = 2000, navigationTimeout = false) {
        await page.waitForSelector(selector, {
            timeout: timeout
        })
        await Promise.all([
            page.click(selector),
            page.waitForNavigation({
                waitUntil: 'domcontentloaded',
                ...(navigationTimeout && {
                    timeout: navigationTimeout
                })
            })
        ])
    }
}

module.exports = PuppUtils