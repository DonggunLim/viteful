import { FC, PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";
import useChangeSeoHead from "../hooks/useChangeSeoHead";

interface LayoutProps extends PropsWithChildren {}

const Layout: FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  useChangeSeoHead();

  return (
    <>
      <nav>
        <button onClick={() => navigate("/")}>main</button>
        <button onClick={() => navigate("/home")}>home</button>
        <button onClick={() => navigate("/profile")}>Profile</button>
      </nav>
      {children}
    </>
  );
};

export default Layout;
