export function AgentStatus({ loading, error }) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 text-muted text-sm py-6">
        <span className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        Agent is thinking...
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-[8px] px-4 py-3 text-red-700 text-sm">
        {error}
      </div>
    );
  }
  return null;
}
