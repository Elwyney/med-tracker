import { useState } from 'react'
import './style.scss'
import DoctorsNoSemd from './components/sections/DoctorsNoSemd'
import Navigation from './components/header'

function App() {
  return (
    <>
      <div className="container">
        <Navigation />
        <DoctorsNoSemd />
      </div>
    </>
  )
}

export default App
