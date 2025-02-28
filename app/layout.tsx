import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "플래닛어스 그림 생성기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
