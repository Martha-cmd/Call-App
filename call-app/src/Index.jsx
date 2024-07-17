import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Call from './Components/Call'
import Auth from './Components/Auth'

const Index = () => {
  return (
    <>
          <Router>
              <Routes>
                  <Route path="/" element={<Auth />} />
                  <Route path="/call" element={<Call />} />
              </Routes>
          </Router>
    </>
  )
}

export default Index