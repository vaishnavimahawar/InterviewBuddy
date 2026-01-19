import { Link } from "react-router-dom";

export const LogoContainer = () => {
  return (
    <Link to={"/"}>
      <img
        src="/assets/svg/LOGO.png"
        alt="AI Mock Interview Logo"
        className="h-16 w-auto object-contain"
      />
    </Link>
  );
};
