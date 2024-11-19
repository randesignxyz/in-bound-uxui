import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProFormDateRangePicker, ProFormDateTimeRangePicker, ProFormSelect } from '@ant-design/pro-components';
import ProForm from '@ant-design/pro-form';
import { Card, Col, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { simpleRequestActions } from '@/services/model';
import { HACCPMonitoringOzoneServiceAPI } from './service';

interface Props extends FormModalProps {
  // id: string;
  // transfer_id:string,
  loading: boolean
  onSave: (duration: string, shift: string,type:string) => void;
}
export default ({ loading, onSave, ...props }: Props) => {
  const requestActions = simpleRequestActions();
  const services = HACCPMonitoringOzoneServiceAPI(requestActions);
  const [form] = useForm<{ line: string; duration: any; shift: string, state: string, request_type: string }>();
  const [time, setTime] = useState('')
  const [type, setType] = useState('')
  useEffect(() => {
    if (props.open) {
      form.resetFields();
      setTime('')
      setType('')
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
        onSave(dataForm.duration, time,type);
      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          <Row gutter={6}>
            <Col span={12}>
              <ProFormSelect
                options={[
                  {
                      value: '7:00',
                      label: '7:00',
                  },
                  {
                      value: '11:00',
                      label: '11:00',
                  },
                  {
                      value: '15:00',
                      label: '15:00',
                  },
                  {
                      value: '19:00',
                      label: '19:00',
                  },
                  {
                      value: '23:00',
                      label: '23:00',
                  },
                  {
                      value: '3:00',
                      label: '3:00'
                  }
              ]}
                name="time"
                label="Time"
                mode="multiple"
                fieldProps={{
                  onChange: (value: any) => {
                    const timeString = value.join(',');
                    const finalValues = { ...value, time: timeString };
                    setTime(finalValues.time)
                  },
                }}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                request={async ({ }) => {
                  const data = await services.getOzoneSystem();

                  return data.map((obj: any) => ({
                      value: obj.ozone,
                      label: `${obj.ozone}`,
                  }));
              }}
                name="type"
                label="Plant"
                mode="multiple"
                fieldProps={{
                  onChange: (value: any) => {
                    const typeString = value.join(',');
                    const finalValues = { ...value, type: typeString };
                    setType(finalValues.type)
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
