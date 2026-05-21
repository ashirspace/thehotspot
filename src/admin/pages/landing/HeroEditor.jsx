import { useOutletContext } from "react-router-dom";
import { useEditor } from "../../hooks/useEditor.js";
import { fetchLandingContent, LANDING_DEFAULTS } from "../../api/siteContentApi.js";
import CmsSection from "../../components/CmsSection.jsx";
import CmsField from "../../components/CmsField.jsx";
import PreviewPane from "../../components/PreviewPane.jsx";
import ActionBar from "../../components/ActionBar.jsx";

function HeroMiniPreview({ c }) {
  return (
    <div className="cms-hero-preview">
      <div className="cms-hero-preview-eyebrow">{c.hero_eyebrow||"OUTREACH AUTOMATION"}</div>
      <div className="cms-hero-preview-h1">
        {c.hero_headline_line1||"Cold outreach that"}{" "}
        <span className="cms-hero-preview-accent">{c.hero_headline_accent||"gets replies"}</span>
      </div>
      <div className="cms-hero-preview-sub">{c.hero_subheadline||""}</div>
      <div className="cms-hero-preview-btns">
        <button className="cms-hero-preview-cta cms-hero-preview-cta--primary">{c.hero_cta_primary||"Start free trial"}</button>
        <button className="cms-hero-preview-cta cms-hero-preview-cta--secondary">{c.hero_cta_secondary||"Watch demo →"}</button>
      </div>
      <div className="cms-hero-preview-disclaimer">{c.hero_disclaimer||""}</div>
    </div>
  );
}

export default function HeroEditor({ user }) {
  const ctx = useOutletContext() || {};
  const { local, update, isDirty, saving, discard, save, lastSaved } = useEditor({
    fetchFn: fetchLandingContent,
    saveKey: "landing",
    defaults: LANDING_DEFAULTS,
    username: user?.username,
  });

  return (
    <div className="cms-editor">
      <div className="cms-editor-header">
        <div className="cms-editor-eyebrow">Landing Page · Hero</div>
        <h1 className="cms-editor-title">Hero Section</h1>
        <p className="cms-editor-subtitle">Edit the main hero section of your landing page.</p>
        {lastSaved && <div className="cms-editor-meta">Last saved {lastSaved}</div>}
      </div>

      <div className="cms-editor-body">
        <div>
          <CmsSection number={1} title="Main Headline" desc="The large text users see first">
            <CmsField id="hero_eyebrow" label="Eyebrow text" value={local.hero_eyebrow||""} onChange={v=>update("hero_eyebrow",v)} maxChars={60} context="hero section" />
            <CmsField id="hero_headline_line1" label="Headline (first part)" value={local.hero_headline_line1||""} onChange={v=>update("hero_headline_line1",v)} maxChars={40} context="hero section" required />
            <CmsField id="hero_headline_accent" label="Headline (teal accent word)" value={local.hero_headline_accent||""} onChange={v=>update("hero_headline_accent",v)} maxChars={30} context="hero section" hint="underlined in teal" required />
          </CmsSection>
          <CmsSection number={2} title="Supporting copy" desc="Sub-headline and social proof">
            <CmsField id="hero_subheadline" label="Sub-headline" value={local.hero_subheadline||""} onChange={v=>update("hero_subheadline",v)} maxChars={200} context="hero section" multiline required />
            <CmsField id="hero_social_proof" label="Social proof line" value={local.hero_social_proof||""} onChange={v=>update("hero_social_proof",v)} maxChars={80} context="hero section" />
          </CmsSection>
          <CmsSection number={3} title="CTAs" desc="Buttons below the headline">
            <CmsField id="hero_cta_primary" label="Primary CTA" value={local.hero_cta_primary||""} onChange={v=>update("hero_cta_primary",v)} maxChars={30} context="hero section" required />
            <CmsField id="hero_cta_secondary" label="Secondary CTA" value={local.hero_cta_secondary||""} onChange={v=>update("hero_cta_secondary",v)} maxChars={30} context="hero section" />
            <CmsField id="hero_disclaimer" label="Disclaimer text" value={local.hero_disclaimer||""} onChange={v=>update("hero_disclaimer",v)} maxChars={80} context="hero section" hint="below CTAs" />
          </CmsSection>
        </div>
        <PreviewPane><HeroMiniPreview c={local} /></PreviewPane>
      </div>

      <ActionBar isDirty={isDirty} saving={saving} onDiscard={discard} onSave={save} sidebarCollapsed={ctx.sidebarCollapsed} />
    </div>
  );
}
