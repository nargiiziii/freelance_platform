import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./NotificationDropdown.module.scss";
import {
  removeNotification,
  addNotification,
} from "../../redux/features/notificationSlice";
import { getMyProposals } from "../../redux/features/proposalSlice";
import { fetchChats } from "../../redux/features/messageSlice";
import { getEmployerProjects } from "../../redux/features/projectSlice";

const NotificationDropdown = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const chats = useSelector((state) => state.messages.chats);
  const proposals = useSelector((state) => state.proposal.myProposals);
  const employerProjects = useSelector(
    (state) => state.projects.employerProjects
  );
  const globalNotifications = useSelector((state) => state.notifications.list);

  const dismissedRef = useRef(
    new Set(
      (() => {
        const stored = localStorage.getItem("dismissedNotifications");
        return stored ? JSON.parse(stored) : [];
      })()
    )
  );

  const persistDismissed = () => {
    localStorage.setItem(
      "dismissedNotifications",
      JSON.stringify([...dismissedRef.current])
    );
  };

  const generatedNotifications = useMemo(() => {
    const list = [];
    const projects = employerProjects || [];

    const msgId = `msg-${role}`;
    const hasNewMessage = chats.some((c) => c.unreadCount > 0);
    if (hasNewMessage) {
      list.push({
        id: msgId,
        text: "📩 Новое сообщение",
        link: "/messages",
      });
    }

    if (role === "freelancer") {
      proposals.forEach((p) => {
        if (p.status === "accepted") {
          list.push({
            id: `acc-${p._id}`,
            text: "✅ Отклик принят",
            link: "/my-proposals",
          });
        }

        if (p.project?.escrow?.status === "released") {
          list.push({
            id: `esc-${p._id}`,
            text: "💰 Получено $" + p.project.escrow.amount,
            link: "/escrow",
          });
        }
      });
    }

    if (role === "employer") {
      projects.forEach((proj) => {
        const hasProposals =
          (proj.proposals && proj.proposals.length > 0) ||
          proj.proposalsLength > 0;

        if (hasProposals) {
          list.push({
            id: `new-${proj._id}`,
            text: "📝 Новый отклик",
            link: `/employer/project/${proj._id}`,
          });
        }

        if (proj.status?.toLowerCase() === "submitted") {
          list.push({
            id: `sub-${proj._id}`,
            text: "📦 Работа сдана",
            link: `/employer/project/${proj._id}`,
          });
        }
      });
    }

    return list;
  }, [chats, proposals, employerProjects, role]);

  useEffect(() => {
    const seen = new Set(globalNotifications.map((n) => n.id));

    generatedNotifications.forEach((n) => {
      const alreadyDismissed = dismissedRef.current.has(n.id);
      const alreadyAdded = seen.has(n.id);

      if (!alreadyDismissed && !alreadyAdded) {
        dispatch(addNotification(n));
      }
    });
  }, [generatedNotifications, globalNotifications, dispatch]);

  useEffect(() => {
    globalNotifications.forEach((n) => {
      if (location.pathname === n.link) {
        dispatch(removeNotification(n.id));
        dismissedRef.current.add(n.id);
        persistDismissed();
      }
    });
  }, [location.pathname, globalNotifications, dispatch]);

  const notifications = useMemo(() => {
    const seen = new Set();
    return globalNotifications
      .filter((n) => generatedNotifications.some((g) => g.id === n.id))
      .filter((n) => {
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      });
  }, [generatedNotifications, globalNotifications]);

  const handleClick = (id, link) => {
    dispatch(removeNotification(id));
    dismissedRef.current.add(id);
    persistDismissed();
    setIsOpen(false);
    navigate(link);
  };

  const unreadCount = notifications.length;

  useEffect(() => {
    dispatch(fetchChats());
    if (role === "freelancer") {
      dispatch(getMyProposals());
    }
    if (role === "employer") {
      dispatch(getEmployerProjects());
    }
  }, [dispatch, role]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchChats());
      if (role === "freelancer") {
        dispatch(getMyProposals());
      }
      if (role === "employer") {
        dispatch(getEmployerProjects());
      }
    }, 30000); // каждые 30 секунд

    return () => clearInterval(interval); // очистка таймера при размонтировании
  }, [dispatch, role]);

  return (
    <div className={styles.container} ref={ref}>
      <div className={styles.icon} onClick={() => setIsOpen(!isOpen)}>
        <Bell />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <h4 className={styles.title}>Уведомления</h4>
          {notifications.slice(0, 5).map((n) => (
            <div
              key={n.id}
              className={styles.item}
              onClick={() => handleClick(n.id, n.link)}
              style={{ cursor: "pointer" }}
            >
              {n.text}
            </div>
          ))}
          {notifications.length === 0 && (
            <p className={styles.empty}>Нет новых уведомлений</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
