import TableView from '@/components/DataCrud/TableView';
import { CheckCircleFilled, EyeFilled, MoreOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { Avatar, Button, Checkbox, Dropdown, Radio, Select, Space, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { useNavigate } from '@umijs/max';

export default function SparePartListingview() {
  const actionRef = useRef<ActionType>();
  const navigate = useNavigate();
  const [radioValue, setRadioValue] = useState('All');
  const getDataSparePart = async ()=> {
    const response = await fetch('https://6818806f5a4b07b9d1cf68de.mockapi.io/spare-parts')
    const data = await response.json();
    console.log("spare-part data", data);
    return data;
  }
  const radioOptions = [
    { value: 'All', label: 'ALL' },
    { value: 'MRO-W', label: 'MRO-W' },
    { value: 'MRO-S', label: 'MRO-S' },
    { value: 'MRO-G', label: 'MRO-G' },
  ];

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
              defaultValue="ALL_WH"
              style={{ width: 125 }}
              onChange={(e) => {
                console.log(e);
              }}
              options={[
                { value: 'All_WH', label: 'All WH' },
                { value: 'W-1', label: 'WH1' },
                { value: 'W-2', label: 'WH2' },
                { value: 'W-3', label: 'WH3' },
              ]}
            />
            <Select
              defaultValue="All"
              style={{ width: 125 }}
              onChange={(e) => {
                console.log(e);
              }}
              options={[
                { value: 'All', label: 'All Categories' },
                { value: 'Mechanical', label: 'Mechanical' },
                { value: 'Electrical', label: 'Electrical' },
                { value: 'Hydraulic', label: 'Hydraulic' },
                { value: 'Tools', label: 'Tools' },
              ]}
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
            render:(_,record) =>{
                return (
                    <Space size={1}>
                        <Tooltip title="Select">
                            <Button icon={<Checkbox />} />
                        </Tooltip>
                    </Space>
                )
            }
          },
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
            key: 'image',
            title: 'Image',
            dataIndex: 'image',
            render: (image) => (
              <Avatar src={image} size={48} shape="square" />
            ),
          },
          {
            key: 'part_number',
            title: 'Part Number',
            dataIndex: 'part_number',
             render: (category, r) => (
              <a
                onClick={() => navigate(`/prod/spare-part-request/view/${r.id}`, { state: { id: r.id } })}
              >
                {category}
              </a>
            ),
          },
          {
            key: 'spare_part_name',
            title: 'Name',
            dataIndex: 'spare_part_name',
          },
          {
            key: 'spare_part_type',
            title: 'Type',
            dataIndex: 'spare_part_type',
          },
          {
            key: 'category',
            title: 'Category',
            dataIndex: 'category',
          },
          {
            key: 'stock',
            title: 'Stock',
            dataIndex: 'stock',
          },
          {
            key: 'BU',
            title: 'BU',
            dataIndex: 'business_unit',
          },
          {
            key: 'Status',
            title: 'Status',
            dataIndex: 'status',
          },
        ]}
      />
    </>
  );
}
