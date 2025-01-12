import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/2.png";

const Start = () => {
  return (
    <div className="bg-black h-screen flex flex-col justify-between">
      <div className="flex-1 flex items-center justify-center">
        <img
          className="w-66"
          src={logo}
          alt="HopDrop Logo"
        />
      </div>
      <div className="bg-white pb-7 py-4 px-4">
        <h2 className="text-2xl text-center font-bold">Get Started with HopDrop</h2>
        <Link
          to="/user/signin"
          className="flex items-center justify-center w-full bg-black text-white py-3 rounded mt-5"
        >
          Continue
        </Link>
      </div>
    </div>
  );
};

export default Start;
