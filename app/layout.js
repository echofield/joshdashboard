import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sadia K Dashboard",
  description: "Client progress and implementation tracking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* This {children} part renders your page. It is essential. */}
        {children}
      </body>
    </html>
  );
}