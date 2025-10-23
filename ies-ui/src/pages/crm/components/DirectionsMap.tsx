import React from "react";

interface MapProps {
  data: {
    customerVerifiedLatLong?: {
      currentLat: number | string;
      currentLong: number | string;
      latitude: number | string;
      longitude: number | string;
    };
    customerCode?: string;
  };
}

const DirectionsMap: React.FC<MapProps> = ({ data }) => {
  if (!data?.customerVerifiedLatLong) return <p>No location data available</p>;

  const { currentLat, currentLong, latitude, longitude } = data.customerVerifiedLatLong;

  const mapSrc = `https://www.google.com/maps/embed/v1/directions?key=${"AIzaSyACftO4Dtfn7BQETFuT4YQZ_wOrO3hgszc"}&origin=${currentLat},${currentLong}&destination=${latitude},${longitude}&mode=driving`;

  return (
    <iframe
      width="100%"
      height="400"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      src={mapSrc}
      title={`Directions for ${data.customerCode || "Customer"}`}
    />
  );
};

export default DirectionsMap;
