import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProFormDateRangePicker, ProFormSelect } from '@ant-design/pro-components';
import ProForm from '@ant-design/pro-form';
import { Card, Col, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { TransferRequestServiceAPI } from './inventory-transfer-request/service';
import { simpleRequestActions } from '@/services/model';
import type { Paging } from '@/services/API';
import type { ProductionLine } from './inventory-transfer-request/data';

interface Props extends FormModalProps {
  // id: string;
  // transfer_id:string,
  loading: boolean
  type:string
  onSave: (duration: string, line: string, shift: string, state: string, request_type: string) => void;
}
export default ({ loading, onSave,type, ...props }: Props) => {
  const [form] = useForm<{ line: string; duration: any; shift: string, state: string, request_type: string }>();
  const [shift, setShift] = useState('')
  const [state, setState] = useState('')
  const requestActions = simpleRequestActions();
  const [line, setLine] = useState('')
  useEffect(() => {
    if (props.open) {
      form.resetFields();
      setLine('')
      setShift('')
      setState('')
    }
  }, [props.open]);

  const request = [
    {
      value: 'in-progress',
      label: 'In Progress',
    },
    {
      value: 'completed',
      label: 'Completed',
    },
    {
      value: 'rejected',
      label: 'Rejected',
    },
  ]

  const transfer = [
    {
      value: 'pending',
      label: 'Pending',
    },
    {
      value: 'completed',
      label: 'Completed',
    },
  ]
  return (
    <FormModalComp
      width="550px"
      {...props}
      confirmLoading={loading}
      onResetForm={() => form.resetFields()}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave(dataForm.duration, line, shift, state, dataForm.request_type);
      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          <Row gutter={6}>
            <Col span={12}>
              <ProFormSelect
                name="line"
                label="Line"
                mode="multiple"
                request={async () => {
                  const lineResponse = await TransferRequestServiceAPI(requestActions).get_line()
                  const line = Array.isArray(lineResponse)
                    ? lineResponse
                    : (lineResponse as Paging<ProductionLine>)?.items || [];
                  return line.map((obj: ProductionLine) => ({
                    value: obj.prdname,
                    label: obj.prdname
                  }))
                }}
                fieldProps={{
                  onChange: (value: any) => {
                    const lineString = value.join(',');
                    const finalValues = { ...value, line: lineString };
                    setLine(finalValues.line)
                  },
                }}
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
            <Col span={12}>
              <ProFormSelect
                options={[
                  {
                    value: 'PM/RM',
                    label: 'PM/RM',
                  },
                  {
                    value: 'FG',
                    label: 'FG',
                  },
                ]}
                name="request_type"
                label="Type"
              />
            </Col>
            <Col span={11}>
              <ProFormSelect
                options={type === 'request' ? request : type === 'transfer' ? transfer : []}
                name="state"
                label="Status"
                mode="multiple"
                fieldProps={{
                  onChange: (value: any) => {
                    const stateString = value.join(',');
                    const finalValues = { ...value, state: stateString };
                    setState(finalValues.state)
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
                label="Duration (Posting Date)"
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
