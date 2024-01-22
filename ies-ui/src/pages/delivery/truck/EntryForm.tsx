import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { Company, LoadingCapacityListItem, SaveTruck, Truck } from '@/services/delivery/data';
import ProForm, {
  ProFormCheckbox,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Card } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface Props extends FormModalProps {
  companyList: Company[];
  loadingCapacityList: LoadingCapacityListItem[];
  data?: Truck;
  onSave: (data: SaveTruck) => void;
}

const TruckEntryModal: React.FC<Props> = ({ companyList, loadingCapacityList, onSave, data, ...props }) => {
  const [form] = useForm<SaveTruck>();


  const initForm = () => {
    form.setFieldsValue({
      name: data?.name,
      code: data?.code,
      licensePlate: data?.licensePlate,
      loadingCapacityId: data?.loadingCapacity?.id,
      description: data?.description,
      companyId: data?.company.id,
      isSideDoor: data?.isSideDoor || false,
    });
  }

  useEffect(() => {
    props.open && initForm()
  }, [props.open]);

  return (
    <FormModalComp
      title="Truck"
      width="700px"
      {...props}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave?.(dataForm);
      }}
      onResetForm={() => {
        form.resetFields();
        initForm()

      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          <ProFormText rules={[{ required: true }]} name={'code'} label="Code" help={<span />} />
          <ProFormText rules={[{ required: true }]} name={'name'} label="Name" help={<span />} />
          <ProFormText
            rules={[{ required: true }]}
            name={'licensePlate'}
            label="License Plate"
            help={<span />}
          />
          <ProFormCheckbox label="Side Door" name={'isSideDoor'} />
          <ProFormSelect
            rules={[{ required: true }]}
            showSearch
            name={'companyId'}
            label="Company"
            help={<span />}
            options={companyList.map((it) => ({
              label: it.name,
              value: it.id || 0,
            }))}
          />

          <ProFormSelect
            rules={[{ required: true }]}
            showSearch
            name={'loadingCapacityId'}
            label="Loading Capacity"
            help={<span />}
            options = {loadingCapacityList.map(it => ({ label: it.name, value: it.id }))}
          />
          <ProFormTextArea name={'description'} label="Description" />
        </ProForm>
      </Card>
    </FormModalComp>
  );
};

export default TruckEntryModal;
