import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "antd/dist/reset.css";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./App.jsx";
import { UploadProgressOverlay } from "./components/UploadProgressOverlay.jsx";

createRoot(document.getElementById("root")).render(
  <>
    <App />
    <UploadProgressOverlay />
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
    />
  </>
);
