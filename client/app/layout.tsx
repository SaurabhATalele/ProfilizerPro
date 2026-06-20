import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../Utils/ThemeContext";
import "react-toastify/dist/ReactToastify.css";
import { TestProvider } from "../Utils/TestContext";
import { UserProvider } from "../Utils/UserContext";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "profilizerPro",
  description: "ProfilizerPro is an AI enabled Assessment platform.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <ThemeProvider>
        <UserProvider>
          <TestProvider>
            <body className={` ${inter.className} `}>{children}</body>
          </TestProvider>
        </UserProvider>
      </ThemeProvider>
    </html>
  );
}
