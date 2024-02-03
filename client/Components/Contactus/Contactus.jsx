import React from "react";
import Link from "next/link";
import Image from "next/image";
const Contactus = () => {
  return (
    <div className="w-3/4 h-screen flex justify-center items-center gap-20">
        <Image
          src={"/ContactImage/ContactusLeft.png"}
          width={300}
          height={450}
          alt="Contactus"
          
        />
      
      <div className="relative p-5 w-80 h-96 shadow-md rounded-md dark:shadow-none dark:backdrop-blur-md dark:bg-[#33333342] shadow-gray-400 flex flex-col items-center justify-around   ">
        <h2 className="font-bold text-[1.5rem]">Contact Us</h2>
        <p className="text-center text-[0.7rem] font-medium">
          Some contact information on how to reach out
        </p>
        <form action="">
          <input
            type="text"
            placeholder="Name"
            className="p-2 bg-transparent border rounded-md text-sm w-full my-2"
          />
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            className="p-2 bg-transparent border rounded-md text-sm w-full my-2 "
          />
          <textarea
           
           type="text"
           name="message"
           id="message"
           placeholder="Message"
           className="p-2 bg-transparent border rounded-md text-sm w-full my-2 size-28 resize-none"
        />
    
          <input
            type="submit"
            value="Send Message"
            className="p-2 bg-primary-light text-white rounded-md text-sm w-full my-2 "
          />
        </form>

      </div>
      <Image
          src={"/ContactImage/ContactusRight.png"}
          width={300}
          height={450}
          alt="ContactusRight"
          
        />
    </div>
  );
};

export default Contactus;
