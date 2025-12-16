import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Outlet } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="ml-[280px] mt-16 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Index;
