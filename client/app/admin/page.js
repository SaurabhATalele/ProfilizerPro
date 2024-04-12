import React from "react";
import AddTest from "../../Components/Admin/Tests/AddTest";
import AdminNavbar from "../../Components/Navbar/Admin";

const page = () => {
  return (
    <div className="w-screen flex justify-center py-24">
      <AdminNavbar />
      <AddTest />
    </div>
  );
};

export default page;
