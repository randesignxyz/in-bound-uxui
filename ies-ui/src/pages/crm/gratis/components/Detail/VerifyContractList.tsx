import React, { useEffect } from "react";
import { formatDate, getColorStatus } from "@/pages/utils";
import { GratisContract, VerifyGratisContact } from "../../types";
import { Button, Space, Tag, Tooltip } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";


const itemCols=(quickViewHandler:(id: number,orderNo: number)=>void): ColumnsType<VerifyGratisContact> => [
   /* {
        width: 20,
        render: (_, r) => (
          <Space size={1}>            
            <Tooltip title="Quick data review">
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => quickViewHandler(r.gratisContractId,r.orderNo-1)}
              />
            </Tooltip>
          </Space>
        ),
    },*/{
        title: '#',
        width:'20px',
        align: 'right',
        dataIndex: 'orderNo',     
        // render:  (_, r) => <Tooltip title="Quick data review"><a onClick={() => quickViewHandler(r.gratisContractId,r.orderNo-1)}>{r.orderNo}</a> </Tooltip>
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
        render: (_, item) => <Tag color={getColorStatus(item.status)}>{item.status}</Tag>
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