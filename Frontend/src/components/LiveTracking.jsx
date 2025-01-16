import React, { useState, useEffect } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";

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

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setCurrentPosition({
        lat: latitude,
        lng: longitude,
      });
    });

    const watchId = navigator.geolocation.watchPosition((position) => {
      const { latitude, longitude } = position.coords;
      setCurrentPosition({
        lat: latitude,
        lng: longitude,
      });
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        console.log("Position updated:", latitude, longitude);
        setCurrentPosition({
          lat: latitude,
          lng: longitude,
        });
      });
    };

    updatePosition(); // Initial position update

    const intervalId = setInterval(updatePosition, 100000); // Update every 10 seconds
  }, []);

  return (
    <APIProvider>
      {/* apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} */}
      <Map
        style={{width: '100vw', height: '100vh'}}
        defaultCenter={currentPosition}
        defaultZoom={17}
        mapId={'1'}
      >
        <AdvancedMarker position={currentPosition} />
      </Map>
    </APIProvider>
  );
};

export default LiveTracking;
