import TableView from '@/components/DataCrud/TableView';
import items from '@/pages/fleet/carbooking/items';
import { CheckCircleFilled, EyeFilled, MoreOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { Button, Checkbox, DatePicker, Dropdown, Radio, Row, Select, Space, Tabs, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { history } from 'umi';

export default function MyReceivedRequests() {
  const actionRef = useRef<ActionType>();
  const [radioValue, setRadioValue] = useState('All');
  const [activeTab, setActiveTab] = useState('1');

  const radioOptions = [
    { value: 'All', label: 'ALL' },
    { value: 'MRO-W', label: 'MRO-W' },
    { value: 'MRO-S', label: 'MRO-S' },
    { value: 'MRO-G', label: 'MRO-G' },
  ];

  const onDetailhandler = async (data: any) => {
    console.log(data);
  };

  // Batch View Columns
  const batchViewColumns = [
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
      key: 'requested_date',
      title: 'Requested Date',
      dataIndex: 'requested_date',
    },
    {
      key: 'pickup_date',
      title: 'Pickup Date',
      dataIndex: 'pickup_date',
    },
    {
      key: 'request_items',
      title: 'Requested Items',
      dataIndex: 'request_items',
    },
    {
      key: 'received_items',
      title: 'Received Items',
      dataIndex: 'received_items',
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
    },
  ];

  // Summary View Columns
  const summaryViewColumns = [
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
      key: 'request_date',
      title: 'Request Date',
      dataIndex: 'request_date',
    },
    {
      key: 'fulfillment_progress',
      title: 'Fulfillment Progress',
      dataIndex: 'fulfillment_progress',
    },
    {
      key: 'received_items',
      title: 'Received Items',
      dataIndex: 'received_items',
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
    },
    {
      key: 'action',
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) => {
        return (
          <Space>
            <Button size="small">Process</Button>
          </Space>
        );
      },
    },
  ];
  return (
    <>
      <TableView
        // hasCriteria={Object.values(Omit(advanceSearchParams, ['business_unit'])).some((v) => v)}
        // cache
        extraFilter={
          <Space size="large" style={{ flexDirection: 'row' }}>
            
            <Select
              defaultValue="All-Status"
              style={{ width: 125 }}
              onChange={(e) => {
                console.log(e);
              }}
              options={[
                { value: 'All-Status', label: 'Status' },
                { value: 'Complete', label: 'Complete' },
                { value: 'Partial', label: 'Partial' },
              ]}
            />
             <DatePicker
            style={{ width: 165 }}
            onChange={(date, dateString) => {
                console.log(date, dateString);
            }}
            placeholder="Request date"
            />
            <DatePicker
            style={{ width: 165 }}
            onChange={(date, dateString) => {
                console.log(date, dateString);
            }}
            placeholder="Pickup date"
            />
            
          </Space>
        }
        tableProps={{
          actionRef: actionRef,
          toolbar: {
            actions: [
             <div style={{ width: '100%' }}>
                <Row style={{ alignItems: 'center' }}>
                  <Tabs
                    style={{ marginRight: 20 }}
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key)}
                    items={[
                      { label: 'Batch View', key: '1' },
                      { label: 'Summary View', key: '2' },
                    ]}
                  />
                </Row>
              </div>
            ],
          },
        }}
        columns={activeTab === '1' ? batchViewColumns : summaryViewColumns}
      />
    </>
  );
}
