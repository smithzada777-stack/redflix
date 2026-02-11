import type { Metadata } from 'next';
import { Outfit, Inter, Black_Ops_One } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const blackOps = Black_Ops_One({ subsets: ['latin'], weight: '400', variable: '--font-black-ops' });

export const metadata: Metadata = {
  title: 'RedFlix - O Melhor do Streaming',
  description: 'Filmes, Séries e TV Ao Vivo com qualidade e economia.',
  icons: {
    icon: 'https://i.imgur.com/mq59DAj.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.className} ${inter.variable} ${blackOps.variable} antialiased selection:bg-primary/30 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
