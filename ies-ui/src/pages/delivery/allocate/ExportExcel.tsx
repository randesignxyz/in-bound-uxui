import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProFormDateRangePicker, ProFormDateTimeRangePicker, ProFormSelect } from '@ant-design/pro-components';
import ProForm from '@ant-design/pro-form';
import { Card, Col, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
// import { TransferRequestServiceAPI } from './inventory-transfer-request/service';
import { simpleRequestActions } from '@/services/model';
import { AllocateServiceAPI } from './service';

interface Props extends FormModalProps {
  // id: string;
  // transfer_id:string,
  loading: boolean
  onSave: (customer: string, ordered_date: any,request_delivery_date: string) => void;
}
export default ({ loading, onSave, ...props }: Props) => {
  const [form] = useForm<{ customer: string; ordered_date: any;request_delivery_date: string }>();
  const requestActions = simpleRequestActions();
  const services = AllocateServiceAPI(requestActions);
  const [customer, setCustomer] = useState('')
  useEffect(() => {
    if (props.open) {
      form.resetFields();
      setCustomer('')
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
        onSave(customer,dataForm.ordered_date,dataForm.request_delivery_date);
      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          <Row gutter={6}>
            <Col span={24}>
              <ProFormSelect
                name="customer"
                label="Customer"
                mode="multiple"
                request={async ({ keyWords }) => {
                  const res = await services.pageCustomer({
                    criteria: {
                      searchValue: keyWords,
                    },
                    pagination: {
                      current: 1,
                      pageSize: 20,
                    },
                  })

                  return res.items.map((c: any) => ({
                    value: c.code,
                    label: `${c.code} - ${c.name}`,
                  }));
                }}
                fieldProps={{
                  onChange: (value: any) => {
                    const customerString = value.join(',');
                    const finalValues = { ...value, customer: customerString };
                    setCustomer(finalValues.customer)
                  },
                }}
              />
            </Col>
          </Row>
          {/* <Row gutter={6}>
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
                options={type == 'request' ? request : type == 'transfer' ? transfer : []}
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
          </Row> */}
          <Row gutter={6}>
            <Col span={24}>
              <ProFormDateRangePicker
                width={'lg'}
                name="ordered_date"
                label="Ordered Date"
                placeholder={['From Date', 'To Date']}
                fieldProps={{
                  format: 'YYYY-MM-DD',
                }}
              />
            </Col>
          </Row>
          <Row gutter={6}>
            <Col span={24}>
              <ProFormDateRangePicker
                width={'lg'}
                name="request_delivery_date"
                label="Request Delivery Date"
                placeholder={['From Date', 'To Date']}
                fieldProps={{
                  format: 'YYYY-MM-DD',
                }}
                rules={[{ required: true }]}
              />
            </Col>
          </Row>
        </ProForm>
      </Card>
    </FormModalComp>
  );
};
