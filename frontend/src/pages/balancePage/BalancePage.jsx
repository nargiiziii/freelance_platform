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
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    dispatch(getProfile());

    axios
      .get("/escrow/history")
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error("Tarix yüklənərkən xəta baş verdi", err));
  }, [dispatch]);

  const handleTopUp = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;

    try {
      setLoading(true);
      await dispatch(topUpBalance(Number(amount))).unwrap();
      toast.success("Balans uğurla artırıldı!");
      setAmount("");

      const res = await axios.get("/escrow/history");
      setTransactions(res.data);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Balans artırılarkən xəta baş verdi";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Siz daxil olmamısınız</p>;
  useNotificationCleaner("esc");

  return (
    <div className={style.balancePage}>
      <h2 className={style.title}>Balans</h2>
      <p className={style.balanceAmount}>
        Cari balans:{" "}
        <span>
          {typeof user.balance === "number" ? user.balance.toFixed(2) : "0.00"}₼
        </span>
      </p>
      <div className={style.topupForm}>
        <input
          type="number"
          placeholder="Məbləği daxil edin"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleTopUp} disabled={loading}>
          {loading ? "Yüklənir..." : "Balansı artır"}
        </button>
      </div>

      <h3 className={style.subtitle}>Əməliyyatlar tarixi</h3>
      <div className={style.tableWrapper}>
        <table>
          <thead>
            <tr>
              <th>Tarix</th>
              <th>Kimdən</th>
              <th>Kimə</th>
              <th>Məbləğ</th>
              <th>Növ</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  Heç bir əməliyyat yoxdur
                </td>
              </tr>
            ) : (
              transactions.map((t, idx) => {
                const isIncoming = t.direction === "income";
                const colorClass = isIncoming ? style.green : style.red;

                return (
                  <tr key={idx}>
                    <td>{new Date(t.date).toLocaleString()}</td>
                    <td>{t.from || "—"}</td>
                    <td>{t.to || "—"}</td>
                    <td className={colorClass}>{t.amount}₼</td>
                    <td>{t.type}</td>
                    <td>{t.status}</td>
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
