import { CheckCircleOutlined, CloseCircleOutlined, FieldTimeOutlined, SignatureOutlined } from "@ant-design/icons";
import { ProDescriptions, ProList } from "@ant-design/pro-components";
import { Button, Card, Flex, message, Popconfirm, Space, Tooltip, Typography } from "antd"
import ImagePreview from "@/components/ImagePreview";
import { formatDateTime } from "@/pages/utils";
import moment from "moment";
import { simpleRequestActions } from "@/services/model";
import { CustomerWithAddressVerifiedAPI } from "./service";
import ChangeStatusForm from "./ChangeStatus";
import { useMemo, useState } from "react";
import Remarks from "@/components/remarks";
import { useQuery } from "@umijs/max";
import { GoogleMap, InfoWindow, Marker, MarkerClusterer, Polyline, useJsApiLoader } from "@react-google-maps/api";

interface Props {
    data1: any,
    mode: string
    onBack: () => void
}

const containerStyle = {
    width: '100%',
    height: '50vh'
};

const center = {
    lat: 11.58181155360925,
    lng: 104.91810050044207
};


function extractCoordinates(text: string | undefined | null): { lat: number; lng: number } | null {
    if (!text) return null; // handle null or undefined input

    const regex = /\(([-\d.]+),\s*([-\d.]+)\)/;
    const match = text.match(regex);

    if (match) {
        return {
            lat: parseFloat(match[1]),
            lng: parseFloat(match[2])
        };
    }

    return null; // return null if no coordinates found
}

const VerifiedDetailView: React.FC<Props> = ({ data1, mode, onBack }) => {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyA0Ifgai8ryDULDIqNOZmX8L7XZlzu4_D8", // Replace with your key
        // libraries: ["places"], // Optional: include if you use Places
    });
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const requestActions = simpleRequestActions();
    const [statusState, setStatusState] = useState<{
        visible?: { name: "MODAL", addressId?: number, status: string }
    }>();
    const [btnState, setBtnState] = useState<number>(20002);
    const [remarkState, setRemarkState] = useState<boolean>(false);
    const [activeMarker, setActiveMarker] = useState<string>();
    const { data, isFetching, refetch } = useQuery({
        queryKey: ["detial", data1?.id],
        queryFn: () => CustomerWithAddressVerifiedAPI(requestActions).detail({ id: data1?.id }),
        refetchOnWindowFocus: false,
        retry: 1
    });
    const [infoOpen, setInfoOpen] = useState(true);

    return (
        <>
            {mode == "Address" && (
                <Flex vertical gap={12}>
                    <Card
                        size="small"
                        extra={[20001, 20002, 20004].some(p => data?.verifiedStatus?.id == 20002) ?
                            <Space>
                                <Button icon={<SignatureOutlined />}
                                    onClick={() => setRemarkState(true)}
                                    type="link"
                                    disabled={btnState != 20002}
                                >Remark</Button>
                                <Button icon={<CheckCircleOutlined />}
                                    onClick={() => setStatusState({ visible: { name: "MODAL", status: "Confirm", addressId: data.addressId, } })}
                                    type="link"
                                    disabled={btnState != 20002}
                                >Confirm</Button>
                                <Button
                                    onClick={() => setStatusState({ visible: { name: "MODAL", status: "Reject", addressId: data.addressId, } })}
                                    icon={<CloseCircleOutlined />} type="link" danger
                                    disabled={btnState != 20002}
                                >Reject</Button>

                            </Space> : ""
                        }
                    >
                        <ProDescriptions
                            dataSource={data}
                            contentStyle={{
                                fontWeight: "500"
                            }}
                            columns={[
                                {
                                    title: "Customer Code",
                                    render: (_, r) => r.customerCode,
                                },
                                {
                                    title: "Address ",
                                    render: (_, r) => r.addressCode,
                                },
                                {
                                    title: "Internal Name",
                                    dataIndex: "ownerName",
                                    render: (_, r) => r.customer?.internalName
                                },
                                {
                                    title: "Salesperson",
                                    render: (_, r) => [r.salesperson?.code, r.salesperson?.name].filter(Boolean).join("-")
                                },
                                {
                                    title: "Source",
                                    dataIndex: "source",
                                    render: (_, r) => r.customer?.source
                                },
                                // {
                                //     title: "Status",
                                //     render: (_, r) => <Typography.Text type={r.active == "N" ? "danger" : "success"}>{r.active == "N" ? "Inactive" : "Active"}</Typography.Text>
                                // },
                                {
                                    title: "Status",
                                    dataIndex: "verified",
                                    render: (_, r) => {
                                        return <Typography
                                            style={{
                                                color:
                                                    r.verifiedStatus?.id === 20001 // Unverified
                                                        ? "#868684ff" // orange
                                                        : r.verifiedStatus?.id === 20002 //"Pending"
                                                            ? "#1890ff" // blue
                                                            : r.verifiedStatus?.id === 20003 //"Rejected"
                                                                ? "#ff4d4f" // red
                                                                : r.verifiedStatus?.id === 20004  //"Confirmed"
                                                                    ? "#52c41a" // green
                                                                    : undefined
                                            }}
                                        >{r.verifiedStatus?.name}</Typography>
                                    }
                                },
                                {
                                    title: "Remark",
                                    render: (_, r) => data?.customerVerifiedLatLong?.comment
                                }
                            ]}

                        />
                    </Card>
                    <Card size="small" title="Attachment Photos" bordered>
                        {data?.customerVerifiedLatLong ? <ImagePreview
                            width={"200px"}
                            key={data.customerVerifiedLatLong?.image}
                            version={1}
                            fileId={data.customerVerifiedLatLong?.image}
                            fileName={""}
                            fallback=""
                        /> : "No Image"}

                    </Card>
                    <Card size={"small"} title="Map" loading={isFetching}>

                        {isLoaded && data?.customerVerifiedLatLong && (
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={center}
                                zoom={14}
                                onLoad={(map) => setMapInstance(map)}
                                options={{
                                    gestureHandling: "greedy",
                                    zoomControl: true,
                                    streetViewControl: false,
                                    mapTypeControl: false,
                                    styles: [
                                        { featureType: "poi", stylers: [{ visibility: "off" }] },
                                        { featureType: "transit", stylers: [{ visibility: "off" }] },
                                    ],
                                }}
                            >
                                {/* Current Location Marker */}
                                <Marker
                                    position={{
                                        lat: Number(data.customerVerifiedLatLong?.currentLat),
                                        lng: Number(data.customerVerifiedLatLong?.currentLong),
                                    }}
                                    icon={{
                                        url: "/icons/location_11315234.png",
                                        scaledSize: isLoaded ? new window.google.maps.Size(60, 60) : undefined,
                                    }}
                                    title="Current location"
                                    onClick={() => setActiveMarker("current")}
                                />

                                {/* Destination Marker */}
                                <Marker
                                    position={{
                                        lat: Number(data.customerVerifiedLatLong?.latitude),
                                        lng: Number(data.customerVerifiedLatLong?.longitude),
                                    }}
                                    icon={{
                                        url: "/icons/location_11315234.png",
                                        scaledSize: isLoaded ? new window.google.maps.Size(60, 60) : undefined,
                                    }}
                                    title={data?.address || "Destination"}
                                     onClick={() => setActiveMarker("Destination")}
                                />

                                <Polyline
                                    path={[
                                        {
                                            lat: Number(data.customerVerifiedLatLong?.currentLat),
                                            lng: Number(data.customerVerifiedLatLong?.currentLong),
                                        },
                                        {
                                            lat: Number(data.customerVerifiedLatLong?.latitude),
                                            lng: Number(data.customerVerifiedLatLong?.longitude),
                                        },
                                    ]}
                                    options={{
                                        strokeColor: "#1890ff",
                                        strokeOpacity: 0.8,
                                        strokeWeight: 4,
                                        geodesic: true,
                                    }}
                                />
                                {/* InfoWindow attached to marker */}
                                {activeMarker === "current" && isLoaded && (
                                    <InfoWindow
                                        anchor={mapInstance?.getMarker?.("current") || undefined} // or use position
                                        position={{
                                            lat: Number(data.customerVerifiedLatLong.currentLat),
                                            lng: Number(data.customerVerifiedLatLong.currentLong),
                                        }}
                                        onCloseClick={() => setActiveMarker(undefined)}
                                    >
                                        <div style={{ padding: "8px" }}>
                                            <div style={{ fontWeight: "bold", fontSize: "16px" }}>Check In Location</div>
                                            <div>Customer Code: <strong>{data.customerCode}</strong></div>
                                        </div>
                                    </InfoWindow>
                                )}
                            </GoogleMap>
                        )}
                    </Card>

                    <Card size="small" title={"Activity"}>
                        <ProList<any>
                            request={async () => {
                                const data1 = await CustomerWithAddressVerifiedAPI(requestActions).list({ id: data.addressId });
                                return Promise.resolve({
                                    data: data1,
                                    success: true
                                })
                            }}
                            metas={{
                                avatar: {
                                    render: (_, r) => <FieldTimeOutlined />
                                },
                                title: {
                                    dataIndex: 'activityType',
                                    render: (_, r) => <Typography
                                        style={{
                                            color: r.status?.id === 20001 // Unverified
                                                ? "#868684ff" // orange
                                                : r?.status?.id === 20002 //"Pending"
                                                    ? "#1890ff" // blue
                                                    : r?.status?.id === 20003 //"Rejected"
                                                        ? "#ff4d4f" // red
                                                        : r?.status?.id === 20004  //"Confirmed"
                                                            ? "#52c41a" // green
                                                            : undefined
                                        }}
                                    >{r.status?.name}</Typography>
                                },
                                subTitle: { render: (_, r) => `by ${r.createdBy} ${moment(moment(r.createdDate)).fromNow()}` },
                                description: { dataIndex: 'remark' },
                                actions: { render: (_, r) => [formatDateTime(moment(r.createdDate))] }
                            }}
                        />
                    </Card>
                </Flex>
            )

            }
            <Remarks
                open={remarkState}
                modalProps={{
                    onCancel: () => setRemarkState(false)
                }}
                onSave={(it) => {
                    CustomerWithAddressVerifiedAPI(requestActions).remark({
                        remark: it,
                        id: data?.customerVerifiedLatLong?.id
                    });
                    refetch?.();
                    setRemarkState(false)
                }}
            />
            <ChangeStatusForm
                open={statusState?.visible?.name == "MODAL"}
                status={statusState?.visible?.status}
                onSave={async (data) => {
                    await CustomerWithAddressVerifiedAPI(requestActions).changeStatus({
                        ...data,
                        id: statusState?.visible?.addressId
                    });
                    message.success("Success!")
                    setStatusState({ visible: undefined });
                    setBtnState(20001)
                }}
                onCancel={() => setStatusState({ visible: undefined })}
            />
        </>
    )
}


export default VerifiedDetailView