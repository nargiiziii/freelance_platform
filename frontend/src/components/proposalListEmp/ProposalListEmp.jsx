import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  acceptProposal,
  rejectProposal,
  getProposalsByProject,
  getMyProposals,
} from "../../redux/features/proposalSlice";
import { getEmployerProjects } from "../../redux/features/projectSlice";
import { releaseFunds, refundFunds } from "../../redux/features/escrowSlice";
import { getProfile } from "../../redux/features/authSlice";
import style from "./ProposalListEmp.module.scss";
import { toast } from "react-toastify";

import axios from "../../axiosInstance";

const ProposalListEmp = ({ projectId, onProjectUpdated }) => {
  const dispatch = useDispatch();
  const [localProposals, setLocalProposals] = useState([]);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const result = await dispatch(
          getProposalsByProject(projectId)
        ).unwrap();
        setLocalProposals(result);
      } catch (err) {
        console.error("Ошибка загрузки откликов:", err);
        toast.error("❌ Не удалось загрузить отклики");
      }
    };

    fetchProposals();
  }, [dispatch, projectId]);

  const handleAccept = (proposalId) => {
    dispatch(acceptProposal({ proposalId }))
      .unwrap()
      .then(async ({ proposal: updated }) => {
        const updatedList = localProposals.map((p) =>
          p._id === updated._id ? { ...updated } : { ...p, status: "rejected" }
        );
        setLocalProposals(updatedList);
        dispatch(getEmployerProjects());
        dispatch(getMyProposals());
        toast.success("✅ Отклик принят");

        if (onProjectUpdated) {
          try {
            const res = await axios.get(`/projects/${projectId}`);
            onProjectUpdated(res.data);
          } catch (err) {
            console.error("❌ Ошибка при обновлении проекта:", err);
          }
        }
      })
      .catch((err) => {
        const message =
          typeof err === "string"
            ? err
            : err?.message || "❌ Не удалось принять отклик";
        toast.error(message);
      });
  };

  const handleReleaseFunds = async (proposal) => {
    const escrow = proposal.project?.escrow;
    if (!escrow || escrow.status !== "funded") return;

    try {
      const updatedEscrow = await dispatch(releaseFunds(escrow._id)).unwrap();

      // 🔄 Обновляем локальные отклики
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

      dispatch(getProfile());
      dispatch(getMyProposals());
      toast.success("✅ Отклик принят");

      // 🆕 Добавляем запрос на обновление проекта и передаём в ProjectDetails
      if (onProjectUpdated) {
        try {
          const res = await axios.get(`/projects/${projectId}`);
          onProjectUpdated(res.data); // 🔁 обновляем данные проекта в ProjectDetails
        } catch (err) {
          console.error("❌ Ошибка при обновлении проекта:", err);
        }
      }
    } catch (err) {
      console.error("Ошибка при переводе средств:", err);
      toast.error("❌ Не удалось перевести оплату");
    }
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
        toast.success("💰 Средства возвращены работодателю");
      })
      .catch((err) => {
        console.error("Ошибка при возврате средств:", err);
        toast.error("❌ Не удалось вернуть средства");
      });
  };

  const activeProposals = localProposals.filter((p) => p.status !== "rejected");
  const rejectedProposals = localProposals.filter(
    (p) => p.status === "rejected"
  );

  return (
    <div className={style.proposalList}>
      {localProposals.length > 0 && <h4 className={style.heading}>Отклики</h4>}
      {localProposals.length === 0 ? (
        <p className={style.noProposals}>Откликов пока нет</p>
      ) : (
        <>
          <div className={style.proposalGrid}>
            {activeProposals.map((proposal) => {
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

                  {["submitted", "accepted"].includes(proposal.status) &&
                    proposal.workFile &&
                    proposal.project?.status !== "closed" && (
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
                                Принять и оплатить
                                </button>
                                <button
                                  className={style.rejectButton}
                                  onClick={() => handleRefund(proposal)}
                                  style={{ marginLeft: "10px" }}
                                >
                                  Отклонить и вернуть деньги
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
            })}
          </div>
          <div className={style.proposalGrid}>
            {rejectedProposals.length > 0 && (
              <div style={{ marginTop: "40px" }}>
                <h4 className={style.heading}>Отклонённые отклики</h4>
                {rejectedProposals.map((proposal) => (
                  <div
                    key={proposal._id}
                    className={style.proposalCard}
                    style={{ backgroundColor: "#f0f0f0", color: "#999" }}
                  >
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProposalListEmp;
