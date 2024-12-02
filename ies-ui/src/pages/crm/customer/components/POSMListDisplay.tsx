import { simpleRequestActions } from "@/services/model"
import { ActionType, ProList } from "@ant-design/pro-components"
import { useRef, useState } from "react";
import { ContractServices } from "../../contract/services";
import { Alert, Avatar, Col, Flex, Row, Space, Tag, Typography } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";
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
                metas={{
                    title: {
                        dataIndex: "code"
                    },
                    subTitle: {
                        render: (_, r) => <Tag color="blue">{formatDate(r.expiryDate)}</Tag>
                    },
                    description: {
                        render: (_, item) => (
                            <Flex vertical gap={12}>
                                <Typography.Text type="secondary">{item.term.description}</Typography.Text>
                            <Space direction="vertical">
                                {
                                    item.posm.map((p:any) => {
                                        return (<>
                                            <Alert
                                                showIcon
                                                banner
                                                
                                                message={p.posmName.name}
                                                icon={<Avatar style={{  color:"white" }}>{p.quantity}</Avatar>}
                                                description={p.posmName.remark}
                                                action={
                                                    p.attachment.length>0?<Button type="link" icon={<PaperClipOutlined/>} onClick={()=>setViewImage({visible:{open:true, posmInfo:p}})} />:""
                                                }
                                            />
                                        </>)
                                    })
                                }
                            </Space>
                            </Flex>
                        )
                    },
                    content: {
                        render: (_, item) => (
                            <Flex vertical>
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