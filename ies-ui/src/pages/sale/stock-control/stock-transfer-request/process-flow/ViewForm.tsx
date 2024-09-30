import ViewFormWrapper from "@/pages/process-flow/components/forms/ViewFormWrapper";
import { DataViewProps } from "@/pages/process-flow/data";
import ApprovalStockRequest from "../ApprovalStockRequest";
import { ProDescriptions, ProTable } from "@ant-design/pro-components";
import { simpleRequestActions } from "@/services/model";
import { StockControlServiceAPI } from "../../services";
import { Card, Flex, Typography } from "antd";
import { useState } from "react";
import { StockTransferRequestItem } from "./data";

export default (props: DataViewProps) => {
    const requestActions = simpleRequestActions();
    const services = StockControlServiceAPI(requestActions);
    const [items, setItems] = useState<StockTransferRequestItem[]>();
    return <ViewFormWrapper<{ id: number }>

        workflowProp={props}>
        {(data, _) => {
            return (
                <Flex vertical gap={24}>
                    {
                        data?.processInstance?.procInstId && (
                            <Card size="small">
                                <ProDescriptions
                                    contentStyle={{
                                        fontWeight: 500
                                    }}
                                    request={async () => {
                                        const response = await services.fetchStockTransferRequest(data?.processInstance?.procInstId || "");
                                        setItems(response.items);
                                        return Promise.resolve({
                                            data: response,
                                            success: true
                                        })
                                    }}
                                    columns={[
                                        {
                                            title: "Store Name",
                                            dataIndex: "storeName"
                                        },
                                        {
                                            title: "Truck No",
                                            dataIndex: "truckNo"
                                        },
                                        {
                                            title: "Remark",
                                            dataIndex: "remark"
                                        }
                                    ]}
                                />
                            </Card>
                        )
                    }

                    <ProTable
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
                                title: "Quantity",
                                dataIndex: "qty",
                                render:(_,r)=><Typography.Text  type="warning">{r.qty}</Typography.Text>
                            },
                            {
                                title:"UOM",
                                dataIndex:"uom"
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