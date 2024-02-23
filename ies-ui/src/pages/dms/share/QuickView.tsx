import { Avatar, Button, Drawer, DrawerProps, Flex, Modal, Space, Tag, message } from "antd"
import { ShareDTO } from "./data"
import { formatDate } from "@/pages/utils"
import { TeamOutlined, UserOutlined, DeleteOutlined } from "@ant-design/icons"
import { ActionType, ProList } from "@ant-design/pro-components"
import { useEffect, useRef } from "react"
import { simpleRequestActions } from "@/services/model"
import { ShareServiceAPI } from "./service"


interface Props extends DrawerProps{
    docId?:number
}

export default  ({ docId ,...props}:Props) =>{
    const actionRef = useRef<ActionType>();
    const requestActions = simpleRequestActions();
    const services = ShareServiceAPI(requestActions);
    useEffect(()=>{
        actionRef.current?.reload?.();
    }, [props.open]);

    return (
        <>
            <Drawer
                {...props}
                title="Quick View"
                width={600}
            >
               
                <ProList<ShareDTO>
                        actionRef={actionRef}
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
                        request={async () => {
                            const data = await services.list(docId);
                            return Promise.resolve({
                                data: data,
                                success: true
                            })
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
                            description: {
                                render: (_, r) => (<Flex vertical>
                                    <Space >
                                        <p>Shared Date: </p>
                                        <p>{formatDate(r.createdDate)}</p>
                                    </Space>
                                    <Space >
                                        <p>Expiration Date: </p>
                                        <p>{formatDate(r.expirationDate)}</p>
                                    </Space>
                                    <p>{r.description}</p>
                                </Flex>)
                            },
                            actions: {
                                render: (_, r) => <Flex gap={2} justify="space-between" align="center" vertical>
                                    <Flex vertical><span>Accessible</span><Tag color="cyan" bordered={false}>{r.accessible}</Tag></Flex>
                                    <Button disabled={!r.isOwner} type="link" danger style={{ position: "absolute", top: -50, right: 0 }} icon={<DeleteOutlined />} onClick={() => Modal.confirm({
                                        title:"Delete Shared",
                                        content:"are you sure?",
                                        onOk:()=>{
                                            services.delete(r.id);
                                            actionRef.current?.reload?.();
                                            message.success("success")
                                        }
                                    })} />
                                </Flex>
                            }
                        }}
                    />
            </Drawer>
        </>
    )
}