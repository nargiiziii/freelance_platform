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
      <h3>Niyə Escrow?</h3>
      <p>
        Escrow sistemi ödənişlərin təhlükəsizliyini təmin edir. Vəsaitlər yalnız razılıq olduqda verilir.
      </p>
      <div className={style.esc_cards}>
        <EscrowCard
          head={"Təhlükəsiz Ödəniş"}
          text={"İş təsdiqlənənədək vəsait saxlanılır"}
          icon={<MdOutlineVerifiedUser />}
        />

        <EscrowCard
          head={"Ədalətli Əməkdaşlıq"}
          text={"Sistem hər iki tərəfi qoruyur"}
          icon={<MdOutlineBalance />}
        />

        <EscrowCard
          head={"Mübahisə Həlli"}
          text={"Problem yarandıqda ədalətli yanaşma"}
          icon={<AiOutlineSmile />}
        />

        <EscrowCard
          head={"Etibar"}
          text={"Güvənli iş münasibətləri qurun"}
          icon={<FaHandshake />}
        />
      </div>
    </div>
  );
};

export default WhyEscrow;
