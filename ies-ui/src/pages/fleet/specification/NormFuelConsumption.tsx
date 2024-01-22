import {
  ProForm,
  ProFormDependency,
  ProFormDigit,
  ProFormTextArea,
} from '@ant-design/pro-components';

import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { Col, Modal, Row } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect } from 'react';
import { NormFuelConsumptionCreate } from './data.d';

interface Props extends FormModalProps {
  data?: NormFuelConsumptionCreate;
  vehicleId?: string;
  onSave: (data: NormFuelConsumptionCreate) => void;
}

const NormFuelConsumption: React.FC<Props> = ({ data, title, vehicleId, onSave, ...props }) => {
  const [form] = useForm();

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
    <FormModalComp
      title={'Norm Fuel Consumption'}
      {...props}
      width={'600px'}
      onSubmit={async () => {
        const dataForm = await form.validateFields();

        Modal.confirm({
          title: 'Save Norm fuel Consumption Record',
          content: ' are you sure?',

          onOk: () => {
            const entry = {
              ...dataForm,
              vehicleId: vehicleId,
              id: data?.id,
            };

            onSave(entry);
          },
        });
      }}
    >
      <ProForm form={form} submitter={false} onReset={() => form.resetFields()}>
        <Row gutter={6}>
          <Col span={24}>
            <ProFormDigit
              label="Truck Tank Capacity"
              name={'tankCapacity'}
              rules={[{ required: true }]}
            />
          </Col>
          <Col span={12}>
            <ProFormDigit
              label="Usage (WH2)"
              name={'usage'}
              rules={[{ required: true }]}
              placeholder={'50 L'}
            />
          </Col>
          <Col span={12}>
            <ProFormDigit
              name={'kilometer'}
              label="Km/month"
              rules={[{ required: true }]}
              placeholder={'500 L'}
            />
          </Col>
          <Col span={24}>
            <ProFormDependency dependencies={['kilometer', 'usage']} name={['kilometer', 'usage']}>
              {({ kilometer, usage }) => {
                const usageRate = ((usage / kilometer) * 100).toFixed(2);
                form.setFieldValue('usageRate', parseFloat(usageRate));
                return (
                  <>
                    <ProFormDigit
                      name={'usageRate'}
                      label="Usage Rate"
                      fieldProps={{
                        value: parseFloat(usageRate) || 0,
                      }}
                    />
                  </>
                );
              }}
            </ProFormDependency>
          </Col>
          <Col span={24}>
            <ProFormTextArea name={'remark'} label="Remark" rules={[{ max: 255 }]} />
          </Col>
        </Row>
      </ProForm>
    </FormModalComp>
  );
};

export default NormFuelConsumption;
