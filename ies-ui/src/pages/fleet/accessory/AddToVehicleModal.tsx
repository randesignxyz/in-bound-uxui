import { simpleRequestActions } from '@/services/model';
import { ProForm } from '@ant-design/pro-components';
import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { CarOutlined } from '@ant-design/icons';
import { useGetState } from 'ahooks';
import { Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect } from 'react';
import { VehicleServiceAPI } from '../vehicle/service';
import { AccessoriesCreate, AccessoriesDTO } from './data';
interface Props extends FormModalProps {
  data?: AccessoriesDTO;
  onSave: (data: AccessoriesCreate) => void;
  actionType?: String;
  id?: string;
}
const AddToVehicleModal: React.FC<Props> = ({ onSave, data, actionType, id, ...props }) => {
  const [form] = useForm<AccessoriesCreate>();
  const requestActions = simpleRequestActions();
  const [imageId, setImageId] = useGetState('');

  useEffect(() => {
    props.open && initFormData();
    props.open && truckLoadData();
  }, [props.open]);
  const truckLoadData = async (value?: string) => {
    const response = await VehicleServiceAPI(requestActions).pageVehicle({
      criteria: { searchValue: value },
      pagination: { pageSize: 20 },
    });
     response.items.map((obj) => ({
      value: obj.id,
      label: (
        <>
          <Space>
            <CarOutlined twoToneColor={'#eb2f96'} />
            {`${obj.plateNumber}`}
            {`${obj.make.name}`}-{`${obj.weight.name}`}
          </Space>
        </>
      ),
      key: Math.random().toString(),
    }));
  };
  const initFormData = () => {
    form.setFieldsValue({
        name:data?.name,
        status: data?.status || "Active",
        description: data?.description
    });
  };
  return (
    <FormModalComp
      title="Create Service Task"
      {...props}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        const entity = {
          ...dataForm,
          imageId: imageId,
        };
        onSave(entity);
      }}
    >
      <ProForm form={form} submitter={false} onReset={() => form.resetFields()}></ProForm>
    </FormModalComp>
  );
};

export default AddToVehicleModal;
