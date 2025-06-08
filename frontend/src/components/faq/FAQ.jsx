import React, { useState } from "react";
import styles from "./FAQ.module.scss";

const questions = [
  {
    question: "How does escrow work?",
    answer:
      "Escrow is a mechanism where funds are held in an account until the project is completed. Once the conditions are met, the funds are released to the contractor.",
  },
  {
    question: "What if the project is not completed?",
    answer:
      "You can open a dispute. The administration will review the details and make a decision.",
  },
  {
    question: "How to submit an application?",
    answer: 'Register, choose a project, and click "Submit Application".',
  },
  {
    question: "How long does it take to get approved?",
    answer:
      "Approval typically takes 1-3 business days after submitting your application.",
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <div className={styles.faq_area}>
      <h2 className={styles.title}>Questions & Answers</h2>
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
