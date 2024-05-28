import { simpleRequestActions } from '@/services/model';
import {
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';

import { FormModalProps } from '@/components/FormModal';
import { Button, Col, message, Modal, Row } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect } from 'react';
import { TireAssignCreate, TireVehicleDTO } from './data.d';
import { SpecificationServiceAPI } from './service';

interface Props extends FormModalProps {
  data?: TireVehicleDTO;
  id?: string;
  loadData: () => void;
  onSave: (data: TireAssignCreate) => void;
}

const TireModalForm: React.FC<Props> = ({
  data,
  title,
  id,
  onSave,
  loadData: loadData,
  ...props
}) => {
  const [form] = useForm();
  const requestActions = simpleRequestActions();

  useEffect(() => {
    props.open && initFormData();
    props.open && data
      ? data
      : form.resetFields(['timeInterval', 'vehicleId', 'serviceTask', 'meterInterval']);
  }, [props.open]);

  const initFormData = () => {
    form.setFieldsValue({
      ...data,
    });
  };

  return (
    <Modal
      title={'Tire Infomation'}
      open={props.open}
      onCancel={() => props.onCancel?.()}
      width={'600px'}
      footer={
        <>
          <Button onClick={() => props.onCancel?.()}>Cancel</Button>
          <Button
            type="primary"
            onClick={async () => {
              const dataForm = await form.validateFields();

              Modal.confirm({
                title: 'Are you Sure?',
                content: 'Save Record',

                onOk: async () => {
                  const entry = {
                    ...dataForm,
                    vehicleId: id,
                    id: data?.id,
                  };

                  const response = (await SpecificationServiceAPI(requestActions).saveVehicleTire(
                    entry,
                  )) as {
                    data: string;
                    message: string;
                  };
                  loadData();
                  message.success(response.message);
                },
              });
            }}
          >
            Save And New
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              const dataForm = await form.validateFields();

              Modal.confirm({
                title: 'Save Tire Record',
                content: ' are you sure?',

                onOk: () => {
                  const entry = {
                    ...dataForm,
                    vehicleId: id,
                    id: data?.id,
                  };

                  onSave(entry);
                  loadData();
                },
              });
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <ProForm form={form} submitter={false} onReset={() => form.resetFields()}>
        <Row gutter={12}>
          <Col span={12}>
            <ProFormSelect
              label="Position Tire"
              name={'tirePosition'}
              options={[
                { value: 'F-L', label: 'Front-L' },
                { value: 'F-R', label: 'Front-R' },
                { value: 'R-R-IN', label: 'Back-R IN' },
                { value: 'R-L-IN', label: 'Back-L IN' },
                { value: 'R-L-OUT', label: 'Back-L OUT' },
                { value: 'R-R-OUT', label: 'Back-R OUT' },
              ]}
              rules={[{ required: true }]}
            />

            <ProFormDigit label="Tire Width" name={'tireWidth'} rules={[{ required: true }]} />
            <ProFormDigit
              label="Tire Diameter"
              name={'wheelDiameter'}
              rules={[{ required: true }]}
            />
          </Col>
          <Col span={12}>
            <ProFormText name={'brand'} label="Tire Brand" rules={[{ required: true }]} />
            <ProFormText name={'code'} label="Tire Code" rules={[{ required: true }]} />
            <ProFormText name={'model'} label="Tire Model" rules={[{ required: true }]} />
          </Col>
          <Col span={8}>
            <ProFormText name={'durability'} label="Durability" rules={[{ required: true }]} />
          </Col>
          <Col span={8}>
            <ProFormDatePicker
              width={'xl'}
              name={'productionDate'}
              label="Production Date"
              rules={[{ required: true }]}
            />
          </Col>
          <Col span={8}>
            <ProFormDatePicker width={'xl'} name={'purchaseDate'} label="Purchase Date" />
          </Col>
        </Row>
      </ProForm>
    </Modal>
  );
};

export default TireModalForm;
