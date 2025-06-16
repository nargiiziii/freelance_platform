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

  return (
    <div>
      <h2>Ваши чаты</h2>
      {chats.length === 0 ? (
        <p>Нет чатов</p>
      ) : (
        chats.map((chat) => {
          const partner = chat.members.find(
            (m) => String(m._id) !== String(user.id)
          );

          // console.log("Текущий пользователь:", user.name, user._id);
          // console.log("Участники чата:", chat.members);

          return (
            <Link
              to={`/chatRoom/${partner._id}`}
              key={chat._id}
              style={{
                display: "block",
                padding: "10px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#333",
              }}
            >
              <strong>{partner.name}</strong>
              <p style={{ fontSize: "14px", marginTop: "5px", color: "#666" }}>
                Перейти к переписке →
              </p>
            </Link>
          );
        })
      )}
    </div>
  );
};

export default MessagesPage;
