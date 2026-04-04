import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Card, Avatar, Space } from "antd";
import { RobotOutlined, UserOutlined, SendOutlined } from "@ant-design/icons";
import "./AIChat.scss";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ad: any;
}

export const AIChat: React.FC<AIChatProps> = ({ ad }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`chat_history_${ad.id}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([
        {
          role: "assistant",
          content: `Привет! Я изучил твой товар "${ad.title}". Чем могу помочь?`,
        },
      ]);
    }
  }, [ad.id, ad.title]);

  useEffect(() => {
    localStorage.setItem(`chat_history_${ad.id}`, JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, ad.id]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: "user", content: inputValue };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          history: newMessages,
          adContext: ad,
        }),
      });

      const data = await response.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.result },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Ошибка связи с ИИ сервером." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      title={
        <Space>
          <RobotOutlined /> Помощник ИИ
        </Space>
      }
      className="ai-chat-card"
    >
      {/* 1. Блок с сообщениями (он будет скроллиться) */}
      <div className="ai-chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-msg ${msg.role}`}>
            <Avatar
              className="msg-avatar"
              icon={
                msg.role === "assistant" ? <RobotOutlined /> : <UserOutlined />
              }
            />
            <div className="msg-bubble">{msg.content}</div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* 2. Блок ввода (он будет зафиксирован внизу) */}
      <div className="ai-chat-input-wrapper">
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 3 }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Спроси что-нибудь..."
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={isLoading}
        />
      </div>
    </Card>
  );
};
