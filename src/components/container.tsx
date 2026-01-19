import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container = ({ children, className }: ContainerProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  return (
    <div
      className={cn(
        "container mx-auto px-4 md:px-8 py-4 w-full",
        isFullScreen && "p-0 m-0 max-w-none",
        className
      )}
    >
      {children}
    </div>
  );
};
