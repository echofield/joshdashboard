import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Updated metadata for Josh W.'s Implementation OS
export const metadata = {
  title: "Josh W. | Implementation OS",
  description: "A living system to execute your marketing strategy and track results.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* The body tag now includes base styling from globals.css for a consistent theme.
        This ensures the background and text colors are applied across the entire application.
      */}
      <body className={`${inter.className} bg-[rgb(var(--background))] text-[rgb(var(--foreground))]`}>
        {/* A main container is used to provide padding and set a maximum width,
          ensuring the dashboard looks good on all screen sizes.
        */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-screen-xl">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
