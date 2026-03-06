import { simpleRequestActions } from "@/services/model"
import { useQuery } from "@umijs/max"
import { ShippingAddressAPI } from "./services"
import { Button, Card, Col, Flex, message, Row, Space } from "antd";
import { ProDescriptions } from "@ant-design/pro-components";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { Address } from "@/services/crm/data";
import { CopyOutlined, ShareAltOutlined } from "@ant-design/icons";

interface Props {
    id?: number;
    openInTab?: true;
    onBack?: () => void;
    item?: any
}

const containerStyle = {
    width: '100%',
    height: '50vh'
};

const ShippingAddressDetail: React.FC<Props> = ({ id, item }) => {

    const requestAction = simpleRequestActions();
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const [showInfo, setShowInfo] = useState(false);

    const { data, isFetching } = useQuery({
        queryKey: ["shipping-address", id],
        queryFn: () => ShippingAddressAPI(requestAction).fetch({ id: item?.id ?? 0 }),
        refetchOnWindowFocus: false,
        enabled: !!id
    });

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyA0Ifgai8ryDULDIqNOZmX8L7XZlzu4_D8",
    });

    const lat = Number(data?.address?.latitude);
    const lng = Number(data?.address?.longitude);

    const center = {
        lat: lat || 11.58181155360925,
        lng: lng || 104.91810050044207
    };

    useEffect(() => {
        if (mapInstance && lat && lng) {
            mapInstance.panTo({ lat, lng });
            mapInstance.setZoom(16);
        }
    }, [mapInstance, lat, lng]);
    const shareLocation = () => {
        const lat = Number(data?.address?.latitude);
        const lng = Number(data?.address?.longitude);

        if (!lat || !lng) {
            console.log("Location not available");
            return;
        }

        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, "_blank");
    };
    const copyMapLink = () => {
        const lat = Number(data?.address?.latitude);
        const lng = Number(data?.address?.longitude);

        if (!lat || !lng) return;

        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

        navigator.clipboard.writeText(url);

        message.success("Map link copied");
    }
    return (
        <Flex gap={12} vertical>

            <Card title={"Information"} size="small"
                extra={
                    <Space size={0}>
                        <Button
                            icon={<CopyOutlined />}
                            onClick={copyMapLink}
                            type="link"
                        >
                            Copy Map URL
                        </Button>
                        <Button
                            icon={<ShareAltOutlined />}
                            type="link"
                            onClick={shareLocation}
                        >
                            Share Map
                        </Button>
                    </Space>
                }
            >
                <ProDescriptions
                    dataSource={item}
                    columns={[
                        {
                            title: "Shipping Code",
                            dataIndex: "code"
                        },
                        {
                            title: "Customer",
                            dataIndex: "customerCode"
                        },
                        {
                            title: "Address",
                            dataIndex: "addressCode"
                        },
                        {
                            title: "Salesperson Code",
                            render: (_, r) => r.salesperson?.code
                        },
                        {
                            title: "Salesperson Name",
                            render: (_, r) => r.salesperson?.name
                        },
                    ]}
                />
                <div>
                    <Row>
                        <Col>
                            {[
                                { name: 'Street Name', value: data?.address?.streetName },
                                { name: 'Street No', value: data?.address?.streetNo },
                                { name: 'House', value: data?.address?.houseNo },
                                { name: 'Village', value: data?.address?.village?.name },
                                { name: 'Commune', value: data?.address?.commune?.name },
                                { name: 'District', value: data?.address?.district?.name },
                                { name: 'Province', value: item?.province?.name },
                            ]
                                .filter((it) => it.value)
                                .map((it) => `${it.name} ${it.value}`)
                                .join(', ')}
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {' '}
                            Hotspot: {data?.address?.hotspot || 'N/A'}, Direction: {data?.address?.direction || 'N/A'}{' '}
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {' '}
                            Latitute: {data?.address?.latitude || 'N/A'}, Longitude: {data?.address?.longitude || 'N/A'}
                        </Col>
                    </Row>
                </div>
            </Card>

            <Card>
                {isLoaded && data?.address && !isFetching && (
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={16}
                        onLoad={(map) => setMapInstance(map)}
                    >

                        <Marker
                            position={{ lat, lng }}
                            onClick={() => {
                                setShowInfo(true);
                                mapInstance?.panTo({ lat, lng });
                            }}
                        />

                        {showInfo && (
                            <InfoWindow
                                position={{ lat, lng }}
                                onCloseClick={() => setShowInfo(false)}
                            >
                                <div>
                                    <b>Name:</b> {data?.address?.address || "Shipping Location"} <br />
                                    <b>Latitude:</b> {lat} <br />
                                    <b>Longitude:</b> {lng}
                                </div>
                            </InfoWindow>
                        )}

                    </GoogleMap>
                )}
            </Card>

        </Flex>
    )
}

export default ShippingAddressDetail;