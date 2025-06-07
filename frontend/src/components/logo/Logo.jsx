import React from 'react'
import style from "./Logo.module.scss"
const Logo = () => {
  return (
    <div className={style.logo}>
      <img src="../../../public/images/logo_dark.png" alt="Logo" />
    </div>
  )
}

export default Logo