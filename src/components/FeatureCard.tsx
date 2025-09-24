// src\components\FeatureCard.tsx
type Props = {
  title: string;
  desc: string;
};

export default function FeatureCard({ title, desc }: Props) {
  return (
    <article
      className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
      role="listitem"
    >
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-gray-300">{desc}</p>
    </article>
  );
}
