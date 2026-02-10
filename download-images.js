const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
    // Brand
    { url: 'https://i.imgur.com/6H5gxcw.png', path: 'brand/logo.png' },
    // Hero
    { url: 'https://i.imgur.com/wGZdjw3.png', path: 'hero/hero-bg.png' },
    // Competitors
    { url: 'https://i.imgur.com/ixKdf90.png', path: 'competitors/netflix.png' },
    { url: 'https://i.imgur.com/YYOnwF2.png', path: 'competitors/prime.png' },
    { url: 'https://i.imgur.com/BnfH5h1.png', path: 'competitors/disney.png' },
    { url: 'https://i.imgur.com/dMvm88t.png', path: 'competitors/hbo.png' },
    { url: 'https://i.imgur.com/gRTAJPs.png', path: 'competitors/globo.png' },
    // Sports
    { url: 'https://i.imgur.com/KzbghZn.png', path: 'sports/brasileirao.png' },
    { url: 'https://i.imgur.com/oozXd3K.png', path: 'sports/copa-mundo.png' },
    { url: 'https://i.imgur.com/8JocDJp.png', path: 'sports/copa-nordeste.png' },
    { url: 'https://i.imgur.com/aVGJOG6.png', path: 'sports/nba.png' },
    { url: 'https://i.imgur.com/kCiNi9e.png', path: 'sports/ufc.png' },
    { url: 'https://i.imgur.com/rv4vxMN.png', path: 'sports/premiere.png' },
    { url: 'https://i.imgur.com/JKR83pe.png', path: 'sports/cazetv.png' },
    { url: 'https://i.imgur.com/U0Tr1Z7.png', path: 'sports/espn.png' },
    { url: 'https://i.imgur.com/vIrkVYY.png', path: 'sports/sportv.png' },
    // Movies
    { url: 'https://i.imgur.com/o5aFK6U.png', path: 'movies/avatar.png' },
    { url: 'https://i.imgur.com/ZNgNuQE.png', path: 'movies/zootopia.png' },
    { url: 'https://i.imgur.com/FAfqJZq.png', path: 'movies/truque.png' },
    { url: 'https://i.imgur.com/9TNCuaG.png', path: 'movies/jurassic.png' },
    { url: 'https://i.imgur.com/36sJP7U.png', path: 'movies/minecraft.png' },
    { url: 'https://i.imgur.com/D4DWCtR.png', path: 'movies/missao.png' },
    { url: 'https://i.imgur.com/wDqFB1z.png', path: 'movies/bailarina.png' },
    { url: 'https://i.imgur.com/XcHZOKv.png', path: 'movies/mickey17.png' },
    { url: 'https://i.imgur.com/QSvAHgB.png', path: 'movies/28anos.png' },
    // Series
    { url: 'https://i.imgur.com/4eIqVnR.png', path: 'series/stranger.png' },
    { url: 'https://i.imgur.com/YbDnYHB.png', path: 'series/walking.png' },
    { url: 'https://i.imgur.com/MJIgYFX.png', path: 'series/vikings.png' },
    { url: 'https://i.imgur.com/7Y4BgjE.png', path: 'series/got.png' },
    { url: 'https://i.imgur.com/PJy6JUu.png', path: 'series/breaking.png' },
    { url: 'https://i.imgur.com/T16gYjr.png', path: 'series/lacasa.png' },
    { url: 'https://i.imgur.com/A2gXG5T.png', path: 'series/theboys.png' },
    { url: 'https://i.imgur.com/sGgQcrT.png', path: 'series/peaky.png' },
    { url: 'https://i.imgur.com/9g7RPOv.png', path: 'series/blackmirror.png' },
];

const basePath = path.join(__dirname, 'public/images');

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return download(res.headers.location, dest).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', reject);
    });
};

const run = async () => {
    for (const img of images) {
        const fullDest = path.join(basePath, img.path);
        const dir = path.dirname(fullDest);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        console.log(`Downloading ${img.path}...`);
        try {
            await download(img.url, fullDest);
        } catch (err) {
            console.error(`Error downloading ${img.url}:`, err.message);
        }
    }
    console.log('Finished downloading all images!');
};

run();
