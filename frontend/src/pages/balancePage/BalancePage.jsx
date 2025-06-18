import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { topUpBalance } from "../../redux/features/authSlice";
import { useEffect } from "react";
import { getProfile } from "../../redux/features/authSlice";

function BalancePage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
                                
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  const handleTopUp = async () => {
    try {
      setLoading(true);
      setMessage("");
      await dispatch(topUpBalance(Number(amount))).unwrap();
      setMessage("Баланс успешно пополнен!");
      setAmount(0);
    } catch (err) {
      setMessage(err || "Ошибка при пополнении");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Вы не авторизованы</p>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">💰 Ваш баланс</h2>

      <p className="text-lg mb-4">
        Текущий баланс: <strong>{user.balance} монет</strong>
      </p>

      <div className="mb-4">
        <label htmlFor="amount" className="block font-medium">
          Сумма пополнения:
        </label>
        <input
          type="number"
          id="amount"
          className="mt-1 p-2 border rounded w-full"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <button
        onClick={handleTopUp}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        disabled={loading || amount <= 0}
      >
        {loading ? "Пополнение..." : "Пополнить баланс"}
      </button>

      {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
    </div>
  );
}

export default BalancePage;
