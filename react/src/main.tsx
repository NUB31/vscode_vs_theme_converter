import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { UserContextProvider } from "./contexts/UserContext";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserContextProvider>
        <App />
      </UserContextProvider>
      <ToastContainer />
    </BrowserRouter>
  </React.StrictMode>
);
