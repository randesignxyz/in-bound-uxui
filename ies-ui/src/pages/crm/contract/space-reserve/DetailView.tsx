import { simpleRequestActions } from "@/services/model"
import { AimOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { Button, Modal, Typography, Image, Flex, Space, Alert, List, Card, Col, Row } from "antd"
import { ContractServices } from "../services"
import { useEffect, useState } from "react"
import SpaceReservedModalForm from "./EntryModalForm"
import { AddressInfo } from "@/services/crm/data"
import ImageViewer from "../../components/ImageViewer"
interface Props {
    contractId: number;
    address?: AddressInfo[];
    source: "CONTRACT" | "CUSTOMER";
    contractCode?: string;
    editable?: boolean;
}

const SpaceReservedView: React.FC<Props> = ({ address, contractCode, source, contractId, editable= true }) => {
    const requestActions = simpleRequestActions();
    const [keyUpdate, setKeyUpdate] = useState((Math.random() * 1000).toString());
    const [state, setState] = useState<{
        visible?: {
            name: "MODAL",
            payloads?: SpaceReserveItem
        }
    }>();
    const [spaceReserve, setSpaceReserve] = useState<SpaceReserveItem[]>();
    const loadData = async () => {
        const data = await ContractServices.listSpaceReserved({ id: contractId }).query(requestActions);
        setSpaceReserve(data);
    }
    useEffect(() => {
        loadData?.();
    }, [keyUpdate]);

    return (<>
        {
            spaceReserve?.find(i=>i.contractId ==contractId) && (<Card
                size="small"
                bordered={false}
                key={keyUpdate}
                title={<Space>
                    <Typography.Text type="success">{source == "CUSTOMER" ? `#${contractCode}` : ""}</Typography.Text>
                </Space>}
                styles={{
                    header: {
                        border: "none",
                    },
                    body: {
                        padding: 0
                    }
                }}
                extra={<>
                    {source === "CONTRACT" && <Button size="small" type="link" onClick={() => setState({ visible: { name: "MODAL" } })} disabled={!editable}>New</Button>}
                </>}
            >
                <List
                    dataSource={spaceReserve}
                    loading={requestActions.request?.loading}
                    key={keyUpdate}
                    size="small"
                    split={false}
                    renderItem={(item) => (
                        <List.Item>
                            <Card style={{ width: "100%", }} styles={{ header: { border: "none" } }} size="small"
                                extra={
                                    source == "CONTRACT" && <Space>
                                        <Button size="small" type="link" onClick={() => setState({ visible: { name: "MODAL", payloads: item } })} icon={<EditOutlined />} />
                                        <Button size="small" type="link" danger onClick={() => {
                                            Modal.confirm({
                                                title: "Delete Record Selected.",
                                                content: "are you sure?",
                                                onOk: () => {
                                                    ContractServices.deleteSpaceReserved({ id: item.id || 0 })(requestActions);
                                                    setKeyUpdate((Math.random() * 1000).toString())
                                                }
                                            })
                                        }} icon={<DeleteOutlined />} />
                                    </Space>
                                }
                            >
                                <Flex wrap gap={24}>
                                    <div style={{ position: "relative", width: 200, zIndex: 6 }} onContextMenu={(e) => e.preventDefault()}>
                                        <div style={{ position: "absolute", top: 20, left: 145 }}><Typography.Title level={5} type="warning">{item.height}m</Typography.Title></div>
                                        <div style={{ position: "absolute", bottom: 10, left: 150 }}><Typography.Title level={5} type="warning">{item.width}m</Typography.Title></div>
                                        <div style={{ position: "absolute", bottom: 10, left: 50 }}><Typography.Title level={5} type="warning">{item.length}m</Typography.Title></div>
                                        <img
                                            width={172}
                                            alt="logo"
                                            style={{
                                                pointerEvents: "none"
                                            }}
                                            src="https://www.math.net/img/a/geometry/shapes/dimensions/rectangular-prism.png"
                                        />
                                    </div>
                                    <Flex vertical wrap >
                                        <Space align="baseline" style={{ width: "100%" }}>
                                            <AimOutlined />
                                            <Typography.Title level={5} type="warning">{item.addressName}</Typography.Title>
                                            <Typography.Text type="secondary">{item.name}</Typography.Text>
                                        </Space>
                                        <Space direction="vertical">
                                            {item.attribute?.map(p => {
                                                return <>
                                                    <Alert
                                                        showIcon
                                                        type="success"
                                                        style={{ width: "100%" }}
                                                        message={p.name}
                                                        icon={<Typography.Text type="warning">{p.typeName}:</Typography.Text>}
                                                        action={
                                                            <Typography.Text type="warning">[ x{p.quantity} ]</Typography.Text>
                                                        }
                                                    />
                                                </>
                                            })}
                                        </Space>
                                    </Flex>
                                    <div>
                                        <Image.PreviewGroup>
                                            {
                                                item.fileId?.map(p => {
                                                    return <ImageViewer
                                                        fileId={p}
                                                        width={90}
                                                    />
                                                })
                                            }
                                        </Image.PreviewGroup>
                                    </div>
                                </Flex>
                            </Card>
                        </List.Item>
                    )}
                />
            </Card>) ||

            source=="CONTRACT"   && <Card
                   size="small"
                    extra={<>
                        {source === "CONTRACT" && <Button size="small" type="link" onClick={() => setState({ visible: { name: "MODAL" } })} >New</Button>}
                    </>}
                ></Card>

        }

        <SpaceReservedModalForm
            open={state?.visible?.name == "MODAL"}
            onCancel={() => setState({ visible: undefined })}
            addressList={address}
            data={state?.visible?.payloads}
            onSave={(data) => {
                Modal.confirm({
                    title: "Save Space Reserve",
                    content: "are you sure?",
                    onOk: async () => {
                        await ContractServices.saveSpaceReserved({
                            ...data,
                            contractId: contractId
                        })(requestActions);
                        setState({ visible: undefined });
                        setKeyUpdate((Math.random() * 1000).toString())
                    }
                })
            }}
        />
    </>)
}

export default SpaceReservedView