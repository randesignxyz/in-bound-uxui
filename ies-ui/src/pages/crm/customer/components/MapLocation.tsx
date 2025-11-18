
import BarComp from "@/pages/delivery/location-tracking/BarComp";
import MarkerComp from "@/pages/delivery/location-tracking/MarkerComp";
import { CustomerServiceAPI } from "@/pages/sale/retailer/customer/services";
import { simpleRequestActions } from "@/services/model";
import { DrawerForm, DrawerFormProps, ProDescriptions, ProForm, ProFormSelect } from "@ant-design/pro-components";
import { GoogleMap, InfoWindow, Marker, MarkerClusterer, useJsApiLoader } from "@react-google-maps/api";
import { useQuery } from "@umijs/max";
import React, { useEffect, useRef, useState } from "react";
import { model } from "../model";
import { Address } from "@/services/crm/data";
import { Button, Card, Space, Spin, Typography } from "antd";
import { CustomerServices } from "../services";
import { CloseOutlined } from "@ant-design/icons";
import { CrmServices } from "../../services";


const containerStyle = {
    width: '100%',
    height: '89vh'
};

const center = {
    lat: 11.58181155360925,
    lng: 104.91810050044207
};

interface Props {
    onClose: () => void;
    filter?: any;
    onFilter:(val:any)=>void
}

const MapLocationDrawer: React.FC<Props> = ({ onClose, filter, onFilter, ...props }) => {
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyA0Ifgai8ryDULDIqNOZmX8L7XZlzu4_D8", // Replace with your key
        // libraries: ["places"], // Optional: include if you use Places
    });

    const [activeMarker, setActiveMarker] = useState<string | number | null>(null);
    const [selectedAddr, setSelectedAddr] = useState<any | null>(null);
    const requestAction = simpleRequestActions();
    const { data, isFetching, refetch } = useQuery({
        queryKey: ["map-location", filter],
        queryFn: () => CustomerServices.addressByCustomerIds({
            ...filter,
            criteria:{
                ...filter?.criteria,
                advanceSearch:{
                    ...filter.criteria,
                    ...filter?.criteria?.advanceSearch
                }
            },
            pagination:{...filter?.pagination, pageSize:filter?.adnaveSeach?.rows}
        }).query(requestAction),
        refetchOnWindowFocus: false,
    })
    const [detailState, setDetailState] = useState<{ visible?: { state: boolean, payload: any } }>();
    const markerRefs = useRef<Map<string | number, google.maps.Marker>>(new Map());

    
    useEffect(() => {
        data && data.items?.map(it => mapInstance?.setCenter({
            lat: parseFloat(it.latitude ?? ""),
            lng: parseFloat(it.longitude ?? "")
        }))
        // Optional: handle open state
    }, []);

    // const handleMarkerClick = (addr: any, lat: number, lng: number) => {
    //     const key = addr.id ?? lat + lng; // fallback key
    //     setActiveMarker(key);
    //     setSelectedAddr(addr);
    //     setDetailState({ visible: { state: true, payload: addr } }); // your external state

    //     // Smooth pan & zoom to marker
    //     mapInstance?.panTo({ lat, lng });
    //     if (mapInstance?.getZoom()! < 16) {
    //         mapInstance?.setZoom(16);
    //     }

    //     // onOpen?.();
    // };

    const handleInfoClose = () => {
        setActiveMarker(null);
        setSelectedAddr(null);
    };

    return (
        <Card
            size="small"
            title={
                <ProForm submitter={false} 
                    onValuesChange={(_,vals)=>{
                        onFilter(vals)
                    }}
                >
                    <Space>
                        <ProFormSelect
                            name={"province"}
                            placeholder={"Provice"}
                            showSearch
                            fieldProps={{
                                variant: "borderless"
                            }}
                            width={"sm"}
                            debounceTime={500}
                            request={async({keywords})=>{
                                const data = await CrmServices.listLocations({type:"PROVINCE"}).query(requestAction)
                                 return data.map(p=>({
                                    label:p.name , value:p.id
                                 }))
                            }}
                        />
                        <ProFormSelect
                            name={"rows"}
                            placeholder={"Row Number"}
                            showSearch
                            fieldProps={{
                                variant: "borderless"
                            }}
                            initialValue={50}
                            options={Array.from({ length: 60 }, (_, i) => {
                                const value = (i + 1) * 50; // 50, 100, 150, ...
                                return { label: value.toString(), value };
                            })}
                        />
                    </Space>
                </ProForm>
            }
            extra={[
                <Button
                    icon={<CloseOutlined />}
                    type="link"
                    onClick={onClose}
                />
            ]}
        >
            <ProDescriptions
                column={2}
                size="small"
                dataSource={detailState?.visible?.payload}
                columns={[
                    {
                        title: "Customer Code",
                        dataIndex: "cardCode"
                    },
                    {
                        title: "Code",
                        dataIndex: "address"
                    },
                    {
                        title: "Address KH",
                        dataIndex: "addressKh"
                    },
                    {
                        title:"All Location",
                        render:()=> <Typography.Text type="warning">{data?.total}</Typography.Text>
                    },
                    // {
                    //     title: "Province",
                    //     dataIndex: "province"
                    // },
                    // {
                    //     title: "District",
                    //     dataIndex: "district"
                    // },
                    // {
                    //     title: "Commune",
                    //     dataIndex: "commune"
                    // },
                    {
                        title: "Direction",
                        dataIndex: "direction"
                    },
                ]}
            />


            {!isFetching && isLoaded &&
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

                    <>
                        {data?.items?.map((addr, i) => {
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

        </Card>
    )
}

export default MapLocationDrawer