import { BankOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons"
import { Button, Flex, Modal, Space, Tag, message } from "antd"
import { simpleRequestActions } from "@/services/model";
import { useEffect, useRef, useState } from "react";
import { ActionType, ProList } from "@ant-design/pro-components";
import { DepartmentServiceAPI } from "./service";
import DepartmentEntryFormModal from "./DepartmentEntryForm";
import UserGroupEntryModal from "../../teams/TeamEntryModal";
import { TeamsServiceAPI } from "../../teams/service";
import AsseignUserModalForm from "./AssignUser";
import { TeamsCreate } from "../../teams/data";

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
                search={{
                    optionRender: (e) => {
                        return [
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
                        ]
                    }
                }}
                pagination={{
                    pageSize: 20
                }}
                request={async (param) => {
                    const data = await DepartmentServiceAPI(requestAction).page({
                        criteria: {
                            searchValue: param.name
                        },
                        pagination: {
                            current: param.current,
                            pageSize: param.pageSize
                        }
                    });
                    return Promise.resolve({
                        data: data.items,
                        success: true,
                        total: data.total
                    });
                }}
                metas={{
                    title: {
                        dataIndex: "name"
                    },
                    subTitle: {
                        search:false,
                        render: (_, r) => {
                            return (<Space>
                                <Tag color="gold">{r?.buId?.name}</Tag>
                                <Tag color="lime">{r?.status}</Tag>
                            </Space>)
                        }
                    },
                    avatar: {
                        search:false,
                        render: (_, r) => (<BankOutlined />)
                    },
                    description: {
                        search:false,
                        render: (_, r) => {
                            return (<>
                                <p>{r.description}</p>
                                <Flex wrap="wrap" gap={"small"}>
                                    {r.users?.map(it => (<Tag color="geekblue">{it.fullName}</Tag>))}
                                </Flex>
                            </>)
                        }
                    },
                }}
            />
            <UserGroupEntryModal
                open={userGroupState?.visible?.name === "modal"}
                onCancel={() => setUserGroupState(v => ({ ...v, visible: undefined }))}
                onSave={async (data: TeamsCreate) => {
                    TeamsServiceAPI(requestAction).save(data)
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