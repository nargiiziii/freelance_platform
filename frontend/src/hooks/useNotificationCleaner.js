// useNotificationCleaner.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeNotification } from "../redux/features/notificationSlice";
import { useLocation } from "react-router-dom";

/**
 * Удаляет уведомления с указанными ID или автоматически по совпадению с текущим путём.
 * @param {string[]|null} ids - Массив ID или null для автоматического удаления по pathname
 */
const useNotificationCleaner = (ids = null) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const allNotifications = useSelector((state) => state.notifications.list);

  useEffect(() => {
    if (Array.isArray(ids) && ids.length > 0) {
      ids.forEach((id) => dispatch(removeNotification(id)));
    } else {
      // Автоматически удаляем, если pathname совпадает с link
      allNotifications.forEach((n) => {
        if (n.link === location.pathname) {
          dispatch(removeNotification(n.id));
        }
      });
    }
  }, [location.pathname]);
};

export default useNotificationCleaner;
