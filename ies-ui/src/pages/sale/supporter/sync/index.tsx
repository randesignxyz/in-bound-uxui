import { simpleRequestActions } from "@/services/model"
import { ActionType, PageContainer, ProTable } from "@ant-design/pro-components"
import { useEffect, useRef, useState } from "react"
import { Button, Space } from "antd"
import { SaleServiceAPI } from "@/services/sale/services"

export default () => {
    const requestActions = simpleRequestActions();
    const saleServices = SaleServiceAPI(requestActions);
    const actionRef = useRef<ActionType>();
    const [data, setData] = useState([])
    // const initilizeData = async () => {

    //     try {
    //         const result = await saleServices.listSyncSo();
    //         setData(result)
    //         console.log('result', result)

    //     } catch (error) {
    //         return;
    //     }
    // };

    // useEffect(() => {
    //     initilizeData()
    // }, [])
    const syncSOFromSAP = async () => {
        try {
            await saleServices.syncAllSOFromSAP({});
            actionRef.current?.reload()
        } catch (error) {
            return;
        }
    };
    const updateToSAP = async () => {
        try {
            await saleServices.updateAllSAPSaleplan({ data: data });
            actionRef.current?.reload()
        } catch (error) {
            return;
        }
    };



    return (
        <PageContainer
            breadcrumbRender={false}
            title="Sync SO"
            extra={
                <Space>
                    <Button onClick={() => syncSOFromSAP()}>Sync From SAP</Button>
                    <Button onClick={() => updateToSAP()}>Update to SAP</Button>
                </Space>

            }
        >
            <ProTable
                options={false}
                // dataSource={data}
                search={false}
                actionRef={actionRef}
                request={async () => {
                    const result = await saleServices.listSyncSo();
                    setData(result)
                    return {
                        data: result,
                        success: true,
                    };
                }}
                // search={false}
                // rowSelection={{
                //     type: "radio",
                //     selections: ["SELECT_INVERT"],
                //     selectedRowKeys: [ip?.id || data?.items[0]?.id]
                // }}
                // tableAlertRender={false}
                // onRow={(record) => {
                //     return {
                //         onClick: () => {
                //             setIp(record)
                //         }
                //     }
                // }}
                rowKey={"id"}
                columns={[
                    {
                        title: "PO #",
                        dataIndex: "doc_entry_num"
                    },
                    {
                        title: "SO Num",
                        dataIndex: "so_no"
                    },
                    {
                        title: "Customer Code",
                        dataIndex: "customer_code"
                    },
                    {
                        title: "Shipping Addrress",
                        dataIndex: "shipping_address"
                    },
                ]}
            />
        </PageContainer>
    )
}