// src/components/sendProposalModal/SendProposalModal.jsx
import React, { useState } from "react";
import style from "./SendProposalModal.module.scss";
import { useDispatch } from "react-redux";
import { createProposal } from "../../redux/features/proposalSlice";

const SendProposalModal = ({ project, onClose }) => {
  const dispatch = useDispatch();
  const [coverLetter, setCoverLetter] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      createProposal({
        projectId: project._id,
        coverLetter,
        price: Number(price),
      })
    );
    onClose();
  };

  return (
    <div className={style.backdrop}>
      <div className={style.modal}>
        <h3>Отклик на проект: {project.title}</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            required
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Сопроводительное письмо"
          />
          <input
            type="number"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Предложенная цена"
          />
          <div className={style.buttons}>
            <button type="submit">Отправить</button>
            <button type="button" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendProposalModal;
