import { createRootRoute, HeadContent, Link, Scripts } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-teal">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="bg-gradient-teal inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium text-cream"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#FDFBF7" },
      { title: "Bayan — Daily verses, deep reflection" },
      {
        name: "description",
        content:
          "Bayan is a calm daily ritual for verse, reflection, and recitation — with mood-based guidance from the Quran.",
      },
      { property: "og:title", content: "Bayan — Daily verses, deep reflection" },
      {
        property: "og:description",
        content: "A Zennish companion for your daily verse, reflection, and recitation.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: AppShell,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
