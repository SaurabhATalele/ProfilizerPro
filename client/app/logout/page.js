import { useEffect } from "react";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  useEffect(() => {
    localStorage.removeItem("token");
    router.push("/login");
  }, []);
  return <div></div>;
};

export default page;
