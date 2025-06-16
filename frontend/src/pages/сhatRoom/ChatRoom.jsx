import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "../../axiosInstance";

const ChatRoom = () => {
  const { userId } = useParams();
  const currentUser = useSelector((state) => state.auth.user);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [chatId, setChatId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchChat = async () => {
      // Создать или получить чат
      const chatRes = await axios.post("/messages/create", {
        receiverId: userId,
      });
      setChatId(chatRes.data._id);

      // Получить сообщения
      const msgs = await axios.get(
        `/messages/chats/${chatRes.data._id}/messages`
      );
      setMessages(msgs.data);

      // Получить информацию о пользователе
      const userRes = await axios.get(`/users/${userId}`);
      setReceiverInfo(userRes.data);
    };

    fetchChat();
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;

    try {
      const res = await axios.post(`/messages/chats/${chatId}/send`, {
        content: newMsg,
      });

      setMessages((prev) => [...prev, res.data]);
      setNewMsg("");
    } catch (err) {
      console.error("Ошибка при отправке сообщения:", err);
      alert("Не удалось отправить сообщение");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Чат с {receiverInfo?.name || "пользователем"}</h2>
      <div
        style={{
          border: "1px solid #ccc",
          padding: 10,
          maxHeight: "400px",
          overflowY: "auto",
          marginBottom: 10,
        }}
      >
        {messages.map((msg) => {
          const isMine = String(msg.sender?._id) === String(currentUser.id);

          return (
            <div
              key={msg._id}
              style={{
                display: "flex",
                justifyContent: isMine ? "flex-end" : "flex-start",
                margin: "5px 0",
              }}
            >
              <p
                style={{
                  background: isMine ? "#cce5ff" : "#f2f2f2",
                  color: "#000",
                  padding: "8px 12px",
                  borderRadius: "16px",
                  maxWidth: "70%",
                  wordBreak: "break-word",
                }}
              >
                {msg.content}
              </p>
            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Введите сообщение"
          style={{ flex: 1, padding: "8px" }}
        />
        <button onClick={handleSend}>Отправить</button>
      </div>
    </div>
  );
};

export default ChatRoom;
