import { Link } from "react-router-dom";

const privacySections = [
  { id: "introduction", label: "Introduction" },
  { id: "information", label: "Information we collect" },
  { id: "use", label: "How we use information" },
  { id: "google", label: "Google API services" },
  { id: "storage", label: "Storage and security" },
  { id: "retention", label: "Data retention" },
  { id: "sharing", label: "Sharing" },
  { id: "rights", label: "Your rights" },
  { id: "local-storage", label: "Cookies and local storage" },
  { id: "children", label: "Children's privacy" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact" },
];

const termsSections = [
  { id: "acceptance", label: "Acceptance" },
  { id: "service", label: "Service" },
  { id: "eligibility", label: "Eligibility" },
  { id: "accounts", label: "Accounts" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "content", label: "Your content" },
  { id: "google", label: "Google services" },
  { id: "privacy", label: "Privacy" },
  { id: "ip", label: "Intellectual property" },
  { id: "warranties", label: "Warranties" },
  { id: "liability", label: "Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "termination", label: "Termination" },
  { id: "law", label: "Governing law" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact" },
];

function PrivacyPage() {
  return (
    <div className="legal-static">
      <div className="sp-shell">
        <nav className="sp-nav" aria-label="Primary navigation">
          <div className="sp-nav-inner">
            <Link to="/" className="sp-wordmark" aria-label="thehotspot home">
              <img src="/brand/thehotspot-logo.png" alt="" className="sp-wordmark-logo" />
              thehotspot
            </Link>
            <div className="sp-nav-links" aria-label="Page links">
              <Link className="sp-nav-link" to="/blog">Blog</Link>
              <Link className="sp-nav-link" to="/#resources">FAQ</Link>
              <Link className="sp-nav-link" to="/#resources">Contact</Link>
            </div>
            <div className="sp-nav-right">
              <Link className="sp-btn sp-btn-ghost" to="/terms">Terms</Link>
              <Link className="sp-btn sp-btn-primary" to="/">Back to app</Link>
            </div>
          </div>
        </nav>

        <header className="sp-hero">
          <div className="sp-container">
            <div className="sp-hero-inner">
              <div>
                <span className="sp-eyebrow">Legal</span>
                <h1 className="sp-h1">Privacy <em>Policy</em>.</h1>
                <p className="sp-hero-copy">
                  How thehotspot collects, uses, stores, and protects account, Google, contact, campaign, and usage
                  data.
                </p>
              </div>
              <aside className="sp-hero-card" aria-label="Policy details">
                <div className="sp-meta-list">
                  <div className="sp-meta-item">
                    <div className="sp-meta-k">LAST UPDATED</div>
                    <div className="sp-meta-v">May 10, 2026</div>
                  </div>
                  <div className="sp-meta-item">
                    <div className="sp-meta-k">EFFECTIVE</div>
                    <div className="sp-meta-v">May 10, 2026</div>
                  </div>
                  <div className="sp-meta-item">
                    <div className="sp-meta-k">CONTACT</div>
                    <div className="sp-meta-v"><a href="mailto:privacy@thehotspot.in">privacy@thehotspot.in</a></div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </header>

        <main className="sp-container">
          <div className="sp-layout">
            <aside className="sp-index" aria-label="Privacy policy sections">
              <div className="sp-index-title">SECTIONS</div>
              {privacySections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>{section.label}</a>
              ))}
            </aside>

            <article className="sp-content">
              <section className="sp-section" id="introduction">
                <div className="sp-section-num">01</div>
                <div>
                  <h2>Introduction</h2>
                  <p>
                    Welcome to <strong>thehotspot</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We
                    operate the outreach automation platform available at <strong>thehotspot.in</strong>.
                  </p>
                  <p>
                    This Privacy Policy explains how we collect, use, disclose, and protect your information when you
                    use our service. By using thehotspot, you agree to the collection and use of information as
                    described in this policy.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="information">
                <div className="sp-section-num">02</div>
                <div>
                  <h2>Information we collect</h2>
                  <p>
                    We collect information you provide directly to us and information received from third-party services
                    you connect.
                  </p>

                  <h3>Account information</h3>
                  <ul>
                    <li>Username and password for password-based accounts</li>
                    <li>Email address</li>
                    <li>Profile name and profile picture for Google Sign-In accounts</li>
                  </ul>

                  <h3>Google account data, when you sign in with Google</h3>
                  <ul>
                    <li>Your Google account email address and display name</li>
                    <li>Your Google profile picture</li>
                    <li>An access token used to authenticate your requests during your session</li>
                  </ul>
                  <div className="sp-note">
                    We only request your basic Google profile (<code>email</code> and <code>profile</code> scopes)
                    during sign-in. We do not access your Gmail messages, contacts, or any other Google data without
                    your explicit, separate consent when you choose to connect those features.
                  </div>

                  <h3>Contact and outreach data</h3>
                  <ul>
                    <li>Contact information you import, including company names, email addresses, websites, and categories</li>
                    <li>Notes and metadata you add to contacts</li>
                    <li>Campaign and outreach activity data</li>
                  </ul>

                  <h3>Usage data</h3>
                  <ul>
                    <li>Pages visited within the application</li>
                    <li>Features used and actions taken</li>
                    <li>Session data stored in your browser&apos;s local storage</li>
                  </ul>
                </div>
              </section>

              <section className="sp-section" id="use">
                <div className="sp-section-num">03</div>
                <div>
                  <h2>How we use your information</h2>
                  <p>We use the information we collect to:</p>
                  <ul>
                    <li>Create and manage your account</li>
                    <li>Provide, operate, and improve the thehotspot platform</li>
                    <li>Authenticate you when you sign in</li>
                    <li>Store and display your contact and campaign data within the app</li>
                    <li>Send transactional communications, such as account notifications</li>
                    <li>Respond to your support requests</li>
                    <li>Ensure the security and integrity of our service</li>
                  </ul>
                  <p>
                    We do not sell your personal information to third parties. We do not use your data for advertising
                    purposes.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="google">
                <div className="sp-section-num">04</div>
                <div>
                  <h2>Google API services</h2>
                  <p>
                    thehotspot uses Google Sign-In (OAuth 2.0) for authentication. Our use and transfer of information
                    received from Google APIs adheres to the{" "}
                    <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener">
                      Google API Services User Data Policy
                    </a>
                    , including the Limited Use requirements.
                  </p>
                  <p>Specifically:</p>
                  <ul>
                    <li>We only use Google user data for the purposes described in this Privacy Policy</li>
                    <li>We do not transfer Google user data to third parties except as necessary to provide our service</li>
                    <li>We do not use Google user data for serving advertisements</li>
                    <li>We do not allow humans to read your Google data unless you have explicitly granted permission, or we are required to do so by law</li>
                  </ul>
                  <p>
                    The access token we receive from Google is stored only in your browser&apos;s local storage and is
                    never sent to or stored on our servers in a way that would allow us to access your Google account
                    independently.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="storage">
                <div className="sp-section-num">05</div>
                <div>
                  <h2>Data storage and security</h2>
                  <p>
                    Your account data (username, email, login method) is stored in Airtable, a third-party database
                    service. Your contact and campaign data is stored in your browser&apos;s local storage on your
                    device.
                  </p>
                  <p>We implement reasonable security measures to protect your information, including:</p>
                  <ul>
                    <li>HTTPS encryption for all data transmitted between your browser and our services</li>
                    <li>Secure OAuth 2.0 authentication for Google Sign-In</li>
                    <li>No storage of Google access tokens on our servers</li>
                  </ul>
                  <p>
                    However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot
                    guarantee absolute security.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="retention">
                <div className="sp-section-num">06</div>
                <div>
                  <h2>Data retention</h2>
                  <p>
                    We retain your account information for as long as your account is active or as needed to provide you
                    services. Contact and campaign data stored in your browser&apos;s local storage persists until you
                    clear it or log out.
                  </p>
                  <p>You may request deletion of your account and associated data at any time by contacting us at the email below.</p>
                </div>
              </section>

              <section className="sp-section" id="sharing">
                <div className="sp-section-num">07</div>
                <div>
                  <h2>Sharing of information</h2>
                  <p>
                    We do not sell, trade, or rent your personal information. We may share your information only in the
                    following limited circumstances:
                  </p>
                  <ul>
                    <li><strong>Service Providers:</strong> We use Airtable to store user account data. These providers are bound by confidentiality obligations.</li>
                    <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to a valid legal request.</li>
                    <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, your information may be transferred as part of that transaction.</li>
                  </ul>
                </div>
              </section>

              <section className="sp-section" id="rights">
                <div className="sp-section-num">08</div>
                <div>
                  <h2>Your rights</h2>
                  <p>You have the right to:</p>
                  <ul>
                    <li><strong>Access</strong> the personal data we hold about you</li>
                    <li><strong>Correct</strong> inaccurate or incomplete data</li>
                    <li><strong>Delete</strong> your account and associated data</li>
                    <li>
                      <strong>Revoke</strong> Google&apos;s access to your account at any time via{" "}
                      <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener">
                        Google Account Permissions
                      </a>
                    </li>
                    <li><strong>Export</strong> your contact data from the app</li>
                  </ul>
                  <p>To exercise any of these rights, contact us at <a href="mailto:privacy@thehotspot.in">privacy@thehotspot.in</a>.</p>
                </div>
              </section>

              <section className="sp-section" id="local-storage">
                <div className="sp-section-num">09</div>
                <div>
                  <h2>Cookies and local storage</h2>
                  <p>
                    thehotspot does not use cookies for tracking. We use browser <strong>local storage</strong> to
                    persist your session and application data, such as contact lists and settings, between visits. This
                    data stays on your device and is not transmitted to our servers.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="children">
                <div className="sp-section-num">10</div>
                <div>
                  <h2>Children&apos;s privacy</h2>
                  <p>
                    thehotspot is not directed at children under 13 years of age. We do not knowingly collect personal
                    information from children under 13. If you believe we have inadvertently collected such information,
                    please contact us immediately.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="changes">
                <div className="sp-section-num">11</div>
                <div>
                  <h2>Changes to this policy</h2>
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of significant changes by
                    posting the new policy on this page with an updated date. Continued use of thehotspot after changes
                    constitutes acceptance of the updated policy.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="contact">
                <div className="sp-section-num">12</div>
                <div>
                  <h2>Contact us</h2>
                  <p>If you have questions about this Privacy Policy or your data, please contact us:</p>
                  <ul>
                    <li>Email: <a href="mailto:privacy@thehotspot.in">privacy@thehotspot.in</a></li>
                    <li>Website: <a href="https://thehotspot.in">thehotspot.in</a></li>
                  </ul>
                </div>
              </section>
            </article>
          </div>
        </main>

        <footer className="sp-footer">
          <div className="sp-container">
            <div className="sp-footer-top">
              <div className="sp-footer-title">Built for responsible outreach.</div>
              <Link className="sp-btn sp-btn-primary" to="/app">Open the dashboard</Link>
            </div>
            <div className="sp-footer-bottom">
              <div>© 2026 thehotspot. All rights reserved.</div>
              <div className="sp-footer-links">
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
                <Link to="/#resources">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function TermsPage() {
  return (
    <div className="legal-static">
      <div className="sp-shell">
        <nav className="sp-nav" aria-label="Primary navigation">
          <div className="sp-nav-inner">
            <Link to="/" className="sp-wordmark" aria-label="thehotspot home">
              <img src="/brand/thehotspot-logo.png" alt="" className="sp-wordmark-logo" />
              thehotspot
            </Link>
            <div className="sp-nav-links" aria-label="Page links">
              <Link className="sp-nav-link" to="/blog">Blog</Link>
              <Link className="sp-nav-link" to="/#resources">FAQ</Link>
              <Link className="sp-nav-link" to="/#resources">Contact</Link>
            </div>
            <div className="sp-nav-right">
              <Link className="sp-btn sp-btn-ghost" to="/privacy">Privacy</Link>
              <Link className="sp-btn sp-btn-primary" to="/">Back to app</Link>
            </div>
          </div>
        </nav>

        <header className="sp-hero">
          <div className="sp-container">
            <div className="sp-hero-inner">
              <div>
                <span className="sp-eyebrow">Legal</span>
                <h1 className="sp-h1">Terms of <em>Service</em>.</h1>
                <p className="sp-hero-copy">
                  The operating agreement for using thehotspot responsibly: accounts, outreach rules, content rights,
                  integrations, and platform limits.
                </p>
              </div>
              <aside className="sp-hero-card" aria-label="Terms details">
                <div className="sp-meta-list">
                  <div className="sp-meta-item">
                    <div className="sp-meta-k">LAST UPDATED</div>
                    <div className="sp-meta-v">May 10, 2026</div>
                  </div>
                  <div className="sp-meta-item">
                    <div className="sp-meta-k">EFFECTIVE</div>
                    <div className="sp-meta-v">May 10, 2026</div>
                  </div>
                  <div className="sp-meta-item">
                    <div className="sp-meta-k">SUPPORT</div>
                    <div className="sp-meta-v"><a href="mailto:support@thehotspot.in">support@thehotspot.in</a></div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </header>

        <main className="sp-container">
          <div className="sp-layout">
            <aside className="sp-index" aria-label="Terms sections">
              <div className="sp-index-title">SECTIONS</div>
              {termsSections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>{section.label}</a>
              ))}
            </aside>

            <article className="sp-content">
              <section className="sp-section" id="acceptance">
                <div className="sp-section-num">01</div>
                <div>
                  <h2>Acceptance of terms</h2>
                  <p>
                    By accessing or using <strong>thehotspot</strong> (&quot;Service&quot;), operated by thehotspot
                    (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) at <strong>thehotspot.in</strong>, you agree
                    to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms,
                    please do not use the Service.
                  </p>
                  <p>
                    We reserve the right to update these Terms at any time. Continued use of the Service after changes
                    are posted constitutes your acceptance of the revised Terms.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="service">
                <div className="sp-section-num">02</div>
                <div>
                  <h2>Description of service</h2>
                  <p>
                    thehotspot is an outreach automation platform that helps users manage contacts, organize outreach
                    campaigns, and track email communication. The Service includes:
                  </p>
                  <ul>
                    <li>A contact database manager for organizing outreach leads</li>
                    <li>Campaign tracking and status monitoring</li>
                    <li>Google account integration for sign-in</li>
                    <li>An AI-powered outreach assistant</li>
                    <li>Email outreach tools, where available</li>
                  </ul>
                </div>
              </section>

              <section className="sp-section" id="eligibility">
                <div className="sp-section-num">03</div>
                <div>
                  <h2>Eligibility</h2>
                  <p>
                    You must be at least 13 years of age to use thehotspot. By using the Service, you represent that
                    you meet this requirement. If you are using the Service on behalf of an organization, you represent
                    that you have authority to bind that organization to these Terms.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="accounts">
                <div className="sp-section-num">04</div>
                <div>
                  <h2>User accounts</h2>
                  <p>
                    You may create an account using a username and password or by signing in with your Google account.
                    You are responsible for:
                  </p>
                  <ul>
                    <li>Maintaining the confidentiality of your login credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Providing accurate and current information</li>
                    <li>Notifying us immediately of any unauthorized access to your account</li>
                  </ul>
                  <p>We reserve the right to suspend or terminate accounts that violate these Terms.</p>
                </div>
              </section>

              <section className="sp-section" id="acceptable-use">
                <div className="sp-section-num">05</div>
                <div>
                  <h2>Acceptable use</h2>
                  <p>You agree to use thehotspot only for lawful purposes. You must not:</p>
                  <ul>
                    <li>Use the Service to send unsolicited bulk email (spam)</li>
                    <li>Violate any applicable laws or regulations, including anti-spam laws such as CAN-SPAM and GDPR</li>
                    <li>Upload or transmit content that is illegal, harmful, or infringes on third-party rights</li>
                    <li>Attempt to gain unauthorized access to any part of the Service or its infrastructure</li>
                    <li>Reverse engineer, decompile, or attempt to extract source code from the Service</li>
                    <li>Use the Service to harass, threaten, or harm others</li>
                    <li>Impersonate any person or entity</li>
                    <li>Interfere with or disrupt the integrity or performance of the Service</li>
                  </ul>
                  <div className="sp-note">
                    thehotspot is designed for legitimate, permission-based outreach only. You are solely responsible
                    for ensuring your use of the platform complies with all applicable email marketing laws and
                    regulations in your jurisdiction.
                  </div>
                </div>
              </section>

              <section className="sp-section" id="content">
                <div className="sp-section-num">06</div>
                <div>
                  <h2>Your content</h2>
                  <p>
                    You retain ownership of all contact data, campaign content, and other information you upload or
                    create through the Service (&quot;Your Content&quot;). By using thehotspot, you grant us a limited,
                    non-exclusive license to store and process Your Content solely to provide the Service to you.
                  </p>
                  <p>You represent and warrant that:</p>
                  <ul>
                    <li>You have the right to use and share all content you submit</li>
                    <li>Your Content does not violate any third-party rights or applicable laws</li>
                    <li>You have obtained proper consent to store and contact the individuals in your contact lists where required by law</li>
                  </ul>
                </div>
              </section>

              <section className="sp-section" id="google">
                <div className="sp-section-num">07</div>
                <div>
                  <h2>Google services integration</h2>
                  <p>
                    thehotspot integrates with Google services (Google Sign-In, Google Sheets, Gmail) subject to
                    Google&apos;s Terms of Service. By connecting your Google account, you also agree to{" "}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener">
                      Google&apos;s Terms of Service
                    </a>
                    .
                  </p>
                  <p>
                    You may revoke thehotspot&apos;s access to your Google account at any time through your{" "}
                    <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener">
                      Google Account settings
                    </a>
                    .
                  </p>
                </div>
              </section>

              <section className="sp-section" id="privacy">
                <div className="sp-section-num">08</div>
                <div>
                  <h2>Privacy</h2>
                  <p>
                    Your use of thehotspot is also governed by our <Link to="/privacy">Privacy Policy</Link>, which is
                    incorporated into these Terms by reference. Please review our Privacy Policy to understand our
                    practices.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="ip">
                <div className="sp-section-num">09</div>
                <div>
                  <h2>Intellectual property</h2>
                  <p>
                    The Service, including its design, features, and underlying code, is owned by thehotspot and
                    protected by intellectual property laws. You may not copy, modify, distribute, or create derivative
                    works from any part of the Service without our express written permission.
                  </p>
                  <p>
                    The thehotspot name, logo, and branding are our trademarks. Nothing in these Terms grants you any
                    right to use our trademarks.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="warranties">
                <div className="sp-section-num">10</div>
                <div>
                  <h2>Disclaimer of warranties</h2>
                  <p>
                    THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
                    KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES,
                    INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                    NON-INFRINGEMENT.
                  </p>
                  <p>
                    We do not warrant that the Service will be uninterrupted, error-free, or that defects will be
                    corrected. We make no warranty regarding the results that may be obtained from the use of the
                    Service.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="liability">
                <div className="sp-section-num">11</div>
                <div>
                  <h2>Limitation of liability</h2>
                  <p>
                    TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THEHOTSPOT SHALL NOT BE LIABLE FOR ANY INDIRECT,
                    INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE
                    SERVICE, INCLUDING LOSS OF DATA, LOST PROFITS, OR BUSINESS INTERRUPTION.
                  </p>
                  <p>
                    Our total liability to you for any claims arising from your use of the Service shall not exceed the
                    amount you paid us in the twelve months preceding the claim, or $10 USD, whichever is greater.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="indemnification">
                <div className="sp-section-num">12</div>
                <div>
                  <h2>Indemnification</h2>
                  <p>
                    You agree to indemnify and hold harmless thehotspot and its affiliates, officers, and employees from
                    any claims, damages, or expenses (including reasonable attorneys&apos; fees) arising from your use of
                    the Service, violation of these Terms, or infringement of any third-party rights.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="termination">
                <div className="sp-section-num">13</div>
                <div>
                  <h2>Termination</h2>
                  <p>
                    We may suspend or terminate your access to the Service at any time, with or without notice, for any
                    reason including violation of these Terms. Upon termination, your right to use the Service will
                    immediately cease.
                  </p>
                  <p>
                    You may stop using the Service and request account deletion at any time by contacting us at{" "}
                    <a href="mailto:support@thehotspot.in">support@thehotspot.in</a>.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="law">
                <div className="sp-section-num">14</div>
                <div>
                  <h2>Governing law</h2>
                  <p>
                    These Terms are governed by and construed in accordance with the laws of India, without regard to
                    its conflict of law provisions. Any disputes arising under these Terms shall be subject to the
                    exclusive jurisdiction of the courts located in India.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="changes">
                <div className="sp-section-num">15</div>
                <div>
                  <h2>Changes to terms</h2>
                  <p>
                    We may modify these Terms at any time by posting the revised Terms on this page with an updated
                    date. We will make reasonable efforts to notify you of significant changes. Your continued use of the
                    Service after changes are posted constitutes acceptance.
                  </p>
                </div>
              </section>

              <section className="sp-section" id="contact">
                <div className="sp-section-num">16</div>
                <div>
                  <h2>Contact us</h2>
                  <p>If you have questions about these Terms of Service, please contact us:</p>
                  <ul>
                    <li>Email: <a href="mailto:support@thehotspot.in">support@thehotspot.in</a></li>
                    <li>Website: <a href="https://thehotspot.in">thehotspot.in</a></li>
                  </ul>
                </div>
              </section>
            </article>
          </div>
        </main>

        <footer className="sp-footer">
          <div className="sp-container">
            <div className="sp-footer-top">
              <div className="sp-footer-title">Clear rules for serious outreach.</div>
              <Link className="sp-btn sp-btn-primary" to="/app">Open the dashboard</Link>
            </div>
            <div className="sp-footer-bottom">
              <div>© 2026 thehotspot. All rights reserved.</div>
              <div className="sp-footer-links">
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
                <Link to="/#resources">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export function LegalPage({ type }: { type: "privacy" | "terms" }) {
  if (type === "privacy") {
    return <PrivacyPage />;
  }

  return <TermsPage />;
}
