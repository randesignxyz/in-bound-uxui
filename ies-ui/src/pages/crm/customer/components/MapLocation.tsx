
import BarComp from "@/pages/delivery/location-tracking/BarComp";
import MarkerComp from "@/pages/delivery/location-tracking/MarkerComp";
import { CustomerServiceAPI } from "@/pages/sale/retailer/customer/services";
import { simpleRequestActions } from "@/services/model";
import { DrawerForm, DrawerFormProps, ProDescriptions } from "@ant-design/pro-components";
import { GoogleMap, InfoWindow, Marker, MarkerClusterer, useJsApiLoader } from "@react-google-maps/api";
import { useQuery } from "@umijs/max";
import React, { useEffect, useRef, useState } from "react";
import { model } from "../model";
import { Address } from "@/services/crm/data";
import { Card, Spin } from "antd";
import { CustomerServices } from "../services";


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
    cusIds?: number[];
}

const MapLocationDrawer: React.FC<Props> = ({ onClose, cusIds, ...props }) => {
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyA0Ifgai8ryDULDIqNOZmX8L7XZlzu4_D8", // Replace with your key
        // libraries: ["places"], // Optional: include if you use Places
    });

    const [activeMarker, setActiveMarker] = useState<string | number | null>(null);
    const [selectedAddr, setSelectedAddr] = useState<any | null>(null);
    const requestAction = simpleRequestActions();
    // const [currentIcon, setCurrentIcon] = useState(defaultIcon);
    const { data, isFetching, refetch } = useQuery({
        queryKey: ["map-location", cusIds],
        queryFn: () => CustomerServices.addressByCustomerIds(cusIds).query(requestAction),
        refetchOnWindowFocus: false,
        // enabled: props.open
    })
    const [detailState, setDetailState] = useState<{ visible?: { state: boolean, payload: any } }>();
    const markerRefs = useRef<Map<string | number, google.maps.Marker>>(new Map());
    console.log(data);


    useEffect(() => {
        CustomerServices.addressByCustomerIds(cusIds).query(requestAction)
        data && props.open && data.map(it => mapInstance?.setCenter({
            lat: parseFloat(it.latitude ?? ""),
            lng: parseFloat(it.longitude ?? "")
        }))
        // Optional: handle open state
    }, [props.open]);

    const handleMarkerClick = (addr: any, lat: number, lng: number) => {
        const key = addr.id ?? lat + lng; // fallback key
        setActiveMarker(key);
        setSelectedAddr(addr);
        setDetailState({ visible: { state: true, payload: addr } }); // your external state

        // Smooth pan & zoom to marker
        mapInstance?.panTo({ lat, lng });
        if (mapInstance?.getZoom()! < 16) {
            mapInstance?.setZoom(16);
        }

        // onOpen?.();
    };

    const handleInfoClose = () => {
        setActiveMarker(null);
        setSelectedAddr(null);
    };

    return (
        <DrawerForm
            {...props}
            title={"Map Location"}
            resize={{
                maxWidth: window.innerWidth * 0.8,
                minWidth: 600,
            }}
            width={800}
            drawerProps={{
                onClose: onClose,
                styles: {
                    body: { padding: 0, margin: 0 }
                },
                loading: isFetching
            }}
            submitter={false}

        >
            <ProDescriptions
                column={2}
                size="small"
                dataSource={detailState?.visible?.payload}
                columns={[
                    {
                        title: "Coded",
                        dataIndex: "address"
                    },
                    {
                        title: "Address KH",
                        dataIndex: "addressKh"
                    },
                    {
                        title: "Province",
                        dataIndex: "province"
                    },
                    {
                        title: "District",
                        dataIndex: "district"
                    },
                    {
                        title: "Commune",
                        dataIndex: "commune"
                    },
                    {
                        title: "Direction",
                        dataIndex: "direction"
                    },
                ]}
            />


            {!isFetching &&
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={10}
                    onLoad={(map) => setMapInstance(map)}
                    options={{
                        zoomControl: true,
                        gestureHandling: "greedy",
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        styles: [
                            { featureType: "poi", stylers: [{ visibility: "off" }] },
                            { featureType: "transit", stylers: [{ visibility: "off" }] },
                            // { featureType: "administrative", elementType: "labels", stylers: [{ visibility: "on" }] },
                        ],
                    }}

                >
                    {/* <BarComp locationTracking={zoomTo} onOpen={onOpen} reload={reload} /> */}

                    {/* <MarkerClusterer
                        imageSizes={[50, 60, 70, 80]}
                        averageCenter
                        enableRetinaIcons
                        gridSize={60}
                    // minimumClusterSize={3}
                    // styles={[
                    //     {
                    //         url: "/icons/location_11315234.png",
                    //         height: 60,
                    //         width: 60,
                    //         textColor: "#ffffff",
                    //         textSize: 14,
                    //         fontWeight: "bold",
                    //     },
                    // ]}
                    // onClick={(cluster) => {
                    //     const markers = cluster.getMarkers();
                    //     if (markers.length > 0 && mapInstance) {
                    //         const bounds = new google.maps.LatLngBounds();
                    //         markers.forEach((m) => bounds.extend(m.getPosition()!));
                    //         mapInstance.fitBounds(bounds);
                    //         if (mapInstance.getZoom()! > 17) mapInstance.setZoom(17);
                    //     }
                    // }}
                    >
                        {(clusterer) => ( */}
                    <>
                        {data?.map((addr, i) => {
                            const lat = Number(addr.latitude);
                            const lng = Number(addr.longitude);
                            if (isNaN(lat) || isNaN(lng)) return null;
                            const key = addr.id ?? i;
                            return (
                                <Marker
                                    key={key}
                                    position={{ lat, lng }}
                                    onClick={() => setDetailState({ visible: { state: true, payload: addr } })}
                                    icon={{
                                        url: "/icons/location_11315234.png",
                                        scaledSize: new google.maps.Size(60, 60),
                                    }}
                                    onClick={() => {
                                        setDetailState({ visible: { state: true, payload: addr } });
                                        // Optional: zoom in on click
                                        mapInstance?.panTo({ lat, lng });
                                        if (mapInstance?.getZoom()! < 16) {
                                            mapInstance?.setZoom(16);
                                        }
                                    }}
                                    title={addr.address ?? "Customer"}
                                    onLoad={(marker) => markerRefs.current.set(key, marker)}
                                >
                                    {/* <InfoWindow
                                                position={{ lat, lng }}
                                                onCloseClick={handleInfoClose}
                                                options={{
                                                    pixelOffset: new google.maps.Size(0, -40),
                                                    maxWidth: 220,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        padding: "10px 12px",
                                                        fontFamily: "Arial, sans-serif",
                                                        lineHeight: 1.4,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontWeight: "bold",
                                                            fontSize: "15px",
                                                            marginBottom: "6px",
                                                            color: "#1a73e8",
                                                        }}
                                                    >
                                                        Shipping Address
                                                    </div>
                                                    <div style={{ fontSize: "13px", color: "#333" }}>
                                                        <strong>Code:</strong> {addr.address || "—"}
                                                    </div>
                                                    {addr.id && (
                                                        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                                                            ID: {addr.id}
                                                        </div>
                                                    )}
                                                </div>
                                            </InfoWindow> */}
                                </Marker>
                            );
                        })}
                    </>
                    {/* )}
                    </MarkerClusterer> */}

                </GoogleMap>}

        </DrawerForm>
    )
}

export default MapLocationDrawer