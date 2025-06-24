import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchChats } from "../../redux/features/messageSlice";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../axiosInstance";
import io from "socket.io-client";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import style from "./MessagesPage.module.scss";
import useNotificationCleaner from "../../hooks/useNotificationCleaner";

const socket = io("http://localhost:3000", { withCredentials: true });

const MessagesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { chats } = useSelector((state) => state.messages);
  const currentUser = useSelector((state) => state.auth.user);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [newMsg, setNewMsg] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useNotificationCleaner("msg");

  const queryParams = new URLSearchParams(location.search);
  const userParam = queryParams.get("user");

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  useEffect(() => {
    if (userParam) {
      setSelectedUserId(userParam);
    }
  }, [userParam]);

  const safeChats = (chats || []).filter(
    (chat) =>
      chat && (chat.partner || (chat.members && chat.members.length > 0))
  );

  useEffect(() => {
    if (!selectedUserId) return;

    const loadChat = async () => {
      try {
        const chatRes = await axios.post("/messages/create", {
          receiverId: selectedUserId,
        });
        const cId = chatRes.data._id;
        setChatId(cId);

        const msgs = await axios.get(`/messages/chats/${cId}/messages`);
        setMessages(msgs.data);

        const userRes = await axios.get(`/users/${selectedUserId}`);
        setReceiverInfo(userRes.data);

        socket.emit("join", currentUser.id);
        socket.emit("markAsRead", {
          chatId: cId,
          reader: currentUser.id,
        });

        dispatch(fetchChats());
      } catch (err) {
        console.error("Ошибка загрузки чата:", err);
      }
    };

    loadChat();
  }, [selectedUserId, currentUser.id, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.on("messageReceived", (msg) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === msg._id);
        return exists ? prev : [...prev, msg];
      });
    });

    socket.on("typing", ({ sender }) => {
      if (sender === selectedUserId) setTyping(true);
    });

    socket.on("stopTyping", ({ sender }) => {
      if (sender === selectedUserId) setTyping(false);
    });

    socket.on("messageRead", ({ chatId: readChatId }) => {
      if (readChatId === chatId) {
        setMessages((prev) =>
          prev.map((m) =>
            String(m.sender?._id) === String(currentUser.id)
              ? { ...m, read: true }
              : m
          )
        );
      }
    });

    return () => {
      socket.off("messageReceived");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("messageRead");
    };
  }, [chatId, selectedUserId, currentUser.id]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;

    try {
      const res = await axios.post(`/messages/chats/${chatId}/send`, {
        content: newMsg,
      });

      setMessages((prev) => [...prev, res.data]);
      setNewMsg("");

      socket.emit("newMessage", {
        message: res.data,
        receiver: selectedUserId,
      });

      socket.emit("stopTyping", {
        chatId,
        sender: currentUser.id,
        receiver: selectedUserId,
      });

      socket.emit("markAsRead", {
        chatId,
        reader: currentUser.id,
      });

      dispatch(fetchChats());
    } catch (err) {
      console.error("Ошибка при отправке сообщения:", err);
      alert("Не удалось отправить сообщение");
    }
  };

  const handleTyping = (e) => {
    setNewMsg(e.target.value);

    socket.emit("typing", {
      chatId,
      sender: currentUser.id,
      receiver: selectedUserId,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId,
        sender: currentUser.id,
        receiver: selectedUserId,
      });
    }, 2000);
  };

  return (
    <div className={style.wrapper}>
      <div className={style.chatList}>
        <h2 className={style.title}>Ваши чаты</h2>
        {safeChats.length === 0 ? (
          <div className={style.emptyState}>
            <p>Нет активных диалогов</p>
          </div>
        ) : (
          safeChats.map((chat) => {
            const partner =
              chat?.partner ||
              chat?.members?.find(
                (m) => m && String(m._id) !== String(currentUser?.id)
              );

            const lastMsg = chat?.lastMessage?.content || "Нет сообщений";
            const unreadCount = chat?.unreadCount || 0;

            if (!partner) return null;
            console.log("chat partner:", partner);

            return (
              <div
                key={chat._id}
                className={`${style.chatCard} ${
                  selectedUserId === partner._id ? style.activeChat : ""
                }`}
                onClick={() => {
                  setSelectedUserId(partner._id);
                  navigate(`/messages?user=${partner._id}`);
                }}
              >
                <div className={style.avatarWrapper}>
                  {partner.avatar ? (
                    <img
                      src={`http://localhost:3000/${partner.avatar}`}
                      alt={partner.name}
                      className={style.avatar}
                    />
                  ) : (
                    <div className={style.avatarPlaceholder}>
                      {partner.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={style.chatInfo}>
                  <div className={style.name}>{partner.name}</div>
                  <div className={style.preview}>
                    {lastMsg.length > 40
                      ? lastMsg.slice(0, 40) + "..."
                      : lastMsg}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <span className={style.unreadBadge}>{unreadCount}</span>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className={style.chatRoom}>
        {selectedUserId ? (
          <>
            <div className={style.header}>
              {receiverInfo?.avatar && (
                <img
                  src={`http://localhost:3000/${receiverInfo.avatar}`}
                  alt="avatar"
                  className={style.avatar}
                />
              )}

              <div>
                <h3>{receiverInfo?.name || "Пользователь"}</h3>
                <p className={style.lastSeen}>
                  {receiverInfo?.lastSeen
                    ? `last seen: ${new Date(
                        receiverInfo.lastSeen
                      ).toLocaleString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "Нет данных о входе"}
                </p>
              </div>
            </div>

            <div className={style.chatBox}>
              {messages.map((msg) => {
                const isMine =
                  String(msg.sender?._id) === String(currentUser.id);
                return (
                  <div
                    key={msg._id}
                    className={`${style.messageRow} ${
                      isMine ? style.myMessage : style.theirMessage
                    }`}
                  >
                    <div className={style.messageBubble}>
                      {msg.content}
                      {isMine && (
                        <span className={style.statusIcon}>
                          {msg.read ? (
                            <DoneAllIcon
                              fontSize="small"
                              className={style.readIcon}
                            />
                          ) : (
                            <DoneIcon
                              fontSize="small"
                              className={style.unreadIcon}
                            />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {typing && (
                <div className={style.typingIndicator}>
                  {receiverInfo?.name || "Пользователь"} печатает...
                </div>
              )}

              <div ref={bottomRef}></div>
            </div>

            <div className={style.inputArea}>
              <input
                type="text"
                value={newMsg}
                onChange={handleTyping}
                placeholder="Введите сообщение"
              />
              <button onClick={handleSend}>Отправить</button>
            </div>
          </>
        ) : (
          <div className={style.selectPrompt}>Выберите чат слева</div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
