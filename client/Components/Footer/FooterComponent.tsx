"use client";
import { FC } from "react";
import "./Footer.css";

const FooterComponent: FC = () => {
  return (
    <footer className="bg-neutral-primary w-full border-t border-[#00000010] dark:border-[#ffffff10]">
      <div className="mx-auto w-full">
        <div className="grid grid-cols-2 gap-8 px-4 py-6 lg:py-8 md:grid-cols-4 text-xs place-items-center">
          <div className="text-left">
            <h2 className="mb-6 text-sm font-semibold text-heading uppercase">Platform</h2>
            <ul className="text-body font-medium">
              <li className="mb-4"><a href="/explore" className="hover:underline">Explore Tests</a></li>
              <li className="mb-4"><a href="/all-tests" className="hover:underline">All Assessments</a></li>
              <li className="mb-4"><a href="/register" className="hover:underline">Get Started</a></li>
            </ul>
          </div>
        
          <div className="text-left">
            <h2 className="mb-6 text-sm font-semibold text-heading uppercase">Company</h2>
            <ul className="text-body font-medium">
              <li className="mb-4"><a href="/aboutus" className="hover:underline">About Us</a></li>
              <li className="mb-4"><a href="/contactus" className="hover:underline">Contact Us</a></li>
              <li className="mb-4"><a href="#" className="hover:underline">Privacy Policy</a></li>
              <li className="mb-4"><a href="#" className="hover:underline">Terms &amp; Conditions</a></li>
            </ul>
          </div>
          <div className="text-left">
            <h2 className="mb-6 text-sm font-semibold text-heading uppercase">Support</h2>
            <ul className="text-body font-medium">
              <li className="mb-4"><a href="/contactus" className="hover:underline">Help Center</a></li>
              <li className="mb-4"><a href="/password-recovery" className="hover:underline">Account Recovery</a></li>
              <li className="mb-4"><a href="#" className="hover:underline">FAQs</a></li>
              <li className="mb-4"><a href="#" className="hover:underline">Feedback</a></li>
            </ul>
          </div>
        </div>
        <div className="px-4 py-6 bg-neutral-secondary-soft md:flex md:items-center md:justify-between">
          <span className="text-sm text-body sm:text-center">
            © {new Date().getFullYear()} ProfilizePro. All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;
