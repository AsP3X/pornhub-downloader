const puppeteer = require("puppeteer");
const fs = require("fs");
const fsp = require("fs").promises;

const Args = process.argv.slice(2);
const appRoot = require.main.paths[0].split('node_module')[0].slice(0, -1);

async function getVideoTitle(page) {
    return await page.evaluate(() => {
        let videoTitleElement = document.getElementById("videoTitle").children[1];
        let videoTitle = videoTitleElement.innerHTML;
        return videoTitle;
    });
}

async function setVideoCurrentTime(page) {
    const videoDuration = await page.$eval("video", (elem) => {
        const duration = elem.duration;
        elem.currentTime = (( duration - 10.2311 ));
    });
    // if (videoDuration == undefined) {
    //     setVideoCurrentTime(page);
    // }
    console.log(videoDuration);
    return videoDuration;
}

function makeFilenameSafe(vTitle) {
    let videoTitle = vTitle;

    // replace all double quotes with empty spaces
    videoTitle = videoTitle.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    return videoTitle;
}

async function phCapture(videoURL) {

    // Checking if the video url parameter is set correctly
    if (Args[0] == undefined && videoURL == "") {
        console.log("ERROR: missing URL parameter");
        return;
    }

    if (Args[0] != undefined && videoURL == "") {
        let videoURL = Args[0];
    }

    // Initializing Browser
    const browser = await puppeteer.launch({
        headless: false,
        product: 'brave',
        executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
    });

    // Preparing page
    const page = await browser.newPage();
    await page.setViewport({
        width: 1024,
        height: 768
    });

    // Loading in session cookies
    const cookieString = await fsp.readFile(appRoot + "/data/cookies.json");
    const cookies = JSON.parse(cookieString);
    await page.setCookie(...cookies);

    /**
     * Loading the requested video url and
     * stores the videoTitle
     */
     await page.goto(videoURL, { waitUntil: 'networkidle2', timeout: 0});
    // await page.goto(videoURL, {waitUntil: 'load', timeout: 0});
    const rawTitle =  await getVideoTitle(page);
    const videoTitle = makeFilenameSafe(rawTitle.toString());

    // set video currentTime
    await page.waitForSelector('video');
    const videoDuration = await setVideoCurrentTime(page);

    await page.setRequestInterception(true);
    await page.on('request', (request) => {
        let reqContent = request.url();
        if (reqContent.includes("hls")) {
            let requestURL = request.url();
            let dataBlock = {
                "title": videoTitle,
                "url": requestURL
            };
            fs.writeFileSync(appRoot + "/data/capture.xhr", JSON.stringify(dataBlock));
        }
        request.continue();
    });
}

module.exports.phCapture = phCapture