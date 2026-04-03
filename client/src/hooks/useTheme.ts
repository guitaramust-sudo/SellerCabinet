import { useState, useEffect } from "react";

export const useTheme = () => {
  // Инициализируем из localStorage или берем светлую по умолчанию
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("app-theme");
    return saved === "dark";
  });

  useEffect(() => {
    // Сохраняем при каждом изменении
    localStorage.setItem("app-theme", isDarkMode ? "dark" : "light");

    // Опционально: добавляем класс на body, чтобы глобальные стили подхватились сразу
    if (isDarkMode) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return { isDarkMode, toggleTheme };
};
