'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="absolute top-0 left-0 w-full z-50 bg-transparent p-4 md:p-6">
            <div className="container mx-auto px-4 md:px-12 flex justify-center md:justify-start">
                <Link href="/">
                    <div className="relative w-40 h-10 md:w-56 md:h-16 hover:opacity-80 transition-opacity border-none outline-none ring-0">
                        <Image
                            src="https://i.imgur.com/6H5gxcw.png"
                            alt="RedFlix Logo"
                            fill
                            className="object-contain object-center md:object-left"
                            priority
                            sizes="(max-width: 768px) 160px, 224px"
                        />
                    </div>
                </Link>
            </div>
        </nav>
    );
}
