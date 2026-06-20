"use client";
import { FC, useState, FormEvent } from "react";
import Image from "next/image";
import { contactUs } from "@/Utils/Apicalls/ContactUs";
import { ToastContainer } from "react-toastify";
import Toast from "@/Utils/Toast";

const Contactus: FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const res = await contactUs({ name, email, message });
    Toast("success", (res as { message: string })?.message);
    console.log(res);
  };

  return (
    <>
      <ToastContainer />
      <div className="w-full min-h-[calc(100vh-80px)] mt-20 flex flex-col lg:flex-row justify-center items-center gap-10 lg:gap-16 px-5 pb-10">
        <div className="hidden lg:flex justify-center items-center w-full max-w-[350px]">
          <Image
            src="/ContactImage/ContactusLeft.png"
            width={350}
            height={450}
            alt="Contactus"
            className="object-contain drop-shadow-2xl hover:-translate-y-2 transition-transform duration-500"
          />
        </div>

        <div className="relative p-8 w-full max-w-md bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl flex flex-col gap-6 transform transition-all hover:scale-[1.01]">
          <div className="text-center space-y-2">
            <h2 className="font-extrabold text-3xl text-gray-900 dark:text-white">Contact Us</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              We&apos;d love to hear from you. Send us a message!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] outline-none transition-all duration-300 text-sm dark:text-white"
                required
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] outline-none transition-all duration-300 text-sm dark:text-white"
                required
              />
            </div>
            <div>
              <textarea
                name="message"
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your Message..."
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] outline-none transition-all duration-300 text-sm dark:text-white min-h-[120px] resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[var(--color-primary)] hover:bg-opacity-90 text-white rounded-lg font-medium transition-all duration-300 shadow-lg shadow-[var(--color-primary)]/30 transform hover:-translate-y-0.5 mt-2"
            >
              Send Message
            </button>
          </form>
        </div>

        <div className="hidden md:flex justify-center items-center w-full max-w-[350px]">
          <Image
            src="/ContactImage/ContactusRight.png"
            width={350}
            height={450}
            alt="ContactusRight"
            className="object-contain drop-shadow-2xl hover:-translate-y-2 transition-transform duration-500"
          />
        </div>
      </div>
    </>
  );
};

export default Contactus;
