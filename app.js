const pornhubAccount = require("./assets/modules/login");
const pornhubCore = require("./assets/modules/capture");
const pornhubStream = require("./assets/modules/download");
const coreConvert = require("./assets/modules/convert");

const Args = process.argv.slice(2);

// Checking if the video url parameter is set correctly
if (Args[0] == undefined) {
    console.log("ERROR: missing URL parameter");
    return;
}

if (Args[0] == "login") {
    pornhubAccount.phLogin();
}

if (Args[0] == "capture") {
    pornhubCore.phCapture(Args[1]);
}

if (Args[0] == "download") {
    pornhubStream.downloadVideo();
}

if (Args[0] == "convert") {
    coreConvert.convM3u8();
}