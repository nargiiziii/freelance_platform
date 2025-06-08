import React from "react";
import style from "./HowWorks.module.scss";
import WorkStep from "../workStep/WorkStep";
import Line from "../line/Line";

const HowWorks = () => {
  return (
    <div className={style.howWorks}>
      <div className={style.howWorks_content}>
        <h2>How It Works</h2>
        <div className={style.howWorks_steps}>
          <div className={style.step}>
            <WorkStep
              num="1"
              title="Create an Account"
              subtitle="Sign up to get started with our platform."
            />
            <Line />
          </div>

          <div className={style.step}>
            <WorkStep
              num="2"
              title="Choose a Plan"
              subtitle="Select a plan that suits your needs."
            />
            <Line />
          </div>

          <div className={style.step}>
            <WorkStep
              num="3"
              title="Start Using"
              subtitle="Access all features and start using the service."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowWorks;
