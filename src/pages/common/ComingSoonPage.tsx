interface ComingSoonPageProps {
  title: string;
  description?: string;
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-paper p-10 text-center">
      <h1 className="text-2xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-ink-muted">
        {description ?? "This workflow is mapped and ready for the next implementation pass."}
      </p>
    </div>
  );
}
