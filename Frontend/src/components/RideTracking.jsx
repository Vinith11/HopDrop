import React, { useState, useEffect } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
} from "@vis.gl/react-google-maps";

const RideTracking = ({ ride, currentPosition }) => {
  const [map, setMap] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState("");

  useEffect(() => {
    if (ride) {
      try {
        // Parse pickup coordinates from comma-separated string
        const [pickupLat, pickupLng] = ride.pickup.split(',').map(coord => parseFloat(coord.trim()));
        const [destLat, destLng] = ride.destination.split(',').map(coord => parseFloat(coord.trim()));

        // Create coordinate objects
        const pickup = {
          lat: pickupLat,
          lng: pickupLng
        };
        
        const destination = {
          lat: destLat,
          lng: destLng
        };

        // Validate coordinates
        if (!isNaN(pickup.lat) && !isNaN(pickup.lng)) {
          setPickupCoords(pickup);
        }
        if (!isNaN(destination.lat) && !isNaN(destination.lng)) {
          setDestinationCoords(destination);
        }
      } catch (error) {
        console.error("Error parsing coordinates:", error);
      }
    }
  }, [ride]);

  // Calculate route and estimated time
  useEffect(() => {
    if (map && pickupCoords && destinationCoords) {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#000000",
          strokeWeight: 4,
        }
      });

      directionsService.route({
        origin: pickupCoords,
        destination: destinationCoords,
        travelMode: "DRIVING",
      })
      .then(response => {
        directionsRenderer.setDirections(response);
        const route = response.routes[0];
        if (route && route.legs[0]) {
          setEstimatedTime(route.legs[0].duration.text);
        }
      })
      .catch(error => {
        console.error("Error calculating route:", error);
      });

      return () => {
        directionsRenderer.setMap(null);
      };
    }
  }, [map, pickupCoords, destinationCoords]);

  if (!currentPosition) return <div>Loading...</div>;

  return (
    <div className="relative h-full">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map
          style={{ width: "100%", height: "100%" }}
          center={currentPosition}
          zoom={15}
          mapId={"1"}
          onLoad={setMap}
          options={{
            draggable: true,
            gestureHandling: 'auto',
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          }}
        >
          {/* Current location marker */}
          {currentPosition && (
            <AdvancedMarker position={currentPosition}>
              <Pin
                background={"#4285F4"}
                borderColor={"#1967D2"}
                glyphColor={"#FFFFFF"}
              />
            </AdvancedMarker>
          )}

          {/* Pickup location marker */}
          {pickupCoords && (
            <AdvancedMarker position={pickupCoords}>
              <Pin
                background={"#00C853"}
                borderColor={"#009624"}
                glyphColor={"#FFFFFF"}
              />
            </AdvancedMarker>
          )}

          {/* Destination marker */}
          {destinationCoords && (
            <AdvancedMarker position={destinationCoords}>
              <Pin
                background={"#D50000"}
                borderColor={"#9B0000"}
                glyphColor={"#FFFFFF"}
              />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>
      {estimatedTime && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md z-10">
          <p className="font-medium">Estimated Time: {estimatedTime}</p>
        </div>
      )}
    </div>
  );
};

export default RideTracking; 