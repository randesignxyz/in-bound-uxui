import storeLocationIcon from '@/assets/store-location-icon.png';
import userLocationIcon from '@/assets/user-location-icon.png';

import { GoogleMap, InfoWindow, LoadScript, Marker } from '@react-google-maps/api';
import { Typography } from 'antd';
import React, { useState } from 'react';

interface Props {
  googleMapApiKey: string;
  zoomNumber: number;
  center: {
    id: string;
    lat: number;
    lng: number;
    name: string;
    internalName: string;
    phone: string;
  };
  positions?: {
    id: string;
    lat: number;
    lng: number;
    name: string;
    internalName: string;
    phone: string;
  }[];
}

const containerStyle = {
  width: '100%',
  height: '400px',
};

export default React.memo(({ googleMapApiKey, center, positions, zoomNumber }: Props) => {
  const [activeMarker, setActiveMarker] = useState<string>();
  const { Text } = Typography;
  const handleActiveMarker = (marker: string) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };

  const markers = positions
    ? positions
        .map((it) => ({
          id: it.id,
          //name: "Chicago, Illinois",
          position: { lat: it.lat, lng: it.lng },
          icon: storeLocationIcon,
          name: it.name,
          internal: it.internalName,
          phone: it.phone,
        }))
        .concat([
          {
            id: center.id,
            position: { lat: center.lat, lng: center.lng },
            icon: userLocationIcon,
            name: center.name,
            internal: center.internalName,
            phone: center.phone,
          },
        ])
    : [
        {
          id: center.id,
          position: { lat: center.lat, lng: center.lng },
          icon: userLocationIcon,
          name: center.name,
          internal: center.internalName,
          phone: center.phone,
        },
      ];

  // const s = { lat: 11.6631353, lng: 104.6958677 };

  return (
    <React.Fragment>
      <LoadScript googleMapsApiKey={googleMapApiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={zoomNumber}
          onClick={() => setActiveMarker(undefined)}
        >
          {/* Child components, such as markers, info windows, etc. */}
          {markers.map((it) => {
            return (
              <Marker
                key={it.id}
                position={it.position}
                icon={it.icon}
                onClick={() => handleActiveMarker(it.id)}
              >
                {activeMarker === it.id ? (
                  <InfoWindow onCloseClick={() => setActiveMarker(undefined)}>
                    <>
                      <Text style={{ fontWeight: 'bold' }}>{it.name}</Text>
                      {it.internal && (
                        <>
                          <br />
                          <Text>{it.internal}</Text>
                        </>
                      )}
                      <br />
                      <Text>{it.phone}</Text>
                    </>
                  </InfoWindow>
                ) : null}
              </Marker>
            );
          })}

          {/* <Marker key={center.lat} position={center} icon={userLocationIcon} />
          {positions &&
            positions.map((it) => {
              console.log(it);
              return <Marker key={it.lat} position={it} icon={storeLocationIcon} />;
            })} */}
        </GoogleMap>
      </LoadScript>
    </React.Fragment>
  );
});
