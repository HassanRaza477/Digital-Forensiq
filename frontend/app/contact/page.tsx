export default function ContactPage() {
  return (
    <main className="bg-canvas text-ink min-h-screen px-8 py-24 text-center">
      <h1 className="font-display text-5xl mb-4">Contact</h1>
      <p className="text-charcoal text-lg max-w-md mx-auto">
        Questions or feedback? Reach out at{" "}
        <a href="mailto:hello@example.com" className="text-accent-blue">
          hello@example.com
        </a>
        .
      </p>
    </main>
  );
}