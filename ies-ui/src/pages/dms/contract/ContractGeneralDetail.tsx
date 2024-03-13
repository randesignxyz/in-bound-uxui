import { formatDate } from "@/pages/utils";
import { ProCard, ProDescriptions } from "@ant-design/pro-components";
import { Space, Row, Col, Badge, Button } from "antd";
import { expriationStatus } from "../core";
import { DocumentationDTO } from "../documentation/data";
import { InfoCircleOutlined } from "@ant-design/icons";

interface Props {
    document?: DocumentationDTO;
    actionRef?: any
}

export default ({ document, actionRef }: Props) => {

    return (
        <>
            <Space
                size={15}
                direction="vertical"
            >
                <ProCard
                    collapsible
                    size="small"
                    title="Contract Infomation"
                >
                    <Row gutter={16}>
                        <Col md={24} sm={24} lg={12}>

                            <ProDescriptions
                            style={{ fontWeight: 500 }}
                                labelStyle={{
                                    width: 150
                                }}
                              
                                column={1}
                                dataSource={document?.documentation}
                                actionRef={actionRef}
                                columns={[

                                    {
                                        label: "Contract Number",
                                        dataIndex: "docNumber"
                                    },
                                    {
                                        label: "Contract Title",
                                        dataIndex: "docName"
                                    },
                                    {
                                        label: "Contract Type",
                                        render: (_, r) => document?.contractType?.name
                                    },
                                    {
                                        label: "Category",
                                        render: (_, r) => r.contractCategory
                                    },
                                    {
                                        label: "Currency",
                                        render: (_, r) => document?.currency?.name
                                    },
                                    {
                                        label: "Contract Value",
                                        dataIndex: "contractValue"
                                    },
                                    {
                                        label: "Gratis",
                                        dataIndex: "gratis"
                                    },
                                    {
                                        label: "Function",
                                        render: (_, r) => document?.department?.name
                                    },
                                    {
                                        label: "Description",
                                        dataIndex: "description"
                                    },
                                ]}
                            />
                        </Col>
                        <Col md={24} sm={24} lg={12}>
                            <ProDescriptions
                                column={1}
                                dataSource={document?.term}
                                labelStyle={{
                                    width: 200
                                }}
                                style={{ fontWeight: 500 }}
                                columns={[
                                    {
                                        label: "Term Type",
                                        render: (_, r) => document?.termType?.name
                                    },
                                    {
                                        label: "Effective Date",
                                        dataIndex: "effectiveDate",
                                        valueType: "date"
                                    },
                                    {
                                        label: "Expiry Date",
                                        dataIndex: "expiryDate",
                                        valueType: "date",
                                        render: (_, r) => (<Badge status={expriationStatus(r.expiryDate) > 0 ? "error" : "processing"} text={formatDate(r.expiryDate)} />)
                                    },
                                    {
                                        label: "Notice Peroid (Days)",
                                        dataIndex: "noticePeriod",
                                    },
                                    {
                                        label: "Warranty",
                                        dataIndex: "warranty"
                                    },
                                    {
                                        label: "Penalty Clause",
                                        dataIndex: "penaltyClause"
                                    },
                                    {
                                        label: "Term of Payment",
                                        dataIndex: "termPayment"
                                    },
                                    {
                                        title: "Status",
                                        render: (_, r) => <Badge status={document?.status == "Inactive" ? "error" : "processing"} text={document?.status} />
                                    }
                                ]}
                            />
                        </Col>
                    </Row>
                </ProCard>

                <ProCard
                >
                    <ProDescriptions
                        dataSource={document?.accountant}
                        style={{ fontWeight: 500 }}
                        columns={[

                            {
                                label: "Company Name",
                                render: (_, r) => (<>
                                    <Button type="link" icon={<InfoCircleOutlined />} size="small"
                                    // onClick={() => setCompanyState({ visible: { name: "MODAL", type: "ADD", payload: document?.company } })}
                                    >
                                    </Button><>{document?.company?.name}</>
                                </>)
                            },
                            {
                                label: "Customer/Vendor Code",
                                render: (_, r) => document?.vendor?.code
                            },
                            {
                                label: "Customer/Vendor Name",
                                render: (_, r) => document?.vendor?.name
                            },
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
        </>
    )
}