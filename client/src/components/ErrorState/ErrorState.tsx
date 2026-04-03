import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import "./ErrorState.scss";

interface ErrorStateProps {
  title?: string;
  subTitle?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Что-то пошло не так",
  subTitle = "Произошла ошибка при загрузке данных. Попробуйте обновить страницу.",
}) => {
  const navigate = useNavigate();

  return (
    <div className="error-container">
      <Result
        status="error" // Антовский статус (рисует красный крестик)
        title={title}
        subTitle={subTitle}
        extra={[
          <Button
            type="primary"
            key="console"
            onClick={() => window.location.reload()}
            className="btn-retry"
          >
            Обновить страницу
          </Button>,
          <Button key="buy" onClick={() => navigate("/")}>
            На главную
          </Button>,
        ]}
      />
    </div>
  );
};
