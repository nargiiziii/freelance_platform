import React from 'react'
import MainHead from '../components/mainHead/MainHead'
import WhyEscrow from '../components/whyEscrow/WhyEscrow'
import HowWorks from '../components/howWorks/HowWorks'
import FAQ from '../components/faq/FAQ'

const Home = () => {
  return (
    <div>
        <MainHead/>
        <WhyEscrow/>
        <HowWorks/>
        <FAQ/>
    </div>
  )
}

export default Home