export function AppFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground">
        <span>
          © {new Date().getFullYear()} FireInvent. All rights reserved.
        </span>
        <div className="flex space-x-3">
          <a href="/imprint" className="hover:text-primary transition-colors">
            Imprint
          </a>
          <a href="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
