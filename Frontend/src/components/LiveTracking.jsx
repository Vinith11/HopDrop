import React, { useState, useEffect } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import axios from "axios";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

const LiveTracking = () => {
  const [currentPosition, setCurrentPosition] = useState(center);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setCurrentPosition({
        lat: latitude,
        lng: longitude,
      });
      fetchNearbyDrivers(latitude, longitude);
    });

    const watchId = navigator.geolocation.watchPosition((position) => {
      const { latitude, longitude } = position.coords;
      setCurrentPosition({
        lat: latitude,
        lng: longitude,
      });
      fetchNearbyDrivers(latitude, longitude);
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  async function fetchNearbyDrivers(ltd, lng) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/captain-near-user`,
        { ltd, lng },  // request body
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log(response.data);  // Axios response data is already parsed
      setNearbyDrivers(response.data);
      
    } catch (error) {
      console.error('Error fetching nearby drivers:', error);
    }
  }
  useEffect(() => {
    const updatePosition = () => {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition({
          lat: latitude,
          lng: longitude,
        });
        fetchNearbyDrivers(latitude, longitude);
      });
    };

    const intervalId = setInterval(updatePosition, 100000); // Update every 100 seconds
    return () => clearInterval(intervalId);
  }, []);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        style={{width: '100vw', height: '100vh'}}
        defaultCenter={currentPosition}
        defaultZoom={17}
        mapId={'1'}
      >
        {/* Current user marker */}
        <AdvancedMarker 
          position={currentPosition}
          title="You are here"
        />

        {/* Nearby drivers markers */}
        {nearbyDrivers.map((driver) => (
          <AdvancedMarker
            key={driver._id}
            position={{
              lat: driver.location.ltd+1,
              lng: driver.location.lng+2
            }}
            title={`${driver.fullname.firstname} ${driver.fullname.lastname} - ${driver.vehicle.vehicleType}`}
          />
        ))}
      </Map>
    </APIProvider>
  );
};

export default LiveTracking;