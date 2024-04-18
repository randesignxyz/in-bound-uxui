import React, { useEffect } from "react";
import { formatDate, getColorStatus } from "@/pages/utils";
import { GratisContract, VerifyGratisContact } from "../../types";
import { Button, Space, Tag, Tooltip } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";
import Status from "@/components/Status";


const itemCols=(quickViewHandler:(id: number,orderNo: number)=>void): ColumnsType<VerifyGratisContact> => [
   {
        title: '#',
        width:'20px',
        align: 'right',
        dataIndex: 'orderNo',  
    },
    {
        title: 'Verified Date',
        dataIndex: 'durationText',
        render:  (_, r) => <Tooltip title="Quick data review"><a onClick={() => quickViewHandler(r.gratisContractId,r.orderNo-1)}>{r.durationText}</a> </Tooltip>
    },
    {
        title: 'Remark',
        dataIndex: 'remarks',
    },
    {
        title: 'Verified',
        dataIndex: 'verified',
    },
    {
        title: 'Status',
        render: (_, item) => <Status text={item?.status||'FAILED'} value={item?.status||'FAILED'}/>
    }
]

const VerifyContractList: React.FC<{item: GratisContract,quickViewHandler:(id: number,orderNo: number)=>void}> = ({item,quickViewHandler}) => {
    return <Table<VerifyGratisContact>
        columns={itemCols(quickViewHandler)}
        style = {{background: '#f2c3bd'}}
        rowKey="id"
        key={`table-${item.id}`}
        dataSource={item.contracts || []}        
        pagination={false}
        size="small"
    />
}
export default VerifyContractList;