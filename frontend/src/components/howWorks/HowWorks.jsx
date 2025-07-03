import React from "react";
import style from "./HowWorks.module.scss";
import WorkStep from "../workStep/WorkStep";
import Line from "../line/Line";

const HowWorks = () => {
  return (
    <div className={style.howWorks}>
      <div className={style.howWorks_content}>
        <h2>Necə işləyir?</h2>
        <div className={style.howWorks_steps}>
          <div className={style.step}>
            <WorkStep
              num="1"
              title="Hesab yaradın"
              subtitle="Başlamaq üçün qeydiyyatdan keçin."
            />
            <Line />
          </div>

          <div className={style.step}>
            <WorkStep
              num="2"
              title="Plan seçin"
              subtitle="Tələblərinizə uyğun planı seçin."
            />
            <Line />
          </div>

          <div className={style.step}>
            <WorkStep
              num="3"
              title="İstifadəyə başlayın"
              subtitle="Xidmətlərdən istifadə edin."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowWorks;
