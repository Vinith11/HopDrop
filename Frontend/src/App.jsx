import React from 'react'
import { Route, Routes } from 'react-router-dom'
import UserSignin from './pages/UserSignin'
import UserSignup from './pages/UserSignup'
import CaptainSignup from './pages/CaptainSignup'
import CaptainSignin from './pages/CaptainSignin'
import Home from './pages/Home'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user/signin" element={<UserSignin />} />
        <Route path='/user/signup' element={<UserSignup />} />
        <Route path="/captain/signup" element={<CaptainSignup />} />
        <Route path="/captain/signin" element={<CaptainSignin />} />

      </Routes>
    </div>
  )
}

export default App