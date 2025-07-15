import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Kiểm tra xem App có import đúng không
import "antd/dist/reset.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "./index.css";

const rootElement = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

if (rootElement) {
  rootElement.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}