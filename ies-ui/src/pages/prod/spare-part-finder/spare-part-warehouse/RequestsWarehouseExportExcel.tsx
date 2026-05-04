import { Button, DatePicker, Form, Modal, Radio, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';

const { RangePicker } = DatePicker;

type ExportPeriod = 'week' | 'month' | 'year' | 'custom';

export type RequestsWarehouseExportValues = {
  dateRange?: [Dayjs, Dayjs];
  businessUnits: string[];
};

type Props = {
  open: boolean;
  loading?: boolean;
  businessUnitOptions: string[];
  reportName: string;
  showDateRange?: boolean;
  onCancel: () => void;
  onSave: (values: RequestsWarehouseExportValues) => Promise<void> | void;
};

type FormValues = {
  period: ExportPeriod;
  dateRange?: [Dayjs, Dayjs];
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
  showDateRange = true,
  onCancel,
  onSave,
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const period = Form.useWatch('period', form);

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      period: showDateRange ? 'week' : undefined,
      dateRange: showDateRange ? getDateRangeByPeriod('week') : undefined,
      businessUnits: ['All'],
    });
  }, [form, open, showDateRange]);

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
            const dateRange = showDateRange
              ? values.dateRange || getDateRangeByPeriod(values.period)
              : undefined;

            const selectedBU = values.businessUnits || [];
            await onSave({
              dateRange,
              businessUnits: selectedBU.includes('All') || selectedBU.length === 0 ? [] : selectedBU,
            });
          }}
        >
          Export
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        {showDateRange !== false ? (
          <>
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
          </>
        ) : null}

        <Form.Item name="businessUnits" label="Business Unit">
          <Select
            mode="multiple"
            allowClear
            showSearch
            placeholder="All Business Units"
            onChange={(val: string[]) => {
              const prev = form.getFieldValue('businessUnits') || [];
              const justAddedAll = !prev.includes('All') && val.includes('All');
              if (justAddedAll || val.length === 0) {
                form.setFieldValue('businessUnits', ['All']);
              } else if (prev.includes('All') && val.length > 1) {
                form.setFieldValue('businessUnits', val.filter((v) => v !== 'All'));
              }
            }}
            options={[
              { label: 'All', value: 'All' },
              ...businessUnitOptions.map((item) => ({ label: item, value: item }))
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
