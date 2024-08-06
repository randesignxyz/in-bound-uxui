import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProFormDateRangePicker, ProFormDateTimeRangePicker, ProFormSelect } from '@ant-design/pro-components';
import ProForm from '@ant-design/pro-form';
import { Card, Col, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { simpleRequestActions } from '@/services/model';

interface Props extends FormModalProps {
  // id: string;
  // transfer_id:string,
  loading: boolean
  onSave: (duration: string, shift: string) => void;
}
export default ({ loading, onSave, ...props }: Props) => {
  const [form] = useForm<{ line: string; duration: any; shift: string, state: string, request_type: string }>();
  const [shift, setShift] = useState('')
  useEffect(() => {
    if (props.open) {
      form.resetFields();
      setShift('')
    }
  }, [props.open]);

  return (
    <FormModalComp
      width="550px"
      {...props}
      confirmLoading={loading}
      onResetForm={() => form.resetFields()}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave(dataForm.duration, shift);
      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          <Row gutter={6}>
            <Col span={23}>
              <ProFormSelect
                options={[
                  {
                      value: 'S1 (7:00)',
                      label: 'S1 (7:00)',
                  },
                  {
                      value: 'S1 (13:00)',
                      label: 'S1 (13:00)',
                  },
                  {
                      value: 'S2 (18:00)',
                      label: 'S2 (18:00)',
                  },
                  {
                      value: 'S2 (22:00)',
                      label: 'S2 (22:00)',
                  },
              ]}
                name="shift"
                label="Shift"
                mode="multiple"
                fieldProps={{
                  onChange: (value: any) => {
                    const shiftString = value.join(',');
                    const finalValues = { ...value, shift: shiftString };
                    setShift(finalValues.shift)
                  },
                }}
              />
            </Col>
          </Row>
          <Row gutter={6}>
            <Col span={24}>
              <ProFormDateRangePicker
                width={'lg'}
                name="duration"
                label="Duration (Assign Date)"
                placeholder={['start', 'end']}
                fieldProps={{
                  format: 'YYYY-MM-DD',
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
