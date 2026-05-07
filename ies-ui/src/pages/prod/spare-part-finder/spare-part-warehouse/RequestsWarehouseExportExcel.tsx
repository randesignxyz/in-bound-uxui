import { Button, DatePicker, Form, Modal, Radio, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { fetchSparePartWarehouses } from '../spare-part-request/service.api';

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

type WarehouseOption = {
  warehouseCode: string;
  warehouseName?: string;
};

const ALL_BUSINESS_UNITS = 'All';
const ALL_WAREHOUSES = 'All';

const getUniqueWarehouses = (items: WarehouseOption[] = []) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const warehouseCode = String(item?.warehouseCode || '').trim();
    if (!warehouseCode || seen.has(warehouseCode)) return false;
    seen.add(warehouseCode);
    return true;
  });
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
  const selectedBusinessUnits = Form.useWatch('businessUnits', form);
  const [loadedWarehouseOptions, setLoadedWarehouseOptions] = useState<WarehouseOption[]>([]);
  const [warehouseOptionsLoading, setWarehouseOptionsLoading] = useState(false);
  const warehouseOptionsSeqRef = useRef(0);

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
  }, [businessUnitOptions, defaultBusinessUnits, defaultWarehouses, form, open, showDateRange]);

  useEffect(() => {
    if (!open || !showWarehouse) return;

    const businessUnits = selectedBusinessUnits?.includes(ALL_BUSINESS_UNITS)
      ? []
      : selectedBusinessUnits || [];
    const requestSeq = ++warehouseOptionsSeqRef.current;
    const controller = new AbortController();

    setWarehouseOptionsLoading(true);
    setLoadedWarehouseOptions([]);
    fetchSparePartWarehouses(businessUnits.length > 0 ? businessUnits : undefined, controller.signal)
      .then((items) => {
        if (controller.signal.aborted || requestSeq !== warehouseOptionsSeqRef.current) return;
        setLoadedWarehouseOptions(getUniqueWarehouses(items));
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.name === 'AbortError' || requestSeq !== warehouseOptionsSeqRef.current) return;
        setLoadedWarehouseOptions([]);
      })
      .finally(() => {
        if (controller.signal.aborted || requestSeq !== warehouseOptionsSeqRef.current) return;
        setWarehouseOptionsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [open, selectedBusinessUnits, showWarehouse]);

  const exportWarehouseOptions = showWarehouse
    ? loadedWarehouseOptions
    : getUniqueWarehouses(
        warehouseOptions
          .filter((item) => item !== ALL_WAREHOUSES)
          .map((item) => ({ warehouseCode: item, warehouseName: item })),
      );

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
            onChange={(values: string[]) => {
              if (!values?.length) {
                form.setFieldValue('businessUnits', [ALL_BUSINESS_UNITS]);
                form.setFieldValue('warehouses', [ALL_WAREHOUSES]);
                return;
              }

              const nextValues =
                values.includes(ALL_BUSINESS_UNITS) && values.length > 1
                  ? values.filter((item) => item !== ALL_BUSINESS_UNITS)
                  : values;
              form.setFieldValue('businessUnits', nextValues);
              form.setFieldValue('warehouses', [ALL_WAREHOUSES]);
            }}
            onSelect={(value) => {
              if (value === ALL_BUSINESS_UNITS) {
                form.setFieldValue('businessUnits', [ALL_BUSINESS_UNITS]);
                form.setFieldValue('warehouses', [ALL_WAREHOUSES]);
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
              loading={warehouseOptionsLoading}
              options={[
                { label: ALL_WAREHOUSES, value: ALL_WAREHOUSES },
                ...exportWarehouseOptions.map((item) => ({
                  label:
                    item.warehouseName && item.warehouseName !== item.warehouseCode
                      ? `${item.warehouseCode} - ${item.warehouseName}`
                      : item.warehouseCode,
                  value: item.warehouseCode,
                })),
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
