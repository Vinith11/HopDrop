import React from "react";
import { Route, Routes } from "react-router-dom";
import UserSignin from "./pages/user/UserSignin";
import UserSignup from "./pages/user/UserSignup";
import CaptainSignup from "./pages/captain/CaptainSignup";
import CaptainSignin from "./pages/captain/CaptainSignin";
import Start from "./pages/Start";
import Home from "./pages/Home";
import CaptainHome from "./pages/CaptainHome";
import UserProtectWrapper from "./pages/UserProtectWrapper";
import CaptainProtectWrapper from "./pages/CaptainProtectWrapper";
import UserLogout from "./pages/UserLogout";
import CaptainLogout from "./pages/CaptainLogout";
import Riding from "./pages/Riding";
import CaptainRiding from "./pages/CaptainRiding";
import Payment from "./pages/Payment";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/user/signin" element={<UserSignin />} />
        <Route path="/user/signup" element={<UserSignup />} />
        <Route path="/captain/signup" element={<CaptainSignup />} />
        <Route path="/captain/signin" element={<CaptainSignin />} />

        <Route path="/riding" element={<Riding />} />
        <Route path="/captain-riding" element={<CaptainRiding />} />

        <Route path="/payment" element={<Payment />} />
        

        <Route
          path="/home"
          element={
            <UserProtectWrapper>
              <Home />
            </UserProtectWrapper>
          }
        />
        <Route
          path="/user/logout"
          element={
            <UserProtectWrapper>
              <UserLogout />
            </UserProtectWrapper>
          }
        />

        <Route
          path="/captain-home"
          element={
            <CaptainProtectWrapper>
              <CaptainHome />
            </CaptainProtectWrapper>
          }
        />

        <Route
          path="/captain/logout"
          element={
            <CaptainProtectWrapper>
              <CaptainLogout />
            </CaptainProtectWrapper>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
