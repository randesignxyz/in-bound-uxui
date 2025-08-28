import { AimOutlined, CheckCircleTwoTone } from "@ant-design/icons";
import { ProDescriptions } from "@ant-design/pro-components";
import { Card, Col, Collapse, Flex, Image, List, Row, Space, Typography } from "antd"
import { AddresssView } from "../register/data";
import ActivityLog from "@/components/ActivityLog";
import ImagePreview from "@/components/ImagePreview";
import { useQuery } from "@umijs/max";

interface Props {
    data: any,
    mode: string
    onBack: () => void
}
const VerifiedDetailView: React.FC<Props> = ({ data, mode, onBack }) => {

    console.log(data.attachmentFile);
    
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
                    <Card size="small" title="Attachment Photos" bordered>
                        <Image.PreviewGroup>
                            <Space>
                                {data?.attachment?.map((it1, index) => ({
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
                        <ActivityLog objectName='ADDRESS_VERIFIED' objectId={data?.addressId} endpoint='CRM' />
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
                        <ActivityLog objectName='ADDRESS_VERIFIED'  objectId={data?.id} endpoint='CRM'
                            styles={{
                                avatar:{
                                    color:"red"
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