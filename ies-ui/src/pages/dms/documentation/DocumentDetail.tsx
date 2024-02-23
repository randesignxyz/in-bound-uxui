import { Badge, Breadcrumb, Button, Space } from "antd"
import { ProCard, ProDescriptions } from "@ant-design/pro-components";
import { DocumentationDTO } from "./data";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useState } from "react";
import PathDocument from "../components/PathDocument";

interface Props {
    document?: DocumentationDTO;
    actionRef?:any;
}

export default ({ document,  actionRef }: Props) => {


    const [pathmodalState, setPathModalState] = useState<{
        visible?:{
            name:"DRAWER";
            data:DocumentationDTO;
        }
    }>();


    return (
        <>
            <Space
                direction="vertical"
                size={15}
            >
                <ProCard
                    size="small"
                    title="Document Information"
                >
                    <ProDescriptions
                        dataSource={document}
                        column={2}
                        actionRef={actionRef}
                        columns={[
                            {
                                title: "Document Number",
                                render: (_, r) => r.documentation?.docNumber
                            },
                            {
                                title: "Document Name",
                                render: (_, r) => r.documentation?.docName
                            },

                            {
                                title: "Document Type",
                                render: (_, r) => r.docType?.name
                            },
                            {
                                title: "Category",
                                render: (_, r) => r.category?.name
                            },
                            {
                                title: "Paths",
                                render: (_, r) =><Space align="center">
                                    <Button size="small" icon={<InfoCircleOutlined/>} type="link" onClick={()=>setPathModalState({visible:{name:"DRAWER", data:r}})} />
                                    <Breadcrumb items={[{key:r.library?.id, title:r.library?.name}].concat(r.path?.map(o=>({key:o.id, title:o.name}))||[])} separator="/" />
                                    </Space>
                            },
                            
                            {
                                title: "Status",
                                render: (_, r) => <Badge status={r.status=="Inactive"?"error":"success"} text={r.status} />,

                            },
                            {
                                title: "Description",
                                render: (_, r) => r.documentation?.description,
                                span:2
                            },
                        ]}
                    />
                </ProCard>

                <ProCard
                    title="Ownership"
                    size="small"
                >
                    <ProDescriptions
                        dataSource={document}
                        columns={[
                            {
                                title: "Owner",
                                render: (_, r) => r.createdBy
                            },

                            {
                                title: "Department",
                                render: (_, r) => r.department?.name
                            },
                            {
                                title: "Business Unit",
                                render:()=>document?.buId?.name
                            }
                        ]}
                    />
                </ProCard>

                <ProCard>
                    <ProDescriptions
                    dataSource={document}
                        column={4}
                        columns={[
                            {
                                title:"Created Date",
                                dataIndex:"createdDate",
                                valueType:"date"
                            },
                            {
                                title:"Created By",
                                dataIndex:"createdBy",
                            },
                            {
                                title:"Updated Date",
                                dataIndex:"lastModifiedDate",
                                valueType:"date"
                            },
                            {
                                title:"Updated By",
                                dataIndex:"lastModifiedBy",
                            },
                        ]}
                    />
                </ProCard>
            </Space>

            <PathDocument
                open={pathmodalState?.visible?.name=="DRAWER"}
                onClose={()=>setPathModalState({visible:undefined})}
                data={pathmodalState?.visible?.data}
            />
        </>
    )
}