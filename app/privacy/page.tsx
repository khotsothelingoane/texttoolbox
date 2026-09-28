import { pageMeta, SITE_NAME } from "@/lib/site";
import Page from "@/components/Page";
export const metadata = pageMeta({ title: `Privacy Policy – ${SITE_NAME}`, description: "TextToolbox processes your text in your browser. Read what data the site does and does not collect.", path: "/privacy" });
export default function Privacy() {
  return (
    <Page title="Privacy Policy">
      <h2>Your text stays on your device</h2>
      <p>All {SITE_NAME} tools process text locally in your web browser. The text you paste or type is not uploaded to our server, is not saved, and is not used for any other purpose. When you close or refresh the page, it is gone.</p>
      <h2>Files you upload</h2>
      <p>Tools that accept text also let you choose a TXT, CSV, DOCX or text-based PDF file. The file is read and converted to text by your browser, on your device. It is not uploaded to our server, is not intentionally stored, and is not sent to any third party. The code that reads PDF and Word files is served from this website itself, not from an outside service. Because the file never leaves your browser, closing or refreshing the page discards it.</p>
      <h2>What we do not collect</h2>
      <ul><li>The text you enter into any tool, or the files you choose to load into a tool</li><li>Accounts, names or passwords (there are no accounts)</li><li>Payment information (there are no payments)</li></ul>
      <h2>What may be collected</h2>
      <p>Our hosting provider may keep standard server logs, such as IP address, browser type and pages requested, for security and reliability. If the site owner enables analytics, aggregated data about page visits may be collected, such as pages viewed, approximate country and device type.</p>
      <h2>Cookies and advertising</h2>
      <p>The site itself does not need cookies to work. If advertising or analytics are enabled, providers such as Google may use cookies or similar technologies. Advertising, if shown, may be personalised. You can manage ad personalisation in your Google account settings or at <a href="https://www.aboutads.info" rel="noopener noreferrer">aboutads.info</a>.</p>
      <h2>Clipboard access</h2>
      <p>The “Paste” button reads your clipboard only when you click it, and only if your browser allows it. “Copy result” writes to your clipboard only when you click it.</p>
      <h2>Children</h2>
      <p>The site is a general-purpose utility and is not directed at children.</p>
      <h2>Changes and contact</h2>
      <p>We may update this policy and will change the date below when we do. See the contact page for how to reach us.</p>
      <p style={{ color: "var(--muted)" }}>Last updated: this policy is a template. The site owner should review it and add the date and any details that apply once analytics or advertising are enabled.</p>
    </Page>
  );
}
