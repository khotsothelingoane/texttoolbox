import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap py-16">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-3">That page does not exist. <Link href="/">Browse all text tools</Link>.</p>
    </div>
  );
}
