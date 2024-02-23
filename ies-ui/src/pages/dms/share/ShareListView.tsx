import { formatDate } from "@/pages/utils";
import { DeleteOutlined, ReloadOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { ActionType, ProList } from "@ant-design/pro-components";
import { Avatar, Tag, Flex, Space, Button, Spin, Badge, message, Modal } from "antd";
import { ShareDTO } from "./data";
import { ShareServiceAPI } from "./service";
import { simpleRequestActions } from "@/services/model";
import { useEffect, useRef, useState } from "react";
import { expriationStatus } from "../core";

interface Props {
    docId?: number
}

export default ({ docId }: Props) => {
    const requestAction = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const [shareState, setShareState] = useState<ShareDTO[]>();
    const onRequest = async () => {
        const data = await ShareServiceAPI(requestAction).list(docId);
        setShareState(data);
    }
    useEffect(() => {
        docId && onRequest()
    }, [docId]);
    return (
        <>
            <Spin spinning={requestAction.request?.loading}>

                <ProList<ShareDTO>
                    dataSource={shareState}
                    style={{
                        margin: 0,
                        padding: 0
                    }}
                    cardProps={{
                        style: {
                            margin: 0,
                            padding: 0
                        }
                    }}
                    actionRef={actionRef}
                    toolBarRender={() => {
                        return [
                            <Button icon={<ReloadOutlined />} type="link" onClick={() => actionRef.current?.reload?.()} />
                        ]
                    }}
                    metas={{
                        avatar: {
                            valueType: "avatar",
                            render: (_, r) => <Avatar icon={r.type === "GROUP" ? <TeamOutlined /> : <UserOutlined />} />
                        },
                        title: {
                            dataIndex: "recipient",
                        },
                        subTitle: {
                            render: (_, r) => <Tag color="gold">{r.type}</Tag>
                        },
                        content: {
                            render: (_, r) => (
                                <>
                                    <Space align="baseline">
                                        <p style={{ color: "gray" }}>Expiration Date: </p>
                                        <Badge status={expriationStatus(r.expirationDate) > 0 ? "error" : "processing"} text={formatDate(r.expirationDate)} />
                                    </Space>
                                    <Space >
                                        <p style={{ color: "gray" }}>Shared Date: </p>
                                        <p>{formatDate(r.createdDate)}</p>
                                    </Space>

                                </>
                            )
                        },
                        description: {
                            render: (_, r) => (<Flex vertical>
                                <p>{r.description}</p>

                            </Flex>)
                        },
                        actions: {
                            render: (_, r) => <Flex vertical>
                                <span>Accessible</span><Tag color="cyan" bordered={false}>{r.accessible}</Tag>
                                <Button disabled={!r.isOwner} type="link" danger style={{ position: "absolute", top: -30, right: 0 }} icon={<DeleteOutlined />}
                                    onClick={() => Modal.confirm({
                                        title: "Delete Shared",
                                        content: "are you sure?",
                                        onOk: () => {
                                            ShareServiceAPI(requestAction).delete(r.id);
                                            actionRef.current?.reload?.();
                                            message.success("success")
                                        }
                                    })} />
                            </Flex>
                        }
                    }}

                />
            </Spin>
        </>
    )
}