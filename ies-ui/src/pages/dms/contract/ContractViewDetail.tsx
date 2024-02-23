import { ProCard, ProDescriptions } from "@ant-design/pro-components"
import { Badge, Button, Col, Divider, Row, Space, Tag } from "antd"
import React, { useState } from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import CompanyDetail from "./company/CompanyDetail";
import { DocumentationDTO } from "../documentation/data";
import moment, { Moment } from "moment";
import { formatDate } from "@/pages/utils";
import { expriationStatus } from "../core";

interface Props {
    document?: DocumentationDTO;
    title?: string;
    actionRef?:any
}


export default ({ document, title, actionRef }: Props) => {


    const [companyState, setCompanyState] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            payload?: CompanyDTO;
        }
    }>();

    // console.log(moment(document?.term.expiryDate).diff(moment(),"hours"));

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
                        <Col span={12}>
                            <ProDescriptions
                                labelStyle={{
                                    width: 150
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
                                        label: "Currency",
                                        // render: (_, r) => r.doc?.name
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
                            />
                        </Col>
                        <Col span={12}>
                            <Divider orientation="left" plain>Term and Renewal</Divider>
                            <ProDescriptions
                                column={1}
                                dataSource={document?.term}
                                labelStyle={{
                                    width: 200
                                }}
                                columns={[
                                    {
                                        label: "Term Type",
                                        dataIndex: "termType"
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
                                        render:(_,r)=>(<Badge status={expriationStatus(r.expiryDate)>0?"error":"processing"} text={formatDate(r.expiryDate)} />)
                                    },
                                    {
                                        label: "Renewal Interval (Months)",
                                        dataIndex: "renewalInterval"
                                    },
                                    {
                                        label: "Notice Peroid",
                                        dataIndex: "noticePeriod"
                                    },
                                    {
                                        label: "Notice Date",
                                        dataIndex: "noticeDate",
                                        valueType: "date"
                                    },
                                    {
                                        title: "Status",
                                        render:(_,r)=><Badge status={document?.status=="Inactive"?"error":"success"} text={document?.status} />
                                    }
                                ]}
                            />
                        </Col>
                    </Row>

                </ProCard>

                <ProCard
                >
                    <ProDescriptions
                        dataSource={document?.documentation}
                        columns={[
                            {
                                label: "Company Name",
                                render: (_, r) => (<>
                                    <Button type="link" icon={<InfoCircleOutlined />} size="small"
                                        onClick={() => setCompanyState({ visible: { name: "MODAL", type: "ADD", payload: document?.company } })}
                                    >
                                    </Button><>{document?.company?.name}</>
                                </>)
                            },
                            {
                                label: "Customer/Vendor Name",
                                dataIndex: "vendorName"
                            },
                            {
                                label: "Customer/Vendor Code",
                                dataIndex: "vendorNumber"
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


            <CompanyDetail
                open={companyState?.visible?.name == "MODAL"}
                onClose={() => setCompanyState({ visible: undefined })}
                data={companyState?.visible?.payload}
            />
        </>
    )
}
