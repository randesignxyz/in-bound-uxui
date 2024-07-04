import boxIcon from '@/assets/box.png';
import { formatter, formatterQty } from '@/pages/utils';
import { LookupDataItem3 } from '@/services/data';
import { RequisitionServiceAPI } from '@/services/pro/services';
import { BarsOutlined, PlusCircleFilled, PlusOutlined, RollbackOutlined } from '@ant-design/icons';
import {
  ActionType,
  DrawerForm,
  DrawerFormProps,
  ProCard,
  ProDescriptions,
  ProFormItem,
  ProFormRadio,
  ProFormSelect,
  ProList,
  RequestData,
} from '@ant-design/pro-components';
import { Alert, Badge, Button, FloatButton, Input } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { uniqueId } from 'lodash';
import { Key, useEffect, useRef, useState } from 'react';
import { createPriceComparisonService } from '../price-comparison/service';
import { createQuotationService } from '../quotation/services';
import { VendorDetail } from '../vendor/vendor';
import { PoItemSearch, SavePoItem } from './data';
import { createPoService } from './services';
import _ from 'lodash';
import { message } from 'antd/lib';

type RefType = 'QC' | 'PQ' | 'PR' | 'ITEM';

const options = [
  {
    value: 'ITEM',
    text: 'Items',
    hint: '',
    items: [
      { value: 'hasRequisition', text: 'Has Requistion' },
      { value: 'hasQuotation', text: 'Has Quotation' },
      { value: 'hasQC', text: 'Has Quotation Comparison' },
    ],
  },
  {
    value: 'PR',
    text: 'Requisition',
    hint: ' PR request code, Requision code',
    items: [
      { value: 'hasQuotation', text: 'Has Quotation' },
      { value: 'hasQC', text: 'Has Quotation Comparison' },
    ],
  },
  {
    value: 'PQ',
    text: 'Quotation',
    hint: 'Quotation code, Vendor code, Vendor name.',
    items: [{ value: 'hasQC', text: 'Has Quotation Comparison' }],
  },
  {
    value: 'QC',
    text: 'Quotation Comparison',
    hint: 'QC request code',
  },
].reverse();

type FormDataType = {
  searchBy: string;
  searchOptions: string[];
  qcIds?: number[];
  pqIds?: number[];
  prIds?: number[];
};
export default ({
  addedItms,
  vendor,
  isService,
  onSave,
  ...props
}: DrawerFormProps & {
  addedItms: SavePoItem[];
  vendor?: VendorDetail;
  isService: boolean;
  onSave: (data: SavePoItem[]) => void;
}) => {
  const [searchBy, setSearchBy] = useState<RefType>('QC');
  const [form] = useForm<FormDataType>();
  const qcSrv = createPriceComparisonService();
  const soSrv = createPoService();
  const pqSrv = createQuotationService();
  const prSrv = RequisitionServiceAPI(pqSrv.requestAction);
  const [criteria, setCriteria] = useState<{
    keywords?: string;
    searchOptions?: string[];
  }>();
  const [selectedRows, setSelectedRows] = useState<PoItemSearch[]>([]);
  const [multiSelect, setMultiSelect] = useState(false);
  const actionRef = useRef<ActionType>();
  const [forceUpdate, setForceUpdate] = useState(0);

  const [items, setItems] = useState<PoItemSearch[]>([]);
  const onRequesthandler = async (): Promise<RequestData<PoItemSearch>> => {
    const dataForm = await form.validateFields();

    const ids =
      searchBy == 'QC'
        ? dataForm.qcIds
        : searchBy == 'PQ'
          ? dataForm.pqIds
          : searchBy == 'PR'
            ? dataForm.prIds
            : [];
    const rs = await soSrv.searchPoItem(
      searchBy,
      [],
      criteria?.keywords,
      isService,
      ids,
      vendor?.id,
    );
    // setDateSource(rs.items);
    return {
      data: rs.items,
      success: true,
      total: rs.total,
    };
  };

  const onSearchHandler = async ({ keyWords }: { keyWords?: string }) => {
    try {
      if (searchBy == 'QC') {
        const rs = await qcSrv.fetchPaging({
          keywords: keyWords,
          criteria: {
            keyword: keyWords,
            isService: isService,
            workflowStatus: 'APPROVED',
            status: 'OPENED',
          },
        });

        return rs.items.map((it) => ({
          label: it.formNo,
          value: it.id,
        }));
      }
      if (searchBy == 'PQ') {
        const rs = await pqSrv.fetchQuotationForPo({
          keywords: keyWords,
          criteria: {
            isService: isService,
            keyword: keyWords,
            // status: 'SELECTED',

          },
        });

        return rs.map((it) => ({
          label: it.code,
          value: it.id,
        }));
      }

      if (searchBy == 'PR') {
        const rs = await prSrv.list({
          criteria: {
            searchValue: keyWords,
            advanceSearch: {
              service: isService,
              integratedStatus: 'POSTED',
              status: 'APPROVED',
            },
          },
        });
        const dataItems = rs.items.map((it) => ({
          label: [it.formNo, it.sapDocNo, it.requestedBy].filter((it) => it).join('/ '),
          value: it.id,
        }));
        return dataItems;
      }
    } catch (error) { }

    return [];
  };

  const disabledleByVendor = (relatedTo?: LookupDataItem3[]) => {

    const selectedVendor = selectedRows.flatMap(it => it.relatedTo).find(it => it?.type == 'VENDOR')
    if (selectedVendor && relatedTo?.some((it) => it.type == 'VENDOR' && it.id != selectedVendor?.id)) {
      return true
    }


    return vendor && relatedTo?.some((it) => it.type == 'VENDOR' && it.id != vendor?.id);
  };

  const onAddHandler = (data: PoItemSearch[]) => {
    const savedData: SavePoItem[] = data
      .filter(
        (it) =>
          !addedItms.some(
            (i) => i.item.refId == it.refId && i.item.refType == it.refType && it.refType != 'ITEM',
          ),
      )
      .map((it) => ({
        seq: 1,
        refType: it.refType,
        refId: it.refId,
        key: uniqueId('po'),
        itemId: it.id,
        itemCode: it.itemCode,
        itemName: it.itemName,
        description: it.description,
        price: it.price || 0,
        uomId: it.uomId,
        uomName: it.uomName,
        qty: ((it.qty || 0) - (it.orderedQty || 0) - (it.purchasedQty || 0)),
        amount: it.amount || 0,
        amountAfterDiscount: it.amount || 0,
        item: it,
        linkObject: [],
      }));
    onSave(savedData);
  };

  useEffect(() => {
    if (searchBy == 'ITEM') {
      setMultiSelect(false);
    }
    // form.resetFields(['itemIds']);
    actionRef.current?.reloadAndRest?.();
  }, [criteria, searchBy, forceUpdate]);

  useEffect(() => {
    if (!props.open) return;
    actionRef.current?.reload();
  }, [props.open]);

  return (
    <DrawerForm
      title={isService ? 'Service Finder' : 'Item Finder'}
      form={form}
      resize={{
        minWidth: 1000,
        maxWidth: window.innerWidth * 0.99,
      }}
      submitter={false}
      {...props}
      onValuesChange={(changedValues) => {
        const { searchBy, searchOptions, qcIds, pqIds, prIds } = changedValues;
        if (searchBy) {
          setSearchBy(searchBy);
        }

        if (qcIds || pqIds || prIds) {
          setForceUpdate((v) => v + 1);
        }

        if (searchOptions) {
          setCriteria((v) => ({ ...v, searchOptions: searchOptions }));
        }
      }}
    >
      {vendor && (
        <Alert
          type="info"
          message={`Vendor: ${[vendor?.code, vendor?.name].filter((it) => it).join(', ')}`}
        />
      )}

      <ProCard direction="column" gutter={10}>
        <ProCard bordered>
          <ProFormRadio.Group
            label="Search By"
            radioType="button"
            initialValue={searchBy}
            name={'searchBy'}
            options={options.map((it) => ({ label: it.text, value: it.value }))}
          />
          {searchBy == 'QC' && props.open && (
            <ProFormSelect
              allowClear
              mode="multiple"
              request={onSearchHandler}
              showSearch
              name={'qcIds'}
              label={options.find((it) => it.value == searchBy)?.text}
            />
          )}

          {searchBy == 'PQ' && props.open && (
            <ProFormSelect
              allowClear
              mode="multiple"
              request={onSearchHandler}
              showSearch
              name={'pqIds'}
              label={options.find((it) => it.value == searchBy)?.text}
            />
          )}

          {searchBy == 'PR' && props.open && (
            <ProFormSelect
              allowClear
              mode="multiple"
              request={onSearchHandler}
              showSearch
              name={'prIds'}
              label={options.find((it) => it.value == searchBy)?.text}
            />
          )}

          <ProFormItem label="Search keywords">
            <Input.Search
              onSearch={(value) => setCriteria((v) => ({ ...v, keywords: value }))}
              placeholder={options.find((it) => it.value == searchBy)?.hint}
            />
          </ProFormItem>
        </ProCard>

        <ProCard>
          <ProList<PoItemSearch>
            headerTitle={'Search Result'}
            toolBarRender={() => {
              return multiSelect
                ? [
                  <Button
                    onClick={() => {
                      const vendors = _.uniq(items.flatMap(it => it.relatedTo).filter(it => it?.type == 'VENDOR').map(it => it?.id).filter(it => it))
                      if (vendors.length > 1) {
                        message.error("Multiple vendors founded")
                        return
                      }
                      setMultiSelect(true);

                      setSelectedRows(items.filter((it) => !it.closed));
                      // setSelectedRowKeys(items.map((it) => it.mainId));
                    }}
                    disabled={
                      items
                        .filter((it) => !it.closed)
                        .filter(
                          (it) =>
                            !addedItms.some(
                              (i) => i.item.refId == it.refId && i.item.refType == searchBy,
                            ),
                        ).length == 0
                    }
                    type="link"
                  >
                    Select All
                  </Button>,
                ]
                : [];
            }}
            metas={{
              avatar: {
                render: (_, r) => <img height="30px" src={boxIcon} />,
              },
              title: {
                render: (_, r) => [r.itemCode, r.itemName].filter((it) => it).join(' - '),
              },
              description: {
                render: (_, r) =>
                  r.refType != 'ITEM' && (
                    <ProDescriptions<PoItemSearch>
                      dataSource={r}
                      size='small'
                      column={3}

                      columns={[
                        {
                          label: 'Ref #',
                          labelStyle: { fontWeight: 'bolder' },
                          render: (_, r) =>
                            r.relatedTo?.map((it) => `${it.type}: ${it.code}`).join(', '),
                          span: 3,
                        },
                        { label: 'Description', dataIndex: 'description', span: 2 },
                        { label: 'UoM', hideInDescriptions: isService, dataIndex: 'uomName' },
                        {
                          label: 'Price',
                          hideInDescriptions: isService,
                          render: (_, r) => r.price && formatter.format(r.price),
                        },
                        {
                          label: 'Qty',
                          hideInDescriptions: isService,
                          render: (_, r) => formatterQty.format(r.qty || 0),
                        },
                        {
                          label: 'Ordered Qty',
                          hideInDescriptions: isService,
                          render: (_, r) => formatterQty.format(r.orderedQty || 0),
                        },
                        {
                          label: 'Purchased Qty',
                          hideInDescriptions: isService,
                          render: (_, r) => formatterQty.format(r.purchasedQty || 0),
                        },
                        {
                          label: 'Available Qty',
                          hideInDescriptions: isService,
                          render: (_, r) => formatterQty.format((r.qty || 0) - (r.purchasedQty || 0) - (r.orderedQty || 0)),
                        },
                        {
                          label: 'Amount',
                          render: (_, r) => formatter.format(r.amount || 0),
                        },
                      ]}
                    />
                  ),
              },

              actions: {
                render: (_, r) => {
                  return (
                    !multiSelect && (
                      <Badge
                        size="small"
                        count={
                          addedItms.filter(
                            (it) => it.item.refType == 'ITEM' && it.item.refId == r.refId,
                          ).length
                        }
                      >
                        <Button
                          disabled={
                            disabledleByVendor(r.relatedTo) ||
                            addedItms.some(
                              (it) =>
                                (r.refType != 'ITEM' &&
                                  it.item.refId == r.refId &&
                                  it.item.refType == r.refType) ||
                                it.combineWith?.some(
                                  (i) => i.refId == r.refId && i.refType == r.refType,
                                ),
                            ) ||
                            r.closed
                          }
                          onClick={() => {
                            onAddHandler([r]);
                          }}
                          type="link"
                          icon={<PlusCircleFilled />}
                        />
                      </Badge>
                    )
                  );
                },
              },
            }}
            actionRef={actionRef}
            rowKey={'refId'}
            request={onRequesthandler}
            onDataSourceChange={setItems}
            rowSelection={
              multiSelect && {
                selectedRowKeys: [
                  ...selectedRows.filter((it) => !it.closed).map((it) => it.refId),
                  ...addedItms
                    .filter((it) => it.item.refType == searchBy)
                    .map((it) => it.item.refId),
                ],
                getCheckboxProps: (record) => ({
                  disabled:
                    disabledleByVendor(record.relatedTo) ||
                    addedItms.some(
                      (it) => it.item.refType == record.refType && it.item.refId == record.refId,
                    ) ||
                    record.closed,
                }),
                onChange: (keys: Key[], items) => {
                  setSelectedRows(items.filter((it) => !it.closed));
                },
              }
            }
          />
          {!multiSelect && searchBy != 'ITEM' && (
            <FloatButton
              tooltip="Multi select"
              icon={<BarsOutlined />}
              onClick={() => setMultiSelect(true)}
            />
          )}
          {multiSelect && selectedRows.length == 0 && (
            <FloatButton
              icon={<RollbackOutlined />}
              tooltip="Clear multi select"
              onClick={() => setMultiSelect(false)}
            />
          )}

          {multiSelect &&
            selectedRows.filter((it) => !addedItms.some((i) => i.itemId == it.refId)).length > 0 &&
            selectedRows.length > 0 && (
              <FloatButton
                type="primary"
                badge={{
                  count: selectedRows.filter(
                    (it) =>
                      !addedItms.some(
                        (i) => i.item.refId == it.refId && i.item.refType == searchBy,
                      ),
                  ).length,
                }}
                onClick={() => {
                  onAddHandler(selectedRows);
                }}
                icon={<PlusOutlined />}
              />
            )}
        </ProCard>
      </ProCard>
    </DrawerForm>
  );
};
