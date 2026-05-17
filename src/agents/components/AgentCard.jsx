export function AgentCard({ title, description, children }) {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function Section({ children }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}
