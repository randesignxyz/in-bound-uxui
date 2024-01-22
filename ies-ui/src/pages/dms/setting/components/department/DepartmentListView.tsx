import { BankOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined, PlusOutlined, ReloadOutlined, UserAddOutlined } from "@ant-design/icons"
import { Button, Flex, Input, Modal, Space, Tag, message } from "antd"
import { simpleRequestActions } from "@/services/model";
import { useEffect, useRef, useState } from "react";
import { ActionType, ProList } from "@ant-design/pro-components";
import { DepartmentServiceAPI } from "./service";
import DepartmentEntryFormModal from "./DepartmentEntryForm";
import UserGroupEntryModal from "../../usergroup/UserGroupEntryModal";
import { GroupServiceAPI } from "../../usergroup/service";
import { GroupCreate } from "../../usergroup/data";
import AsseignUserModalForm from "./AssignUser";

interface Props {
    actionKey?: string
}
export default ({ actionKey }: Props) => {
    const requestAction = simpleRequestActions();
    const services = DepartmentServiceAPI(requestAction);
    const actionRef = useRef<ActionType>();
    const [state, setState] = useState<{
        visible?: {
            name: "modal";
            type: "ADD" | "EDIT";
            payLoad?: DepartmentDTO
        }
    }>();

    const [assignDepartmentState, setAssignDepartmentState] = useState<{
        visible?: {
            name: "MODAL";
            deparment?: DepartmentDTO;
        }
    }>();

    const [userGroupState, setUserGroupState] = useState<{
        visible?: {
            name: "modal";
            type: "ADD" | "EDIT";
            payLoad?: { record?: DepartmentDTO }
        }
    }>();

    const onLoad = async () => {
        const data = await services.page({
            criteria: { searchValue: "", advanceSearch: {} }
        });
    }

    useEffect(() => {
        onLoad();
    }, [actionKey]);

    const onSave = async (data: DeparmentCreate) => {
        Modal.confirm({
            title: "Save Accessory record",
            content: " are you sure?",
            onOk: async () => {
                const response = await services.save(data) as ({
                    message: string,
                    data: string,
                });
                setState((v) => ({ ...v, visible: undefined }));
                message.success(response.message);
                actionRef.current?.reloadAndRest?.();
            }
        });
    }
    return (
        <>
            <ProList
                actionRef={actionRef}
                headerTitle={
                    <>
                        <Input />
                    </>
                }
                toolBarRender={() => [
                    <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setState({ visible: { name: "modal", type: "ADD", } })
                        }}
                    />,
                    <Button
                        type="link"
                        icon={<ReloadOutlined />}
                        onClick={() => actionRef.current?.reload?.()}
                    ></Button>,
                ]}
                request={async () => {
                    const data = await DepartmentServiceAPI(requestAction).page({
                        criteria: {
                            searchValue: ""
                        }
                    });
                    return Promise.resolve({
                        data: data.items,
                        success: true
                    })
                }}
                metas={{
                    title: {
                        dataIndex: "name"
                    },
                    subTitle: {
                        render: (_, r) => {
                            return (<Space>
                                <Tag color="gold">{r?.buId?.name}</Tag>
                                <Tag color="lime">{r?.status}</Tag>
                            </Space>)
                        }
                    },
                    type: {},
                    avatar: {
                        render: (_, r) => (<BankOutlined />)
                    },
                    description: {
                        render: (_, r) => {
                            return (<>
                                <p>{r.description}</p>
                                <Flex wrap="wrap" gap={"small"}>

                                    {r.users?.map(it => (<Tag color="geekblue">{it.fullName}</Tag>))}
                                </Flex>
                            </>)
                        }
                    },
                    actions: {
                        render: (_, r) => [
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => setState({ visible: { name: "modal", type: "ADD", payLoad: r } })}
                            />,
                            <Button
                                type="link"
                                icon={<InfoCircleOutlined />}
                            />,
                            <Button
                                type="link"
                                icon={<UserAddOutlined />}
                                onClick={() => {
                                    setAssignDepartmentState({ visible: { name: "MODAL", deparment: r } })
                                }}
                            />,
                            <Button
                                type="link"
                                icon={<DeleteOutlined style={{ color: "red" }} />}
                            />,
                        ]
                    },
                }}

            />
            <UserGroupEntryModal
                open={userGroupState?.visible?.name === "modal"}
                onCancel={() => setUserGroupState(v => ({ ...v, visible: undefined }))}
                onSave={async (data: GroupCreate) => {
                    GroupServiceAPI(requestAction).save(data)
                    setUserGroupState((v) => ({ ...v, visible: undefined }));
                }}
            />

            <DepartmentEntryFormModal
                open={state?.visible?.name === "modal"}
                onCancel={() => setState(v => ({ ...v, visible: undefined }))}
                onSave={onSave}
                data={state?.visible?.payLoad}
            />

            <AsseignUserModalForm
                open={assignDepartmentState?.visible?.name == "MODAL"}
                onSave={async (data: AssignDepartment) => {
                    await DepartmentServiceAPI(requestAction).assignUser(data);
                    actionRef.current?.reload?.();
                    setAssignDepartmentState((v)=>({...v,visible:undefined}));
                }}
                onCancel={() => setAssignDepartmentState((v) => ({ ...v, visible: undefined }))}
                department={assignDepartmentState?.visible?.deparment}
            />
        </>
    )
}