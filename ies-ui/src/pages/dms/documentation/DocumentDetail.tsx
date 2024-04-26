import { Badge, Breadcrumb, Button, Col, Row, Space } from "antd"
import { ProCard, ProDescriptions } from "@ant-design/pro-components";
import { DocumentationDTO } from "./data";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useState } from "react";
import PathDocument from "../components/PathDocument";
import { formatDate } from "@/pages/utils";
import { expriationStatus } from "../core";

interface Props {
    document?: DocumentationDTO;
    actionRef?: any;
}
export default ({ document, actionRef }: Props) => {
    const [pathmodalState, setPathModalState] = useState<{
        visible?: {
            name: "DRAWER";
            data: DocumentationDTO;
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
                    {
                        document?.category == "GENERAL" && (
                            <ProDescriptions
                                dataSource={document}
                                column={{ md: 1, sm: 1, lg: 2, xl: 2 }}
                                actionRef={actionRef}
                                style={{ fontWeight: 500 }}
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
                                        render: (_, r) => r.category
                                    },
                                    {
                                        title: "Paths",
                                        render: (_, r) => <Space align="center">
                                            <Button size="small" icon={<InfoCircleOutlined />} type="link" onClick={() => setPathModalState({ visible: { name: "DRAWER", data: r } })} />
                                            <Breadcrumb items={[{ key: r.library?.id, title: r.library?.name }].concat(r.path?.map(o => ({ key: o.id, title: o.name })) || [])} separator="/" />
                                        </Space>
                                    },
                                    {
                                        title: "Status",
                                        render: (_, r) => <Badge status={r.status == "Inactive" ? "error" : "success"} text={r.status} />,
                                    },
                                    {
                                        title: "Description",
                                        render: (_, r) => r.documentation?.description,
                                        span: 2
                                    },
                                ]}
                            />
                        ) ||
                        (
                            <Row gutter={12}>
                                <Col span={12}>
                                    <ProDescriptions
                                        dataSource={document}
                                        column={1}
                                        actionRef={actionRef}
                                        labelStyle={{
                                            width: 200
                                        }}
                                        style={{ fontWeight: 500 }}
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
                                                title: "function",
                                                render: (_, r) => document?.department?.name
                                            },
                                            {
                                                title: "OpCos",
                                                render: (_, r) => document?.opCo?.name
                                            },

                                            {
                                                title: "Description",
                                                render: (_, r) => r.documentation?.description,
                                                span: 2
                                            },
                                        ]}
                                    />
                                </Col> 
                                <Col span={12}>
                                    <ProDescriptions
                                        dataSource={document}
                                        column={1}
                                        actionRef={actionRef}
                                        labelStyle={{
                                            width: 100
                                        }}
                                        style={{ fontWeight: 500 }}
                                        columns={[
                                            {
                                                title: "Category",
                                                render: (_, r) => r.category
                                            },
                                            {
                                                title: "Institute / Organization",
                                                dataIndex: "institute",
                                                render:(_,r)=>document?.documentation.institute
                                            },
                                            {
                                                title: "Issued Date",
                                                render: (_, r) => formatDate(document?.term?.issuedDate),
                                                valueType: "date"
                                            },
                                            {
                                                title: "Valid Date",
                                                render: (_, r) => (<Badge status={expriationStatus(r.term.expiryDate) > 0 ? "error" : "processing"} text={formatDate(r.term.expiryDate)} />),
                                                valueType: "date"
                                            },
                                            {
                                                title: "Paths",
                                                render: (_, r) => <Space align="center">
                                                    <Button size="small" icon={<InfoCircleOutlined />} type="link" onClick={() => setPathModalState({ visible: { name: "DRAWER", data: r } })} />
                                                    <Breadcrumb items={[{ key: r.library?.id, title: r.library?.name }].concat(r.path?.map(o => ({ key: o.id, title: o.name })) || [])} separator="/" />
                                                </Space>
                                            },
                                            {
                                                title: "Status",
                                                render: (_, r) => <Badge status={r.status == "Inactive" ? "error" : "success"} text={r.status} />,
                                            },
                                        ]}
                                    />
                                </Col>
                            </Row>
                        )
                    }
                    <ProDescriptions
                        dataSource={document}
                        column={{ md: 1, sm: 1, lg: 2, xl: 2 }}
                        actionRef={actionRef}
                    />
                </ProCard>
                <ProCard
                    title="Ownership"
                    size="small"
                >
                    <ProDescriptions
                        dataSource={document}
                        style={{ fontWeight: 500 }}
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
                                render: () => document?.buId?.name
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
                                title: "Created Date",
                                dataIndex: "createdDate",
                                valueType: "date"
                            },
                            {
                                title: "Created By",
                                dataIndex: "createdBy",
                            },
                            {
                                title: "Updated Date",
                                dataIndex: "lastModifiedDate",
                                valueType: "date"
                            },
                            {
                                title: "Updated By",
                                dataIndex: "lastModifiedBy",
                            },
                        ]}
                    />
                </ProCard>
            </Space>
            <PathDocument
                open={pathmodalState?.visible?.name == "DRAWER"}
                onClose={() => setPathModalState({ visible: undefined })}
                data={pathmodalState?.visible?.data}
            />
        </>
    )
}