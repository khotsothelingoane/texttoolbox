import { pageMeta, SITE_NAME } from "@/lib/site";
import Page from "@/components/Page";
export const metadata = pageMeta({ title: `Terms of Use – ${SITE_NAME}`, description: "The terms for using TextToolbox's free online text tools.", path: "/terms" });
export default function Terms() {
  return (
    <Page title="Terms of Use">
      <p>By using {SITE_NAME} you agree to these terms. If you do not agree, please do not use the site.</p>
      <h2>Use of the tools</h2>
      <p>The tools are provided free for personal and commercial use. Please do not misuse the site, attempt to disrupt it, or use it in ways that break the law.</p>
      <h2>No warranty</h2>
      <p>The tools are provided “as is”, without warranties of any kind. We work to make results accurate, but text processing has edge cases, especially for extraction and case conversion. Check important results before relying on them.</p>
      <h2>Limitation of liability</h2>
      <p>To the extent permitted by law, we are not liable for loss or damage arising from use of the site or its results. You are responsible for keeping your own copy of any important text.</p>
      <h2>Your content</h2>
      <p>You keep all rights to the text you enter. Text is processed in your browser and is not sent to or stored by us.</p>
      <h2>Third-party services and links</h2>
      <p>The site may use third-party services such as analytics and advertising. Those services have their own terms and policies.</p>
      <h2>Changes</h2>
      <p>We may update these terms. Continued use of the site means you accept the updated terms.</p>
      <p style={{ color: "var(--muted)" }}>These terms are a general template. The site owner should have them reviewed for their situation and jurisdiction.</p>
    </Page>
  );
}
