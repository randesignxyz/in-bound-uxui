import { Button, DatePicker, Form, Modal, Radio, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  requireWarehouseSelection?: boolean;
  singleBusinessUnit?: boolean;
  includeAllBusinessUnits?: boolean;
  singleWarehouse?: boolean;
  includeAllWarehouses?: boolean;
  onCancel: () => void;
  onSave: (values: RequestsWarehouseExportValues) => Promise<void> | void;
};

type FormValues = {
  period: ExportPeriod;
  dateRange?: [Dayjs, Dayjs];
  businessUnits?: string | string[];
  warehouses?: string | string[];
};

type WarehouseOption = {
  warehouseCode: string;
  warehouseName?: string;
};

const ALL_BUSINESS_UNITS = 'All';
const ALL_WAREHOUSES = 'All';

const toArray = (value?: string | string[]) => {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
};

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
  requireWarehouseSelection = false,
  singleBusinessUnit = false,
  includeAllBusinessUnits = true,
  singleWarehouse = false,
  includeAllWarehouses = true,
  onCancel,
  onSave,
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const period = Form.useWatch('period', form);
  const selectedBusinessUnits = Form.useWatch('businessUnits', form);
  const [loadedWarehouseOptions, setLoadedWarehouseOptions] = useState<WarehouseOption[]>([]);
  const [warehouseOptionsLoading, setWarehouseOptionsLoading] = useState(false);
  const warehouseOptionsSeqRef = useRef(0);
  const selectableBusinessUnits = useMemo(
    () => businessUnitOptions.filter((item) => item !== ALL_BUSINESS_UNITS),
    [businessUnitOptions],
  );

  useEffect(() => {
    if (!open) return;

    const initialBusinessUnits = defaultBusinessUnits?.length
      ? defaultBusinessUnits
      : includeAllBusinessUnits
        ? [ALL_BUSINESS_UNITS]
        : selectableBusinessUnits.slice(0, 1);

    form.setFieldsValue({
      period: showDateRange ? 'week' : undefined,
      dateRange: showDateRange ? getDateRangeByPeriod('week') : undefined,
      businessUnits: singleBusinessUnit
        ? initialBusinessUnits[0]
        : initialBusinessUnits,
      warehouses: defaultWarehouses?.length
        ? singleWarehouse
          ? defaultWarehouses[0]
          : defaultWarehouses
        : requireWarehouseSelection || !includeAllWarehouses
          ? undefined
          : [ALL_WAREHOUSES],
    });
  }, [
    businessUnitOptions,
    defaultBusinessUnits,
    defaultWarehouses,
    form,
    includeAllBusinessUnits,
    includeAllWarehouses,
    open,
    requireWarehouseSelection,
    selectableBusinessUnits,
    singleBusinessUnit,
    singleWarehouse,
    showDateRange,
  ]);

  useEffect(() => {
    if (!open || !showWarehouse) return;

    const selectedBusinessUnitValues = toArray(selectedBusinessUnits);
    const businessUnits = selectedBusinessUnitValues.includes(ALL_BUSINESS_UNITS)
      ? []
      : selectedBusinessUnitValues;
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
  const allWarehouseOption = requireWarehouseSelection
    ? []
    : includeAllWarehouses
      ? [{ label: ALL_WAREHOUSES, value: ALL_WAREHOUSES }]
      : [];

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

            const businessUnitValues = toArray(values.businessUnits);
            const selectedBU = businessUnitValues.includes(ALL_BUSINESS_UNITS)
              ? []
              : businessUnitValues;
            const warehouseValues = toArray(values.warehouses);
            const selectedWarehouses = warehouseValues.includes(ALL_WAREHOUSES)
              ? []
              : warehouseValues;

            if (requireWarehouseSelection && selectedWarehouses.length === 0) {
              form.setFields([
                {
                  name: 'warehouses',
                  errors: ['Please select at least one warehouse.'],
                },
              ]);
              return;
            }

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
            mode={singleBusinessUnit ? undefined : 'multiple'}
            allowClear={includeAllBusinessUnits}
            showSearch
            placeholder={includeAllBusinessUnits ? 'All Business Units' : 'Select Business Unit'}
            options={[
              ...(includeAllBusinessUnits
                ? [{ label: ALL_BUSINESS_UNITS, value: ALL_BUSINESS_UNITS }]
                : []),
              ...selectableBusinessUnits.map((item) => ({ label: item, value: item })),
            ]}
            onChange={(value: string | string[]) => {
              const values = toArray(value);
              if (!values?.length) {
                const fallbackBusinessUnits = includeAllBusinessUnits
                  ? [ALL_BUSINESS_UNITS]
                  : selectableBusinessUnits.slice(0, 1);
                form.setFieldValue(
                  'businessUnits',
                  singleBusinessUnit ? fallbackBusinessUnits[0] : fallbackBusinessUnits,
                );
                form.setFieldValue(
                  'warehouses',
                  requireWarehouseSelection || !includeAllWarehouses ? undefined : [ALL_WAREHOUSES],
                );
                return;
              }

              const nextValues =
                includeAllBusinessUnits && values.includes(ALL_BUSINESS_UNITS) && values.length > 1
                  ? values.filter((item) => item !== ALL_BUSINESS_UNITS)
                  : values;
              form.setFieldValue(
                'businessUnits',
                singleBusinessUnit ? nextValues[0] : nextValues,
              );
              form.setFieldValue(
                'warehouses',
                requireWarehouseSelection || !includeAllWarehouses ? undefined : [ALL_WAREHOUSES],
              );
            }}
            onSelect={(value) => {
              if (includeAllBusinessUnits && value === ALL_BUSINESS_UNITS) {
                form.setFieldValue(
                  'businessUnits',
                  singleBusinessUnit ? ALL_BUSINESS_UNITS : [ALL_BUSINESS_UNITS],
                );
                form.setFieldValue(
                  'warehouses',
                  requireWarehouseSelection || !includeAllWarehouses ? undefined : [ALL_WAREHOUSES],
                );
                return;
              }

              if (!singleBusinessUnit) {
                form.setFieldValue(
                  'businessUnits',
                  toArray(form.getFieldValue('businessUnits')).filter(
                    (item: string) => item !== ALL_BUSINESS_UNITS,
                  ),
                );
              }
            }}
          />
        </Form.Item>

        {showWarehouse ? (
          <Form.Item
            name="warehouses"
            label="Warehouse"
            rules={
              requireWarehouseSelection
                ? [
                    {
                      validator: (_, value: string | string[] | undefined) => {
                        const selectedWarehouses = toArray(value).filter(
                          (item) => item && item !== ALL_WAREHOUSES,
                        );
                        return selectedWarehouses.length > 0
                          ? Promise.resolve()
                          : Promise.reject(new Error('Please select at least one warehouse.'));
                      },
                    },
                  ]
                : undefined
            }
          >
            <Select
              mode={singleWarehouse ? undefined : 'multiple'}
              allowClear
              showSearch
              placeholder={
                requireWarehouseSelection ? 'Select warehouse' : 'All Warehouses'
              }
              loading={warehouseOptionsLoading}
              options={[
                ...allWarehouseOption,
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
                  form.setFieldValue('warehouses', singleWarehouse ? ALL_WAREHOUSES : [ALL_WAREHOUSES]);
                  return;
                }

                if (singleWarehouse) return;

                form.setFieldValue(
                  'warehouses',
                  toArray(form.getFieldValue('warehouses')).filter(
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
