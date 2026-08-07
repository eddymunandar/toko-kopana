export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-12 py-8 pb-24 md:pb-8 text-center text-sm text-foreground/60">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} Toko KOPANA. All rights reserved.</p>
        <p className="mt-2 text-xs">Koperasi KOPANA</p>
      </div>
    </footer>
  );
}
