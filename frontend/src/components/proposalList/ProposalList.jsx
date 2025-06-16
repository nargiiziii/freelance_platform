import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  acceptProposal,
  rejectProposal,
} from "../../redux/features/proposalSlice";
import { getEmployerProjects } from "../../redux/features/projectSlice";
import style from "./ProposalList.module.scss";
import { releaseFunds } from "../../redux/features/escrowSlice";

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
        localProposals
          .filter((proposal) => proposal.status !== "rejected")
          .map((proposal) => {
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
                            console.error(
                              "Ошибка при отклонении отклика:",
                              err
                            );
                            alert("Ошибка: не удалось отклонить отклик");
                          });
                      }}
                    >
                      ❌ Отклонить
                    </button>
                  </div>
                )}

                {proposal.status === "submitted" && proposal.workFile && (
                  <div>
                    <strong>Фрилансер сдал работу:</strong>
                    <br />
                    <a
                      href={`http://localhost:3000/api/proposals/download/${proposal.workFile}`}
                    >
                      📥 Скачать файл
                    </a>

                    {/* Обёртка — самовызывающаяся функция */}
                    {(() => {
                      const escrow =
                        proposal.project?.escrow || proposal.escrow;

                      if (!escrow) {
                        return (
                          <p style={{ color: "red", marginTop: 10 }}>
                            ❗ Escrow не найден — кнопка скрыта
                          </p>
                        );
                      }

                      if (escrow.status !== "funded") {
                        return (
                          <p style={{ color: "orange", marginTop: 10 }}>
                            💡 Средства уже переведены
                          </p>
                        );
                      }

                      return (
                        <button
                          className={style.acceptButton}
                          onClick={() => {
                            dispatch(releaseFunds(escrow._id))
                              .unwrap()
                              .then((updatedEscrow) => {
                                const updatedList = localProposals.map((p) => {
                                  const currentEscrow =
                                    p.project?.escrow || p.escrow;
                                  if (
                                    currentEscrow &&
                                    currentEscrow._id ===
                                      updatedEscrow.escrow._id
                                  ) {
                                    // Обновим статус на "released"
                                    const updatedEscrowData = {
                                      ...currentEscrow,
                                      status: "released",
                                    };

                                    return {
                                      ...p,
                                      project: {
                                        ...p.project,
                                        escrow: updatedEscrowData,
                                      },
                                      escrow: updatedEscrowData,
                                    };
                                  }
                                  return p;
                                });
                                setLocalProposals(updatedList);
                              })
                              .catch((err) => {
                                console.error("❌ releaseFunds error:", err);
                                alert("Ошибка при переводе средств");
                              });
                          }}
                        >
                          💸 Принять работу и оплатить
                        </button>
                      );
                    })()}
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
