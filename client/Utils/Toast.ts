import { toast, Bounce, ToastOptions } from "react-toastify";

type ToastType = "success" | "error" | "info" | "warning" | "loading";

const Toast = (type: ToastType, message: string) => {
  const options: ToastOptions = {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce,
  };

  toast[type](message, options);
};

export default Toast;
