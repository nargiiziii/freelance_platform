import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { submitWork } from "../../redux/features/proposalSlice";

const SubmitWorkModal = ({ projectId, onClose }) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);

  const handleSubmit = () => {
    if (!file) return;
    dispatch(submitWork({ projectId, file }))
      .unwrap()
      .then(async () => {
        const res = await fetch(
          `http://localhost:3000/api/proposals/project/${projectId}`
        );
        const updatedProposals = await res.json();
        window.dispatchEvent(
          new CustomEvent("proposalsUpdated", { detail: updatedProposals })
        );
        onClose();
      });
  };

  return (
    <div style={{ padding: 20, border: "1px solid gray" }}>
      <h3>Yerinə yetirilmiş işi göndər</h3>
      <input
        type="file"
        accept="*/*"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ marginBottom: 10 }}
      />
      <button onClick={handleSubmit}>📤 Göndər</button>
      <button onClick={onClose}>❌ Ləğv et</button>
    </div>
  );
};

export default SubmitWorkModal;
