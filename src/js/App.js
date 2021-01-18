import React from "react";
import Home from "./components/home/home";
import { ToastProvider } from "react-toast-notifications";

export default function App() {
  const handleClick = () =>
    electron.notificationApi.sendNotification("my custom message");

  return (
    <ToastProvider autoDismiss autoDismissTimeout={2000} placement="top-center">
      <div>
        <Home />
        {/* <button onClick={handleClick}>Notify</button> */}
      </div>
    </ToastProvider>
  );
}
