import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "./providers";
import MusicPlayer from "@/components/MusicPlayer";
import GameBot from "@/components/GameBot/GameBot"; 

export const metadata: Metadata = {
  title: "СНО — Студенческое научное общество",
  description:
    "Сайт студенческого научного общества: новости, мероприятия, конференции, состав, заявки на вступление.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          {children}
          <MusicPlayer />
          <GameBot /> 
        </Providers>
      </body>
    </html>
  );
}