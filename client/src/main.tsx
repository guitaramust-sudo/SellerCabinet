import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import router from "./routes/routes";
import { RouterProvider } from "react-router-dom";
import { store } from "./store";
import { Provider } from "react-redux";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
