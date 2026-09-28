import Link from "next/link";
import { pageMeta, SITE_NAME } from "@/lib/site";
import Page from "@/components/Page";
export const metadata = pageMeta({ title: `About ${SITE_NAME} – Free Browser-Based Text Tools`, description: "TextToolbox is a set of free text tools that run in your browser, with no accounts and no uploads.", path: "/about" });
export default function About() {
  return (
    <Page title={`About ${SITE_NAME}`}>
      <p>{SITE_NAME} is a collection of simple, free tools for everyday text jobs: cleaning up lists, changing capitalisation, counting words and pulling out emails, links or phone numbers.</p>
      <h2>How it works</h2>
      <p>Each tool runs in your web browser using JavaScript. When you paste text, the processing happens on your own device, so the text is not sent to our server. There are no accounts, no logins and no paid features.</p>
      <h2>Why it exists</h2>
      <p>Small text tasks come up constantly, and many tools for them are cluttered or ask for signups. This site aims to do one thing: let you paste, get the result and move on.</p>
      <h2>Keeping it free</h2>
      <p>The site may show advertising in the future to cover running costs. Ads will be clearly labelled and kept separate from the tools.</p>
      <p>Browse <Link href="/">all tools</Link>, read the <Link href="/privacy">privacy policy</Link>, or <Link href="/contact">get in touch</Link>.</p>
    </Page>
  );
}
