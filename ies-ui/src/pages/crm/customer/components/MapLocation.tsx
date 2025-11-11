
import BarComp from "@/pages/delivery/location-tracking/BarComp";
import MarkerComp from "@/pages/delivery/location-tracking/MarkerComp";
import { CustomerServiceAPI } from "@/pages/sale/retailer/customer/services";
import { simpleRequestActions } from "@/services/model";
import { DrawerForm, DrawerFormProps } from "@ant-design/pro-components";
import { GoogleMap, Marker, MarkerClusterer, useJsApiLoader } from "@react-google-maps/api";
import { useQuery } from "@umijs/max";
import React, { useEffect, useState } from "react";
import { model } from "../model";
import { Address } from "@/services/crm/data";
import { Spin } from "antd";


const containerStyle = {
    width: '100%',
    height: '89vh'
};

const center = {
    lat: 11.58181155360925,
    lng: 104.91810050044207
};

interface Props extends DrawerFormProps {
    onClose: () => void;
    cusId: number;
}

const MapLocationDrawer: React.FC<Props> = ({ onClose, cusId, ...props }) => {
    const { state, ops, actions, modals } = model(cusId);
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyA0Ifgai8ryDULDIqNOZmX8L7XZlzu4_D8", // Replace with your key
        // libraries: ["places"], // Optional: include if you use Places
    });

    const requestAction = simpleRequestActions();
    // const [currentIcon, setCurrentIcon] = useState(defaultIcon);
    const { data, isFetching, refetch } = useQuery({
        queryKey: ["map-location", cusId],
        queryFn: () => ops.listAddressDetailByCustomerId({ id: cusId }),
        refetchOnWindowFocus: false,
        enabled:props.open
    })


    useEffect(() => {
        data && props.open && data.map(it => mapInstance?.setCenter({
            lat: parseFloat(it.latitude ?? ""),
            lng: parseFloat(it.longitude ?? "")
        }))
        // Optional: handle open state
    }, [props.open]);

    return (
        <DrawerForm
            {...props}
            title={"Map Location"}
            drawerProps={{
                onClose: onClose,
                styles: {
                    body: { padding: 0, margin: 0 }
                },
                loading:isFetching
            }}  

        >

            {!isFetching &&
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={14}
                    onLoad={(map) => setMapInstance(map)}
                    options={{
                        zoomControl:true,
                        gestureHandling:"greedy",
                        styles: [
                            {
                                featureType: 'poi.business',
                                stylers: [{ visibility: 'off' }],
                            },
                            {
                                featureType: 'poi.attraction',
                                stylers: [{ visibility: 'off' }],
                            },
                            {
                                featureType: 'poi.school',
                                stylers: [{ visibility: 'off' }],
                            },
                            {
                                featureType: 'poi.sports_complex',
                                stylers: [{ visibility: 'off' }],
                            },
                            {
                                featureType: 'poi.medical',
                                stylers: [{ visibility: 'off' }],
                            },
                            {
                                featureType: 'poi.place_of_worship',
                                stylers: [{ visibility: 'off' }],
                            },
                            {
                                featureType: 'poi.sports_complex',
                                stylers: [{ visibility: 'off' }],
                            },
                            {
                                featureType: 'poi.government',
                                stylers: [{ visibility: 'off' }],
                            },
                            {
                                featureType: 'poi.park',
                                stylers: [{ visibility: 'off' }],
                            },
                            {
                                featureType: 'transit.station',
                                stylers: [{ visibility: 'off' }],
                            },
                            {
                                featureType: 'transit.station.bus',
                                stylers: [{ visibility: 'off' }],
                            }
                        ]
                    }}

                >
                    {/* <BarComp locationTracking={zoomTo} onOpen={onOpen} reload={reload} /> */}

                    <MarkerClusterer imageSizes={[50, 50, 50, 50]}>
                        {(clusterer) =>
                            data?.map((addr, i) => {
                                const lat = Number(addr.latitude);
                                const lng = Number(addr.longitude);
                                if (isNaN(lat) || isNaN(lng)) return null;

                                return (
                                    <Marker
                                        key={addr.id ?? i}
                                        position={{ lat, lng }}
                                        clusterer={clusterer}
                                        icon={{
                                            url: "/icons/location_11315234.png",
                                            scaledSize: new google.maps.Size(60, 60),
                                        }}
                                        title={addr.address ?? "Customer"}
                                    />
                                );
                            })
                        }
                    </MarkerClusterer>


                </GoogleMap>}

        </DrawerForm>
    )
}

export default MapLocationDrawer