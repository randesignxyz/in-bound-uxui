import TableView from '@/components/DataCrud/TableView';
import { CheckCircleFilled, EyeFilled, MoreOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { Button, Checkbox, DatePicker, Dropdown, Radio, Select, Space, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { useNavigate } from '@umijs/max';

export default function MySparePartRequests() {
  const actionRef = useRef<ActionType>();
  const [radioValue, setRadioValue] = useState('All');

  const radioOptions = [
    { value: 'All', label: 'ALL' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Completed', label: 'Completed' },
  ];

  const onDetailhandler = async (data: any) => {
    console.log(data);
  };
  return (
    <>
      <TableView
        // hasCriteria={Object.values(Omit(advanceSearchParams, ['business_unit'])).some((v) => v)}
        // cache
        extraFilter={
          <Space size="large" style={{ flexDirection: 'row' }}>
            {/* Desktop: Radio Group */}
            <div className="radio-group-desktop">
              <Radio.Group
                value={radioValue}
                onChange={(e) => {
                  setRadioValue(e.target.value);
                  console.log(e.target.value);
                }}
              >
                {radioOptions.map((opt) => (
                  <Radio.Button key={opt.value} value={opt.value}>
                    {opt.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </div>

            {/* Mobile: Dropdown */}
            <div className="radio-group-mobile">
              <Dropdown
                menu={{
                  items: radioOptions.map((opt) => ({
                    key: opt.value,
                    label: opt.label,
                    onClick: () => {
                      setRadioValue(opt.value);
                      console.log(opt.value);
                    },
                  })),
                  selectedKeys: [radioValue],
                }}
                trigger={['click']}
              >
                <Button>
                  {radioOptions.find((opt) => opt.value === radioValue)?.label} <MoreOutlined />
                </Button>
              </Dropdown>
            </div>
             <Select
              defaultValue="Type"
              style={{ width: 125 }}
              onChange={(e) => {
                console.log(e);
              }}
              options={[
                { value: 'All', label: 'All Types' },
                { value: 'Normal', label: 'Normal' },
                { value: 'High', label: 'High' },
                { value: 'Emergency', label: 'Emergency' },
              ]}
            />
            <DatePicker
            style={{ width: 165 }}
            onChange={(date, dateString) => {
                console.log(date, dateString);
            }}
            placeholder="Posting date"
            />
            
          
          </Space>
        }
        tableProps={{
          actionRef: actionRef,
          toolbar: {
            actions: [
              <>
                <Button>Import Excel </Button>
                <Button>Request Part</Button>
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
            key: 'request_id',
            title: 'Request ID',
            dataIndex: 'request_id',
          },
          {
            key: 'type_of_priority',
            title: 'Type of Priority',
            dataIndex: 'type_of_priority',
          },
          {
            key: 'requested_date',
            title: 'Requested Date',
            dataIndex: 'requested_date',
          },
          {
            key: 'Total_items',
            title: 'Total Items',
            dataIndex: 'total_items',
          },
          {
            key: 'received_items',
            title: 'Received Items',
            dataIndex: 'received_items',
          },
          {
            key: 'request_status',
            title: 'Request Status',
            dataIndex: 'request_status',
          },
          {
            key: 'Remark',
            title: 'Remark',
            dataIndex: 'remark',
          },
        ]}
      />
    </>
  );
}
