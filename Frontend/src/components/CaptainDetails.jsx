import React, { useContext, useEffect, useState } from "react";
import { CaptainDataContext } from "../context/CaptainContext";
import { Link } from "react-router-dom";

const CaptainDetails = () => {
  const { captain } = useContext(CaptainDataContext);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [stats, setStats] = useState({
    hoursOnline: 0,
    totalRides: 0,
    rating: 4.8
  });

  const fetchTodayEarnings = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/captain/earnings/today`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setTodayEarnings(data[0]?.totalEarnings || 0);
    } catch (error) {
      console.error("Error fetching today's earnings:", error);
    }
  };

  useEffect(() => {
    fetchTodayEarnings();
    // Refresh earnings every minute
    const interval = setInterval(fetchTodayEarnings, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link to="/captain/profile" className="flex items-center justify-start gap-3">
          <img
            className="h-10 w-10 rounded-full object-cover"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdlMd7stpWUCmjpfRjUsQ72xSWikidbgaI1w&s"
            alt=""
          />
          <h4 className="text-lg font-medium capitalize">
            {captain.fullname.firstname + " " + captain.fullname.lastname}
          </h4>
        </Link>
        <div>
          <h4 className="text-xl font-semibold">₹{todayEarnings}</h4>
          <p className="text-sm text-gray-600">Today's Earnings</p>
        </div>
      </div>
      <div className="flex p-3 mt-8 bg-gray-100 rounded-xl justify-center gap-5 items-start">
        <div className="text-center">
          <i className="text-3xl mb-2 font-thin ri-timer-2-line"></i>
          <h5 className="text-lg font-medium">{stats.hoursOnline}</h5>
          <p className="text-sm text-gray-600">Hours Online</p>
        </div>
        <div className="text-center">
          <i className="text-3xl mb-2 font-thin ri-route-line"></i>
          <h5 className="text-lg font-medium">{stats.totalRides}</h5>
          <p className="text-sm text-gray-600">Total Rides</p>
        </div>
        <div className="text-center">
          <i className="text-3xl mb-2 font-thin ri-star-line"></i>
          <h5 className="text-lg font-medium">{stats.rating}</h5>
          <p className="text-sm text-gray-600">Rating</p>
        </div>
      </div>
    </div>
  );
};

export default CaptainDetails;
