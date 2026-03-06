import TableView from '@/components/DataCrud/TableView';
import { CheckCircleFilled, EyeFilled, MoreOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { Avatar, Button, Checkbox, DatePicker, Dropdown, Radio, Select, Space, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { useNavigate } from '@umijs/max';

export default function MyRequestsToReturn() {
  const actionRef = useRef<ActionType>();
  const navigate = useNavigate();
  const [radioValue, setRadioValue] = useState('All');
  const getDataSparePart = async ()=> {
    const response = await fetch('https://6818806f5a4b07b9d1cf68de.mockapi.io/spare-parts')
    const data = await response.json();
    console.log("spare-part data", data);
    return data;
  }

  const onDetailhandler = async (data: any) => {
    console.log(data);
  };
  return (
    <>
      <TableView
        actionHandlers={{
          onRequest: async (criteria, pagination, sort) => {
            const data = await getDataSparePart();
            return {
              items: data,
              total: data.length,
            };
          },
        }}
        // hasCriteria={Object.values(Omit(advanceSearchParams, ['business_unit'])).some((v) => v)}
        // cache
        extraFilter={
          <Space size="large" style={{ flexDirection: 'row' }}>
            <Select
              defaultValue="Status"
              style={{ width: 125 }}
              onChange={(e) => {
                console.log(e);
              }}
              options={[
                { value: 'Status', label: 'Status' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Rejected', label: 'Rejected' },
                 { value: 'Completed', label: 'Completed' },
              ]}
            />
            <DatePicker 
            placeholder='Filter Date'
            />
          </Space>
        }
        tableProps={{
          actionRef: actionRef,
          toolbar: {
            actions: [
              <>
              </>,
            ],
          },
        }}
        columns={[
          {
            title: '',
            width: 10,
            render: (_, record) => {
              return (
                <Space size={1}>
                  <Tooltip title="View Details">
                    <Button icon={<EyeFilled />} onClick={() => onDetailhandler(record)} />
                  </Tooltip>
                </Space>
              );
            },
          },
          {
            key: 'Return_Id',
            title: 'Return Id',
            dataIndex: 'return_id',
          },
          {
            key: 'Return Date',
            title: 'Return Date',
            dataIndex: 'return_date',
          },
          {
            key: 'Total Items',
            title: 'Total Items',
            dataIndex: 'total_items',
          },
          {
            key: 'Status',
            title: 'Status',
            dataIndex: 'status',
          },
          {
            key: 'Remarks',
            title: 'Remarks',
            dataIndex: 'remarks',
          },
          
        ]}
      />
    </>
  );
}
