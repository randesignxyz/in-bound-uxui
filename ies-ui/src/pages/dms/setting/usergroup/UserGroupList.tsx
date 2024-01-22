import { ActionType, ProList } from "@ant-design/pro-components"
import { Button, Flex, Space, Tag } from "antd"
import { GroupServiceAPI } from "./service"
import { simpleRequestActions } from "@/services/model"
import { GroupCreate, GroupDTO } from "./data"
import { EditOutlined, InfoCircleOutlined, UserAddOutlined, DeleteOutlined, TeamOutlined, PlusOutlined } from "@ant-design/icons"
import { useEffect, useRef, useState } from "react"
import UserGroupEntryModal from "./UserGroupEntryModal"
import GroupDetail from "./Detail"

interface Props {
    actionKey?: string
}

export default ({ actionKey }: Props) => {
    const requestAction = simpleRequestActions();
    const services = GroupServiceAPI(requestAction);
    const actionRef = useRef<ActionType>();
    useEffect(() => {

    }, [actionKey]);

    const [state, setState] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            payload?: GroupDTO;
        }
    }>();
    const [detailState, setDetailState] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            payload?: GroupDTO;
        }
    }>();
    return (
        <>
            <ProList<GroupDTO>
                toolBarRender={() => [
                    <Button
                        icon={<PlusOutlined />}
                        type="link"
                        onClick={() => setState({ visible: { name: "MODAL", type: "ADD", } })}
                    />
                ]}
                request={async () => {
                    const data = services.page({ searchValue: "" });
                    return Promise.resolve({
                        data: (await data).items,
                        success: true
                    });
                }}
                actionRef={actionRef}
                metas={{
                    title: {
                        dataIndex: "name"
                    },
                    subTitle: {
                        dataIndex: "isDeleted"
                    },
                    type: {},
                    avatar: {
                        render: (_, r) => (<TeamOutlined />)
                    },
                    description: {
                        render: (_, r) => {
                            return (
                                <Flex vertical>
                                    
                                    <p>{r.description}</p>
                                    <Flex  wrap="wrap" gap={"small"}>

                                        {r.userList?.map(it => (<Tag color="gold">{it.userName}</Tag>))}
                                    </Flex>
                                    
                                </Flex>
                            )
                        }
                    },

                    actions: {
                        render: (_, r) => [
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => setState({ visible: { name: "MODAL", type: "EDIT", payload: r } })}
                            />,
                            <Button
                                type="link"
                                icon={<InfoCircleOutlined />}
                                onClick={()=>setDetailState({visible:{name:"MODAL", type:"EDIT", payload:r}})}
                            />,
                            <Button
                                type="link"
                                icon={<UserAddOutlined />}
                            />,
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined  />}
                            />,
                        ]
                    },
                }}
            />

            <UserGroupEntryModal
                open={state?.visible?.name === "MODAL"}
                onCancel={() => setState({ visible: undefined })}
                data={state?.visible?.payload}
                onSave={async (data: GroupCreate) => {
                    services.save(data);
                    actionRef.current?.reload?.();
                    setState((v) => ({ ...v, visible: undefined }))

                }}
            />

            <GroupDetail
                open={detailState?.visible?.name==="MODAL"}
                onClose={()=>setDetailState((v)=>({...v, visible:undefined}))}
            />
        </>
    )
}