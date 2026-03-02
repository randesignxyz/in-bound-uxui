import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Button, Radio, Space, Tooltip } from 'antd';
import { ActionType } from '@ant-design/pro-components';
import { useRef } from 'react';
import { EyeFilled } from '@ant-design/icons';

export default function SparePartListingview(){
      const actionRef = useRef<ActionType>();
      const onDetailhandler = async (data: any)=>{
        console.log(data)
      }
    return <>
    <TableView
    // hasCriteria={Object.values(Omit(advanceSearchParams, ['business_unit'])).some((v) => v)}
    // cache 
    extraFilter ={

        <Space  size="large" style={{ flexDirection: 'row' }}>
            <Radio.Group
            onChange={(e)=>{
                console.log(e.target.value)
            }}
            >
            </Radio.Group>
            <Radio.Button value="pending">Pending</Radio.Button>
            <Radio.Button value="approved">Approved</Radio.Button>
            <Radio.Button value="rejected">Rejected</Radio.Button>
        </Space>
    }
    tableProps={{
        actionRef: actionRef,
        toolbar:{
            actions:[
                <>
                <Button>Refresh</Button>
                <Button>Request Part</Button>
                </>
            ]
        }
    }}
    columns={[
        {
            title:'',
            width:10,
            render: (_, record) => {
                return <Space size={1}>
                    <Tooltip title="View Details">
                        <Button
                        icon={<EyeFilled />}
                        onClick={()=> onDetailhandler(record)}
                        />
                    </Tooltip>
                </Space>
            }
        },
        {    
        key: 'spare_part_type',
        title: 'Type',
        dataIndex: 'spare_part_type',
        },
        {
        key: 'spare_part_name',
        title: 'Name',
        dataIndex: 'spare_part_name',
        },
        {
        key: 'image',
        title: 'Image',
        dataIndex: 'image',
        }
    ]}
   
    />
    </>
}