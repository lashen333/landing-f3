// src\components\ContactForm.tsx
"use client";

import { useState } from "react";

export default function ContactForm() {
  const [artist, setArtist] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: wire this to your backend later
    alert(`Submitted:\nArtist: ${artist}\nEmail: ${email}\nMsg: ${msg}`);
  };

  return (
    <form className="mx-auto grid max-w-xl gap-4" onSubmit={onSubmit}>
      <input
        className="contact-from-input"
        placeholder="Artist / Band name"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        required
      />
      <input
        className="contact-from-input"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <textarea
        className="contact-from-input"
        placeholder="What are you working on?"
        rows={4}
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
      />
      <button
        className="rounded-xl px-5 py-3 font-semibold bg-white text-black hover:bg-white/90 transition"
        type="submit"
      >
        Request Callback
      </button>
    </form>
  );
}
