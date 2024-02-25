"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const Sidebar = () => {
   
 
  return (
    <>



  <div className="flex flex-col h-screen bg-blue-800 w-[245px] rounded-r-3xl">
  {/* <!-- Half sidebar above --> */}
  <div className="flex flex-col flex-grow">
    <div className="hover:bg-gray-800 text-white py-4 px-8 cursor-pointer"><Link href={"/"} className="flex gap-1">
        <Image src={"/logo.svg"} width={15} height={15} alt="logo" />
        <h3 className="font-bold dark:text-primary-dark ">
          ProfilizePro
        </h3>
      </Link></div>
    <div className="hover:bg-gray-800 text-white py-4 px-8 cursor-pointer">Dashboard</div>
    <div className="hover:bg-gray-800 text-white py-4 px-8 cursor-pointer">Exams</div>
    <div className="hover:bg-gray-800 text-white py-4 px-8 cursor-pointer">Register</div>
    <div className="hover:bg-gray-800 text-white py-4 px-8 cursor-pointer">Payment</div>
  </div>
  
  {/* <!-- Two buttons below sidebar --> */}
  <div >
    
    <div className="hover:bg-gray-800 text-white py-4 px-8 cursor-pointer">Setting</div>
    <div className="hover:bg-gray-800 text-white py-4 px-8 cursor-pointer">Logout</div>
  </div>

 
</div>
<div className="flex items-center justify-center ml-96">
<div>
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Name
      </th>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Age
      </th>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Location
      </th>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Occupation
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        John Doe
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        30
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        New York
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        Engineer
      </td>
    </tr>
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        Jane Smith
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        25
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        Los Angeles
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        Designer
      </td>
    </tr>
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        Jane Smith
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        25
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        Los Angeles
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        Designer
      </td>
    </tr>
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        Jane Smith
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        25
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        Los Angeles
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        Designer
      </td>
    </tr>
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        Jane Smith
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        25
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        Los Angeles
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        Designer
      </td>
    </tr>

  </tbody>
</table>

</div>
</div>









   


  
  </>
);
};


export default Sidebar;

  