const nodefetch = require("node-fetch");
const https = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const fsExtra = require('fs-extra')

const appRoot = require.main.paths[0].split('node_module')[0].slice(0, -1);

function cleanUP(directory) {
    fsExtra.emptyDirSync(directory);
    if (fs.existsSync(appRoot + "/data/master.m3u8")) {
        fs.unlinkSync(appRoot + "/data/master.m3u8");
    }
}

function printProgress(mix, max){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Downloaded ${mix} of ${max}`);
}

async function downloadVideo() {
    cleanUP(appRoot + "/downloads/parts");
    let videoData = JSON.parse(fs.readFileSync(appRoot + "/data/capture.xhr"));
    const source = videoData["url"];
    console.log(source);
    let sourceArray = source.split("-");
    let segmentCount = Number(sourceArray[2]);
    sourceArray[2] = "${i}";
    let sourceArray2 = source.split(segmentCount);

    let maxCount = (( segmentCount + 1 ));
    for (let i = 1; i < maxCount; i++) {
        const content = await nodefetch(sourceArray2[0] + `${i}` + sourceArray2[1], {
            "headers": {
                "accept": "*/*",
                "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "sec-gpc": "1"
              },
              "referrer": "https://de.pornhubpremium.com/",
              "referrerPolicy": "strict-origin-when-cross-origin",
              "body": null,
              "method": "GET",
              "mode": "cors"
          });
      
        const file = fs.createWriteStream(appRoot + `/downloads/parts/sec_${i}.ts`);
        https.get(content.url, function(response) {
            response.pipe(file);
        });
        printProgress(i, maxCount);
    }
}

module.exports.downloadVideo = downloadVideo;