"use client";
import { FC, useState } from "react";
import Image from "next/image";
import Verify from "./Verify";
import SendEmail from "./SendEmail";
import Reset from "./Reset";
import { ToastContainer } from "react-toastify";
import Toast from "@/Utils/Toast";
import { useTheme } from "@/Utils/ThemeContext";

const Otp: FC = () => {
  const { darkMode } = useTheme();
  const [otp, setOtp] = useState<string | false>(false);
  const [email, setEmail] = useState<string>("");
  const [Verified, setVerified] = useState<boolean>(false);

  const handleOtp = (userOtp: string): void => {
    if (userOtp === otp) {
      Toast("success", "OTP Verified");
      setVerified(!Verified);
    } else {
      Toast("error", "Incorrect OTP");
    }
  };

  const handleSendMail = async (emailValue: string): Promise<void> => {
    try {
      const res = await fetch("/api/v1/users/generate-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailValue }),
      });
      const data = await res.json();
      if (data.message === "User Not Found") {
        Toast("error", "User Not Found");
        return;
      }
      if (data.status !== 200) {
        Toast("error", "Something went wrong")
        return;
      }

      if (data.status === 200) {
        setOtp(data.otp);
        setEmail(emailValue);
        Toast("success", "OTP Sent to your Email");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <ToastContainer />
      <div className="w-screen min-h-screen bg-white dark:bg-[#0c0c0c] text-black dark:text-white">
        <div className="w-screen min-h-screen flex justify-center items-center gap-20">
          {!otp ? (
            <SendEmail handleSendMail={handleSendMail} />
          ) : (
            !Verified && <Verify handleOtp={handleOtp} />
          )}
          {Verified && <Reset email={email} />}

          <Image
            src={"/ResetImage/email.svg"}
            alt="One-time passcode sent to your email"
            width={450}
            height={400}
          />
        </div>
      </div>
    </div>
  );
};

export default Otp;
