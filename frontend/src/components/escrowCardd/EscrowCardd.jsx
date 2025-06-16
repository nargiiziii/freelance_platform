import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { completeProject } from "../../redux/features/projectSlice";

const EscrowCardd = ({ project }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleComplete = () => {
    dispatch(completeProject(project._id));
  };

  const escrow = project.escrow;
  const status = escrow?.status;

  return (
    <div style={{ padding: 15, border: "1px dashed gray", marginTop: 10 }}>
      <h4>Escrow</h4>
      {escrow ? (
        <>
          <p><strong>Сумма:</strong> ${escrow.amount}</p>
          <p><strong>Статус:</strong> {status}</p>
          {user?.role === "employer" && project.status === "submitted" && (
            <button onClick={handleComplete}>Завершить проект и выплатить</button>
          )}
        </>
      ) : (
        <p>Escrow пока не создан</p>
      )}
    </div>
  );
};

export default EscrowCardd;