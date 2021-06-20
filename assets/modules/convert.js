const fs = require("fs");
const { FFmpeg, ffprobe, ffprobeSync } = require("kiss-ffmpeg");

const appRoot = require.main.paths[0].split('node_module')[0].slice(0, -1);

function convMP4() {
    let videoData = JSON.parse(fs.readFileSync(appRoot + "/data/capture.xhr"));
    const source = videoData["title"];
    ffmpeg = new FFmpeg({
        inputs: appRoot + "/data/master.m3u8",
        outputs:  { 
            url: appRoot + "/downloads/videos/" + source + ".mp4",
            options: { 
                "vcodec": "copy", 
                "c": "copy",
                "crf": "50"
            } 
        }
    });
    ffmpeg.run();
}

function convM3u8() {
    const downloadFolder = appRoot + "/downloads/parts";
    fs.readdir(downloadFolder, (err, files) => {
        const fileCount = (( files.length ));
        console.log(fileCount);
        for (let i = 1; i < fileCount; i++) {
            
            console.log(`i[${i}] - f[${fileCount}]`);
            
            const masterFile = appRoot + "/data/master.m3u8";
            const partFile = appRoot + `/downloads/parts/sec_${i}.ts\n`;
            if (i == 1) {
                fs.appendFileSync(masterFile, '#EXTM3U\n');
                fs.appendFileSync(masterFile, '#EXT-X-TARGETDURATION:10\n');
                fs.appendFileSync(masterFile, '#EXT-X-MEDIA-SEQUENCE:1\n');
    
                fs.appendFileSync(masterFile, '#EXTINF:10, no desc\n');
                fs.appendFileSync(masterFile, partFile);
            } else if (i == (( fileCount - 1 ))){
                fs.appendFileSync(masterFile, '#EXT-X-ENDLIST');
            } else if (i < fileCount && i != 0) {
                fs.appendFileSync(masterFile, '#EXTINF:10, no desc\n');
                fs.appendFileSync(masterFile, partFile);
            } else {
                console.log("ERROR");
            }
        }
        // fs.copyFile(masterFile, appRoot + '/downloads/master.m3u8', (err) => {
        //     if (err) throw err;
        //     console.log('source.txt was copied to destination.txt');
        //     convMP4();
        // });

        convMP4();
    })
}


module.exports.convM3u8 = convM3u8;