import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { submitWork } from "../../redux/features/projectSlice";

const SubmitWorkModal = ({ projectId, onClose }) => {
  const dispatch = useDispatch();
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    if (!url) return;
    dispatch(submitWork({ projectId, submittedFileUrl: url }));
    onClose();
  };

  return (
    <div style={{ padding: 20, border: "1px solid gray" }}>
      <h3>Отправить выполненную работу</h3>
      <input
        type="text"
        placeholder="Ссылка на файл (картинку, zip и т.д.)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <button onClick={handleSubmit}>Отправить</button>
      <button onClick={onClose}>Отмена</button>
    </div>
  );
};

export default SubmitWorkModal;