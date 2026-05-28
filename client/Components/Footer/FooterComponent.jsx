import React from "react";
import { FaRegCopyright } from "react-icons/fa6";
import Link from "next/link";
import "./Footer.css";

const FooterComponent = () => {
  return (
    <div className="footer flex justify-between">
      <p className="flex w-1/2 items-center gap-2">
        <FaRegCopyright /> ProfilizerPro 2024. All rights reserved
      </p>
      <div className="links">
        <Link href={"/aboutus"}>About us </Link>
        <Link href={"/contactus"}>Contact</Link>
      </div>
    </div>
  );
};

export default FooterComponent;
