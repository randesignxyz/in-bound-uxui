import { formatDate, formatter, formatterPercentage } from '@/pages/utils';
import { LookupDataItem } from '@/services/data';
import {
  ActionType,
  DrawerForm,
  DrawerFormProps,
  ProCard,
  ProForm,
  ProList,
  ProTable,
} from '@ant-design/pro-components';
import { Alert, Input, message, Space, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect, useRef, useState } from 'react';
import { QuotationItemtDetail, QuotationListItem } from '../quotation/data';
import { createQuotationService } from '../quotation/services';

export default ({
  // onSave,
  onAddQuotation,
  vendor,
  selectedItems,
  vendorExcluded,
  isService,
  ...props
}: DrawerFormProps & {
  isService?: boolean;
  vendor?: LookupDataItem;
  vendorExcluded: number[];
  selectedItems: number[];
  onAddQuotation: (item: QuotationListItem) => void;
  // onSave: (item: AddPriceComparisonItem) => void;
}) => {
  const srvPQ = createQuotationService();
  const actionRef = useRef<ActionType>();
  const [criteria, setCriteria] = useState<{ keyWord?: string; pqIds?: number[] }>();
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly React.Key[]>([]);
  const [form] = useForm();
  const [forceSearch, setForceSearch] = useState(0)

  const onSearch = async (pageSize?: number, current?: number) => {
    try {
      const rs = await srvPQ.fetchQuotationForPc({
        keywords: criteria?.keyWord,
        criteria: {
          keyword: criteria?.keyWord,
          vendorId: vendor?.id,
          // quotationIds: criteria?.pqIds,
          isService: isService,
          // type: searchBy,
        },
        pagination: {
          current: current,
          pageSize: pageSize,
        },
      });

      return {
        data: rs.items,
        success: true,
        total: rs.total,
      };
    } catch (error: any) {
      message.error(error.message || 'Failed to search.');

      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  useEffect(() => {
    if (!props.open) return;
    actionRef.current?.reloadAndRest?.();
    return () => {
      form.resetFields();
      setCriteria(undefined);
    };
  }, [props.open]);

  useEffect(() => {
    actionRef.current?.reloadAndRest?.();
  }, [forceSearch])

  return (
    <DrawerForm
      title={`${!isService ? 'Items finder' : 'Services finder'}`}
      form={form}
      resize={{
        maxWidth: window.innerWidth * 0.99,
        minWidth: 1000,
      }}
      onValuesChange={(changeValues) => {
        const { quotationIds } = changeValues;
        if (quotationIds) {
          setCriteria((v) => ({ ...v, pqIds: quotationIds }));
        }
      }}
      width={1000}
      {...props}
      submitter={false}
    >
      <ProCard>
        {vendor && (
          <Alert
            showIcon
            type="info"
            message={`Search quotation for vendor ${[vendor.code, vendor.name]
              .filter((it) => it)
              .join('-')}`}
          />
        )}
        <ProForm.Item
          label="keywords"
          tooltip="Plean enter PQ code, PR form no, PR doc no, item name, item descriotion, item code."
        >
          <Input.Search
            onSearch={(value) => {
              setCriteria((v) => ({ ...v, keyWord: value }))
              setForceSearch(v => v + 1)
            }}
            placeholder={'PQ code, PR form no, PR doc no, item name, item descriotion, item code.'}
          />
        </ProForm.Item>
      </ProCard>

      <ProList<QuotationListItem>
        actionRef={actionRef}
        showActions="hover"
        request={({ pageSize, current }) => onSearch(pageSize, current)}
        expandable={{
          expandedRowKeys,
          // rowExpandable: (record) => record.quotationItems?.length > 0 || false,
          onExpandedRowsChange: setExpandedRowKeys,
        }}
        metas={{
          title: {
            render: (_, it) => (
              <Typography.Link
                disabled={
                  selectedItems.some((i) => i == it.id) ||
                  vendorExcluded.some((i) => i == it.vendor.id)
                }
                onClick={() => {
                  onAddQuotation(it);
                }}
              >
                {[it.code, it.vendor.code, it.vendor.name].join('-')}
              </Typography.Link>
            ),

          },
          subTitle: {
            render: (_, it) => <Space>{formatDate(it.issuedDate)}</Space>,
          },

          description: {
            render: (_, it) => (
              <ProTable<QuotationItemtDetail>
                pagination={false}
                search={false}
                options={false}
                size="small"
                bordered
                rowKey={'id'}
                dataSource={it.items}
                columns={[
                  {
                    title: 'Item ',
                    render: (_, r) => [r.itemCode, r.itemName].filter((it) => it).join(' - '),
                  },
                  {
                    title: 'Description ',
                    render: (_, r) => r.description,
                  },
                  { title: 'Qty', hideInTable: isService, render: (_, r) => r.qty },
                  {
                    title: 'UoM',
                    hideInTable: isService,
                    render: (_, r) => r.uomName,
                  },
                  { title: 'Qty', hideInTable: isService, render: (_, r) => r.qty },
                  {
                    title: 'Price',
                    hideInTable: isService,
                    render: (_, r) => formatter.format(r.price),
                    align: 'right',
                  },
                  {
                    title: 'Discount',
                    hideInTable: isService,
                    render: (_, r) =>
                      r.discountPercentage && formatterPercentage.format(r.discountPercentage),
                    align: 'right',
                  },
                  {
                    title: 'Amount',
                    render: (_, r) => formatter.format(r.amountAfterDiscount),
                    align: 'right',
                  },
                ]}
              />
            ),
          },
        }}
      />
    </DrawerForm>
  );
};
