import type { Metadata } from "next";
import "./globals.css";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Nunito+Sans:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-[#F9FAFB] text-[#2B2D42] flex flex-col">
        <GoogleAnalytics />
        <AuthProvider>
          <LanguageProvider>
            <HeaderWrapper />
            <main className="flex-grow">
              {children}
            </main>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

