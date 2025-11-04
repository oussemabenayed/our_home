import React from 'react'
import Hero from '../components/Hero'
import Companies from '../components/Companies'
import Features from '../components/Features'
import Properties from '../components/propertiesshow'
import Steps from '../components/Steps'
import Testimonials from '../components/testimonial'
import Milestones from '../components/aboutus/Milestone'

const Home = () => {
  return (
    <div>
      <Hero />
      <Companies />
      <Features />
      <Properties />
      <Steps />
      <Testimonials />
      <Milestones />
    </div>
  )
}

export default Home
