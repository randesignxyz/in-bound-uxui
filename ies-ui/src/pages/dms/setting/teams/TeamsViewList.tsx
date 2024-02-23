import { ActionType, ProList } from "@ant-design/pro-components"
import { Avatar, Button, Flex, Modal, Tag, Tooltip, message } from "antd"
import { TeamsServiceAPI } from "./service"
import { simpleRequestActions } from "@/services/model"
import { EditOutlined, InfoCircleOutlined, UserAddOutlined, DeleteOutlined, TeamOutlined, PlusOutlined, ReloadOutlined, SwapOutlined, UserOutlined } from "@ant-design/icons"
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

    const [memberViewState, setMemberViewState] = useState<{
        state: Boolean;
        id?: number;
    }>({ state: false });

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
                // search={{
                //     optionRender: (e) => {
                //         return [
                //             <Button
                //                 type="link"
                //                 onClick={() => setState({ visible: { name: "MODAL", type: "ADD" } })}
                //                 icon={<PlusOutlined />} />,
                //             <Button
                //                 type="link"
                //                 onClick={() => actionRef.current?.reload?.()}
                //                 icon={<ReloadOutlined />}
                //             />
                //         ]
                //     }
                // }}
                pagination={{
                    pageSize: 20
                }}
                options={false}
                // ghost={true}
                // grid={{ gutter: 16, column: 2 }}
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
                // metas={{
                //     avatar: {
                //         render: () => <Avatar
                //             style={{ marginRight: "10px" }}
                //             // size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
                //             icon={<TeamOutlined />}
                //         />
                //     },
                //     title: {
                //         dataIndex: "name",
                //     },
                //     subTitle:{
                //         dataIndex:"createdDate",
                //         valueType:"date"
                //     },
                //     content: {
                //         render: (_, r) => {

                //             return memberViewState?.id == r.id && !memberViewState.state ?
                //                 <Flex
                //                     wrap="wrap"
                //                     gap={2}
                //                 >
                //                     {r.userList.map(o => <Tooltip title={o.userName}><Tag color="gold">{o.userName}</Tag></Tooltip>)}
                //                 </Flex>

                //                 : <Avatar.Group
                //                     maxCount={10}
                //                 > {r.userList.map(o =>
                //                     <Tooltip title={o.userName}><Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} /></Tooltip>
                //                 )}
                //                 </Avatar.Group>
                //         }

                //     },
                //     actions: {
                //         render: (_, r) => [
                //             <Button
                //                 type="link"
                //                 onClick={() => setMemberViewState((b) => ({ ...b, id: r.id, state: !memberViewState?.state }))}
                //                 icon={<SwapOutlined />}
                //             />,
                //             <Button
                //                 type="link"
                //                 icon={<EditOutlined />}
                //                 onClick={() => setState({ visible: { name: "MODAL", type: "EDIT", payload: r } })}
                //             />,
                //             // <Button
                //             //     type="link"
                //             //     icon={<InfoCircleOutlined />}
                //             //     onClick={()=>setDetailState({visible:{name:"MODAL", type:"EDIT", payload:r}})}
                //             // />,
                //             // <Button
                //             //     type="link"
                //             //     icon={<UserAddOutlined />}
                //             // />,
                //             <Button
                //                 type="link"
                //                 danger
                //                 icon={<DeleteOutlined />}
                //                 onClick={() => {
                //                     Modal.confirm({
                //                         title: "Delete Group",
                //                         content: "Are you sure delete group? You can not restore.",
                //                         onOk: () => {
                //                             services.delete(r.id);
                //                             message.success("Success!");
                //                             actionRef.current?.reload?.();
                //                         }
                //                     })
                //                 }}
                //             />,
                //         ]
                //     }
                // }}
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
                        // <Button
                        //     type="link"
                        //     icon={<InfoCircleOutlined />}
                        //     onClick={()=>setDetailState({visible:{name:"MODAL", type:"EDIT", payload:r}})}
                        // />,
                        // <Button
                        //     type="link"
                        //     icon={<UserAddOutlined />}
                        // />,
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