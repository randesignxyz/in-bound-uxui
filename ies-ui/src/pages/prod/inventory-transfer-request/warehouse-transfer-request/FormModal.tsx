import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
import { EditableFormInstance, EditableProTable } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { AddSupplierParams, TransferRequest, TransferRequestItem } from '../data';
import { ItemServiceAPI } from '../service';
// import { ReceiveStatusChange, ReceivedItem, Transfer, TransferItem } from '../data';

interface Props extends FormModalProps {
  id: string;
  data?: TransferRequest;
  transfer_id: string;
  onSave: (data: AddSupplierParams, id: string, remarks: string, transfer_id: string) => void;
}
export default ({ onSave, data, ...props }: Props) => {
  // const [form] = useForm<{ remarks: string }>();
  const [items, setItems] = useState<TransferRequestItem[]>([]);
  const requestActions = simpleRequestActions();
  const services = ItemServiceAPI(requestActions);
  const editableFormRef = useRef<EditableFormInstance>();

  return (
    <FormModalComp
      title="Inventory Transfer"
      {...props}
      width={'900px'}
      onSubmit={async () => {
        // const dataForm = await form.validateFields();
        // const entity = {
        //   ...dataForm,
        //   item: items.map((v) => ({ ...v })),
        // };
        // for(let i=0; i<items.length;i++){
        // console.log(items[i])
        onSave(items, data?.id, data?.remark, data?.transfer_id);
        // }
        // console.log(entity, data?.id, data?.remark, data?.transfer_id)
        // onSave(entity, data?.id, data?.remark, data?.transfer_id);
      }}
    >
      {/* <Select
        showSearch
        style={{ width: 150 }}
        placeholder="Select"
        optionFilterProp="children"
        filterOption={(input, option: any) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        onChange={handleSelectChange} // Assign the handler function to onChange
        value={selectedValue} // Assign the selected value from state
      >
        <Option value="option1">Option 1</Option>
        <Option value="option2">Option 2</Option>
        <Option value="option3">Option 3</Option>
      </Select> */}
      <EditableProTable<TransferRequestItem>
        size="small"
        search={false}
        rowKey="id"
        editable={{
          type: 'multiple',
          editableKeys: data?.item.map((it) => it.id),
          onValuesChange: (_, recordList) => {
            setItems(recordList.map((it) => ({ ...it })));
          },
        }}
        editableFormRef={editableFormRef}
        value={data?.item}
        recordCreatorProps={false}
        pagination={false}
        columns={[
          { title: 'No', render: (_, __, index) => index + 1, editable: false, width: 70 },
          { title: 'Item Code', dataIndex: 'item_code', editable: false },
          { title: 'Item Name', dataIndex: 'item_name', editable: false },
          {
            title: 'Quantity',
            dataIndex: 'quantity',
            render: (_, r) => [r.quantity].join('/'),
            editable: false,
          },
          // { title: 'Provide', valueType: 'digit', width: 135, dataIndex: 'received', formItemProps: { rules: [{ required: true, }] } },
          { title: 'UoM', dataIndex: 'uom', editable: false, width: 60 },
          {
            title: 'Vendor',
            dataIndex: 'supplier',
            valueType: 'select',
            request: async (word) => {
              const da = await services.page_supplier({
                criteria: {
                  searchValue: word.keyWords,
                  advanceSearch: { tendency: data?.business_unit },
                },
                pagination: { pageSize: 10 },
              });
              return da.items.map((obj) => ({
                value: obj.card_name,
                label: `${obj.card_name}`,
              }));
            },
            ellipsis: true,
            fieldProps: {
              showSearch: true,
              popupMatchSelectWidth: 200,
              placeholder: 'Please Select',
            },
          },
          { title: 'Remark', dataIndex: 'remark' },
          // {
          //   title: 'Dropdown Column',
          //   dataIndex: 'dropdownValue',
          //   valueType: 'select',
          //   width: 200,
          //   render: () => (
          //     <Select
          //       showSearch
          //       style={{ width: 150 }}
          //       placeholder="Select"
          //       optionFilterProp="children"
          //       filterOption={(input, option: any) =>
          //         option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          //       }
          //       onChange={handleSelectChange} // Assign the handler function to onChange
          //       value={selectedValue} // Assign the selected value from state
          //     >
          //       <Option value="option1">Option 1</Option>
          //       <Option value="option2">Option 2</Option>
          //       <Option value="option3">Option 3</Option>
          //     </Select>
          //   ),
          // },
        ]}
      />
    </FormModalComp>
  );
};
