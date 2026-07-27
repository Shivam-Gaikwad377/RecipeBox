import type { ReactNode } from "react";
import  Navbar  from "@/components/shell/Navbar";
import  Footer  from "@/components/shell/Footer";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background text-on-background flex flex-col min-h-screen">
      <Navbar />

      <main className="grow  pb-xl px-margin-mobile md:px-margin-desktop max-w-360 w-full mx-auto">
        {children}
      </main>

      <Footer />
    </div>
  );
}