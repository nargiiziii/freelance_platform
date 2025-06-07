import React from 'react'
import style from './Button.module.scss'
const Button = ({text}) => {
  return (
    <div>
        <button>{text}</button>
    </div>
  )
}

export default Button