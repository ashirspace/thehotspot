import ContentEditor from "../ContentEditor.jsx";
import { SITE_DEFAULTS, SITE_SECTIONS } from "../siteFields.js";

export default function SiteEditor() {
  return (
    <ContentEditor
      contentKey="site"
      defaults={SITE_DEFAULTS}
      sections={SITE_SECTIONS}
      eyebrow="Content · Site"
      title="Site"
      titleEm="Copy"
      blurb="Edit the in-app copy across the dashboard — home page, contacts, and account pages. Changes publish to all users on save."
    />
  );
}
