import React from 'react'
import style from './EscrowCard.module.scss'


const EscrowCard = ({icon, head, text}) => {
  return (
    <div className={style.escrowCard}>
        <div className={style.icon}>{icon}</div>
        <h3>{head}</h3>
        <p>{text}</p>
    </div>
  )
}

export default EscrowCard