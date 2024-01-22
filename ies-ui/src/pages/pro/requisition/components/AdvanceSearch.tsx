import { ProDepartment } from '@/services/pro/data';
import { RequisitionAdvanceSearchParams } from '@/services/pro/req-params';
import ProForm, {
  ProFormDateRangePicker,
  ProFormCheckbox,
  ProFormSelect,
} from '@ant-design/pro-form';
import { Drawer, DrawerProps } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

export interface AdvanceSearchProps extends DrawerProps {
  initData?: RequisitionAdvanceSearchParams;

  onSearch: (params: RequisitionAdvanceSearchParams) => void;
  onReset: () => void;
  listDepts?: ProDepartment[];
}

const AdvanceSearch: React.FC<AdvanceSearchProps> = ({ initData, onReset, onSearch, ...props }) => {
  const [form] = useForm<RequisitionAdvanceSearchParams>();

  useEffect(() => {
    if (!props.open) return;
    form.setFieldsValue({ ...initData });
  }, [props.open]);

  return (
    <Drawer {...props}>
      <ProForm
        form={form}
        onReset={() => onReset()}
        submitter={{
          onSubmit: async () => {
            const data = await form.validateFields();
            onSearch(data);
          },
        }}
      >
        <ProFormSelect
          mode="multiple"
          name="deptIds"
          label="Department"
          options={props.listDepts?.map((it) => {
            return { value: it.id, label: it.name };
          })}
        />

        <ProFormDateRangePicker label="Expected Date" name="acquiredDate" />
        <ProFormDateRangePicker label="Requested Date" name="requestedDate" />
        <ProFormCheckbox labelAlign="left" label="Service" name="service" />
      </ProForm>
    </Drawer>
  );
};

export default AdvanceSearch;
// export default ({onSearch, ...rest}: Props) => {

//     const [form] = useForm<RequisitionAdvanceSearchFormData>()

//     return <DrawerForm {...rest} form = {form}  onFinish = {async () => {
//         const formData = await form.validateFields()

//         // return await onSearch?.() //(data: {formData.acquiredDate, formData.requestedDate, formData.service})
//     }}>
//         <ProFormDateRangePicker label="Expected Date" name="acquiredDate" />
//         <ProFormDateRangePicker label="Requested Date" name="requestedDate" />
//         <ProFormCheckbox
//                 labelAlign="left"
//                 label="Service"
//                 name="service"
//               />
//     </DrawerForm>
// }
