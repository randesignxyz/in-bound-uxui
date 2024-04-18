import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProFormDateTimeRangePicker, ProFormSelect } from '@ant-design/pro-components';
import ProForm from '@ant-design/pro-form';
import { Card, Col, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface Props extends FormModalProps {
  // id: string;
  // transfer_id:string,
  onSave: (id: string, remarks: string, transfer_id: string) => void;
}
export default ({ onSave, ...props }: Props) => {
  const [form] = useForm<{ line: string; duration: any; shift: string }>();
  useEffect(() => {
    if (props.open) form.resetFields();
  }, [props.open]);

  return (
    <FormModalComp
      width="550px"
      {...props}
      onResetForm={() => form.resetFields()}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave(dataForm.duration, dataForm.line, dataForm.shift);
      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          <Row gutter={6}>
            <Col span={12}>
              <ProFormSelect
                options={[
                  {
                    value: 'Line 1',
                    label: 'Line 1',
                  },
                  {
                    value: 'Line 2',
                    label: 'Line 2',
                  },
                  {
                    value: 'Line 3',
                    label: 'Line 3',
                  },
                  {
                    value: 'Line 4',
                    label: 'Line 4',
                  },
                  {
                    value: 'Line 5',
                    label: 'Line 5',
                  },
                  {
                    value: 'Line 6',
                    label: 'Line 6',
                  },
                ]}
                name="line"
                label="Line"
                rules={[{ required: true }]}
              />
            </Col>
            <Col span={11}>
              <ProFormSelect
                options={[
                  {
                    value: 'S1',
                    label: 'S1',
                  },
                  {
                    value: 'S2',
                    label: 'S2',
                  },
                ]}
                name="shift"
                label="Shift"
                rules={[{ required: true }]}
              />
            </Col>
          </Row>
          <Row gutter={6}>
            <Col>
              <ProFormDateTimeRangePicker
                width={'lg'}
                name="duration"
                label="Duration"
                placeholder={['start', 'end']}
                fieldProps={{
                  format: 'YYYY-MM-DD HH:mm:ss',
                }}
                rules={[{ required: true }]}
              />
            </Col>
          </Row>
          {/* <Text>{id}</Text>
          <Text>{transfer_id}</Text> */}
        </ProForm>
      </Card>
    </FormModalComp>
  );
};
