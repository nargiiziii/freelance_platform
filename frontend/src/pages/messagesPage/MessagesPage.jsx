import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchChats } from "../../redux/features/messageSlice";
import { Link } from "react-router-dom";

const MessagesPage = () => {
  const dispatch = useDispatch();
  const { chats } = useSelector((state) => state.messages);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  // Фильтруем только валидные чаты
  const safeChats = (chats || []).filter(
    (chat) => chat && (chat.partner || (chat.members && chat.members.length > 0))
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>Ваши чаты</h2>
      {safeChats.length === 0 ? (
        <p>Нет чатов</p>
      ) : (
        safeChats.map((chat) => {
          const partner =
            chat?.partner ||
            chat?.members?.find((m) => m && String(m._id) !== String(user?.id));

          const lastMsg = chat?.lastMessage?.content || "Нет сообщений";
          const unreadCount = chat?.unreadCount || 0;

          if (!partner) return null; // Пропускаем, если нет собеседника

          return (
            <Link
              to={`/chatRoom/${partner._id}`}
              key={chat._id}
              style={{
                display: "block",
                padding: "12px",
                marginBottom: "12px",
                border: "1px solid #ccc",
                borderRadius: "10px",
                textDecoration: "none",
                color: "#333",
                position: "relative",
              }}
            >
              <strong>{partner.name}</strong>
              <p style={{ fontSize: "14px", marginTop: "5px", color: "#666" }}>
                {lastMsg.length > 40 ? lastMsg.slice(0, 40) + "..." : lastMsg}
              </p>

              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "4px 8px",
                    fontSize: "12px",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })
      )}
    </div>
  );
};

export default MessagesPage;
