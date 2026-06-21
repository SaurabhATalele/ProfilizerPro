import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../Utils/ThemeContext";
import "react-toastify/dist/ReactToastify.css";
import { TestProvider } from "../Utils/TestContext";
import { UserProvider } from "../Utils/UserContext";
import { ReactNode } from "react";
import ConditionalNavbar from "@/Components/Navbar/ConditionalNavbar";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var isDark = stored
                    ? stored === 'dark'
                    : window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (isDark) document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <ThemeProvider>
        <UserProvider>
          <TestProvider>
            <body className={` ${inter.className} `}>
              <ConditionalNavbar />

              {children}

            </body>
          </TestProvider>
        </UserProvider>
      </ThemeProvider>
    </html>
  );
}
