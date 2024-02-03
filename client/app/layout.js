import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../Utils/ThemeContext";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "profilizerPro",
  description: "ProfilizerPro is an AI enabled Assessment platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ThemeProvider>
        <body className={`${inter.className} `}>{children}</body>
      </ThemeProvider>
    </html>
  );
}
