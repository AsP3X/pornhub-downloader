const puppeteer = require("puppeteer");
const fs = require("fs");
const fsp = require("fs").promises;

const appRoot = require.main.paths[0].split('node_module')[0].slice(0, -1);
require('dotenv').config({ path: appRoot + "/.env" });

// Clearing old login data
// and continuing with auto login if data is provided
function clearLoginData() {
    if (fs.existsSync(`${appRoot}/data/cookies.json`)) {
        console.log("Cookie data was found! Removing now...");
        fs.unlinkSync(appRoot + "/data/cookies.json");
    } else {
        console.log("No login data was found continuing with auto login");
    }
}

async function phLogin() {
    clearLoginData();
    // Initializing Browser
    const browser = await puppeteer.launch({
        headless: false,
        // product: 'brave',
        // executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
    });

    // Preparing page
    const page = await browser.newPage();
    await page.setViewport({
        width: 1024,
        height: 768
    });

    // Checking if cookies are already present
    /**
     * If there are no cookies a automatic login
     * will start.
     * 
     * If present the script will continue without
     * a creating a new login session
     */

    if (fs.existsSync(appRoot + "/data/cookies.json")) {
        browser.close();
    } else {
        await page.goto('https://de.pornhubpremium.com/premium/login', {waitUntil: 'load', timeout: 0});
        await page.click("#username", {delay: 100});
        await page.type("#username", "asp3x", {delay: 100});
        await page.click("#password");
        await page.type("#password", "wN8t24TDvZ2T9bDKywc6", {delay: 100});
        await page.click('#submitLogin'); 
        await page.waitForNavigation({timeout: 0});

        const cookies = await page.cookies();
        await fsp.writeFile(appRoot + "/data/cookies.json", JSON.stringify(cookies, null, 2));

        // Validation of cookies are set correctly
        if (cookies != null || cookies.length != 0) {
            return;
        }
    }
}

module.exports.phLogin = phLogin;