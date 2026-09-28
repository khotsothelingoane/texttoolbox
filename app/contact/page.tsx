import { CONTACT_EMAIL, pageMeta, SITE_NAME } from "@/lib/site";
import Page from "@/components/Page";
export const metadata = pageMeta({ title: `Contact ${SITE_NAME}`, description: "How to contact TextToolbox with questions, feedback or bug reports.", path: "/contact" });
export default function Contact() {
  return (
    <Page title="Contact">
      <p>Questions, feedback or a bug to report? We would like to hear from you.</p>
      {CONTACT_EMAIL ? (
        <p>Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      ) : (
        <p><strong>Contact method not configured yet.</strong> The site owner can set the <code>NEXT_PUBLIC_CONTACT_EMAIL</code> environment variable to display an email address here.</p>
      )}
      <h2>Helpful details for bug reports</h2>
      <ul><li>The tool you were using</li><li>Your browser and device</li><li>What you expected and what happened</li></ul>
      <p>Please do not send sensitive personal information by email.</p>
    </Page>
  );
}
