import React from "react";
import Home from "./components/home/home";
export default function App() {
  const handleClick = () =>
    electron.notificationApi.sendNotification("my custom message");

  return (
    <div>
      <Home />
      {/* <button onClick={handleClick}>Notify</button> */}
    </div>
  );
}
