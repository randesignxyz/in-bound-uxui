import { AimOutlined, CheckCircleTwoTone, FieldTimeOutlined } from "@ant-design/icons";
import { ProDescriptions, ProList } from "@ant-design/pro-components";
import { Card, Col, Collapse, Flex, Image, List, Row, Space, Typography } from "antd"
import { AddresssView } from "../register/data";
import ActivityLog from "@/components/ActivityLog";
import ImagePreview from "@/components/ImagePreview";
import OrderGoogleMap from "@/pages/sale/retailer/orders/components/OrderGoogleMap";
import { formatDateTime } from "@/pages/utils";
import moment from "moment";
import { simpleRequestActions } from "@/services/model";
import { CustomerWithAddressVerifiedAPI } from "./service";

interface Props {
    data: any,
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

const VerifiedDetailView: React.FC<Props> = ({ data, mode, onBack }) => {
    const location = extractCoordinates(data?.logs?.remarks);
    const requestActions = simpleRequestActions();
    return (
        <>
            {mode == "Address" && (
                <Flex vertical gap={12}>
                    <Card>
                        <ProDescriptions
                            dataSource={data}
                            contentStyle={{
                                fontWeight: "500"
                            }}
                            columns={[
                                {
                                    title: "Code",
                                    render: (_, r) => r.code,
                                },
                                {
                                    title: "Name",
                                    render: (_, r) => r.customer?.name,
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
                                {
                                    title: "Status",
                                    render: (_, r) => <Typography.Text type={r.active == "N" ? "danger" : "success"}>{r.active == "N" ? "Inactive" : "Active"}</Typography.Text>
                                },
                                {
                                    title: "Verified",
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
                                                                : r.verifiedStatus?.id ===20004  //"Confirmed"
                                                                    ? "#52c41a" // green
                                                                    : undefined
                                            }}
                                        >{r.verifiedStatus?.name}</Typography>
                                    }
                                },
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
                        />:"No Image"}
                       
                    </Card>
                    <Card size={"small"} title="Map">
                        {data?.customerVerifiedLatLong && <OrderGoogleMap
                            googleMapApiKey="AIzaSyACftO4Dtfn7BQETFuT4YQZ_wOrO3hgszc"
                            zoomNumber={12}
                            center={{
                                id: `${data.id}`,
                                lat: parseFloat(data?.customerVerifiedLatLong?.latitude),
                                lng: parseFloat(data?.customerVerifiedLatLong?.longitude),
                                name: 'Check In Location',
                                internalName: '',
                                phone: `Customer Code: ${data.customerCode}`,
                            }}
                            positions={[]}
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
                                    render: (_, r) => <FieldTimeOutlined/>
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
                        {/* <ActivityLog objectName='ADDRESS_VERIFIED' objectId={data?.addressId} endpoint='CRM' /> */}
                    </Card>
                </Flex>
            ) ||
                <Flex vertical gap={12}>

                    <Card title={"Customer"} size="small"
                    >
                        <ProDescriptions
                            dataSource={data}
                            contentStyle={{
                                fontWeight: "500"
                            }}
                            columns={[
                                {
                                    title: "Code",
                                    render: (_, r) => r.code,

                                },
                                {
                                    title: "Name",
                                    render: (_, r) => r.name
                                },
                                {
                                    title: "OwnerName",
                                    dataIndex: "ownerName"
                                    // render: (_, r) => r.ownerName
                                },
                                {
                                    title: "Salesperson",
                                    render: (_, r) => [r.salesperson?.code, r.salesperson?.name].filter(Boolean).join("-")
                                },
                                {
                                    title: "Source",
                                    dataIndex: "source"
                                },
                                {
                                    title: "Status",
                                    render: (_, r) => <Typography.Text type={r.active == "N" ? "danger" : "success"}>{r.active == "N" ? "Inactive" : "Active"}</Typography.Text>
                                }
                            ]}
                        />
                    </Card>
                    <Card size="small" >
                        <Collapse
                            size="small"
                            ghost
                            defaultActiveKey={["1"]}
                            items={[{
                                key: '1', label: 'Address', children: <p>
                                    <List<AddresssView>
                                        size="small"
                                        locale={{ emptyText: 'No Address added' }}
                                        dataSource={data.address || []}
                                        itemLayout="horizontal"
                                        rowKey="key"
                                        renderItem={(item) => (
                                            <List.Item
                                            >
                                                <List.Item.Meta
                                                    title={
                                                        <Space>
                                                            {' '}
                                                            <AimOutlined /> {item.address}
                                                            {item.isVerified == true ? <CheckCircleTwoTone twoToneColor={"#52C41A"} /> : ""} {/*<Tag>{item.type?.name}</Tag>{' '}*/}
                                                        </Space>
                                                    }
                                                    description={
                                                        <div>
                                                            <Row>
                                                                <Col>
                                                                    {[
                                                                        { name: 'Street Name', value: item?.streetName },
                                                                        { name: 'Street No', value: item?.streetNo },
                                                                        { name: 'House', value: item?.houseNo },
                                                                        { name: 'Village', value: item?.village?.name },
                                                                        { name: 'Commune', value: item?.commune?.name },
                                                                        { name: 'District', value: item?.district?.name },
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
                                                                    Hotspot: {item.hotspot || 'N/A'}, Direction: {item.direction || 'N/A'}{' '}
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col>
                                                                    {' '}
                                                                    Latitute: {item.latitude || 'N/A'}, Longitude: {item.longitude || 'N/A'}
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    }
                                                />
                                                {/* {(item.visitPlanOptionList || []).length > 0 && <ListContent item={item} />} */}
                                            </List.Item>
                                        )}
                                    />
                                </p>
                            }]}
                        />
                    </Card>
                    <Card size="small" title="Attachment Photos" bordered>
                        <Image.PreviewGroup>
                            <Space>
                                {data?.attachmentFile?.map((it1, index) => ({
                                    fileId: it1.fileId,
                                    fileName: `Photo (${index + 1})`,
                                }))?.map(it => <ImagePreview
                                    width={'200px'}
                                    key={it.fileId}
                                    fileId={it.fileId}
                                    fileName={it.fileName}
                                />)}
                            </Space>
                        </Image.PreviewGroup>
                    </Card>
                    <Card size="small" title={"Activity"}>
                        <ActivityLog objectName='ADDRESS_VERIFIED' objectId={data?.id} endpoint='CRM'
                            styles={{
                                avatar: {
                                    color: "red"
                                }
                            }}
                        />
                    </Card>

                </Flex>
            }

        </>
    )
}


export default VerifiedDetailView