export interface ContentItem {
    id: string;
    title: string;
    image: string;
    category: 'sports' | 'movies' | 'series';
}

export const sportsData: ContentItem[] = [
    { id: 's1', title: 'Brasileirão', image: 'https://imgur.com/KzbghZn.png', category: 'sports' },
    { id: 's2', title: 'Copa do Mundo', image: 'https://imgur.com/oozXd3K.png', category: 'sports' },
    { id: 's3', title: 'Copa do Nordeste', image: 'https://imgur.com/8JocDPp.png', category: 'sports' },
    { id: 's4', title: 'NBA', image: 'https://imgur.com/aVGJOG6.png', category: 'sports' },
    { id: 's5', title: 'UFC', image: 'https://imgur.com/kCiNi9e.png', category: 'sports' },
    { id: 's6', title: 'Premiere', image: 'https://imgur.com/rv4vxMN.png', category: 'sports' },
    { id: 's7', title: 'CazéTV', image: 'https://imgur.com/JKR83pe.png', category: 'sports' },
    { id: 's8', title: 'ESPN', image: 'https://imgur.com/U0Tr1Z7.png', category: 'sports' },
    { id: 's9', title: 'SPORTV', image: 'https://imgur.com/vIrkVYY.png', category: 'sports' },
];

export const moviesData: ContentItem[] = [
    { id: 'm1', title: 'Avatar: Fogos e Cinzas', image: 'https://imgur.com/o5aFK6U.png', category: 'movies' },
    { id: 'm2', title: 'Zootopia 2', image: 'https://imgur.com/ZNgNuQE.png', category: 'movies' },
    { id: 'm3', title: 'Truque de Mestre 3', image: 'https://imgur.com/FAfqJZq.png', category: 'movies' },
    { id: 'm4', title: 'Jurassic World: Rebirth', image: 'https://imgur.com/9TNCuaG.png', category: 'movies' },
    { id: 'm5', title: 'Minecraft: O Filme', image: 'https://imgur.com/36sJP7U.png', category: 'movies' },
    { id: 'm6', title: 'Missão Impossível 8', image: 'https://imgur.com/D4DWCtR.png', category: 'movies' },
    { id: 'm7', title: 'Bailarina (John Wick)', image: 'https://imgur.com/wDqFB1z.png', category: 'movies' },
    { id: 'm8', title: 'Mickey 17', image: 'https://imgur.com/XcHZOKv.png', category: 'movies' },
    { id: 'm9', title: '28 Anos Depois', image: 'https://imgur.com/QSvAHgB.png', category: 'movies' },
];

export const seriesData: ContentItem[] = [
    { id: 'se1', title: 'Stranger Things', image: 'https://imgur.com/4eIqVnR.png', category: 'series' },
    { id: 'se2', title: 'The Walking Dead', image: 'https://imgur.com/YbDnYHB.png', category: 'series' },
    { id: 'se3', title: 'Vikings', image: 'https://imgur.com/MJIgYFX.png', category: 'series' },
    { id: 'se4', title: 'Game of Thrones', image: 'https://imgur.com/7Y4BgjE.png', category: 'series' },
    { id: 'se5', title: 'Breaking Bad', image: 'https://imgur.com/PJy6JUu.png', category: 'series' },
    { id: 'se6', title: 'La Casa de Papel', image: 'https://imgur.com/T16gYjr.png', category: 'series' },
    { id: 'se7', title: 'The Boys', image: 'https://imgur.com/A2gXG5T.png', category: 'series' },
    { id: 'se8', title: 'Peaky Blinders', image: 'https://imgur.com/sGgQcrT.png', category: 'series' },
    { id: 'se9', title: 'Black Mirror', image: 'https://imgur.com/9g7RPOv.png', category: 'series' },
];
