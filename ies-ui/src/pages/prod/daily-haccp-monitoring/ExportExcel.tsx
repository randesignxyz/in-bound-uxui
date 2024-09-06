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
  onSave: (duration: string, line: string) => void;
}
export default ({ loading, onSave, ...props }: Props) => {
  const [form] = useForm<{ line: string; duration: any }>();
  const [line, setLine] = useState('')
  useEffect(() => {
    if (props.open) {
      form.resetFields();
      setLine('')
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
        onSave(dataForm.duration, line);
      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          <Row gutter={6}>
            <Col span={23}>
              <ProFormSelect
                options={[
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
                      label: 'Line 6'
                  }
              ]}
                name="line"
                label="Line"
                mode="multiple"
                fieldProps={{
                  onChange: (value: any) => {
                    const lineString = value.join(',');
                    const finalValues = { ...value, line: lineString };
                    setLine(finalValues.line)
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
