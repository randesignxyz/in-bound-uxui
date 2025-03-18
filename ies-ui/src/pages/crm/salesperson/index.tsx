import { simpleRequestActions } from "@/services/model"
import { SalespersonOrgAPI } from "./service"
import React, { useEffect, useState } from "react";
import { Button, Card, Space, Spin, Tooltip } from "antd";
import SalePersonTree from "./SalePersonTree";
import { SyncOutlined } from "@ant-design/icons";

export default () => {
    const requestActions = simpleRequestActions();
    const [SaleOrgDataList, setSlaeOrgDataList] = useState<SalespersonOrg[]>();
    const loadData = async () => {
        const salesOrg = await SalespersonOrgAPI(requestActions).salesOrgList({});
        setSlaeOrgDataList(salesOrg);
    }
    useEffect(() => {
        loadData()
    }, []);

    return (
        <>
            <Card
                title={"Salesperson Organization Unit"}
                size="small"
                extra={[
                    <Space>
                        <Tooltip title={"Sync Salesperson"}>
                            <Button type="link" onClick={()=>SalespersonOrgAPI(requestActions).syncExecStoreProcedureSalesperson()} size="small" icon={<SyncOutlined />} >Sync Salesperson</Button>
                        </Tooltip>
                        {/* <Button type="link" onClick={() => setSalesperonState({ visible: { name: "MODAL" } })} size="small" icon={<PlusOutlined />} /> */}
                    </Space>
                ]}
            >
                <Spin spinning={requestActions.request?.loading}>
                    <SalePersonTree
                        data={SaleOrgDataList}
                        onLoadData={()=>loadData()}
                    />
                </Spin>
            </Card>
        </>
    )
}