import { Button, DatePicker, Form, Modal, Radio, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';

const { RangePicker } = DatePicker;

type ExportPeriod = 'week' | 'month' | 'year' | 'custom';

export type RequestsWarehouseExportValues = {
  dateRange?: [Dayjs, Dayjs];
  businessUnits: string[];
  warehouses?: string[];
};

type Props = {
  open: boolean;
  loading?: boolean;
  businessUnitOptions: string[];
  defaultBusinessUnits?: string[];
  warehouseOptions?: string[];
  defaultWarehouses?: string[];
  reportName: string;
  showDateRange?: boolean;
  showWarehouse?: boolean;
  onCancel: () => void;
  onSave: (values: RequestsWarehouseExportValues) => Promise<void> | void;
};

type FormValues = {
  period: ExportPeriod;
  dateRange?: [Dayjs, Dayjs];
  businessUnits?: string[];
  warehouses?: string[];
};

const ALL_BUSINESS_UNITS = 'All';
const ALL_WAREHOUSES = 'All';

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
  defaultBusinessUnits,
  warehouseOptions = [],
  defaultWarehouses,
  reportName,
  showDateRange = true,
  showWarehouse = false,
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
      businessUnits: defaultBusinessUnits?.length
        ? defaultBusinessUnits
        : [ALL_BUSINESS_UNITS],
      warehouses: defaultWarehouses?.length
        ? defaultWarehouses
        : [ALL_WAREHOUSES],
    });
  }, [businessUnitOptions, defaultBusinessUnits, defaultWarehouses, form, open, showDateRange, warehouseOptions]);

  return (
    <Modal
      title={reportName === 'spare_parts' || reportName === 'prod_spf_requests' ? 'Export Excel' : 'Export Return Excel'}
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

            const selectedBU = values.businessUnits?.includes(ALL_BUSINESS_UNITS)
              ? []
              : values.businessUnits || [];
            const selectedWarehouses = values.warehouses?.includes(ALL_WAREHOUSES)
              ? []
              : values.warehouses || [];
            await onSave({
              dateRange,
              businessUnits: selectedBU,
              warehouses: selectedWarehouses,
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
            options={[
              { label: ALL_BUSINESS_UNITS, value: ALL_BUSINESS_UNITS },
              ...businessUnitOptions
                .filter((item) => item !== ALL_BUSINESS_UNITS)
                .map((item) => ({ label: item, value: item })),
            ]}
            onSelect={(value) => {
              if (value === ALL_BUSINESS_UNITS) {
                form.setFieldValue('businessUnits', [ALL_BUSINESS_UNITS]);
                return;
              }

              form.setFieldValue(
                'businessUnits',
                (form.getFieldValue('businessUnits') || []).filter(
                  (item: string) => item !== ALL_BUSINESS_UNITS,
                ),
              );
            }}
          />
        </Form.Item>

        {showWarehouse ? (
          <Form.Item name="warehouses" label="Warehouse">
            <Select
              mode="multiple"
              allowClear
              showSearch
              placeholder="All Warehouses"
              options={[
                { label: ALL_WAREHOUSES, value: ALL_WAREHOUSES },
                ...warehouseOptions
                  .filter((item) => item !== ALL_WAREHOUSES)
                  .map((item) => ({ label: item, value: item })),
              ]}
              onSelect={(value) => {
                if (value === ALL_WAREHOUSES) {
                  form.setFieldValue('warehouses', [ALL_WAREHOUSES]);
                  return;
                }

                form.setFieldValue(
                  'warehouses',
                  (form.getFieldValue('warehouses') || []).filter(
                    (item: string) => item !== ALL_WAREHOUSES,
                  ),
                );
              }}
            />
          </Form.Item>
        ) : null}
      </Form>
    </Modal>
  );
}
