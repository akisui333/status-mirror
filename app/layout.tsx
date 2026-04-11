import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "状态页 - 深夜食堂监控站",
  description: "深夜食堂监控站服务状态页",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full bg-slate-50 text-slate-900 antialiased">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
