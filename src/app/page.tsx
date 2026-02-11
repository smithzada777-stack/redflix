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

const sportsItems = [
  { id: 1, name: 'Brasileirão', img: '/images/sports/brasileirao.png' },
  { id: 2, name: 'Copa do Mundo', img: '/images/sports/copa-mundo.png' },
  { id: 3, name: 'Copa do Nordeste', img: '/images/sports/copa-nordeste.png' },
  { id: 4, name: 'NBA', img: '/images/sports/nba.png' },
  { id: 5, name: 'UFC', img: '/images/sports/ufc.png' },
  { id: 6, name: 'Premiere', img: '/images/sports/premiere.png' },
  { id: 7, name: 'CazéTV', img: '/images/sports/cazetv.png' },
  { id: 8, name: 'ESPN', img: '/images/sports/espn.png' },
  { id: 9, name: 'SPORTV', img: '/images/sports/sportv.png' },
];

const moviesItems = [
  { id: 1, name: 'Avatar: Fogos e Cinzas', img: '/images/movies/avatar.png' },
  { id: 2, name: 'Zootopia 2', img: '/images/movies/zootopia.png' },
  { id: 3, name: 'Truque de Mestre 3', img: '/images/movies/truque.png' },
  { id: 4, name: 'Jurassic World: Rebirth', img: '/images/movies/jurassic.png' },
  { id: 5, name: 'Minecraft Filme', img: '/images/movies/minecraft.png' },
  { id: 6, name: 'Missão Impossível 8', img: '/images/movies/missao.png' },
  { id: 7, name: 'Bailarina (John Wick)', img: '/images/movies/bailarina.png' },
  { id: 8, name: 'Mickey 17', img: '/images/movies/mickey17.png' },
  { id: 9, name: '28 Anos Depois', img: '/images/movies/28anos.png' },
];

const seriesItems = [
  { id: 1, name: 'Stranger Things', img: '/images/series/stranger.png' },
  { id: 2, name: 'The Walking Dead', img: '/images/series/walking.png' },
  { id: 3, name: 'Vikings', img: '/images/series/vikings.png' },
  { id: 4, name: 'Game of Thrones', img: '/images/series/got.png' },
  { id: 5, name: 'Breaking Bad', img: '/images/series/breaking.png' },
  { id: 6, name: 'La Casa de Papel', img: '/images/series/lacasa.png' },
  { id: 7, name: 'The Boys', img: '/images/series/theboys.png' },
  { id: 8, name: 'Peaky Blinders', img: '/images/series/peaky.png' },
  { id: 9, name: 'Black Mirror', img: '/images/series/blackmirror.png' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden relative">
      <div className="animate-fade-in-up">
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
      </div>

      <WhatsAppButton />
    </main>
  );
}
