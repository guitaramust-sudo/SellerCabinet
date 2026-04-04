import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import { MainAdPage } from "../components/MainAdPage/MainAdPage";
import { ProductViewPage } from "../components/ProductViewPage/ProductViewPage";
import { AdEditPage } from "../components/AdEditPage/AdEditPage";
import { ErrorState } from "../components/ErrorState/ErrorState";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <div style={{ padding: "20px" }}>Что-то пошло не так...</div>,
    children: [
      {
        index: true,
        element: <MainAdPage />,
      },
      {
        path: "ads/:id",
        element: <ProductViewPage />,
      },
      {
        path: "ads/:id/edit",
        element: <AdEditPage />,
      },
      {
        path: "ads",
        element: <Navigate to="/" replace />,
      },
      {
        path: "*",
        element: <ErrorState />,
      },
    ],
  },
]);

export default router;
