// Single source of truth for the login page's editable copy.
// LOGIN_DEFAULTS are also the fallback strings the live LoginModal uses.

export const LOGIN_DEFAULTS = {
  landing_title:         "Welcome to thehotspot",
  landing_subtitle:      "Your AI-powered outreach dashboard",
  landing_signin_btn:    "Sign In",
  landing_getstarted_btn:"Get Started",
  login_title:           "Welcome back",
  login_subtitle:        "Sign in to your outreach dashboard",
  signup_title:          "Create your account",
  signup_subtitle:       "Join thehotspot and start automating your outreach",
  username_label:        "Username",
  username_ph_login:     "Enter username",
  username_ph_signup:    "Choose a username",
  email_label:           "Email",
  email_ph:              "Enter your email",
  password_label:        "Password",
  password_ph_login:     "Enter password",
  password_ph_signup:    "Min 6 characters",
  google_btn:            "Continue with Google",
  divider_text:          "or",
  signin_btn:            "Sign In",
  signup_btn:            "Create Account",
};

export const MAX_SINGLE = 80;
export const MAX_MULTI = 200;

export const LOGIN_SECTIONS = [
  { eyebrow: "Landing view", fields: [
    { key: "landing_title",         label: "Welcome title",     required: true, context: "landing view heading" },
    { key: "landing_subtitle",      label: "Welcome subtitle",  multiline: true, context: "landing view" },
    { key: "landing_signin_btn",    label: "Sign-in button",    context: "landing view" },
    { key: "landing_getstarted_btn",label: "Get-started button",context: "landing view" },
  ]},
  { eyebrow: "Sign-in view", fields: [
    { key: "login_title",    label: "Heading",  required: true, context: "sign-in form" },
    { key: "login_subtitle", label: "Subtitle", multiline: true, context: "sign-in form" },
  ]},
  { eyebrow: "Sign-up view", fields: [
    { key: "signup_title",    label: "Heading",  required: true, context: "sign-up form" },
    { key: "signup_subtitle", label: "Subtitle", multiline: true, context: "sign-up form" },
  ]},
  { eyebrow: "Form labels", fields: [
    { key: "username_label",     label: "Username label",                context: "both forms" },
    { key: "username_ph_login",  label: "Username placeholder (sign-in)",context: "sign-in form" },
    { key: "username_ph_signup", label: "Username placeholder (sign-up)",context: "sign-up form" },
    { key: "email_label",        label: "Email label",                   context: "sign-up form" },
    { key: "email_ph",           label: "Email placeholder",             context: "sign-up form" },
    { key: "password_label",     label: "Password label",                context: "both forms" },
    { key: "password_ph_login",  label: "Password placeholder (sign-in)",context: "sign-in form" },
    { key: "password_ph_signup", label: "Password placeholder (sign-up)",context: "sign-up form" },
  ]},
  { eyebrow: "Buttons", fields: [
    { key: "google_btn",   label: "Google button", required: true, context: "all views" },
    { key: "divider_text", label: "Divider text",  context: "all views" },
    { key: "signin_btn",   label: "Sign-in submit",required: true, context: "sign-in form" },
    { key: "signup_btn",   label: "Sign-up submit",required: true, context: "sign-up form" },
  ]},
];
