import TableView from '@/components/DataCrud/TableView';
import { CheckCircleFilled, EyeFilled, MoreOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { Avatar, Button, Checkbox, DatePicker, Dropdown, Radio, Select, Space, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { useNavigate } from '@umijs/max';
import { Background } from 'reactflow';
import FormModalSelectItems from './FormModalSelectItems';

export default function MySparePartList() {
  const actionRef = useRef<ActionType>();
  const navigate = useNavigate();
  const [folderSelected, setFolderSelected] = useState<string>();
  const [radioValue, setRadioValue] = useState('All');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState<{ visible: boolean; data?: any[] }>({ visible: false });
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

  const handleCheckboxChange = (record: any, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => {
        if (prev.some((item) => item.id === record.id)) {
          return prev;
        }

        return [...prev, record];
      });
    } else {
      setSelectedItems((prev) => prev.filter(item => item.id !== record.id));
    }
  };

  const handleReturnPart = () => {
    if (selectedItems.length > 0) {
      setModalOpen({ visible: true, data: selectedItems });
    }
  };

  const handleModalSubmit = (items: any[]) => {
    console.log('Submitting return for items:', items);
    // Add your submit logic here
    // items will contain the edited data with return_quantity and reason
    setModalOpen({ visible: false });
    setSelectedItems([]);
  };

  const handleAddMore = (items: any[]) => {
    setSelectedItems(items);
    setModalOpen({ visible: false });
  };

  const handleModalCancel = () => {
    setModalOpen(prev => ({ ...prev, visible: false }));
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
              defaultValue="category"
              style={{ width: 125 }}
              onChange={(e) => {
                console.log(e);
              }}
              options={[
                { value: 'category', label: 'Categories' },
                { value: 'Mechanical', label: 'Mechanical' },
                { value: 'Electrical', label: 'Electrical' },
                { value: 'Hydraulic', label: 'Hydraulic' },
                { value: 'Tools', label: 'Tools' },
              ]}
            />
            <DatePicker/>
          </Space>
        }
        tableProps={{
          actionRef: actionRef,
          toolbar: {
            actions: [
              <>
                <Button>My Requests</Button>
                <Button>Import Excel </Button>
                <Button 
                type={selectedItems.length > 0 ? 'primary' : 'default'}
                disabled={selectedItems.length === 0}
                onClick={handleReturnPart}
                >Return Part ({selectedItems.length})</Button>
              </>,
            ],
          },
        }}
        columns={[
          {
            title: '',
            width: 10,
            render:(_,record) =>{
                const isChecked = selectedItems.some(item => item.id === record.id);
                return (
                    <Space size={1}>
                        <Tooltip title="Select">
                            <Checkbox 
                              checked={isChecked}
                              onChange={(e) => handleCheckboxChange(record, e.target.checked)}
                            />
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
            title: 'Product Number',
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
            key: 'Warehouse',
            title: 'Warehouse',
            dataIndex: 'receiving_from_warehouse',
          },
          {
            key: 'BU',
            title: 'BU',
            dataIndex: 'business_unit',
          },
          {
            key: 'Requested_Date',
            title: 'Requested Date',
            dataIndex: 'requested_date',
          },
          {
            key: 'Requested_Pickup_Date',
            title: 'Requested Pickup Date',
            dataIndex: 'requested_pickup_date',
          }
        ]}
      />
      <FormModalSelectItems
        open={modalOpen.visible}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
        data={modalOpen.data}
      />
    </>
  );
}
