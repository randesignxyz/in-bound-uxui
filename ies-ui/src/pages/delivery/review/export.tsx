import { Driver } from '@/services/delivery/data';
import {
  DrawerForm,
  DrawerFormProps,
  ProFormDateRangePicker,
  ProFormRadio,
  ProFormSelect,
} from '@ant-design/pro-form';


import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { ReviewReport } from './data.type';
import { ProFormDatePicker } from '@ant-design/pro-components';

interface Props extends DrawerFormProps {
  drivers: Driver[];
  onExport: (data: ReviewReport) => Promise<void>;
}

const Exporter: React.FC<Props> = ({ drivers, onExport, ...props }) => {
  const [form] = useForm<ReviewReport>();
  const [type, setType] = useState<'YEARLY' | 'MONTHLY' | 'DATE'>('MONTHLY');
  const [driverRequired, setDriverRequired] = useState(false);

  useEffect(() => {
    onReset();
    return () => {
      form.resetFields();
    };
  }, [props.open]);

  const onReset = () => {
    form.setFieldsValue({
      reportType: 'RAW',
      dateType: 'MONTHLY',
    });
  };

  return (
    <DrawerForm
      form={form}
      {...props}
      onValuesChange={(changedValues) => {
        const { dateType, reportType } = changedValues;
        if ('dateType' in changedValues) {
          setType(dateType);
        }

        if ('reportType' in changedValues) {
          setDriverRequired(reportType === 'DRIVER');
        }
      }}
      onFinish={async () => {
        const dataForm = await form.validateFields();
        return await onExport(dataForm);
      }}
    >
      <ProFormRadio.Group
        label="Report Type"
        name={'reportType'}
        options={[
          { label: 'Raw', value: 'RAW' },
          { label: 'Questionnaire', value: 'QUESTIONNAIRE' },
          { label: 'Driver', value: 'DRIVER' },
        ]}
      />

      <ProFormSelect
        mode="multiple"
        label="Driver(s)"
        name={'drivers'}
        // rules = {[{required: driverRequired}]}
        options={drivers.map((it) => ({
          label: [it.firstName, it.lastName].join(' '),
          value: it.id || 0,
        }))}
      />
      <ProFormRadio.Group
        label="Date Type"
        name={'dateType'}
        options={[
          { label: 'Date Range', value: 'DATE' },
          { label: 'Monthly', value: 'MONTHLY' },
          { label: 'Yearly', value: 'YEARLY' },
        ]}
      />
      {type === 'YEARLY' && (
        <ProFormDatePicker.Year rules={[{ required: true }]} label="Year" name={'date'} />
      )}
      {type === 'MONTHLY' && (
        <ProFormDatePicker.Month rules={[{ required: true }]} label="Month" name={'date'} />
      )}
      {type === 'DATE' && (
        <ProFormDateRangePicker rules={[{ required: true }]} label="Date" name={'dateRange'} />
      )}
    </DrawerForm>
  );
};

export default Exporter;
