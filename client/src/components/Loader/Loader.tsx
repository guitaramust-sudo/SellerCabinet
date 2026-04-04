import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./Loader.scss";

interface LoaderProps {
  description?: string;
  minHeight?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  description = "Загрузка...",
  minHeight = "200px",
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 40 }} spin />;

  return (
    <div className="custom-loader" style={{ minHeight }}>
      <Spin indicator={antIcon} description={description} />
    </div>
  );
};
