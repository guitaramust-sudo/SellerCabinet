const express = require("express");
const cors = require("cors");

const app = express();
// Порт 3001, чтобы не конфликтовать с основным бэкендом (8080)
const PORT = process.env.AI_PORT || 3001;

app.use(cors());
app.use(express.json());

app.post("/api/generate-ai", async (req, res) => {
  const { action, text, title } = req.body;

  let prompt = "";

  if (action === "improve") {
    prompt = `
      Ты — профессиональный редактор объявлений и специалист по модерации текста.
      Твоя задача: сделать описание привлекательным, вежливым и полностью очищенным от токсичности.

      СТРОГИЕ ПРАВИЛА ЦЕНЗУРЫ:
      1. ПОЛНОСТЬЮ УДАЛИ или замени на культурные аналоги любой мат, нецензурную лексику, оскорбления и грубый жаргон.
      2. Если в тексте есть агрессия — перепиши её в спокойном, деловом тоне.
      3. Описание должно соответствовать правилам приличия и законам РФ (никакой дискриминации или запрещенных тем).

      ФОРМАТ ОТВЕТА (Пиши СТРОГО по этой структуре):
      Название товара: [Подходящее название]

      Описание: 
      [Твой текст сплошным абзацем. НИКАКИХ списков, НИКАКОЙ нецензурщины. Пиши грамотно и чисто.]

      Преимущества:
      - [Пункт 1]
      - [Пункт 2]

      ОТРЕДАКТИРУЙ ЭТОТ ТЕКСТ: 
      "${text}"

      Важно: Начни ответ сразу с "Название товара:". Не пиши "Вот ваш текст" или "Я исправил".
    `;
  } else if (action === "price") {
    prompt = `
      Проанализируй товар: "${title}".
      Выдай ответ строго по шаблону:
      Название товара: ${title}
      Рекомендуемая цена: [число] рублей (обязательно без пробелов вне зависимости от длины числа)
      Обоснование: [одно короткое предложение]
      
      Не пиши ничего, кроме этих трех строк.
    `;
  }

  try {
    const ollamaResponse = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.2, // Низкая температура для стабильного формата
        },
      }),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      throw new Error(`Ollama error: ${errorText}`);
    }

    const data = await ollamaResponse.json();
    // Возвращаем результат фронтенду
    res.json({ result: data.response });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Ошибка генерации. Проверь работу Ollama." });
  }
});

app.listen(PORT, () => {
  console.log(`AI Сервис запущен на http://localhost:${PORT}`);
});
