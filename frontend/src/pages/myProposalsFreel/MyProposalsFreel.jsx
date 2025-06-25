import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyProposals, submitWork } from "../../redux/features/proposalSlice";
import { fetchUserReviews } from "../../redux/features/reviewSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import style from "./MyProposalsFreel.module.scss";
import ReviewForm from "../../components/reviewForm/ReviewForm";
import { removeNotification } from "../../redux/features/notificationSlice";

const MyProposalsFreel = () => {
  const dispatch = useDispatch();
  const { myProposals, status, error } = useSelector((state) => state.proposal);
  const { reviews } = useSelector((state) => state.reviews);

  const [selectedFile, setSelectedFile] = useState({});
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    dispatch(getMyProposals());
    dispatch(fetchUserReviews());
  }, [dispatch]);

  useEffect(() => {
    if (myProposals.length > 0) {
      const idsToRemove = [
        "msg",
        ...myProposals.map((p) => `acc-${p._id}`),
        ...myProposals.map((p) => `esc-${p._id}`),
      ];
      idsToRemove.forEach((id) => dispatch(removeNotification(id)));
    }
  }, [myProposals, dispatch]);

  const handleFileChange = (proposalId, file) => {
    setSelectedFile((prev) => ({ ...prev, [proposalId]: file }));
  };

  const handleSubmit = async (proposalId, projectId) => {
    const file = selectedFile[proposalId];
    if (!file) {
      toast.warn("Выберите файл перед отправкой.");
      return;
    }

    setSubmitting((prev) => ({ ...prev, [proposalId]: true }));

    try {
      await dispatch(submitWork({ projectId, file })).unwrap();
      toast.success("Работа успешно отправлена!");
      await dispatch(getMyProposals());
    } catch (err) {
      toast.error("Ошибка при отправке файла.");
    } finally {
      setSubmitting((prev) => ({ ...prev, [proposalId]: false }));
    }
  };

  return (
    <>
      <h2>Мои отклики</h2>
      <div className={style.container}>
        {status === "loading" && <p>Загрузка...</p>}
        {error && <p className={style.error}>{error}</p>}
        {Array.isArray(myProposals) && myProposals.length === 0 ? (
          <p>Вы пока не отправляли откликов.</p>
        ) : (
          <ul className={style.list}>
            {myProposals.map((proposal) => {
              const hasLeftReview = reviews.some(
                (rev) => rev.project === proposal.project?._id
              );

              const isProjectPaid =
                proposal.project?.status === "closed" &&
                proposal.project?.escrow?.status === "released";

              const cardStatusClass = isProjectPaid
                ? style.completed
                : proposal.status === "refunded"
                ? style.refunded
                : proposal.status === "rejected"
                ? style.rejected
                : style.inProgress;

              return (
                <li
                  key={proposal._id}
                  className={`${style.card} ${cardStatusClass}`}
                >
                  <div className={style.top}>
                    <div className={style.left}>
                      <h3>{proposal.project?.title || "Проект удалён"}</h3>
                      {isProjectPaid && (
                        <p className={style.statusPaid}>Проект оплачен</p>
                      )}
                      <p>
                        <strong>Ваше сообщение:</strong> {proposal.coverLetter}
                      </p>
                      <p>
                        <strong>Цена:</strong> {proposal.price}₽
                      </p>
                      <p>
                        <strong>Статус:</strong>{" "}
                        {proposal.status === "pending" && "На рассмотрении"}
                        {proposal.status === "accepted" && "Принят"}
                        {proposal.status === "rejected" && "Отклонён"}
                        {proposal.status === "submitted" && "Работа отправлена"}
                        {proposal.status === "refunded" && (
                          <span className={style.refundedLabel}>
                            Работа отклонена — средства возвращены
                          </span>
                        )}
                      </p>
                    </div>

                    <div className={style.right}>
                      {proposal.status === "accepted" && (
                        <div className={style.submitBlock}>
                          <label className={style.fileLabel}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 30 24"
                              fill="currentColor"
                            >
                              <path d="M12 16v-8m0 0l-3 3m3-3l3 3m9 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Нажмите для загрузки файла
                            <input
                              type="file"
                              onChange={(e) =>
                                handleFileChange(
                                  proposal._id,
                                  e.target.files[0]
                                )
                              }
                            />
                          </label>

                          <button
                            onClick={() =>
                              handleSubmit(proposal._id, proposal.project._id)
                            }
                            disabled={submitting[proposal._id]}
                          >
                            {submitting[proposal._id]
                              ? "Отправка..."
                              : "Отправить работу"}
                          </button>
                        </div>
                      )}

                      {proposal.status === "submitted" && proposal.workFile && (
                        <div className={style.submittedBlock}>
                          <p className={style.fileSent}>
                            Вы отправили файл:{" "}
                            <a
                              href={`http://localhost:3000/uploads/${proposal.workFile}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {proposal.workFile}
                            </a>
                          </p>

                          {isProjectPaid && (
                            <p className={style.completedLabel}>
                              ✔ Работа завершена — оплата получена
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {isProjectPaid && !hasLeftReview && (
                    <div className={style.reviewBlock}>
                      <h4>Оцените заказчика:</h4>
                      <ReviewForm
                        toUserId={proposal.project?.employer?._id}
                        projectId={proposal.project?._id}
                        onSubmitSuccess={() => dispatch(fetchUserReviews())}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
};

export default MyProposalsFreel;
