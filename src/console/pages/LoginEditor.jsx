import ContentEditor from "../ContentEditor.jsx";
import LoginPreview from "../LoginPreview.jsx";
import { LOGIN_DEFAULTS, LOGIN_SECTIONS } from "../loginFields.js";

export default function LoginEditor() {
  return (
    <ContentEditor
      contentKey="login"
      defaults={LOGIN_DEFAULTS}
      sections={LOGIN_SECTIONS}
      eyebrow="Content · Login"
      title="Login Page"
      titleEm="Editor"
      blurb="Edit the text shown to users on the public sign-in screen. Changes go live immediately on save."
      preview={(form) => <LoginPreview form={form} />}
    />
  );
}
