export default function PreviewPane({ children }) {
  return (
    <div className="cms-preview-pane">
      <div className="cms-preview-header">
        <span className="cms-preview-eyebrow">Preview</span>
        <span className="cms-preview-live">● Live</span>
        <span className="cms-preview-url">thehotspot.in</span>
      </div>
      <div className="cms-preview-frame">{children}</div>
      <a
        href="https://thehotspot.in"
        target="_blank"
        rel="noreferrer"
        className="cms-preview-open-full"
      >
        Open full site ↗
      </a>
    </div>
  );
}
