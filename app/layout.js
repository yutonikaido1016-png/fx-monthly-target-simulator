import "./globals.css";

export const metadata = {
  title: "FX目標達成シミュレーター",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
