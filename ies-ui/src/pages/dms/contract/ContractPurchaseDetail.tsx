import { ProCard, ProDescriptions } from "@ant-design/pro-components"
import { Col, Row, Space, Typography } from "antd"
import React, { useState } from "react";
import CompanyDetail from "./company/CompanyDetail";
import { DocumentationDTO } from "../documentation/data";
import { formatDate } from "@/pages/utils";
import { expriationStatus } from "../core";

interface Props {
    document?: DocumentationDTO;
    actionRef?: any
}
export default ({ document, actionRef }: Props) => {
    const [companyState, setCompanyState] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            payload?: CompanyDTO;
        }
    }>();

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
                                labelStyle={{
                                    width: 150
                                }}
                                style={{ fontWeight: 500 }}
                                column={1}
                                dataSource={document?.documentation}
                                columns={[
                                    {
                                        label: "Contract Name",
                                        dataIndex: "docName"
                                    },
                                    {
                                        label: "Contract Number",
                                        dataIndex: "docNumber"
                                    },
                                    {
                                        label: "Category",
                                        dataIndex: "category",
                                        render: (_, r) => document?.category
                                    },
                                    {
                                        label: "Vendor Name",
                                        render: (_, r) => document?.vendor?.name
                                    },
                                    {
                                        label: "OpCo",
                                        dataIndex: "opCo",
                                        render: (_, r) => document?.opCo?.name
                                    },
                                    {
                                        label: "Function",
                                        render: (_, r) => document?.department?.name
                                    },
                                    {
                                        label: "Currency",
                                        render: (_, r) => document?.currency?.name
                                    },
                                    {
                                        label: "Description",
                                        dataIndex: "description",
                                        span: 2
                                    },
                                ]}
                            />
                        </Col>
                        <Col md={24} sm={24} lg={12}>
                            {/* <Divider orientation="left" plain>Term and Renewal</Divider> */}
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
                                        render:(_,r)=><Typography.Text type={expriationStatus(r.expiryDate) > 0 ?"danger":"success"} >{formatDate(r.expiryDate)}</Typography.Text>
                                        // render: (_, r) => (<Badge status={expriationStatus(r.expiryDate) > 0 ? "error" : "processing"} text={formatDate(r.expiryDate)} />)
                                    },
                                    // {
                                    //     label: "Renewal Interval (Months)",
                                    //     dataIndex: "renewalInterval"
                                    // },
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
                                        render:(_,r)=><Typography.Text type={document?.status =="Inactive"?"danger":"success"} >{document?.status}</Typography.Text>
                                        // render: (_, r) => <Badge status={document?.status == "Inactive" ? "error" : "processing"} text={document?.status} />
                                    }
                                    // {
                                    //     label: "Notice Date",
                                    //     dataIndex: "noticeDate",
                                    //     valueType: "date"
                                    // },

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
                                label: "Total Amount",
                                dataIndex: "totalAmount",
                                valueType: "money"
                            },
                            {
                                label: "Final Amount",
                                dataIndex: "finalAmount",
                                valueType: "money"
                            },
                            {
                                label: "PO",
                                dataIndex: "po"
                            },
                            {
                                label: "Paid",
                                dataIndex: "paid",
                                valueType: "money"
                            },
                            {
                                label: "Balance",
                                dataIndex: "balance",
                                valueType: "money"
                            },
                            {
                                label: "Comments",
                                dataIndex: "comments"
                            },
                            // {
                            //     label: "Company Name",
                            //     render: (_, r) => (<>
                            //         <Button type="link" icon={<InfoCircleOutlined />} size="small"
                            //             onClick={() => setCompanyState({ visible: { name: "MODAL", type: "ADD", payload: document?.company } })}
                            //         >
                            //         </Button><>{document?.company?.name}</>
                            //     </>)
                            // },
                            // {
                            //     label: "Customer/Vendor Name",
                            //     dataIndex: "vendorName"
                            // },
                            // {
                            //     label: "Customer/Vendor Code",
                            //     dataIndex: "vendorNumber"
                            // },
                        ]}
                    />
                </ProCard>
                <ProCard>
                    <ProDescriptions
                        dataSource={document}
                        column={4}
                        size="small"
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
            <CompanyDetail
                open={companyState?.visible?.name == "MODAL"}
                onClose={() => setCompanyState({ visible: undefined })}
                data={companyState?.visible?.payload}
            />
        </>
    )
}
