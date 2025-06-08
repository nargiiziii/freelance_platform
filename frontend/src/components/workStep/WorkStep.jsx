import React from "react";
import style from "./WorkStep.module.scss";

const WorkStep = ({ num, title, subtitle }) => {
  return (
    <div className={style.workStep}>
      <p className={style.num}>{num}</p>
      <p className={style.title}>{title}</p>
      <p className={style.subtitle}>{subtitle}</p>
    </div>
  );
};

export default WorkStep;
