import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  acceptProposal,
  rejectProposal,
  getProposalsByProject,
} from "../../redux/features/proposalSlice";
import { getEmployerProjects } from "../../redux/features/projectSlice";
import { releaseFunds, refundFunds } from "../../redux/features/escrowSlice";
import style from "./ProposalList.module.scss";

const ProposalList = ({ projectId }) => {
  const dispatch = useDispatch();
  const [localProposals, setLocalProposals] = useState([]);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const result = await dispatch(getProposalsByProject(projectId)).unwrap();
        setLocalProposals(result);
      } catch (err) {
        console.error("Ошибка загрузки откликов:", err);
      }
    };

    fetchProposals();
  }, [dispatch, projectId]);

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

  const handleReleaseFunds = (proposal) => {
    const escrow = proposal.project?.escrow;
    if (!escrow || escrow.status !== "funded") return;

    dispatch(releaseFunds(escrow._id))
      .unwrap()
      .then((updatedEscrow) => {
        const updatedList = localProposals.map((p) => {
          if (p.project?.escrow?._id === updatedEscrow.escrow._id) {
            return {
              ...p,
              project: {
                ...p.project,
                escrow: { ...escrow, status: "released" },
              },
              status: "released",
            };
          }
          return p;
        });
        setLocalProposals(updatedList);
      })
      .catch((err) => {
        console.error("Ошибка при переводе средств:", err);
        alert("Не удалось перевести оплату");
      });
  };

  const handleRefund = (proposal) => {
    const escrow = proposal.project?.escrow;
    if (!escrow || escrow.status !== "funded") return;

    dispatch(refundFunds(escrow._id))
      .unwrap()
      .then((updatedEscrow) => {
        const updatedList = localProposals.map((p) => {
          if (p.project?.escrow?._id === updatedEscrow.escrow._id) {
            return {
              ...p,
              project: {
                ...p.project,
                escrow: { ...escrow, status: "refunded" },
              },
              status: "refunded",
            };
          }
          return p;
        });
        setLocalProposals(updatedList);
        alert("💰 Средства возвращены работодателю");
      })
      .catch((err) => {
        console.error("Ошибка при возврате средств:", err);
        alert("Не удалось вернуть средства");
      });
  };

  return (
    <div className={style.proposalList}>
      {localProposals.length > 0 && <h4 className={style.heading}>Отклики</h4>}
      {localProposals.length === 0 ? (
        <p className={style.noProposals}>Откликов пока нет</p>
      ) : (
        localProposals
          .filter((proposal) => proposal.status !== "rejected")
          .map((proposal) => {
            const escrow = proposal.project?.escrow;

            return (
              <div key={proposal._id} className={style.proposalCard}>
                <div className={style.infoBlock}>
                  <p>
                    <strong>Фрилансер:</strong>{" "}
                    {proposal.freelancer?.name || "Без имени"}
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
                  <div className={style.buttons}>
                    <button
                      className={style.acceptButton}
                      onClick={() => handleAccept(proposal._id)}
                    >
                      ✅ Принять
                    </button>
                    <button
                      className={style.rejectButton}
                      onClick={() => {
                        dispatch(rejectProposal({ proposalId: proposal._id }))
                          .unwrap()
                          .then(({ proposal: updated }) => {
                            const updatedList = localProposals.map((p) =>
                              p._id === updated._id
                                ? { ...p, status: updated.status }
                                : p
                            );
                            setLocalProposals(updatedList);
                          })
                          .catch((err) => {
                            console.error("Ошибка при отклонении:", err);
                            alert("Ошибка: не удалось отклонить отклик");
                          });
                      }}
                    >
                      ❌ Отклонить
                    </button>
                  </div>
                )}

                {proposal.status === "submitted" && proposal.workFile && (
                  <div className={style.workBlock}>
                    <p>
                      <strong>Фрилансер сдал работу:</strong>
                    </p>
                    <a
                      href={`http://localhost:3000/api/proposals/download/${proposal.workFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={style.downloadLink}
                    >
                      📥 Скачать файл
                    </a>

                    {escrow ? (
                      <>
                        {escrow.status === "funded" ? (
                          <div style={{ marginTop: 10 }}>
                            <button
                              className={style.acceptButton}
                              onClick={() => handleReleaseFunds(proposal)}
                            >
                              💸 Принять работу и оплатить
                            </button>
                            <button
                              className={style.rejectButton}
                              onClick={() => handleRefund(proposal)}
                              style={{ marginLeft: "10px" }}
                            >
                              ⛔ Отклонить и вернуть деньги
                            </button>
                          </div>
                        ) : escrow.status === "refunded" ? (
                          <p style={{ color: "blue", marginTop: 10 }}>
                            💰 Средства возвращены
                          </p>
                        ) : (
                          <p style={{ color: "green", marginTop: 10 }}>
                            ✅ Работа оплачена
                          </p>
                        )}
                      </>
                    ) : (
                      <p style={{ color: "red", marginTop: 10 }}>
                        ❗ Escrow не найден
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
      )}
    </div>
  );
};

export default ProposalList;
