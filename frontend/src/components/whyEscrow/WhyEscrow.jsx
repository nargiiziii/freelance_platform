import React from "react";
import style from "./WhyEscrow.module.scss";
import EscrowCard from "../escrowCard/EscrowCard";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { MdOutlineBalance } from "react-icons/md";
import { AiOutlineSmile } from "react-icons/ai";
import { FaHandshake } from "react-icons/fa";

const WhyEscrow = () => {
  return (
    <div className={style.whyEscrow}>
      <h3>Why Use Escrow?</h3>
      <p>
        Our built-in escrow system ensures secure payments between clients and
        freelancers. Funds are only released when both parties are satisfied.
      </p>
      <div className={style.esc_cards}>
        <EscrowCard
          head={"Secure Payments"}
          text={"Funds are held safely until the work is approved"}
          icon={<MdOutlineVerifiedUser />}
        />

        <EscrowCard
          head={"Balanced Collaboration"}
          text={"A neutral system ensures that no one is taken advantage of"}
          icon={<MdOutlineBalance />}
        />

        <EscrowCard
          head={"Dispute Resolution"}
          text={"Fair system to handle any disagreements"}
          icon={<AiOutlineSmile />}
        />

        <EscrowCard
          head={"Mutual Trust"}
          text={"Build strong working relationships with confidence"}
          icon={<FaHandshake />}
        />
      </div>
    </div>
  );
};

export default WhyEscrow;
