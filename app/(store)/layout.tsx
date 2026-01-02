import { NavbarServer } from "@/components/navigation/navbarServer";
import NextTopLoader from 'nextjs-toploader';

export default function StoreLayout({ children }: Readonly<{children: React.ReactNode;}>) {
  return (
    <div>
      <NavbarServer />
      <main className="min-h-screen">
        <NextTopLoader showSpinner={false}/>
        {children}
      </main>
    </div>
  );
}