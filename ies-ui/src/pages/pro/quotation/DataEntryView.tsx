import FileUploader from '@/components/Attachment/FileUploader';
import { formatter } from '@/pages/utils';
import {
  CheckCircleOutlined,
  ClearOutlined,
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  MergeCellsOutlined,
  MinusCircleOutlined,
  QuestionCircleOutlined,
  RollbackOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  FooterToolbar,
  PageContainer,
  ProCard,
  ProForm,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormGroup,
  ProFormMoney,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, message, Modal, Popconfirm, Space, Spin, Table } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { round, uniqueId } from 'lodash';
import { Moment } from 'moment';
import { useEffect, useRef, useState } from 'react';
import { createVendorService } from '../vendor/services';
import AddService from './AddService';
import { PrItem, QuotationDetail, QuotationListItem, QuotationSavePayload, SaveQuotationItem } from './data';

import _ from 'lodash';
import { ProPaths } from '..';
import { VendorDetail } from '../vendor/vendor';
import QuotationItemFinder from './QuotationItemFinder';
import { createQuotationService } from './services';

type DataFormType = {
  vendorId?: number;
  vendorName?: string;
  contactPerson: string;
  contactPersonId: number;
  noneVendor: boolean;
  isService: boolean;
  phone1: string;
  phone2?: string;
  phone3?: string;
  mail?: string;
  address?: string;
  paymentGroup?: string;
  paymentGroupId?: number;
  buyerId: number;
  ownerId: number;
  issuedDate: Moment;
  refNo: string;
  requiredDate: Moment;
  validUntil: Moment;
  leadTime?: string;
  warranty?: string;
  tradeTerms?: string;
  specifications?: string;
  amount: number;
  discountPercentage: number;
  discountAmount: number;
  amountAfterDiscount: number;
  tax?: number;
  remarks?: string;
};

export default ({
  id,
  type,
  onView,
  openInTab,
  onBack,
}: {
  id?: number;
  openInTab?: true;
  type: 'CREATE' | 'EDIT';
  onView?: (added: QuotationListItem) => void;
  onBack: () => void;
}) => {
  const srv = createQuotationService();
  const vendorSrv = createVendorService();
  const [items, setItems] = useState<SaveQuotationItem[]>([]);
  const [services, setServices] = useState<SaveQuotationItem[]>([]);
  const [form] = useForm<DataFormType>();
  const editableFormRef = useRef<EditableFormInstance>();
  const [forceUpdate, setForceUpdate] = useState(0);
  const [uploadFiles, setUploadFiles] = useState<string[]>([]);
  const [isService, setIsService] = useState(false);
  const [data, setData] = useState<QuotationDetail>();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataChangedProtection, setDataChangedProtection] = useState(false);
  const [mergeItemEnabled, setMergeItemEnabled] = useState<SaveQuotationItem>();
  const [mergeItems, setMergeItems] = useState<SaveQuotationItem[]>([]);
  const [vendorDetail, setVendorDetail] = useState<VendorDetail>();
  const lockEnabled = () => type == 'CREATE' && !!id;

  const [addItemVisible, setAddItemVisible] = useState(false);

  const onFindVendorHandler = async ({ keyWords }: { keyWords?: string }) => {
    const rs = await vendorSrv.fetchPaging({
      keywords: keyWords,
      criteria: { vendorId: data?.vendor.id },
    });

    const dataItems = rs.items.map((it) => ({
      label: [it.code, it.name].join('-'),
      value: it.id,
    }));
    if (
      data?.vendor?.id &&
      data.vendor.id > 0 &&
      !rs.items.some((it) => it.id == data?.vendor?.id)
    ) {
      const vendor = await onSelectVendor(data?.vendor?.id);
      return [
        { label: [vendor?.code, vendor?.name].join(' - '), value: data?.vendor.id },
        ...dataItems,
      ];
    }
    return dataItems;
  };

  const onFindPaymentGroup = async () => {
    const rs = await vendorSrv.fetchListPaymentGroup();
    return rs.map((it) => ({
      label: it.name,
      value: it.id,
    }));
  };

  const linkPR = (records: SaveQuotationItem) => {
    return (
      <Table<PrItem>
        size="small"
        rowKey={'id'}
        pagination={false}
        dataSource={records?.item?.prItems?.filter((it) =>
          records.prLinked.some((i) => i == it.id),
        )}
        columns={
          isService
            ? [
              { title: 'Form No', render: (_, r) => <Space>{r.formNo}</Space> },
              { title: 'Doc No', render: (_, r) => r.docNo },
              { title: 'Requested By', render: (_, r) => r.requestedBy },
            ]
            : [
              { title: 'Form No', render: (_, r) => <Space>{r.formNo}</Space> },
              { title: 'Doc No', render: (_, r) => r.docNo },
              { title: 'Requested By', render: (_, r) => r.requestedBy },
              { title: 'Qty', align: 'right', render: (_, r) => r.qty },
              { title: 'uom', render: (_, r) => r.uom },
            ]
        }
      />
    );
  };

  const getVendorId = (dataForm: DataFormType) => {
    if (dataForm.vendorId) return dataForm.vendorId;

    if ((data?.vendor.id || 0) < 0 && dataForm?.vendorName) {
      if (dataForm?.vendorName == data?.vendorName) return data.vendor.id;
    }
    return undefined;
  };
  const onSave = async () => {
    try {
      const dataForm = await form.validateFields();
      await editableFormRef.current?.validateFields();

      if (!isService && items.length == 0) {
        message.error('No item added.');
        return;
      }
      if (isService && services.length == 0) {
        message.error('No service added.');
        return;
      }

      Modal.confirm({
        title: 'Save Quotation',
        content: 'Are you sure?',
        onOk: async () => {
          const isNew = type == 'CREATE';
          try {
            const saveData: QuotationSavePayload = {
              id: isNew ? undefined : data?.id!!,
              vendorId: getVendorId(dataForm),
              vendor: {
                code: dataForm.vendorId ? vendorDetail?.code : undefined,
                name: dataForm.vendorName || vendorDetail?.name,
                contactPersonId: dataForm.contactPersonId,
                contactPerson: dataForm.contactPersonId
                  ? vendorDetail?.contactList.find((it) => it.id == dataForm.contactPersonId)
                    ?.contactName
                  : dataForm.contactPerson,
                phone1: dataForm.phone1,
                phone2: dataForm.phone2,
                phone3: dataForm.phone3,
                mail: dataForm.mail,
                address: dataForm.address,
                paymentGroupId: dataForm.paymentGroupId || vendorDetail?.paymentGroupId,
                paymentGroup: vendorDetail?.paymentGroup,
              },

              buyerId: dataForm.buyerId,
              ownerId: dataForm.ownerId,
              issuedDate: dataForm.issuedDate,
              refNo: dataForm.refNo,
              requiredDate: dataForm.requiredDate,
              validUntil: dataForm.validUntil,
              leadTime: dataForm.leadTime,
              warranty: dataForm.warranty,
              tradeTerms: dataForm.tradeTerms,
              specifications: dataForm.specifications,
              items: (isService ? services : items).map((it, index) => ({
                no: it.no || index + 1,
                itemId: it.itemId,
                refType: it.refType,
                itemCode: it.itemCode,
                itemName: it.itemName,
                description: it.description,
                qty: it.qty,
                uomId: it.uomId,
                uomName: it.uomName,
                price: it.price,
                amount: it.amount,
                discountPercentage: it.discount,
                discountAmount: it.amount - it.amountAfterDiscount,
                amountAfterDiscount: it.amountAfterDiscount,
                remarks: it.remarks,
                prLinked: it.prLinked,
              })),
              service: isService,
              totalAmount: dataForm.amount,
              discountPercentage: dataForm.discountPercentage,
              discountAmount: dataForm.discountAmount,
              paymentDue: dataForm.amountAfterDiscount,
              tax: dataForm.tax,
              files: uploadFiles,
              remarks: dataForm.remarks,
            };

            const rs = await srv.saveItem(saveData);
            onView?.(rs.data)
            // history.push(ProPaths.quotation + `/detail/${rs.data}`);
          } catch (error: any) {
            message.error(error.message || 'Failed to save.');
          }
        },
      });
    } catch (error) {
      message.error('Invalid data.');
    }
  };

  const onSelectVendor = async (vendorId: number) => {
    try {
      if (vendorId < 0) return;
      const rs = await vendorSrv.fetchItem(vendorId);
      form.resetFields(['contactPersonId']);
      form.setFieldsValue({
        contactPersonId: rs.contactList.find((it) => it)?.id,
        phone1: rs.phone1,
        phone2: rs.phone2,
        mail: rs.mail,
        address: rs.address,

        paymentGroup: rs.paymentGroup,
      });

      setVendorDetail(rs);
      return rs;
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch data.');
    }
  };
  const clearForm = () => {
    form.resetFields();
    setItems([]);
    setServices([]);
    setIsService(false)
    initData();
  };

  const initData = async () => {
    if (!id) return;

    try {
      const rs = await srv.fetchItem(id);
      setData(rs);
      lockEnabled() && setDataChangedProtection(true);
      // rs.vendor.id && await onSelectVendor(rs.vendor.id)
      form.setFieldsValue({
        vendorId: (rs.vendor?.id || 0) < 0 ? undefined : rs.vendor?.id,
        isService: rs.service,
        noneVendor: (rs.vendor?.id || 0) < 0,
        contactPerson: rs.contactPerson,
        vendorName: rs.vendorName,
        contactPersonId: rs.contactPersonId,
        phone1: rs.phone1,
        phone2: rs.phone2,
        mail: rs.mail,
        address: rs.address,
        refNo: rs.refNo,
        issuedDate: rs.issuedDate,
        requiredDate: rs.requiredDate,
        validUntil: rs.validUntil,
        leadTime: rs.leadTime,
        warranty: rs.warranty,
        buyerId: rs.buyerId,
        ownerId: rs.ownerId,
        paymentGroupId: rs.paymentGroupId,
        paymentGroup: rs.paymentGroup,
        tradeTerms: rs.tradeTerms,
        specifications: rs.specifications,
        amount: rs.totalAmount,
        discountPercentage: rs.discountPercentage,
        discountAmount: rs.discountAmount,
        amountAfterDiscount: rs.paymentDue,
        remarks: rs.remarks,
      });
      setIsService(rs.service);
      const itemList = rs.items.map((it) => ({
        no: it.no,
        id: it.id,
        key: uniqueId('item'),
        itemId: it.itemId,
        refType: it.refType,
        itemCode: it.itemCode,
        itemName: it.itemName,
        description: it.description,
        remarks: it.remarks,
        qty: it.qty,
        uomId: it.uomId,
        uomName: it.uomName,
        price: it.price,
        amount: it.amount,
        discount: it.discountPercentage,
        amountAfterDiscount: it.amountAfterDiscount,
        item: it.item,
        prLinked: it.prLinked,
      }));
      if (rs.service) {
        setServices(itemList);
      } else {
        setItems(itemList);
      }
      if (rs.vendor.id || 0 > 0) {
        rs.vendor.id && (await onSelectVendor(rs.vendor.id));
      }
      type == 'EDIT' && setUploadFiles(rs.attachmentFiles || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch data.');
    }
  };

  const onSaveHandler = (data: SaveQuotationItem) => {
    const isNew = !items.some((it) => it.key == data.key);
    if (isNew) {
      if (isService) {
        setServices((v) => [...v, data].map((it, index) => ({ ...it, no: index + 1 })));
      } else {
        setItems((v) => [...v, data].map((it, index) => ({ ...it, no: index + 1 })));
      }
    } else {
      const newItems = items.map((it) => {
        if (it.key == data.key) {
          return { ...it, ...data };
        } else return it;
      });
      if (isService) {
        setServices(newItems);
      } else {
        setItems(newItems);
      }
    }

    setForceUpdate((v) => v + 1);
  };

  const doMerge = () => {
    const removeItems = mergeItems.filter((it) => it.key != mergeItemEnabled?.key);

    setItems((v) =>
      v
        .filter((it) => !removeItems.some((i) => i.key == it.key))
        .map((it, index) =>
          it.key == mergeItemEnabled?.key
            ? {
              ...it,
              no: index + 1,
              qty: _.sum(removeItems.map((i) => i.qty)) + it.qty,
              amount: (_.sum(removeItems.map((i) => i.qty)) + it.qty) * it.price,
              amountAfterDiscount: (_.sum(removeItems.map((i) => i.qty)) + it.qty) * it.price,
              item: {
                ...it.item!!,
                prItems: [
                  ...(it.item?.prItems || []),
                  ...removeItems.flatMap((i1) => i1.item?.prItems || []),
                ],
              },
              prLinked: [...it.prLinked, ...removeItems.flatMap((i1) => i1.prLinked)],
            }
            : it,
        ),
    );

    setMergeItemEnabled(undefined);
    setMergeItems([]);
    setForceUpdate((v) => v + 1);
  };

  useEffect(() => {
    initData().finally(() => setDataLoaded(true));
  }, []);

  useEffect(() => {
    const amount = (isService ? services : items)
      .map((it) => it.amountAfterDiscount || 0)
      .reduce((p, c) => p + c, 0);
    const discountPercentage = form.getFieldValue('discountPercentage') || 0;
    const discountAmount = amount == 0 ? 0 : round(((discountPercentage || 0) * amount) / 100, 2);

    const amountAfterDiscount = amount - discountAmount;
    const tax = form.getFieldValue('tax') || 0;
    const taxAmount = amount == 0 ? 0 : round((amountAfterDiscount * tax) / 100, 2) || 0;
    form.setFieldsValue({
      amount: amount,
      discountAmount: discountAmount,
      amountAfterDiscount: amountAfterDiscount + taxAmount,
    });

    if (!discountPercentage) {
      form.resetFields(['discountAmount']);
    }
  }, [items, services, forceUpdate]);

  const actionButtons = dataChangedProtection && lockEnabled() ? (
    <Button
      type="link"
      onClick={() => setDataChangedProtection(false)}
      icon={<UnlockOutlined />}
    >
      Unlock
    </Button>
  ) : (
    lockEnabled() && (
      <Button
        type="link"
        onClick={() => setDataChangedProtection(true)}
        icon={<LockOutlined />}
      >
        Lock
      </Button>
    )
  )

  const content = <Space direction="vertical" style={{ width: '100%' }}>
    <ProForm
      form={form}
      submitter={{
        render: () => (
          <FooterToolbar>
            <Button style={{ marginRight: 10 }} onClick={onBack}>
              Cancel
            </Button>
            <Button onClick={clearForm}>Clear</Button>
            <Button type="primary" onClick={onSave}>
              Submit
            </Button>
          </FooterToolbar>
        ),
      }}
    >
      <ProCard
        bordered
        style={{ marginBlockStart: 8 }}
        gutter={8}
        direction="row"
        size="small"
        title={'Genernal'}
        extra={openInTab && actionButtons}
      >
        <ProCard size="small" colSpan={'500px'}>
          <ProFormGroup direction="horizontal">
            <ProForm.Item
              required
              style={{ marginBottom: 0 }}
              tooltip="Please check Manual to input none SAP vendor."
              label="Vendor"
            >
              <Space>
                <ProFormCheckbox disabled={dataChangedProtection} name={'noneVendor'}>
                  Manual
                </ProFormCheckbox>
                <ProFormDependency name={['noneVendor']}>
                  {({ noneVendor }) => {
                    if (noneVendor)
                      return (
                        <ProFormText
                          disabled={dataChangedProtection}
                          rules={[{ required: true }]}
                          name={'vendorName'}
                          width={380}
                        />
                      );

                    return (
                      <ProFormSelect
                        disabled={dataChangedProtection}
                        rules={[{ required: true }]}
                        name={'vendorId'}
                        fieldProps={{ popupMatchSelectWidth: 500 }}
                        allowClear
                        showSearch
                        request={onFindVendorHandler}
                        width={380}
                      />
                    );
                  }}
                </ProFormDependency>
              </Space>
            </ProForm.Item>
          </ProFormGroup>

          <ProFormGroup>
            <ProFormDependency name={['noneVendor']}>
              {({ noneVendor }) => {
                if (!noneVendor) {
                  return (
                    <ProFormSelect
                      name={'contactPersonId'}
                      label="Contact Person"
                      disabled={dataChangedProtection}
                      width={470}
                      rules={[{ required: true }]}
                      options={vendorDetail?.contactList.map((it) => ({
                        label: it.contactName,
                        value: it.id,
                      }))}
                    />
                  );
                }
                return (
                  <ProFormText
                    disabled={dataChangedProtection}
                    rules={[{ required: true }]}
                    tooltip="Max length is 100 characters"
                    fieldProps={{ maxLength: 100 }}
                    label="Contact Person"
                    name={'contactPerson'}
                    placeholder={'Contact Person'}
                    width={470}
                  />
                );
              }}
            </ProFormDependency>
          </ProFormGroup>
          <ProFormGroup>
            <ProFormText
              disabled={dataChangedProtection}
              rules={[{ required: true }]}
              tooltip="Max length is 50 characters"
              fieldProps={{ maxLength: 50 }}
              name={'phone1'}
              label="Phone1"
              width={'sm'}
            />
            <ProFormText
              disabled={dataChangedProtection}
              tooltip="Max length is 50 characters"
              fieldProps={{ maxLength: 50 }}
              name={'phone2'}
              label="Phone2"
              width={'sm'}
            />
          </ProFormGroup>
          <ProFormText
            disabled={dataChangedProtection}
            tooltip="Max length is 100 characters"
            fieldProps={{ maxLength: 100 }}
            width={470}
            name={'mail'}
            label="E-Mail"
          />
          <ProFormTextArea
            disabled={dataChangedProtection}
            name={'address'}
            tooltip="Max length is 500 characters"
            fieldProps={{ rows: 1, maxLength: 500 }}
            width={500}
            label="Address"
          />
          <ProFormDependency name={['noneVendor']}>
            {({ noneVendor }) => {
              if (!noneVendor)
                return (
                  <ProFormText
                    disabled={dataChangedProtection}
                    name={'paymentGroup'}
                    fieldProps={{ readOnly: true }}
                    width={470}
                    label="Payment Terms"
                  />
                );

              return (
                <ProFormSelect
                  disabled={dataChangedProtection}
                  label="Payment Terms"
                  rules={[{ required: true }]}
                  name={'paymentGroupId'}
                  allowClear
                  showSearch
                  request={onFindPaymentGroup}
                  width={470}
                />
              );
            }}
          </ProFormDependency>
        </ProCard>

        <ProCard />
        <ProCard size="small" colSpan={'500px'}>
          <ProFormGroup direction="horizontal">
            <ProFormText
              name={'refNo'}
              fieldProps={{
                maxLength: 50,
              }}
              rules={[{ required: true }]}
              width={'sm'}
              label="Vendor Ref. No"
            />
            <ProFormDatePicker
              name={'issuedDate'}
              rules={[{ required: true }]}
              width={'sm'}
              label="Issued Date"
            />
          </ProFormGroup>
          <ProFormGroup direction="horizontal">
            <ProFormDatePicker
              rules={[{ required: true }]}
              name={'requiredDate'}
              width={'sm'}
              label="Required Date"
            />
            <ProFormDatePicker
              rules={[{ required: true }]}
              width={'sm'}
              name={'validUntil'}
              label="Valid Until"
            />
          </ProFormGroup>
          <ProFormTextArea
            name={'leadTime'}
            tooltip="Max lenght is 500 characters"
            fieldProps={{ rows: 1, maxLength: 500 }}
            width={500}
            label="Delivery Lead Time"
          />
          <ProFormTextArea
            name={'warranty'}
            tooltip="Max lenght is 500 characters"
            fieldProps={{ rows: 1, maxLength: 500 }}
            width={500}
            label="Warranty"
          />
          <ProFormTextArea
            name={'tradeTerms'}
            tooltip="Max lenght is 500 characters"
            fieldProps={{ rows: 1, maxLength: 500 }}
            width={500}
            label="Trade Terms"
          />
          <ProFormTextArea
            name={'specifications'}
            tooltip="Max lenght is 500 characters"
            fieldProps={{ rows: 1, maxLength: 500 }}
            width={500}
            label="Specifications"
          />
        </ProCard>

        {/* <ProCard colSpan={'20px'} /> */}
      </ProCard>
    </ProForm>

    <ProCard
      bordered
      size="small"
      direction="column"
      title={isService ? 'Service List' : 'Item List'}
      extra={
        <ProForm form={form} submitter={false}>
          <Space align="baseline">
            <ProFormSwitch
              disabled={!!id || services.length > 0 || items.length > 0}
              name={'isService'}
              // isService
              unCheckedChildren={'Item'}
              checkedChildren={'Service'}
            />
            <Button danger type='link' disabled={isService ? services.length == 0 : items.length == 0} icon={<ClearOutlined />} onClick={() => {
              setItems([])
              setServices([])
            }} />
          </Space>
        </ProForm>
      }
    >
      {!isService && (
        <EditableProTable<SaveQuotationItem>
          value={items.map((it, index) => ({ ...it, no: index + 1 }))}
          size="small"
          recordCreatorProps={{
            creatorButtonText: 'Add Item ',
            onClick: () => {
              setAddItemVisible(true);
            },
            record: () => ({} as SaveQuotationItem),
          }}
          key={'pro-item-list'}
          rowKey="key"
          rowSelection={
            !!mergeItemEnabled && {
              selectedRowKeys: mergeItems.map((it) => it.key),
              getCheckboxProps: (r) => {
                return {
                  disabled:
                    r.itemId != mergeItemEnabled.itemId || r.key == mergeItemEnabled.key,
                };
              },
              onChange(_, selectedRows) {
                setMergeItems(selectedRows);
              },
            }
          }
          editableFormRef={editableFormRef}
          controlled
          editable={{
            type: 'multiple',
            editableKeys: items.map((it) => it.key),
            actionRender: (row) => [
              <Space key={'k1' + row.key} size={'small'} align="baseline">
                {!mergeItemEnabled && (
                  <Popconfirm
                    title="Delete the item"
                    description="Are you sure to delete?"
                    onConfirm={() => setItems((v) => v.filter((it) => it.key != row.key))}
                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                  >
                    <Button danger type="link" size="small" icon={<MinusCircleOutlined />} />
                  </Popconfirm>
                )}

                {row.item &&
                  !mergeItemEnabled &&
                  items.filter((it) => it.itemId == row.itemId && it.key == '------').length > 1 && (
                    <Button
                      onClick={() => {
                        setMergeItemEnabled(row);
                        setMergeItems(items.filter((it) => it.itemId == row.itemId));
                      }}
                      type="link"
                      icon={<MergeCellsOutlined />}
                    />
                  )}

                {mergeItemEnabled?.key == row.key && (
                  <Button
                    onClick={() => {
                      setMergeItemEnabled(undefined);
                      setMergeItems([]);
                    }}
                    danger
                    type="link"
                    disabled={!(row.item?.prItems && row.item?.prItems.length > 0)}
                    icon={<RollbackOutlined />}
                  />
                )}

                {mergeItemEnabled?.key == row.key && (
                  <Popconfirm
                    title="Merge Item"
                    description="Are you sure to merge?"
                    onConfirm={() => {
                      doMerge();
                    }}
                  >
                    <Button
                      type="link"
                      // disabled={
                      //   mergeItems.filter((it) => it.key != mergeItemEnabled.key).length == 0
                      // }
                      icon={<CheckCircleOutlined />}
                    />
                  </Popconfirm>
                )}
              </Space>,
            ],
            onValuesChange: (_, recordList) => {
              const newItems = recordList.map((it) => {
                const newAmount = (it.price || 0) * (it.qty || 0);
                const newAmountAfterDiscount = round(
                  newAmount * (1 - (it.discount || 0) / 100),
                  2,
                );
                return {
                  ...it,
                  amount: newAmount,
                  amountAfterDiscount: newAmountAfterDiscount,
                };
              });
              // setForceUpdate(v => v+1)
              setItems(newItems);
            },
          }}
          expandable={{
            expandedRowRender: linkPR,
            rowExpandable: (record) => record.prLinked.length > 0,
          }}
          columns={[
            {
              title: '#',
              dataIndex: 'no',
              readonly: true,
              width: 30,
              render: (_, r) => r.no,
            },
            {
              title: 'Item Code',
              dataIndex: 'itemCode',
              readonly: true,
              width: 90,
              render: (_, r) => r.itemCode,
            },
            {
              title: 'Item Name',
              dataIndex: 'itemName',
              readonly: true,
              responsive: ['sm', 'md'],
              render: (_, r) => r.itemName,
            },
            {
              title: 'Description',
              // width: 170,
              dataIndex: 'description',
              tooltip: 'Max length is 1000 characters',
              valueType: 'textarea',
              fieldProps: { rows: 1 },
              responsive: ['sm', 'md'],
            },
            {
              title: 'Qty',
              formItemProps: { rules: [{ required: true }] },
              fieldProps: {
                style: { width: 70 },
                disabled: dataChangedProtection,
                precision: 2,
                min: 0,
              },
              dataIndex: 'qty',
              align: 'center',
              valueType: 'digit',
              width: 80,
            },
            {
              title: 'UoM',
              width: 100,
              dataIndex: 'uomName',
              valueType: 'select',
              formItemProps: { rules: [{ required: true }] },
              fieldProps: {
                style: { width: 90 },
                required: true,
                disabled: dataChangedProtection,
                showSearch: true,
                popupMatchSelectWidth: 200,
              },
              valueEnum: (r) =>
                (r.item?.uomList || []).reduce(
                  (acc, cur) => ({ ...acc, [cur.id]: cur.name }),
                  {},
                ),
            },
            {
              title: 'Price',
              dataIndex: 'price',

              fieldProps: {
                style: { width: 90 },
              },
              formItemProps: {
                rules: [{ required: true }],
              },
              valueType: 'money',
              width: 100,
              align: 'right',
            },
            {
              title: 'Amount',
              width: 100,
              align: 'right',
              editable: false,
              renderText: (_, record) => formatter.format(record.amount),
            },
            {
              title: 'Dis. (%)',
              fieldProps: {
                max: 90,
                min: 0,
              },
              align: 'right',
              valueType: 'digit',
              dataIndex: 'discount',
              width: 90,
            },
            {
              title: 'After Dis.',
              align: 'right',
              editable: false,
              dataIndex: 'amountAfterDiscount',
              valueType: 'money',
              width: 110,
              renderText: (_, record) => formatter.format(record.amountAfterDiscount),
            },
            {
              title: 'Remarks',
              dataIndex: 'remarks',
              valueType: 'textarea',
              tooltip: 'Max length is 1000 characters',
              responsive: ['xs', 'md'],
              fieldProps: { rows: 1 },
              render: (_, r) => r.remarks,
            },
            {
              valueType: 'option',
              width: 60,
              hideInTable: dataChangedProtection,
              render: () => {
                return null;
              },
            },
          ]}
        />
      )}

      {isService && (
        <EditableProTable<SaveQuotationItem>
          value={services.map((it, index) => ({ ...it, no: index + 1 }))}
          rowKey="key"
          size="small"
          key={'pro-item-service'}
          recordCreatorProps={{
            creatorButtonText: 'Add Service ',
            onClick: () => {
              setAddItemVisible(true);
            },
            record: () => ({} as SaveQuotationItem),
          }}
          editableFormRef={editableFormRef}
          controlled
          expandable={{
            expandedRowRender: linkPR,
            rowExpandable: (record) => record.prLinked.length > 0,
          }}
          editable={{
            type: 'multiple',
            editableKeys: services.map((it) => it.key),
            onValuesChange: (_, recordList) => {
              const newServices = recordList.map((it) => {
                const newAmount = it.amount || 0;
                const newAmountAfterDiscount = round(
                  newAmount * (1 - (it.discount || 0) / 100),
                  2,
                );
                return {
                  ...it,
                  amount: newAmount,
                  amountAfterDiscount: newAmountAfterDiscount,
                };
              });

              setServices(newServices);
            },
            actionRender: (row) => [
              <Space size={'small'} align="baseline">
                {row.item && (
                  <AddService
                    key={`${row.key}-edit-service`}
                    item={row.item}
                    editData={{ ...row }}
                    onSave={(data) => {
                      const newServices = services.map((it) => {
                        if (it.key == data.key) {
                          return { ...it, ...data };
                        } else return it;
                      });
                      setServices(newServices);
                    }}
                    trigger={
                      <Button
                        type="link"
                        disabled={!(row.item?.prItems && row.item?.prItems.length > 0)}
                        icon={<EditOutlined />}
                      />
                    }
                  />
                )}

                <Popconfirm
                  key={`${row.key}-confirm`}
                  title="Delete the service"
                  description="Are you sure to delete?"
                  onConfirm={() => setServices((v) => v.filter((it) => it.key != row.key))}
                  icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                >
                  <Button
                    disabled={dataChangedProtection}
                    danger
                    type="link"
                    size="small"
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </Space>,
            ],
          }}
          columns={[
            {
              title: '#',
              dataIndex: 'no',
              readonly: true,
              width: 20,
              render: (_, r) => r.no,
            },
            {
              title: 'Service Name',
              dataIndex: 'itemName',
              responsive: ['sm', 'md'],

              formItemProps: {
                rules: [{ required: true }],
              },
            },
            {
              title: 'Description',
              dataIndex: 'description',
              valueType: 'textarea',
              responsive: ['md', 'lg'],
              tooltip: 'Max length is 1000 characters',
              fieldProps: {
                rows: 1,
              },
            },
            {
              title: 'Amount',
              width: 150,
              align: 'right',
              valueType: 'digit',
              dataIndex: 'amount',
              formItemProps: {
                rules: [{ required: true }],
              },
              fieldProps: {
                style: { width: 130 },
                precision: 2,
                min: 0,
              },
            },
            {
              title: 'Dis. (%)',
              fieldProps: {
                style: { width: 80 },
                max: 100,
                min: 0,
              },

              align: 'right',
              valueType: 'digit',
              dataIndex: 'discount',
              width: 100,
            },
            {
              title: 'Amt. after Dis.',
              align: 'right',
              editable: false,
              dataIndex: 'amountAfterDiscount',
              valueType: 'money',
              width: 130,
              renderText: (_, record) => formatter.format(record.amountAfterDiscount),
            },
            {
              title: 'Remarks',
              dataIndex: 'remarks',
              valueType: 'textarea',
              tooltip: 'Max length is 1000 characters',
              responsive: ['sm', 'md'],
              fieldProps: { rows: 1 },
              render: (_, r) => r.remarks,
            },
            {
              valueType: 'option',
              width: 80,
              render: () => {
                return null;
              },
            },
          ]}
        />
      )}

      <ProCard direction="row" size="small">
        <ProForm form={form} submitter={false}>
          <ProCard size="small" colSpan={'500px'}>
            <ProFormTextArea
              name={'remarks'}
              tooltip="Max length is 1000 characters"
              fieldProps={{ rows: 6, maxLength: 1000 }}
              width={'xl'}
              label="Remarks"
            />
          </ProCard>
        </ProForm>
        <ProCard />
        <ProCard size="small" colSpan={'500px'}>
          <ProForm
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onValuesChange={(changedValues) => {
              const { vendorId, discountPercentage, discountAmount, isService, tax } =
                changedValues;

              const amount = form.getFieldValue('amount');

              if ('discountPercentage' in changedValues) {
                form.setFieldsValue({
                  discountAmount: (discountPercentage * amount) / 100,
                });

                setForceUpdate((v) => v + 1);
                return;
              }

              if ('discountAmount' in changedValues) {
                form.setFieldsValue({
                  discountPercentage: round((discountAmount * 100) / amount, 2),
                });
                setForceUpdate((v) => v + 1);
                return;
              }
              if (tax) {
                setForceUpdate((v) => v + 1);
              }
              if (
                (discountAmount == undefined || discountPercentage == undefined) &&
                (form.getFieldValue('discountAmount') == undefined ||
                  form.getFieldValue('discountPercentage') == undefined)
              ) {
                setForceUpdate((v) => v + 1);
                form.resetFields(['discountPercentage', 'discountAmount']);
              }

              if ('vendorId' in changedValues) {
                onSelectVendor(vendorId);
              }

              if ('isService' in changedValues) {
                setIsService(isService);
              }
            }}
            labelAlign="right"
            layout="horizontal"
            submitter={false}
          >
            <ProFormMoney
              formItemProps={{
                style: {
                  fontWeight: 'bolder',
                },
              }}
              // locale="en-US"
              name={'amount'}
              width={'sm'}
              readonly
              label="Total Before Discount"
            />
            <ProForm.Item style={{ marginBottom: 0 }} label="Discount">
              <Space.Compact>
                <ProFormDigit
                  name={'discountPercentage'}
                  placeholder={'%'}
                  fieldProps={{
                    max: 100,
                    min: 0,
                  }}
                  width={70}
                />
                <ProFormMoney
                  locale="en-US"
                  name={'discountAmount'}
                  placeholder={'Amount'}
                  width={150}
                />
              </Space.Compact>
            </ProForm.Item>
            <ProFormDigit
              label="Tax"
              name={'tax'}
              width={70}
              placeholder={'%'}
              fieldProps={{
                max: 100,
                min: 0,
              }}
            />
            <ProFormMoney
              formItemProps={{
                style: {
                  fontWeight: 'bolder',
                },
              }}
              fieldProps={{}}

              readonly
              name={'amountAfterDiscount'}
              label="Total Payment Due"
              width={'sm'}
            />
          </ProForm>
        </ProCard>
      </ProCard>
    </ProCard>
    <FileUploader
      title="Attachments"
      multiple
      showTitle
      addFileInfo
      service="FILE"
      initFiles={type == 'EDIT' ? data?.attachmentFiles : []}
      onSetFiles={(files) => {
        setUploadFiles(files.map((it) => it.response));
      }}
    />
  </Space>

  return (<Spin spinning={srv.requestAction.request?.loading || false}>
    {openInTab ? content : <PageContainer
      onBack={history.back}
      title={`${type == 'CREATE' ? 'New Quotation' : 'Edit Quotation'}`}
      subTitle={!!id && `${type == 'CREATE' ? 'Copy From' : ''} ${data?.code}`}
      extra={actionButtons}
    >
      {dataLoaded && (content)}
    </PageContainer>}
    <QuotationItemFinder
      onSaveMulti={(datas) => datas.forEach((it) => onSaveHandler(it))}
      addedItems={isService ? services : items}
      isService={isService}
      open={addItemVisible}
      onOpenChange={(visible) => !visible && setAddItemVisible(false)}
      getAddedItem={(id, isService) => {
        if (!isService) {
          return items.find((it) => it.itemId == id);
        }
      }}
      onSave={(record, isService) => {
        if (isService) {
          setServices((v) => [...v, record].map((it, index) => ({ ...it, no: index + 1 })));
        } else {
          onSaveHandler(record);
        }
      }}
    />
  </Spin>
  );
};
