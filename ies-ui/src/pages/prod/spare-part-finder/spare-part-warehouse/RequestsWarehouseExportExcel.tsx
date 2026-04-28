import { Button, DatePicker, Form, Modal, Radio, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';

const { RangePicker } = DatePicker;

type ExportPeriod = 'week' | 'month' | 'year' | 'custom';
type BusinessUnitMode = 'all' | 'select';

export type RequestsWarehouseExportValues = {
  dateRange: [Dayjs, Dayjs];
  businessUnits: string[];
};

type Props = {
  open: boolean;
  loading?: boolean;
  businessUnitOptions: string[];
  reportName: string;
  onCancel: () => void;
  onSave: (values: RequestsWarehouseExportValues) => Promise<void> | void;
};

type FormValues = {
  period: ExportPeriod;
  dateRange?: [Dayjs, Dayjs];
  businessUnitMode: BusinessUnitMode;
  businessUnits?: string[];
};

const getDateRangeByPeriod = (period: ExportPeriod): [Dayjs, Dayjs] => {
  const today = dayjs();

  switch (period) {
    case 'month':
      return [today.subtract(1, 'month').startOf('day'), today.endOf('day')];
    case 'year':
      return [today.subtract(1, 'year').startOf('day'), today.endOf('day')];
    case 'week':
    default:
      return [today.subtract(7, 'day').startOf('day'), today.endOf('day')];
  }
};

export default function RequestsWarehouseExportExcel({
  open,
  loading,
  businessUnitOptions,
  reportName,
  onCancel,
  onSave,
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const period = Form.useWatch('period', form);
  const businessUnitMode = Form.useWatch('businessUnitMode', form);

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      period: 'week',
      dateRange: getDateRangeByPeriod('week'),
      businessUnitMode: 'all',
      businessUnits: [],
    });
  }, [form, open]);

  return (
    <Modal
      title={reportName === 'prod_spf_requests' ? 'Export Excel' : 'Export Return Excel'}
      open={open}
      confirmLoading={loading}
      onCancel={onCancel}
      width={560}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="export"
          type="primary"
          loading={loading}
          onClick={async () => {
            const values = await form.validateFields();
            const dateRange = values.dateRange || getDateRangeByPeriod(values.period);

            await onSave({
              dateRange,
              businessUnits: values.businessUnitMode === 'all' ? [] : values.businessUnits || [],
            });
          }}
        >
          Export
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="period" label="Date Range" rules={[{ required: true }]}>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            onChange={(event) => {
              const nextPeriod = event.target.value as ExportPeriod;
              form.setFieldValue('dateRange', getDateRangeByPeriod(nextPeriod));
            }}
            options={[
              { label: 'A Week', value: 'week' },
              { label: 'A Month', value: 'month' },
              { label: 'A Year', value: 'year' },
              { label: 'Select Range', value: 'custom' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="dateRange"
          rules={[{ required: true, message: 'Please select a date range.' }]}
        >
          <RangePicker
            allowClear={false}
            disabled={period !== 'custom'}
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item name="businessUnitMode" label="Business Unit" rules={[{ required: true }]}>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            onChange={(event) => {
              if ((event.target.value as BusinessUnitMode) === 'all') {
                form.setFieldValue('businessUnits', []);
              }
            }}
            options={[
              { label: 'All', value: 'all' },
              { label: 'Select Business Unit', value: 'select' },
            ]}
          />
        </Form.Item>

        {businessUnitMode === 'select' ? (
          <Form.Item
            name="businessUnits"
            rules={[{ required: true, message: 'Please select at least one business unit.' }]}
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              placeholder="Select business unit"
              options={businessUnitOptions.map((item) => ({ label: item, value: item }))}
            />
          </Form.Item>
        ) : null}
      </Form>
    </Modal>
  );
}
