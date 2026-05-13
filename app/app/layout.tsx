import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpaOps — Med Spa Operations Management",
  description: "Standard operating procedures built for med spas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#8b6f5e",
          colorBackground: "#faf8f5",
          colorText: "#2c2420",
          colorInputBackground: "#faf8f5",
          colorInputText: "#2c2420",
          borderRadius: "2px",
          fontFamily: "Georgia, 'Times New Roman', serif",
        },
      }}
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
