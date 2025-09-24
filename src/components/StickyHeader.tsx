// src\components\StickyHeader.tsx
"use client";

import { useEffect, useState } from "react";

export default function StickyHeader() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition
        ${solid ? "bg-black/60 backdrop-blur border-b border-white/10" : "bg-transparent"}`}
      aria-label="Site header"
    >
      <nav className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="audio-bars" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <span className="font-semibold tracking-wide">StudioX</span>
        </div>

        <ul className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <li><a href="#services" className="hover:text-white">Services</a></li>
          <li><a href="#contact" className="hover:text-white">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
}
