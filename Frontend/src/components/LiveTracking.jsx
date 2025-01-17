import React, { useState, useEffect } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import axios from "axios";

const LiveTracking = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [map, setMap] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const pos = {
        lat: latitude,
        lng: longitude,
      };
      setCurrentPosition(pos);
      fetchNearbyDrivers(latitude, longitude);
    });

    // Set up interval for position updates (3 minutes = 180000 milliseconds)
    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const pos = {
          lat: latitude,
          lng: longitude,
        };
        setCurrentPosition(pos);
        fetchNearbyDrivers(latitude, longitude);
      });
    }, 180000); // 3 minutes interval

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  async function fetchNearbyDrivers(ltd, lng) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/captain-near-user`,
        { ltd, lng },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setNearbyDrivers(response.data);
    } catch (error) {
      console.error("Error fetching nearby drivers:", error);
    }
  }

  if (!currentPosition) return <div>Loading...</div>;

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        style={{ width: "100vw", height: "100vh" }}
        center={currentPosition}
        zoom={16}
        mapId={"1"}
        onLoad={(map) => setMap(map)}
      >
        {/* Current user marker */}
        <AdvancedMarker position={currentPosition} title="You are here">
          <Pin
            background={"#FF0000"}
            borderColor={"#CC0000"}
            glyphColor={"#FFFFFF"}
          />
        </AdvancedMarker>

        {/* Nearby drivers markers */}
        {nearbyDrivers.map((driver) => {
          const position = {
            lat: Number(driver.location.ltd) + 0.001, // Smaller offset
            lng: Number(driver.location.lng) + 0.001,
          };

          return (
            <AdvancedMarker
              key={driver._id}
              position={position}
              title={`${driver.fullname.firstname} ${driver.fullname.lastname} - ${driver.vehicle.vehicleType}`}
            >
              <Pin
                background={"#0f9d58"}
                borderColor={"#006425"}
                glyphColor={"#FFFFFF"}
              />
            </AdvancedMarker>
          );
        })}
      </Map>
    </APIProvider>
  );
};

export default LiveTracking;
