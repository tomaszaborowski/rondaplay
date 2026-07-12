import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { TopBanner } from "@/components/TopBanner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "Ronda Play | Redefiniendo el Tiempo Muerto como Juego Compartido",
  description: "Transforma el tiempo de pantalla aislado en conexión familiar. Pon el móvil en el centro de la mesa y únete a todos, desde los 6 hasta los 99 años.",
  keywords: ["juegos de mesa digitales", "multijugador local", "juegos familiares", "pasa y juega", "conexión familiar"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased min-h-screen bg-[#F9FAFB] text-[#2B2D42] flex flex-col">
        <GoogleAnalytics />
        <LanguageProvider>
          {/* TopBanner sits above the nav — it adds 36px to the top */}
          <TopBanner />
          {/* Navbar is offset by the banner height */}
          <div className="pt-9">
            <Navbar />
          </div>
          <main className="flex-grow">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
