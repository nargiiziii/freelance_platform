// ✅ Обновлённый ProposalList (аккуратный стиль)
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { acceptProposal } from "../../redux/features/proposalSlice";
import { getEmployerProjects } from "../../redux/features/projectSlice";
import style from "./ProposalList.module.scss";

const ProposalList = ({ proposals = [] }) => {
  const dispatch = useDispatch();
  const [localProposals, setLocalProposals] = useState(proposals);

  useEffect(() => {
    setLocalProposals(proposals);
  }, [proposals]);

  const handleAccept = (proposalId) => {
    dispatch(acceptProposal({ proposalId }))
      .unwrap()
      .then(({ proposal: updated }) => {
        const updatedList = localProposals.map((p) =>
          p._id === updated._id ? { ...updated } : { ...p, status: "rejected" }
        );
        setLocalProposals(updatedList);
        dispatch(getEmployerProjects());
      })
      .catch((err) => {
        console.error("Ошибка при принятии отклика:", err);
        alert("Ошибка: не удалось принять отклик");
      });
  };

  return (
    <div className={style.proposalList}>
      {localProposals.length > 0 && <h4 className={style.heading}>Отклики</h4>}
      {localProposals.length === 0 ? (
        <p className={style.noProposals}>Откликов пока нет</p>
      ) : (
        localProposals.map((proposal) => (
          <div key={proposal._id} className={style.proposalCard}>
            <div className={style.infoBlock}>
              <p>
                <strong>Фрилансер:</strong> {proposal.freelancer?.name || "Без имени"}
              </p>
              <p>
                <strong>Письмо:</strong> {proposal.coverLetter}
              </p>
              <p>
                <strong>Цена:</strong> {proposal.price}₽
              </p>
              <p>
                <strong>Статус:</strong> {proposal.status}
              </p>
            </div>
            {proposal.status === "pending" && (
              <button className={style.acceptButton} onClick={() => handleAccept(proposal._id)}>
                ✅ Принять
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ProposalList;
