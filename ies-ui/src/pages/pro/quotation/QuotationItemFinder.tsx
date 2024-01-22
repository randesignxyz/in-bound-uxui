import boxIcon from '@/assets/box.png';
import { formatter, formatterQty } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import { RequisitionServiceAPI } from '@/services/pro/services';
import { BarsOutlined, PlusCircleFilled, PlusOutlined, RollbackOutlined } from '@ant-design/icons';
import {
  ActionType,
  DrawerForm,
  DrawerFormProps,
  ProCard,
  ProDescriptions,
  ProFormItem,
  ProFormSelect,
  ProList,
} from '@ant-design/pro-components';
import { Badge, Button, FloatButton, Input, message, Radio, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import _, { omit, uniqueId } from 'lodash';
import { Key, useEffect, useRef, useState } from 'react';
import { Item, PrItem, SaveQuotationItem } from './data';
import { createQuotationService } from './services';

type FormDataType = {
  requisitionID: number;
  fromPrOnly?: boolean;
  item: string;
  service: string;
};

type SearchOptionType = 'PR' | 'ITEM' | 'SRV';

export default ({
  isService,
  onSave,
  getAddedItem,
  onSaveMulti,
  addedItems,
  ...props
}: DrawerFormProps & {
  isService: boolean;
  addedItems: SaveQuotationItem[];
  getAddedItem: (itemId: number, isService: boolean) => SaveQuotationItem | undefined;
  onSave: (data: SaveQuotationItem, isService: boolean) => void;
  onSaveMulti: (data: SaveQuotationItem[], isService: boolean) => void;
}) => {
  const requestActions = simpleRequestActions();
  const [searchBy, setSearchBy] = useState<SearchOptionType>('PR');
  const srv = RequisitionServiceAPI(requestActions);
  const quotationSrv = createQuotationService();
  const [form] = useForm<FormDataType>();
  const [open, setOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [multiSelect, setMultiSelect] = useState(false);
  const [criteria, setCriteria] = useState<{
    prIds?: number[];
    keywords?: string;
    fromPrOnly?: boolean;
  }>();

  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [items, setItems] = useState<(Item & { mainId: number })[]>([]);

  const actionRef = useRef<ActionType>();

  const onSearchPR = async ({ keywords }: { keywords?: string }) => {
    const rs = await srv.list({
      criteria: {
        searchValue: keywords,
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
  };

  const findByPrs = async (ids?: number[], keywords?: string) => {
    try {
      const rs = await (isService
        ? quotationSrv.listServiceByPr(ids, keywords)
        : quotationSrv.listItemByPr(ids, keywords));
      return rs;
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch data');
      return [];
    }
  };

  const findByItems = async () => {
    try {
      const rs = await quotationSrv.listItemByKeywords(criteria?.keywords, criteria?.fromPrOnly);
      return rs.items;
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch data');
      return [];
    }
  };

  const options = [
    { label: 'Purchase Request', value: 'PR', visible: true },
    { label: 'Item', value: 'ITEM', visible: !isService, disabled: multiSelect },
    { label: 'Service', value: 'SRV', visible: isService },
  ].filter((it) => it.visible) as { label: string; value: string }[];

  const onSearch = async () => {
    if (searchBy == 'PR') {
      const rs = await findByPrs(criteria?.prIds, criteria?.keywords);
      return {
        data: rs.map(
          (it) =>
            ({
              ...it,
              refType: 'PR',
              mainId: it.prItems?.find((it) => it)?.id!!,
            } as Item & { mainId: number }),
        ),
      };
    }

    const data = (await findByItems()).map(
      (it) => ({ ...it, refType: 'ITEM', mainId: it.id } as Item & { mainId: number }),
    );
    return {
      data: data,
    };
  };

  useEffect(() => {
    setSearchBy('PR');
    setSelectedRowKeys(addedItems?.flatMap((it) => it.item?.prItems?.map((i) => i.id) || []) || []);
  }, [open]);

  useEffect(() => {
    actionRef.current?.reload();
  }, [criteria, searchBy]);

  const multiItemToAddRrecord = () => {
    return selectedRowKeys.filter(
      (it) =>
        !addedItems.some((t) => t.refType == t.refType && t.item?.prItems?.some((i) => i.id == it)),
    ).length;
  };

  const onSaveHandler = (addedItems: Item[]) => {
  
    onSaveMulti(
      addedItems.map((item) => {
        const it = item.prItems?.find((it) => it);
        const uom =
          item.uomList.find((it1) => it1.name == it?.uom) || item.uomList.find((it) => it);
        const qty = it?.qty || 1;
        const price = it?.unitPrice || 0;
        const amount = qty * price;
        return {
          key: uniqueId('quotation'),
          itemId: item.id,
          itemCode: item.itemCode,
          itemName: item.itemName,
          description: it?.description,
          refType: searchBy,
          qty: qty,
          uomId: uom?.id,
          price: price,
          uomName: uom?.name,
          amount: amount,
          discount: 0,
          amountAfterDiscount: amount,
          item: item,
          prLinked: item.prItems?.map((it) => it.id) || [],
        } as SaveQuotationItem;
      }),
      isService,
    );
  };

  return (
    <DrawerForm
      onOpenChange={setOpen}
      open={open}
      onValuesChange={(changedValues) => {
        const { requisitionIDs, item, service, fromPrOnly } = changedValues;
        if (requisitionIDs) {
          // findByPrs(requisitionIDs);
          setCriteria((v) => ({ prIds: requisitionIDs }));
        }

        if (item) {
          setCriteria((v) => ({ ...v, keywords: item }));
        }

        if (service) {
          setCriteria((v) => ({ ...v, keywords: service }));
        }

        if (fromPrOnly) {
          setCriteria((v) => ({ ...v, fromPrOnly: fromPrOnly }));
        }
      }}
      submitter={false}
      form={form}
      drawerProps={{
        destroyOnClose: true,
      }}
      wrapperCol={{ span: 21 }}
      labelCol={{ span: 3 }}
      layout="horizontal"
      resize={{
        maxWidth: window.innerWidth * 0.9,
        minWidth: 1000,
      }}
      title={isService ? 'Add Services' : 'Add Items'}
      {...props}
    >
      <ProCard direction="column" gutter={5}>
        <ProCard bordered>
          {!isService && (
            <ProFormItem label="Search By">
              <Radio.Group
                defaultValue={'PR'}
                optionType="button"
                options={options}
                onChange={(e) => setSearchBy(e.target.value || 'PR')}
              />
            </ProFormItem>
          )}
          {(searchBy != 'ITEM' || isService) && (
            <ProFormSelect
              label="Requisition"
              mode="multiple"
              placeholder={'PR No, Request No, Requestor'}
              name={'requisitionIDs'}
              showSearch
              allowClear
              request={onSearchPR}
            />
          )}
          <ProFormItem label="keywords">
            <Input.Search
              placeholder={
                isService
                  ? 'Service name, description'
                  : searchBy == 'PR'
                  ? 'PR form no, PR code'
                  : 'Item code, name, PR form no, PR code'
              }
              onSearch={(value) => {
                setCriteria((v) => ({ ...v, keywords: value }));
              }}
            />
          </ProFormItem>
        </ProCard>

        <ProList<Item & { mainId: number }>
          actionRef={actionRef}
          request={() => onSearch()}
          size="small"
          rowKey={'mainId'}
          onDataSourceChange={(dataList) => setItems(dataList)}
          headerTitle={'Search Result'}
          toolBarRender={() => {
            return multiSelect
              ? [
                  <Button
                    onClick={() => {
                      setMultiSelect(true);
                      setSelectedItems(items);
                      setSelectedRowKeys(items.map((it) => it.mainId));
                    }}
                    disabled={
                      items.filter(
                        (it) =>
                          !addedItems.some(
                            (t) =>
                              t.refType == t.refType &&
                              t.item?.prItems?.some((i) => i.id == it.mainId),
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
          showActions="hover"
          // rowSelection={multiSelect && rowSelecti`on}
          rowSelection={
            multiSelect && {
              getCheckboxProps: (record) =>
                searchBy != 'ITEM'
                  ? {
                      disabled: addedItems?.some((it) =>
                        it.item?.prItems?.some((i) => i.id == record.mainId),
                      ),
                    }
                  : {},
              selectedRowKeys,

              onChange: (keys: Key[], rows: Item[]) => {
                setSelectedItems(rows);
                setSelectedRowKeys(keys);
              },
            }
          }
          metas={{
            avatar: {
              render: (_, r) => <img height="30px" src={boxIcon} />,
            },
            title: {
              render: (_, it) => (
                <Space>{[it.itemCode, it.itemName].filter((it) => it).join(' - ')} </Space>
              ),
            },
            subTitle: {
              render: (_, r) =>
                r.prItems &&
                r.prItems.length > 0 &&
                `PR #: ${r.prItems.map((it) => it.formNo).join(', ')}`,
            },
            actions: {
              render: (_, r) =>
                !multiSelect && (
                  <Badge
                    size="small"
                    count={
                      addedItems.filter((it) => it.refType == 'ITEM' && it.itemId == r.id).length
                    }
                  >
                    <Button
                      onClick={() => onSaveHandler([r])}
                      disabled={addedItems?.some(
                        (it) =>
                          it.refType == 'PR' && it.item?.prItems?.some((i) => i.id == r.mainId),
                      )}
                      icon={<PlusCircleFilled />}
                      type="link"
                    />
                  </Badge>
                ),
            },
            description: {
              render: (_, r) => {
                const item = r.prItems?.find((it) => it);
                return (
                  searchBy != 'ITEM' && (
                    <ProDescriptions<PrItem>
                      dataSource={r.prItems?.find((it) => it)}
                      column={3}
                      columns={[
                        { label: 'Description', dataIndex: 'description', span: 2 },
                        { label: 'UoM', hideInDescriptions: isService, render: (_, r) => r.uom },
                        { label: 'Price', render: (_, r) => formatter.format(r.unitPrice) },
                        {
                          label: 'Qty',
                          hideInDescriptions: isService,
                          render: (_, r) => formatterQty.format(r.qty),
                        },
                        { label: 'Amount', render: (_, r) => formatter.format(r.amount) },
                        {
                          label: 'Ordered Qty',
                          hideInDescriptions: !item?.orderdQty,
                          render: (_, r) => r.orderdQty && formatterQty.format(r.orderdQty),
                        },
                        {
                          label: 'Purchased Qty',
                          hideInDescriptions: !item?.purchaseQty,
                          render: (_, r) => r.purchaseQty && formatterQty.format(r.purchaseQty),
                        },
                      ]}
                    />
                  )
                );
              },
            },
          }}
        />
      </ProCard>
      {!multiSelect && searchBy == 'PR' && (
        <FloatButton
          tooltip="Multi select"
          icon={<BarsOutlined />}
          onClick={() => setMultiSelect(true)}
        />
      )}
      {multiSelect && selectedRowKeys.length == 0 && (
        <FloatButton
          icon={<RollbackOutlined />}
          tooltip="Clear multi select"
          onClick={() => setMultiSelect(false)}
        />
      )}

      {multiSelect && multiItemToAddRrecord() > 0 && (
        <FloatButton
          type="primary"
          badge={{
            count: multiItemToAddRrecord(),
          }}
          onClick={() => {
            // const ids = _.uniq(selectedItems?.map((it) => it.id));
            // const addedAll = ids.map((id) => {
            //   const item = omit(
            //     selectedItems?.find((it) => it.id == id),
            //     'prItem',
            //   );
            //   return {
            //     ...item,
            //     prItems: selectedItems
            //       ?.filter((it) => it.id == id)
            //       .map((it) => it.prItems?.find((it) => it)),
            //   } as Item;
            // });

            onSaveHandler(selectedItems);
          }}
          icon={<PlusOutlined />}
        />
      )}
    </DrawerForm>
  );
};
