import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchChats } from "../../redux/features/messageSlice";
import { Link } from "react-router-dom";
import style from "./MessagesPage.module.scss";

const MessagesPage = () => {
  const dispatch = useDispatch();
  const { chats } = useSelector((state) => state.messages);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  const safeChats = (chats || []).filter(
    (chat) =>
      chat && (chat.partner || (chat.members && chat.members.length > 0))
  );


const renderGlowDots = () => {
  const dots = [];
  for (let i = 0; i < 35; i++) {
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const size = 40 + Math.random() * 40; // 40–80px
    const delay = Math.random() * 10;
    const duration = 14 + Math.random() * 6;

    dots.push(
      <span
        key={i}
        style={{
          top: `${top}%`,
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    );
  }
  return dots;
};


  return (
    <div className={style.messagesWrapper}>
<div className={style.glowDots}>{renderGlowDots()}</div>



      <h2 className={style.title}>Ваши чаты</h2>

      {safeChats.length === 0 ? (
        <div className={style.emptyState}>
          <img src="/images/empty_chat.svg" alt="Нет чатов" />
          <p>Пока нет ни одного диалога. Начните общение!</p>
        </div>
      ) : (
        safeChats.map((chat) => {
          const partner =
            chat?.partner ||
            chat?.members?.find((m) => m && String(m._id) !== String(user?.id));

          const lastMsg = chat?.lastMessage?.content || "Нет сообщений";
          const lastMsgDate = chat?.lastMessage?.createdAt
            ? new Date(chat.lastMessage.createdAt).toLocaleDateString()
            : null;
          const unreadCount = chat?.unreadCount || 0;

          if (!partner) return null;

          return (
            <Link
              to={`/chatRoom/${partner._id}`}
              key={chat._id}
              className={style.chatCard}
            >
              <div className={style.chatLeft}>
                {partner.avatar ? (
                  <img
                    src={partner.avatar}
                    alt={partner.name}
                    className={style.avatar}
                  />
                ) : (
                  <div className={style.avatarPlaceholder}>
                    {partner.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className={style.chatContent}>
                <div className={style.chatHeader}>
                  <span className={style.partnerName}>{partner.name}</span>
                  {lastMsgDate && (
                    <span className={style.chatDate}>{lastMsgDate}</span>
                  )}
                </div>
                <p className={style.lastMessage}>
                  {lastMsg.length > 60 ? lastMsg.slice(0, 60) + "..." : lastMsg}
                </p>
              </div>

              {unreadCount > 0 && (
                <span className={style.unreadBadge}>{unreadCount}</span>
              )}
            </Link>
          );
        })
      )}
    </div>
  );
};

export default MessagesPage;
