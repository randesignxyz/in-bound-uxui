import { ActionType, ProList } from "@ant-design/pro-components"
import { Button, Flex, Modal, Tag, message } from "antd"
import { TeamsServiceAPI } from "./service"
import { simpleRequestActions } from "@/services/model"
import { EditOutlined, DeleteOutlined, TeamOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons"
import { useEffect, useRef, useState } from "react"
import UserGroupEntryModal from "./TeamEntryModal"
import TeamsDetail from "./Detail"
import { TeamsCreate, TeamsDTO } from "./data"

interface Props {
    actionKey?: string;
    isCurrentUser?:boolean;
}

export default ({ actionKey, isCurrentUser }: Props) => {
    const requestAction = simpleRequestActions();
    const services = TeamsServiceAPI(requestAction);
    const actionRef = useRef<ActionType>();
    useEffect(() => {

    }, [actionKey]);

    const [state, setState] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            payload?: TeamsDTO;
        }
    }>();
    const [detailState, setDetailState] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            payload?: TeamsDTO;
        }
    }>();


    return (
        <>
            <ProList<TeamsDTO>
                headerTitle={"Your Teams"}
                toolBarRender={() => [
                    <Button
                        type="link"
                        onClick={() => setState({ visible: { name: "MODAL", type: "ADD" } })}
                        icon={<PlusOutlined />} />,
                    <Button
                        type="link"
                        onClick={() => actionRef.current?.reload?.()}
                        icon={<ReloadOutlined />}
                    />
                ]}
            
                pagination={{
                    pageSize: 20
                }}
                options={false}
                request={async (param) => {
                    const data = await services.page({
                        criteria: {
                            searchValue: param.name,
                            advanceSearch:{
                                isCurrentUser:isCurrentUser
                            }
                        },
                        pagination: {
                            pageSize: param.pageSize,
                            current: param.current
                        }
                    });
                    return Promise.resolve({
                        data: data.items,
                        success: true,
                        total: data.total
                    });
                }}
                actionRef={actionRef}

            metas={{
                title: {
                    dataIndex: "name"
                },
                subTitle: {
                    search:false,
                    dataIndex: "status"
                },
                avatar: {
                    search:false,
                    render: (_, r) => (<TeamOutlined />)
                },
                description: {
                    search:false,
                    render: (_, r) => {
                        return (
                            <Flex vertical>

                                <p>{r.description}</p>
                                <Flex  wrap="wrap" gap={"small"}>

                                    {r.memberList?.map(it => (<Tag color="gold">{it.userName}</Tag>))}
                                </Flex>

                            </Flex>
                        )
                    }
                },

                actions: {
                    search:false,
                    render: (_, r) => [
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => setState({ visible: { name: "MODAL", type: "EDIT", payload: r } })}
                        />,

                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined  />}
                            onClick={()=>{
                                Modal.confirm({
                                    title:"Delete Group",
                                    content:"Are you sure delete group? You can not restore.",
                                    onOk:()=>{
                                        services.delete(r.id);
                                        message.success("Success!");
                                        actionRef.current?.reload?.();
                                    }
                                })
                            }}
                        />,
                    ]
                },
            }}
            />

            <UserGroupEntryModal
                open={state?.visible?.name === "MODAL"}
                onCancel={() => setState({ visible: undefined })}
                data={state?.visible?.payload}
                onSave={async (data: TeamsCreate) => {
                    services.save(data);
                    setState((v) => ({ ...v, visible: undefined }))
                    actionRef.current?.reloadAndRest?.();
                    message.success("Success!")
                }}
            />

            <TeamsDetail
                open={detailState?.visible?.name === "MODAL"}
                onClose={() => setDetailState((v) => ({ ...v, visible: undefined }))}
                data={detailState?.visible?.payload}
            />
        </>
    )
}