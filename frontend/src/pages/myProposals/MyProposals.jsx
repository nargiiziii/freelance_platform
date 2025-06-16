import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyProposals, submitWork } from "../../redux/features/proposalSlice";
import style from "./MyProposals.module.scss";

const MyProposals = () => {
  const dispatch = useDispatch();
  const { myProposals, status, error } = useSelector((state) => state.proposal);
  const [selectedFile, setSelectedFile] = useState({});
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    dispatch(getMyProposals());
  }, [dispatch]);

  const handleFileChange = (proposalId, file) => {
    setSelectedFile((prev) => ({ ...prev, [proposalId]: file }));
  };

  const handleSubmit = async (proposalId, projectId) => {
    const file = selectedFile[proposalId];
    if (!file) return;

    setSubmitting((prev) => ({ ...prev, [proposalId]: true }));
    await dispatch(submitWork({ projectId, file }));
    await dispatch(getMyProposals());
    setSubmitting((prev) => ({ ...prev, [proposalId]: false }));
  };

  return (
    <div className={style.container}>
      <h2>Мои отклики</h2>
      {status === "loading" && <p>Загрузка...</p>}
      {error && <p className={style.error}>{error}</p>}
      {Array.isArray(myProposals) && myProposals.length === 0 ? (
        <p>Вы пока не отправляли откликов.</p>
      ) : (
        <ul className={style.list}>
          {myProposals.map((proposal) => (
            <li key={proposal._id} className={style.card}>
              <h3>{proposal.project?.title || "Проект удалён"}</h3>
              <p>
                <strong>Ваше сообщение:</strong> {proposal.coverLetter}
              </p>
              <p>
                <strong>Цена:</strong> {proposal.price}₽
              </p>
              <p>
                <strong>Статус:</strong>{" "}
                {proposal.status === "pending" && "⏳ На рассмотрении"}
                {proposal.status === "accepted" && "✅ Принят"}
                {proposal.status === "rejected" && "❌ Отклонён"}
                {proposal.status === "submitted" && "📤 Работа отправлена"}
              </p>

              {/* 📤 Отправка файла, если принято */}
              {proposal.status === "accepted" && (
                <div className={style.submitBlock}>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(proposal._id, e.target.files[0])}
                  />
                  <button
                    onClick={() => handleSubmit(proposal._id, proposal.project._id)}
                    disabled={submitting[proposal._id]}
                  >
                    {submitting[proposal._id] ? "Отправка..." : "📤 Отправить работу"}
                  </button>
                </div>
              )}

              {/* 🔗 Если работа уже отправлена — показать ссылку */}
              {proposal.status === "submitted" && proposal.workFile && (
                <p>
                  📎 Вы отправили файл:{" "}
                  <a
                    href={`http://localhost:3000/uploads/${proposal.workFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {proposal.workFile}
                  </a>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyProposals;
