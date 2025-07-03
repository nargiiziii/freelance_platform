import React, { useState } from "react";
import styles from "./FAQ.module.scss";

const questions = [
  {
    question: "Escrow sistemi nədir və necə işləyir?",
    answer:
      "Escrow — işəgötürənin vəsaiti əvvəlcədən platformada bloklamasıdır. Freelancer işi tamamlaya və işəgötürən onu təsdiqləyəndən sonra vəsait freelancerə köçürülür.",
  },
  {
    question: "Freelancer necə müraciət edə bilər?",
    answer:
      'Freelancer kimi qeydiyyatdan keçin, uyğun layihəni seçin və "Müraciət et" düyməsini klikləyin.',
  },
  {
    question: "İşəgötürən təklifi necə qəbul edir?",
    answer:
      "Müraciətlər siyahısından freelancerin təklifini seçərək onu qəbul edə bilərsiniz. Qəbul etdikdən sonra vəsait escrow-a köçürüləcək.",
  },
  {
    question: "İş tamamlandıqdan sonra nə baş verir?",
    answer:
      "Freelancer işi təqdim edir. İşəgötürən işi nəzərdən keçirir və razı qalarsa, ödənişi buraxa bilər. Bundan sonra hər iki tərəf rəy yaza bilər.",
  },
  {
    question: "Mesajlaşma necə işləyir?",
    answer:
      "Hər iki istifadəçi layihə və müraciət çərçivəsində bir-biri ilə real vaxtda mesajlaşa bilər. Bu, işin gedişatını rahat izləməyə kömək edir.",
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <div className={styles.faq_area}>
      <h2 className={styles.title}>Suallar & Cavablar</h2>
      <div className={styles.list}>
        {questions.map((item, index) => (
          <div key={index} className={styles.item}>
            <div className={styles.question} onClick={() => toggle(index)}>
              {item.question}
              <span className={styles.icon}>
                {activeIndex === index ? "−" : "+"}
              </span>
            </div>
            <div
              className={`${styles.answerWrapper} ${
                activeIndex === index ? styles.active : ""
              }`}
            >
              <div className={styles.answer}>{item.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
