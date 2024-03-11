import { ProCard, ProDescriptions } from "@ant-design/pro-components"
import { Badge, Button, Col, Divider, Row, Space } from "antd"
import React, { useState } from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
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
                                // style={{ fontWeight: 600 }}
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
                                        dataIndex: "contractCategory"
                                    },
                                    {
                                        label: "Vendor Name",
                                        render:(_,r)=>document?.vendor?.name
                                    },
                                    {
                                        label:"OpCo",
                                        dataIndex:"opCo"
                                    },
                                    {
                                        label:"Function",
                                        render:(_,r)=>document?.department?.name
                                    },
                                    {
                                        label:"Currency",
                                        render:(_,r)=>document?.currency?.name
                                    },
                                    {
                                        label: "Description",
                                        dataIndex: "description",
                                        span:2
                                    },
                                   
                                    
                                ]}
                            />
                            {/* <ProDescriptions
                                labelStyle={{
                                    width: 150
                                }}
                                contentStyle={{
                                    fontWeight:"bolder"
                                }}
                                column={1}
                                dataSource={document?.documentation}
                                actionRef={actionRef}
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
                                        label: "Contract Type",
                                        render:(_,r)=>document?.contractType?.name
                                    },
                                    {
                                        label:"Category",
                                        render:(_,r)=>r.contractCategory
                                    },
                                    {
                                        label: "Currency",
                                        render: (_, r) => r.
                                    },
                                    {
                                        label: "Contract Value",
                                        dataIndex: "contractValue"
                                    },
                                    {
                                        label: "Purpose Value",
                                        dataIndex: "purposeValue"
                                    },
                                    {
                                        label: "Gratis",
                                        dataIndex: "gratis"
                                    },
                                    {
                                        label: "Department",
                                        render: (_, r) => document?.department?.name
                                    },
                                    {
                                        label: "Location",
                                        dataIndex: "location"
                                    },
                                    {
                                        label: "Description",
                                        dataIndex: "description"
                                    },
                                ]}
                            /> */}
                        </Col>
                        <Col md={24} sm={24} lg={12}>
                            {/* <Divider orientation="left" plain>Term and Renewal</Divider> */}
                            <ProDescriptions
                                column={1}
                                dataSource={document?.term}
                                labelStyle={{
                                    width: 200
                                }}
                                // style={{ fontWeight: 400 }}
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
                                    // {
                                    //     label: "Renewal Interval (Months)",
                                    //     dataIndex: "renewalInterval"
                                    // },
                                    {
                                        label: "Notice Peroid (Days)",
                                        dataIndex: "noticePeriod",
                                    },
                                    {
                                        label:"Warranty",
                                        dataIndex:"warranty"
                                    },
                                    {
                                        label:"Penalty Clause",
                                        dataIndex:"penaltyClause"
                                    },
                                    {
                                        label:"Term of Payment",
                                        dataIndex:"termPayment"
                                    },
                                    {
                                        title: "Status",
                                        render: (_, r) => <Badge status={document?.status == "Inactive" ? "error" : "processing"} text={document?.status} />
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
                        style={{ fontWeight: 600 }}
                        columns={[
                            {
                                label:"Total Amount",
                                dataIndex:"totalAmount",
                                valueType:"money"
                            },
                            {
                                label:"Final Amount",
                                dataIndex:"finalAmount",
                                valueType:"money"
                            },
                            {
                                label:"PO",
                                dataIndex:"po"
                            },
                            {
                                label:"Paid",
                                dataIndex:"paid",
                                valueType:"money"
                            },
                            {
                                label:"Balance",
                                dataIndex:"balance",
                                valueType:"money"
                            },
                            {
                                label:"Comments",
                                dataIndex:"comments"
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
