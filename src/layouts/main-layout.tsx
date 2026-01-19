import { Container } from "@/components/container";
import Header from "@/components/header";
import { Outlet } from "react-router-dom";

export const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <Container className="flex-grow pt-0">
        <main className="flex-grow">
          <Outlet />
        </main>
      </Container>
    </div>
  );
};
