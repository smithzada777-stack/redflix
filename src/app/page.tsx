'use client';

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import PriceComparison from '@/components/PriceComparison';
import ContentCarousel from '@/components/ContentCarousel';
import Testimonials from '@/components/Testimonials';
import Plans from '@/components/Plans';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import BackToTop from '@/components/BackToTop';

const sportsItems = [
  { id: 1, name: 'Brasileirão', img: 'https://i.imgur.com/KzbghZn.png' },
  { id: 2, name: 'Copa do Mundo', img: 'https://i.imgur.com/oozXd3K.png' },
  { id: 3, name: 'Copa do Nordeste', img: 'https://i.imgur.com/8JocDJp.png' },
  { id: 4, name: 'NBA', img: 'https://i.imgur.com/aVGJOG6.png' },
  { id: 5, name: 'UFC', img: 'https://i.imgur.com/kCiNi9e.png' },
  { id: 6, name: 'Premiere', img: 'https://i.imgur.com/rv4vxMN.png' },
  { id: 7, name: 'CazéTV', img: 'https://i.imgur.com/JKR83pe.png' },
  { id: 8, name: 'ESPN', img: 'https://i.imgur.com/U0Tr1Z7.png' },
  { id: 9, name: 'SPORTV', img: 'https://i.imgur.com/vIrkVYY.png' },
];

const moviesItems = [
  { id: 1, name: 'Avatar: Fogos e Cinzas', img: 'https://i.imgur.com/o5aFK6U.png' },
  { id: 2, name: 'Zootopia 2', img: 'https://i.imgur.com/ZNgNuQE.png' },
  { id: 3, name: 'Truque de Mestre 3', img: 'https://i.imgur.com/FAfqJZq.png' },
  { id: 4, name: 'Jurassic World: Rebirth', img: 'https://i.imgur.com/9TNCuaG.png' },
  { id: 5, name: 'Minecraft Filme', img: 'https://i.imgur.com/36sJP7U.png' },
  { id: 6, name: 'Missão Impossível 8', img: 'https://i.imgur.com/D4DWCtR.png' },
  { id: 7, name: 'Bailarina (John Wick)', img: 'https://i.imgur.com/wDqFB1z.png' },
  { id: 8, name: 'Mickey 17', img: 'https://i.imgur.com/XcHZOKv.png' },
  { id: 9, name: '28 Anos Depois', img: 'https://i.imgur.com/QSvAHgB.png' },
];

const seriesItems = [
  { id: 1, name: 'Stranger Things', img: 'https://i.imgur.com/4eIqVnR.png' },
  { id: 2, name: 'The Walking Dead', img: 'https://i.imgur.com/YbDnYHB.png' },
  { id: 3, name: 'Vikings', img: 'https://i.imgur.com/MJIgYFX.png' },
  { id: 4, name: 'Game of Thrones', img: 'https://i.imgur.com/7Y4BgjE.png' },
  { id: 5, name: 'Breaking Bad', img: 'https://i.imgur.com/PJy6JUu.png' },
  { id: 6, name: 'La Casa de Papel', img: 'https://i.imgur.com/T16gYjr.png' },
  { id: 7, name: 'The Boys', img: 'https://i.imgur.com/A2gXG5T.png' },
  { id: 8, name: 'Peaky Blinders', img: 'https://i.imgur.com/sGgQcrT.png' },
  { id: 9, name: 'Black Mirror', img: 'https://i.imgur.com/9g7RPOv.png' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden relative">
      <Navbar />
      <Hero />
      <PriceComparison />

      <section className="py-16 bg-black">
        <div className="container mx-auto px-4 md:px-12 mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
            Na <span className="text-primary">REDFLIX</span>, você tem acesso a:
          </h2>
        </div>

        <div className="space-y-4">
          <ContentCarousel title={<>Jogos ao vivo e <span className="text-primary">MUITO MAIS</span>:</>} items={sportsItems} delay={0} />
          <ContentCarousel title={<>Principais <span className="text-primary">FILMES</span>:</>} items={moviesItems} delay={2} />
          <ContentCarousel title={<>Melhores <span className="text-primary">SÉRIES</span>:</>} items={seriesItems} delay={4} />
        </div>
      </section>

      <Testimonials />
      <Plans />
      <FAQ />
      <Footer />

      <WhatsAppButton />
      <BackToTop />
    </main>
  );
}
