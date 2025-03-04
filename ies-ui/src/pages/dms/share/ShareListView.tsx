import { formatDate } from "@/pages/utils";
import { DeleteOutlined, EllipsisOutlined, ReloadOutlined, SaveOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { ActionType, ProList } from "@ant-design/pro-components";
import { Avatar, Tag, Flex, Space, Button, Badge, message, Modal, Dropdown, MenuProps } from "antd";
import { ShareDTO } from "./data";
import { ShareServiceAPI } from "./service";
import { simpleRequestActions } from "@/services/model";
import { useEffect, useRef, useState } from "react";
import { expriationStatus } from "../core";
import { Typography } from "antd/lib";
import { DocumentationCreate, DocumentationDTO } from "../documentation/data";
import CopyDocument from "./CopyDocument";

interface Props {
    docId?: number;
    actionKey?: string;
}

export default ({ docId, actionKey }: Props) => {
    const requestAction = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const [shareState, setShareState] = useState<ShareDTO[]>();
    const service = ShareServiceAPI(requestAction);
    const onRequest = async () => {
        const data = await ShareServiceAPI(requestAction).list(docId);
        setShareState(data);
    }
    // useEffect(() => {
    //     docId && onRequest()
    // }, [docId]);
    const [ copyDocumentState, setCopyDocumentState ] = useState<{
        visible?:{
            open:boolean |  false ;
            data?:DocumentationDTO
        }
    }>();

    const items = (record: ShareDTO): MenuProps['items'] => [
        {
            key: "1",
            label: "Save a Document",
            icon: <SaveOutlined />,
            onClick: () =>setCopyDocumentState({visible:{open:true, data:record.document}})
        },
        {
            key: "remove",
            label: "Remove",
            icon: <DeleteOutlined />,
            danger: true,
            disabled:!record.isOwner,
            onClick: () => {
                Modal.confirm({
                    title: "Delete Shared",
                    content: "are you sure?",
                    // onOk: () => {
                    //     ShareServiceAPI(requestAction).delete(record.id);
                    //     actionRef.current?.reload?.();
                    //     message.success("success")
                    // }
                });
            }
        }
    ]

    return (
        <>
            <ProList<ShareDTO>
                dataSource={shareState}
                size="small"
                headerTitle={"Shared"}
                request={async ({ keyword, current, pageSize }) => {
                    const data = await service.page({
                        criteria: {
                            searchValue: keyword
                        },
                        pagination: {
                            current: current,
                            pageSize: pageSize
                        }
                    });
                    return Promise.resolve({
                        data: data.items,
                        success: true
                    })
                }}
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
                        render: (_, r) => r.createdBy?.replaceAll(".", " ")
                    },
                    subTitle: {
                        render: (_, r) => <Tag color="gold" bordered={false}>{r.type}</Tag>
                    },
                    content: {
                        render: (_, r) => (
                            <Space size={0} direction="vertical">
                                <Space align="baseline">
                                    <p style={{ color: "gray" }}>Expiration Date: </p>
                                    <Badge status={expriationStatus(r.expirationDate) > 0 ? "error" : "processing"} text={formatDate(r.expirationDate)} />
                                </Space>
                                <Space >
                                    <p style={{ color: "gray" }}>Shared Date: </p>
                                    <p>{formatDate(r.createdDate)}</p>
                                </Space>
                            </Space>
                        )
                    },
                    description: {
                        render: (_, r) => (<Flex vertical>
                            <Space size={12}>
                                <Typography.Text type="secondary">To:</Typography.Text>
                                <Typography.Text >{r.recipient}</Typography.Text>
                            </Space>
                            <Typography.Paragraph type="secondary" ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>{r.description}</Typography.Paragraph>
                        </Flex>)
                    },
                    actions: {
                        render: (_, r) => <Dropdown
                            menu={{
                                items: items(r),
                                style: {
                                    width: 200
                                }
                            }}
                        ><a><EllipsisOutlined /></a></Dropdown>
                       
                    }
                }}
            />

            <CopyDocument
                open={copyDocumentState?.visible?.open}
                onSave={(data)=>{
                    Modal.confirm({
                        title:"Save a Document",
                        content:"are you sure?",
                        onOk:async()=>{
                            await service.copyDocument(data);
                            message.success("Sucess");    
                            setCopyDocumentState({  visible:undefined });
                        }
                    })
                }}
                data={copyDocumentState?.visible?.data}
                onCancel={()=>setCopyDocumentState({visible:undefined})}
            />
        </>
    )
}