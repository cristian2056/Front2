// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./stores/store.js";
import "./index.css";
import App from "./App.jsx";

// Provider envuelve toda la app para que cualquier componente
// pueda acceder al estado global (Redux) con useSelector y useDispatch

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);