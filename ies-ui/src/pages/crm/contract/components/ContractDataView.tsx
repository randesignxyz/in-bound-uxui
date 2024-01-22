import { ContractDetail, SettlementPlan } from "@/services/crm/data"
import ProDescriptions from "@ant-design/pro-descriptions"
import { Card, Table, Tabs } from "antd"
import React from "react"
import { history } from 'umi'
import TextArea from "antd/lib/input/TextArea"
import { LayoutConfig } from "../model"
import TermDataView from "./TermDataView"
import { duration, formatDate, formatMonth } from "@/pages/utils"
import AttachmentList from "@/components/Attachment/AttachmentList"
import moment from "moment"

export interface ViewProps {
    data?: ContractDetail,
    layoutConfig?: LayoutConfig;
}

export const ContractDataView: React.FC<ViewProps> = ({ layoutConfig, data }) => {
    return (
        <>
            <Card
                size="small"
                style={{ marginBottom: '10px' }}>
                <ProDescriptions contentStyle={{ fontWeight: 'bold' }}  >
                <ProDescriptions.Item label="No">
                        {data?.contractNo || "Not Assigned"}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label="Type">
                        {data?.contractType.name} / {data?.subContractType.name}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label="Sub Type">
                        {data?.contractSubType.name}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label="Budget Code">
                        {data?.subContractType.budgetCode}
                    </ProDescriptions.Item>
                    
                    <ProDescriptions.Item label="Date">
                        {formatDate(data?.contractDate)}
                    </ProDescriptions.Item>

                    <ProDescriptions.Item label="From">
                        {formatDate(data?.effectiveDate)} to {formatDate(data?.expireDate)}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label="Contract Duration">
                        {duration(moment(data?.effectiveDate), moment(data?.expireDate))}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label="Days Left">
                        {duration(moment().isBefore(moment(data?.effectiveDate))?moment(data?.effectiveDate): moment() , moment(data?.expireDate))}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item label="Customer">
                        <a onClick={() => history.push(`/crm/customer/detail/${data?.customer.id}`)}>{
                            [data?.customer.code, data?.customer.name].filter(it => it).join(" - ")
                        }</a>
                    </ProDescriptions.Item>

                    <ProDescriptions.Item label="Ref No">
                        {data?.refNo}
                    </ProDescriptions.Item>

                </ProDescriptions>
            </Card>
            <Card size="small">
                <Tabs >

                    <Tabs.TabPane key="term" tab="Terms">
                        <TermDataView data={data} layoutConfig={layoutConfig} />
            
                    </Tabs.TabPane>

                    {data?.remarks && <Tabs.TabPane key='remarks' tab="Remarks">
                        <TextArea value={data.remarks} />

                    </Tabs.TabPane>}


                    {data?.settlementList && data?.settlementList.length > 0 && <Tabs.TabPane key="settlementPLan" tab="Settlement Plan" >
                        <Table<SettlementPlan>
                            columns={[
                                { title: 'Schedule Date', width: '200', render: (_, rd) => formatMonth(rd.scheduledDate) },
                                { title: 'Settled', width: '200', render: (_, rd) => rd.isSettled ? 'Yes' : '' },
                                { title: "Settled Date", width: '200', render: (_, rd) => formatDate(rd.settledDate) || 'Unsettled' },
                                { title: "Sponsored Item", align: 'left', render: (_, rd) => rd.itemList?.map(it => `${it.item.name}:  ${it.qty}`).join(",") },
                                { title: "Total", width: '150', dataIndex: 'total' },
                                { title: "Comment", render: (_, rd) => [rd.comment, rd.commentInternal].filter(it => it).join("/") }
                            ]}
                            dataSource={data?.settlementList}
                            size='small'
                        />
                    </Tabs.TabPane>}

                    {data?.attachmentFileIds && data?.attachmentFileIds.length > 0 && <Tabs.TabPane key='attachment' tab="Attached Files">
                        <AttachmentList fileIds={data?.attachmentFileIds} attachmentFiles={[]} />
                    </Tabs.TabPane>}
                </Tabs>
            </Card>
        </>)
}