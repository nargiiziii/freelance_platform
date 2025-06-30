import React, { useState } from "react";
import style from "./AssistantChat.module.scss";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { IoCloseSharp } from "react-icons/io5";

const AssistantChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Привет! Я могу помочь с платформой 😊" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const systemPrompt = `
Ты — вежливый и понятный помощник фриланс-платформы. Помогай пользователям в зависимости от их роли.

Если пользователь пишет: "я наниматель" или "я работодатель", то объясни следующее:

На платформе наниматели создают проекты — это задачи, которые будут выполнять фрилансеры. После создания проекта фрилансеры отправляют отклики (предложения). Наниматель может принять или отклонить отклик. При принятии отклика с баланса нанимателя списываются деньги в эскроу. Фрилансер начинает выполнять проект. Когда работа будет готова, фрилансер отправляет файл. Наниматель переходит на страницу Project Detail, где он может:
— либо оплатить фрилансеру за выполненную работу (деньги переходят из эскроу),
— либо отклонить работу и вернуть деньги обратно на свой баланс.

Если пользователь пишет: "я фрилансер", то объясни следующее:

Фрилансеры могут перейти на страницу со списком открытых проектов. Они выбирают интересные проекты и отправляют отклики. Наниматель может принять или отклонить отклик. Если отклик принят — начинается работа. Фрилансер выполняет задание и отправляет результат через страницу My Proposals. После этого наниматель либо одобряет работу и выплачивает оплату, либо отклоняет её.

Если вопрос не по теме платформы (например, про погоду или философию), вежливо откажись и скажи, что ты помощник только по функционалу сайта.
Отвечай дружелюбно, понятно и коротко.
`;

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "user", parts: [{ text: input }] },
          ],
        }),
      });

      const data = await res.json();
      const reply = data.reply || "Извините, я не поняла 😢";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Произошла ошибка 😵" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.wrapper}>
      {open && (
        <div className={style.chatBox}>
          <div className={style.header}>
            <span>🤖 Чат-помощник</span>
            <button onClick={() => setOpen(false)}>
              <IoCloseSharp />
            </button>
          </div>
          <div className={style.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === "user" ? style.userMsg : style.aiMsg}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className={style.aiMsg}>Печатает...</div>}
          </div>
          <div className={style.inputBox}>
            <input
              type="text"
              placeholder="Задай вопрос..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

      {!open && (
        <button
          className={style.fab}
          onClick={() => setOpen(true)}
          title="Помощник"
        >
          <IoChatbubbleEllipsesSharp />
        </button>
      )}
    </div>
  );
};

export default AssistantChat;
