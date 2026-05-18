import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "AtomQuest",
  description: "Goal Setting & Tracking Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}