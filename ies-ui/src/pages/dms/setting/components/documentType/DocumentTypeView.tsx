import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { ActionType, ProList } from "@ant-design/pro-components"
import { Button, Tag } from "antd";
import { useEffect, useRef, useState } from "react";
import DocumentTypeModalForm from "./DocumentTypeModalForm";
import { DocumentTypeServiceAPI } from "./service";
import { simpleRequestActions } from "@/services/model";
import { Modal, message } from "antd/lib";

interface Props {
    actionKey?: string
}
export default ({ actionKey }: Props) => {
    const actionRef = useRef<ActionType>();
    const requestAction = simpleRequestActions();
    const services = DocumentTypeServiceAPI(requestAction);
    const [state, setState] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            payload?: DocumentTypeDTO;
        }
    }>();
    useEffect(() => {
    }, [actionKey]);
    return (
        <>
            <ProList<DocumentTypeDTO>
                actionRef={actionRef}
                search={{
                    optionRender: (e) => {
                        return [
                            <Button
                                type="link"
                                onClick={() => setState({ visible: { name: "MODAL", type: "ADD" } })}
                                icon={<PlusOutlined />} />,
                            <Button
                                type="link"
                                onClick={() => actionRef.current?.reload?.()}
                                icon={<ReloadOutlined />}
                            />
                        ]
                    }
                }}
                pagination={{
                    pageSize: 20
                }}
                request={async (param) => {
                    const data = await services.page({
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
                        dataIndex: "status",
                        search: false
                    },
                    description: {
                        render: (_, r) => {
                            return <>
                                {r.fileExtension?.map(o => <Tag color="gold">{o}</Tag>)}
                                <p>{r.description}</p>
                            </>
                        },
                        search: false
                    },
                    actions: {
                        search: false,
                        render: (_, r) => [
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setState({ visible: { name: "MODAL", type: "EDIT", payload: r } })
                                }}
                            />,
                            <Button
                                danger
                                type="link"
                                onClick={() => {
                                    Modal.confirm({
                                        title: `Delete Document Type of ${r.name} `,
                                        content: "do you want to continue",
                                        onOk: () => {
                                            services.delete(r.id).then(i => {
                                                message.success("Success");
                                                actionRef.current?.reload?.();
                                            });
                                        }
                                    })
                                }}
                                icon={<DeleteOutlined />}
                            />
                        ]
                    }
                }}
            />
            <DocumentTypeModalForm
                open={state?.visible?.name == "MODAL"}
                onCancel={() => setState((v) => ({ ...v, visible: undefined }))}
                data={state?.visible?.payload}
                onSave={(data: DocumentTypeCreate) => {
                    Modal.confirm({
                        title: "Save Document Type",
                        content: "Are you sure",
                        onOk: async () => {
                            services.save(data);
                            message.success("Success");
                            setState({ visible: undefined });
                            actionRef.current?.reload?.();
                        }
                    })
                }}
            />
        </>
    )
}