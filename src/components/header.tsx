import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom"; // Import useLocation
import { useAuth } from "@clerk/clerk-react";

import { cn } from "@/lib/utils";
import { Container } from "./container";
import { LogoContainer } from "./logo-container";
import { NavigationRoutes } from "./navigation-routes";
import { ProfileContainer } from "./profile-container";
import { ToggleContainer } from "./toggle-container";

const Header = () => {
  const { userId } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Hook to get the current page location
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Effect to detect page scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  return (
    <>
      {/* This is the visible, fixed header */}
      {!isFullScreen && (
        <header
          className={cn(
            "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out",
            isScrolled
              ? "border-b border-gray-200/80 bg-white/80 backdrop-blur-xl"
              : "border-b border-transparent"
          )}
        >
          <Container>
            {/* Corrected the desktop height for better balance */}
            <div className="flex items-center gap-4 w-full h-14 md:h-16">
              <LogoContainer />
              <nav className="hidden md:flex items-center gap-4">
                <NavigationRoutes />
                {userId && (
                  <NavLink
                    to={"/generate"}
                    className={({ isActive }) =>
                      cn(
                        "text-base text-neutral-600 hover:text-neutral-900 transition-colors",
                        isActive && "text-neutral-900 font-semibold"
                      )
                    }
                  >
                    Dashboard
                  </NavLink>
                )}
              </nav>
              <div className="ml-auto flex items-center gap-6">
                <ProfileContainer />
                <ToggleContainer />
              </div>
            </div>
          </Container>
        </header>
      )}
      {/* This is the invisible "spacer" div. */}
      {!isHomePage && !isFullScreen && <div className="h-16 md:h-20" />}
    </>
  );
};

export default Header;