import { simpleRequestActions } from "@/services/model"
import { ActionType, ProList } from "@ant-design/pro-components"
import { useRef, useState } from "react";
import { ContractServices } from "../../contract/services";
import { Alert, Avatar, Col, Collapse, Flex, Row, Space, Tag, Typography } from "antd";
import { AimOutlined, PaperClipOutlined } from "@ant-design/icons";
import { Button } from "antd/lib";
import POSMImage from "../../components/POSMImage";
import { ContractPOSMItem } from "../../contract/types";
import { formatDate } from "@/pages/utils";

interface Props {
    customerId: number;
    version?: number;
}

const POSMDisplayList: React.FC<Props> = ({ customerId, version }) => {
    const requestActions = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const [viewImage, setViewImage] = useState<{
        visible?: {
            open: Boolean;
            posmInfo: ContractPOSMItem
        }
    }>();
    return (
        <>
            <ProList
                actionRef={actionRef}
                request={async () => {
                    const data1 = await ContractServices.listPOSMByCustomer(customerId).query(requestActions);
                    return Promise.resolve({
                        data: data1,
                        sucess: true
                    })
                }}
                size="small"
                grid={{
                    md:2,
                    xl:2,
                    lg:2,
                    xxl:2,
                    sm:1,
                    xs:1
                }}
                rowSelection={false}
                metas={{
                    title: {
                        dataIndex: "code"
                    },
                    subTitle: {
                        render: (_, r) => <Tag bordered={false} color="blue">{formatDate(r.expiryDate)}</Tag>
                    },
                    content: {
                        render: (_, item) => (
                            <Flex vertical gap={12}>
                                <Typography.Text type="secondary">{item.term.description}</Typography.Text>
                                <Collapse
                                    style={{
                                        marginLeft:"-40px",
                                    }}
                                    ghost
                                    size="small"
                                    expandIconPosition="start"
                                    expandIcon={() => <AimOutlined />}
                                    items={[
                                        {
                                            label: <Typography.Text type="warning">{item.address.address}</Typography.Text>,
                                            children: <>
                                                <Flex vertical style={{ paddingLeft:40}}>
                                                    <div>
                                                        <Typography.Text type="secondary">
                                                            <Row>
                                                                <Col>
                                                                    {[
                                                                        { name: 'Street Name', value: item.address?.streetName },
                                                                        { name: 'Street No', value: item.address?.streetNo },
                                                                        { name: 'House', value: item.address?.houseNo },
                                                                        { name: 'Village', value: item.address?.village?.name },
                                                                        { name: 'Commune', value: item.address?.commune?.name },
                                                                        { name: 'District', value: item.address?.district?.name },
                                                                        { name: 'Province', value: item.address?.province?.name },
                                                                    ]
                                                                        .filter((it) => it.value)
                                                                        .map((it) => `${it.name} ${it.value}`)
                                                                        .join(', ')}
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col>
                                                                    {' '}
                                                                    Hotspot: {item.address.hotspot || 'N/A'}, Direction: {item.address.direction || 'N/A'}{' '}
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col>
                                                                    {' '}
                                                                    Latitute: {item.address.latitude || 'N/A'}, Longitude: {item.address.longitude || 'N/A'}
                                                                </Col>
                                                            </Row>
                                                        </Typography.Text>
                                                    </div>
                                                </Flex>
                                            </>
                                        }
                                    ]}
                                />
                                <Space direction="vertical">
                                    {
                                        item.posm.map((p: any) => {
                                            return (<>
                                                <Alert
                                                    showIcon
                                                    message={p.posmName.name}
                                                    icon={<Avatar style={{ color: "white", backgroundColor: "#52c41a" }}>x{p.quantity}</Avatar>}
                                                    description={p.posmName.remark}
                                                    action={
                                                        p.attachment.length > 0 ? <Button type="link" icon={<PaperClipOutlined />} onClick={() => setViewImage({ visible: { open: true, posmInfo: p } })} /> : ""
                                                    }
                                                />
                                            </>)
                                        })
                                    }
                                </Space>
                            </Flex>
                        )
                    },
                }}
            />
            <POSMImage
                open={viewImage?.visible?.open == true}
                pomsInfo={viewImage?.visible?.posmInfo}
                onClose={() => setViewImage({ visible: undefined })}
            />
        </>
    )
}

export default POSMDisplayList