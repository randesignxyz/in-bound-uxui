import ViewFormWrapper from "@/pages/process-flow/components/forms/ViewFormWrapper";
import { DataViewProps } from "@/pages/process-flow/data";
import { ProDescriptions, ProTable } from "@ant-design/pro-components";
import { simpleRequestActions } from "@/services/model";
import { Card, Flex, Typography } from "antd";
import { useState } from "react";
import { StockControlDetail, StockDetailLess } from "@/services/sale/data";
import { StockControlServiceAPI } from "../../stock-control/services";

export default (props: DataViewProps) => {
    const requestActions = simpleRequestActions();
    const services = StockControlServiceAPI(requestActions);
    const [items, setItems] = useState<StockDetailLess[]>();
    return <ViewFormWrapper<{ id: number }> workflowProp={props}>{(data, _) => {
            
            return (
                <Flex vertical gap={24}>
                    {
                        data?.processInstance?.procInstId && (
                            <Card size="small">
                                <ProDescriptions<StockControlDetail>
                                    request={async () =>{
                                        const response =await services.fetchStockControl(data?.processInstance?.procInstId || "");
                                        setItems(response.items);
                                        return Promise.resolve({
                                            data: response,
                                            success: true
                                        })
                                    }}
                                    contentStyle={{
                                        fontWeight: 500
                                    }}
                                    columns={[
                                        {
                                            title: "Store Name",
                                            render: (_, r) => <Typography.Text type='success'>{r.stockName}</Typography.Text>
                                        },
                                        {
                                            title:"Owner",
                                            // render:(_,r)=>r.owner.toString()
                                        },
                                        {
                                            title:"Items Count",
                                            render:(_,r)=><Typography.Text >{r.items?.length}</Typography.Text>
                                        }
                                    ]}
                                />
                            </Card>
                        )
                    }

                    <ProTable<StockDetailLess>
                        search={false}
                        options={false}
                        pagination={false}
                        dataSource={items}
                        columns={[
                            {
                                title: "Items Code",
                                dataIndex: "itemCode"
                            },
                            {
                                title: "Items Name",
                                dataIndex: "itemName"
                            },
                            {
                                title: "Beginning Qty",
                                dataIndex: "beginningQty",
                            },
                            {
                                title: "Quantity",
                                dataIndex: "quantity",
                               renderText:(text, record, index, action) =>{
                                   return <Typography.Text type="warning">{text}</Typography.Text>
                               },
                            },
                            {
                                title: "UOM",
                                dataIndex: "uom"
                            },
                            {
                                title: "Remark",
                                dataIndex: "remark"
                            },

                        ]}
                    />
                </Flex>
            )
            // return props.formKey == "stock_transfer_request_supervisor_approval" && data?.processInstance?.procInstId && (
            //     <Flex vertical gap={24} >
            //         <Card size="small">
            //             <ProDescriptions
            //                 contentStyle={{
            //                     fontWeight: 500
            //                 }}
            //                 request={async () => {
            //                     const response = await services.fetchStockTransferRequest(data?.processInstance?.procInstId || "");
            //                     console.log(response);
            //                     return Promise.resolve({
            //                         data: response,
            //                         success: true
            //                     })
            //                 }}
            //                 columns={[
            //                     {
            //                         title: "Store Name",
            //                         dataIndex: "storeName"
            //                     },
            //                     {
            //                         title: "Truck No",
            //                         dataIndex: "truckNo"
            //                     },
            //                     {
            //                         title: "Truck No",
            //                         dataIndex: "truckNo"
            //                     },
            //                     {
            //                         title: "Remark",
            //                         dataIndex: "remark"
            //                     }
            //                 ]}
            //             />
            //         </Card>
            //     </Flex>

            // )
        }}
    </ViewFormWrapper>

}