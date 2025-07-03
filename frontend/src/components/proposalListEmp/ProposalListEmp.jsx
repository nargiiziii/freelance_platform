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
        const result = await dispatch(getProposalsByProject(projectId)).unwrap();
        setLocalProposals(result);
      } catch (err) {
        console.error("Təkliflərin yüklənməsi zamanı xəta:", err);
        toast.error("❌ Təklifləri yükləmək mümkün olmadı");
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
        toast.success("✅ Təklif qəbul edildi");

        if (onProjectUpdated) {
          try {
            const res = await axios.get(`/projects/${projectId}`);
            onProjectUpdated(res.data);
          } catch (err) {
            console.error("❌ Layihənin yenilənməsi zamanı xəta:", err);
          }
        }
      })
      .catch((err) => {
        const message =
          typeof err === "string"
            ? err
            : err?.message || "❌ Təklifi qəbul etmək mümkün olmadı";
        toast.error(message);
      });
  };

  const handleReleaseFunds = async (proposal) => {
    const escrow = proposal.project?.escrow;
    if (!escrow || escrow.status !== "funded") return;

    try {
      const updatedEscrow = await dispatch(releaseFunds(escrow._id)).unwrap();

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
      toast.success("✅ Təklif qəbul edildi və ödəniş edildi");

      if (onProjectUpdated) {
        try {
          const res = await axios.get(`/projects/${projectId}`);
          onProjectUpdated(res.data);
        } catch (err) {
          console.error("❌ Layihənin yenilənməsi zamanı xəta:", err);
        }
      }
    } catch (err) {
      console.error("Ödəniş zamanı xəta:", err);
      toast.error("❌ Ödənişi həyata keçirmək mümkün olmadı");
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
        toast.success("💰 Vəsait işəgötürənə qaytarıldı");
      })
      .catch((err) => {
        console.error("Vəsaitin qaytarılması zamanı xəta:", err);
        toast.error("❌ Vəsaiti qaytarmaq mümkün olmadı");
      });
  };

  const activeProposals = localProposals.filter((p) => p.status !== "rejected");
  const rejectedProposals = localProposals.filter((p) => p.status === "rejected");

  return (
    <div className={style.proposalList}>
      {localProposals.length > 0 && <h4 className={style.heading}>Təkliflər</h4>}
      {localProposals.length === 0 ? (
        <p className={style.noProposals}>Hələlik heç bir təklif yoxdur</p>
      ) : (
        <>
          <div className={style.proposalGrid}>
            {activeProposals.map((proposal) => {
              const escrow = proposal.project?.escrow;

              return (
                <div key={proposal._id} className={style.proposalCard}>
                  <div className={style.infoBlock}>
                    <p>
                      <strong>Freelancer:</strong>{" "}
                      {proposal.freelancer?.name || "Ad göstərilməyib"}
                    </p>
                    <p>
                      <strong>Məktub:</strong> {proposal.coverLetter}
                    </p>
                    <p>
                      <strong>Qiymət:</strong> {proposal.price}₽
                    </p>
                    <p>
                      <strong>Status:</strong> {proposal.status}
                    </p>
                  </div>

                  {proposal.status === "pending" && (
                    <div className={style.buttons}>
                      <button
                        className={style.acceptButton}
                        onClick={() => handleAccept(proposal._id)}
                      >
                        ✅ Qəbul et
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
                              console.error("İmtina zamanı xəta:", err);
                              alert("Xəta: təklifi imtina etmək mümkün olmadı");
                            });
                        }}
                      >
                        ❌ İmtina et
                      </button>
                    </div>
                  )}

                  {["submitted", "accepted"].includes(proposal.status) &&
                    proposal.workFile &&
                    proposal.project?.status !== "closed" && (
                      <div className={style.workBlock}>
                        <p>
                          <strong>Freelancer işi təhvil verib:</strong>
                        </p>
                        <a
                          href={`http://localhost:3000/api/proposals/download/${proposal.workFile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={style.downloadLink}
                        >
                          📥 Faylı yüklə
                        </a>

                        {escrow ? (
                          <>
                            {escrow.status === "funded" ? (
                              <div style={{ marginTop: 10 }}>
                                <button
                                  className={style.acceptButton}
                                  onClick={() => handleReleaseFunds(proposal)}
                                >
                                  Qəbul et və ödə
                                </button>
                                <button
                                  className={style.rejectButton}
                                  onClick={() => handleRefund(proposal)}
                                  style={{ marginLeft: "10px" }}
                                >
                                  İmtina et və pulu qaytar
                                </button>
                              </div>
                            ) : escrow.status === "refunded" ? (
                              <p style={{ color: "blue", marginTop: 10 }}>
                                💰 Vəsait qaytarılıb
                              </p>
                            ) : (
                              <p style={{ color: "green", marginTop: 10 }}>
                                ✅ İş ödənildi
                              </p>
                            )}
                          </>
                        ) : (
                          <p style={{ color: "red", marginTop: 10 }}>
                            ❗ Escrow tapılmadı
                          </p>
                        )}
                      </div>
                    )}
                </div>
              );
            })}
          </div>

          {rejectedProposals.length > 0 && (
            <div className={style.proposalGrid} style={{ marginTop: "40px" }}>
              <h4 className={style.heading}>İmtina olunmuş təkliflər</h4>
              {rejectedProposals.map((proposal) => (
                <div
                  key={proposal._id}
                  className={style.proposalCard}
                  style={{ backgroundColor: "#f0f0f0", color: "#999" }}
                >
                  <div className={style.infoBlock}>
                    <p>
                      <strong>Freelancer:</strong>{" "}
                      {proposal.freelancer?.name || "Ad göstərilməyib"}
                    </p>
                    <p>
                      <strong>Məktub:</strong> {proposal.coverLetter}
                    </p>
                    <p>
                      <strong>Qiymət:</strong> {proposal.price}₽
                    </p>
                    <p>
                      <strong>Status:</strong> {proposal.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProposalListEmp;
