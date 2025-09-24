// src\components\Section.tsx
type Props = {
  id?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export default function Section({ id, title, subtitle, children }: Props) {
  return (
    <section id={id} className="section">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-10">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="mt-3 section-sub">{subtitle}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}
