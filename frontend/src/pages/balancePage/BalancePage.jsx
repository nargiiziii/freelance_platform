import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { topUpBalance, getProfile } from "../../redux/features/authSlice";
import axios from "../../axiosInstance";
import style from "./BalancePage.module.scss";
import { toast } from "react-toastify";
import useNotificationCleaner from "../../hooks/useNotificationCleaner";

function BalancePage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    dispatch(getProfile());

    axios
      .get("/escrow/history")
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error("Ошибка загрузки истории", err));
  }, [dispatch]);

  const handleTopUp = async () => {
    try {
      setLoading(true);
      setMessage("");
      await dispatch(topUpBalance(Number(amount))).unwrap();
      toast.success("Balance successfully replenished!");
      setAmount(0);
    } catch (err) {
      const msg = err?.response?.data?.message || "Error while replenishing";
      toast.error(msg);
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Вы не авторизованы</p>;
  useNotificationCleaner("esc");

  return (
    <div className={style.balanceContainer}>
      <h2 className={style.heading}> Ваш баланс</h2>

      <p className={style.balanceText}>
        Текущий баланс: <strong>{user.balance} монет</strong>
      </p>

      <div className={style.inputGroup}>
        <label htmlFor="amount">Сумма пополнения:</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <button
        onClick={handleTopUp}
        className={style.topUpButton}
        disabled={loading || amount <= 0}
      >
        {loading ? "Пополнение..." : "Пополнить баланс"}
      </button>

      {message && <p className={style.message}>{message}</p>}

      <h3 className={style.subheading}>🧾 История транзакций</h3>
      <div className={style.tableWrapper}>
        <table className={style.table}>
          <thead>
            <tr>
              <th>Дата</th>
              <th>От</th>
              <th>Кому</th>
              <th>Сумма</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  className={style.tableCell}
                  colSpan="5"
                  style={{ textAlign: "center" }}
                >
                  Нет транзакций
                </td>
              </tr>
            ) : (
              transactions.map((t, idx) => {
                const isIncome = t.direction === "income";
                const colorClass = isIncome ? style.greenText : style.redText;

                return (
                  <tr key={idx}>
                    <td className={style.tableCell}>{t.date}</td>
                    <td className={style.tableCell}>{t.from}</td>
                    <td className={style.tableCell}>{t.to}</td>
                    <td className={`${style.tableCell} ${colorClass}`}>
                      {t.amount}
                    </td>
                    <td className={style.tableCell}>{t.status}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BalancePage;
