import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "../../axiosInstance";
import io from "socket.io-client";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import style from "./ChatRoom.module.scss";
import { fetchChats } from "../../redux/features/messageSlice";
import useNotificationCleaner from "../../hooks/useNotificationCleaner";

const socket = io("http://localhost:3000", { withCredentials: true });

const ChatRoom = () => {
  useNotificationCleaner("msg");

  const { userId } = useParams();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (currentUser?.id) {
      socket.emit("join", currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const chatRes = await axios.post("/messages/create", {
          receiverId: userId,
        });
        const cId = chatRes.data._id;
        setChatId(cId);

        const msgs = await axios.get(`/messages/chats/${cId}/messages`);
        setMessages(msgs.data);

        const userRes = await axios.get(`/users/${userId}`);
        setReceiverInfo(userRes.data);

        socket.emit("markAsRead", {
          chatId: cId,
          reader: currentUser.id,
        });

        dispatch(fetchChats());
      } catch (err) {
        console.error("Ошибка загрузки чата:", err);
      }
    };

    fetchChat();
  }, [userId, currentUser.id, dispatch]);

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
      if (sender === userId) setTyping(true);
    });

    socket.on("stopTyping", ({ sender }) => {
      if (sender === userId) setTyping(false);
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
  }, [chatId, userId, currentUser.id]);

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
        receiver: userId,
      });

      socket.emit("stopTyping", {
        chatId,
        sender: currentUser.id,
        receiver: userId,
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
      receiver: userId,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId,
        sender: currentUser.id,
        receiver: userId,
      });
    }, 2000);
  };

  return (
    <div className={style.chatWrapper}>
      <div className={style.fixedHeader}>
        <div className={style.userInfo}>
          {receiverInfo?.avatar && (
            <img
              src={receiverInfo.avatar}
              alt="avatar"
              className={style.avatar}
            />
          )}
          <h2 className={style.chatHeader}>
            {receiverInfo?.name || "пользователем"}
          </h2>
        </div>
      </div>

      <div className={style.chatBox}>
        {messages.map((msg) => {
          const isMine = String(msg.sender?._id) === String(currentUser.id);
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
                      <DoneIcon fontSize="small" className={style.unreadIcon} />
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
          className={style.inputField}
        />
        <button onClick={handleSend} className={style.sendButton}>
          Отправить
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
