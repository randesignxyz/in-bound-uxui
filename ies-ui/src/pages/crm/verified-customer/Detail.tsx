import { AimOutlined, CheckCircleOutlined, CheckCircleTwoTone, CloseCircleOutlined, FieldTimeOutlined, SignatureOutlined } from "@ant-design/icons";
import { ProDescriptions, ProList } from "@ant-design/pro-components";
import { Button, Card, Col, Collapse, Flex, Image, List, message, Modal, Row, Space, Typography } from "antd"
import { AddresssView } from "../register/data";
import ActivityLog from "@/components/ActivityLog";
import ImagePreview from "@/components/ImagePreview";
import OrderGoogleMap from "@/pages/sale/retailer/orders/components/OrderGoogleMap";
import { formatDateTime } from "@/pages/utils";
import moment from "moment";
import { simpleRequestActions } from "@/services/model";
import { CustomerWithAddressVerifiedAPI } from "./service";
import ChangeStatusForm from "./ChangeStatus";
import { useState } from "react";
import RemarkFormModal from "@/pages/sale/retailer/components/RemarkFormModal";
import Remarks from "@/components/remarks";
import RemarkModal from "@/components/remark-modal";
import { useQuery } from "@umijs/max";
import { GoogleMap, InfoWindow, LoadScript, Marker } from "@react-google-maps/api";
import DirectionsMap from "../components/DirectionsMap";

interface Props {
    data1: any,
    mode: string
    onBack: () => void
}

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
                    <Card size={"small"} title="Map">
                        {/* {data && <DirectionsMap data={{
                            customerCode:data?.customerCode,
                            customerVerifiedLatLong:{
                                currentLat:data?.customerVerifiedLatLong?.currentLat,
                                currentLong:data?.customerVerifiedLatLong?.currentLong,
                                latitude:data?.customerVerifiedLatLong?.longitude,
                                longitude:data?.customerVerifiedLatLong?.longitude
                            }
                        }} />} */}
                        {/* <iframe
                            width="100%"
                            height="400"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            src={`https://www.google.com/maps/embed/v1/directions?key=${"AIzaSyACftO4Dtfn7BQETFuT4YQZ_wOrO3hgszc"}&origin=${data?.customerVerifiedLatLong?.currentLat},${data?.customerVerifiedLatLong?.currentLong}&destination=${data?.customerVerifiedLatLong?.latitude},${data?.customerVerifiedLatLong?.longitude}&mode=driving`}
                        /> */}
                        {/* <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyACftO4Dtfn7BQETFuT4YQZ_wOrO3hgszc"}>
                            <GoogleMap
                                mapContainerStyle={{ width: '100%', height: '400px' }}
                                center={{
                                    lat: parseFloat(data?.customerVerifiedLatLong?.latitude),
                                    lng: parseFloat(data?.customerVerifiedLatLong?.longitude),
                                }}
                                zoom={12}
                                onClick={() => setActiveMarker(undefined)}
                            >
                                {[
                                    {
                                        id: "origin",
                                        lat: parseFloat(data?.customerVerifiedLatLong?.currentLat),
                                        lng: parseFloat(data?.customerVerifiedLatLong?.currentLong),
                                        name: "Your Location",
                                        phone: "",
                                        // icon: userLocationIcon,
                                    },
                                    {
                                        id: "destination",
                                        lat: parseFloat(data?.customerVerifiedLatLong?.latitude),
                                        lng: parseFloat(data?.customerVerifiedLatLong?.longitude),
                                        name: "Customer Location",
                                        phone: `Customer Code: ${data?.customerCode}`,
                                        // icon: storeLocationIcon,
                                    },
                                ].map((it) => (
                                    <Marker
                                        key={it.id}
                                        position={{ lat: it.lat, lng: it.lng }}
                                        // icon={it.icon}
                                        onClick={() => setActiveMarker(it.id)}
                                    >
                                        {activeMarker === it.id && (
                                            <InfoWindow onCloseClick={() => setActiveMarker(undefined)}>
                                                <>
                                                    <Typography.Text strong>{it.name}</Typography.Text>
                                                    <br />
                                                    <Typography.Text>{it.phone}</Typography.Text>
                                                    <br />
                                                    <a
                                                        href={`https://www.google.com/maps/dir/?api=1&origin=${data?.customerVerifiedLatLong?.currentLat},${data?.customerVerifiedLatLong?.currentLong}&destination=${data?.customerVerifiedLatLong?.latitude},${data?.customerVerifiedLatLong?.longitude}&travelmode=driving`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        📍 Get Directions
                                                    </a>
                                                </>
                                            </InfoWindow>
                                        )}
                                    </Marker>
                                ))}
                            </GoogleMap>
                        </LoadScript> */}
                        {data && <OrderGoogleMap
                            googleMapApiKey="AIzaSyACftO4Dtfn7BQETFuT4YQZ_wOrO3hgszc"
                            zoomNumber={12}
                            key={data?.addressCode + "-" + data?.customerVerifiedLatLong?.latitude + "-" + data?.customerVerifiedLatLong?.longitude}
          
                            center={{
                                id: `${data.id}`,
                                lat: parseFloat(data?.customerVerifiedLatLong?.latitude),
                                lng: parseFloat(data?.customerVerifiedLatLong?.longitude),
                                name: 'Check In Location',
                                internalName: '',
                                phone: `Customer Code: ${data.customerCode}`,
                            }}
                            positions={[
                                {
                                    id: "origin",
                                    lat: data?.customerVerifiedLatLong?.currentLat,
                                    lng: data?.customerVerifiedLatLong?.currentLong,
                                    name: "Your Location",
                                    internalName: "",
                                    phone: ""
                                },
                                {
                                    id: "destination",
                                    lat: parseFloat(data?.customerVerifiedLatLong?.latitude),
                                    lng: parseFloat(data?.customerVerifiedLatLong?.longitude),
                                    name: "Last Point",
                                    internalName: "",
                                    phone: ""
                                },
                            ]}
                        />}
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