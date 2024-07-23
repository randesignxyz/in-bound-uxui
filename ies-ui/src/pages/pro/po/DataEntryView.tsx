import FileUploader from '@/components/Attachment/FileUploader';
import { ProcessFlowModalWrapper } from '@/pages/process-flow/components/ProcessFlowModalWrapper';
import { formatter } from '@/pages/utils';
import { UserResult } from '@/services/process-workflow/data';
import {
  CaretRightOutlined,
  CheckCircleOutlined,
  ClearOutlined,
  DeleteOutlined,
  DollarOutlined,
  DotChartOutlined,
  EyeFilled,
  MenuOutlined,
  MergeCellsOutlined,
  MinusCircleOutlined,
  QuestionCircleOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  FooterToolbar,
  PageContainer,
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormGroup,
  ProFormMoney,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProList,
  ProTable,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Flex, message, Popconfirm, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import _, { round } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { createVendorService } from '../vendor/services';
import { VendorDetail } from '../vendor/vendor';
import {
  CompanyAddress,
  PoItemSearch,
  PoRequestFormNames,
  PoRequestSavePayload,
  SavePoItem,
} from './data';
import PoItemFinder from './PoItemFinder';
import { createPoService } from './services';
import { Moment } from 'moment';
import { useInView } from 'react-intersection-observer';
import { LookupDataItem3 } from '@/services/data';
import { getRelatedItms, RelatedObj } from '../services';
import Icon from '@ant-design/icons/lib/components/Icon';
import Link from 'antd/es/typography/Link';
import { Divider } from 'rc-menu';

type DataFormType = {
  vendorId: number;
  vendorName: string;
  contactPersonId: number;
  noneVendor: boolean;
  isService: boolean;
  phone1: string;
  phone2?: string;
  phone3?: string;
  mail?: string;
  address?: string;
  deliveredDate: Moment;
  billToAddressId: number;
  billToAddress: string;

  shipToAddressId: number;
  shipToAddress: string;

  paymentGroup?: string;
  paymentGroupId?: number;
  totalAmount: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxPercentage?: number;
  taxAmount?: number;
  paymentDue: number;
  remarks?: string;
};

export default ({
  onView,
  onBack,
}: {
  id?: number;
  type: 'CREATE' | 'EDIT';
  onBack: () => void;
  onView?: (processInstId: string, fornNo: string) => void;
}) => {
  const [form] = useForm<DataFormType>();
  const vendorSrv = createVendorService();
  const srv = createPoService();
  const [vendor, setVendor] = useState<VendorDetail>();
  const [companyAddress, setCompanyAddress] = useState<CompanyAddress[]>();
  const [uploadFiles, setUploadFiles] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [items, setItems] = useState<SavePoItem[]>([]);
  const [mergeItemEnabled, setMergeItemEnabled] = useState<SavePoItem>();
  const [mergeItems, setMergeItems] = useState<SavePoItem[]>([]);
  const editableFormRef = useRef<EditableFormInstance>();
  const [forceReloadVendorList, setForceReloadVendorList] = useState(0);
  const [requestVisible, setRequestVisible] = useState(false);
  const [addItemVisible, setAddItemVisible] = useState(false);
  const [isService, setIsService] = useState(false);

  const { ref, inView } = useInView({});

  const onFindVendorHandler = async ({ keyWords }: { keyWords?: string }) => {
    const rs = await vendorSrv.fetchPaging({
      keywords: keyWords,
    });

    const dataItems = rs.items.map((it) => ({
      label: [it.code, it.name].join('-'),
      value: it.id,
    }));

    return [
      ...(vendor && !dataItems.some((it) => it.value == vendor?.id)
        ? [{ label: [vendor.code, vendor.name].join('-'), value: vendor.id }]
        : []),
      ...dataItems,
    ];
  };

  const setBillingAddress = (billToAddressId: number) => {
    const address = vendor?.billingAddressList.find((it) => it.id == billToAddressId);
    form.setFieldValue(
      'billToAddress',
      [
        // { lable: 'Address', value: address?.address },
        { lable: 'Block', value: address?.block },
        { lable: 'Building', value: address?.building },
        { lable: 'Street', value: address?.street },
        { lable: 'City', value: address?.city },
        { lable: 'County', value: address?.county },
        { lable: 'Country', value: address?.country },
        { lable: 'Address2', value: address?.address2 },
        { lable: 'Address3', value: address?.address3 },
      ]
        .filter((it) => !!it.value)
        .map((it) => `${it.lable}: ${it.value}`)
        .join('\n'),
    );
  };
  const onSelectVendor = async (vendorId: number) => {
    try {
      if (vendorId < 0) return;
      const rs = await vendorSrv.fetchItem(vendorId);
      setVendor(rs);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch date.');
    }
  };

  const initData = async () => {
    const rs = await srv.listCompanyAddress();
    const shippedAddress = rs.find((it) => it);
    form.setFieldsValue({
      shipToAddressId: shippedAddress?.id,
      shipToAddress: shippedAddress?.address,
    });
    setCompanyAddress(rs);
  };

  const linkObject = (record: SavePoItem) => {
    return (
      <ProList<RelatedObj>
        // dataSource={[...(record.item.relatedTo || []), ...(record.combineWith?.flatMap(it => it.relatedTo || []) || [])]}
        dataSource={record.relatedObjects}
        ghost={true}
        grid={{ gutter: 16, column: 4 }}
        itemCardProps={{
          size: 'small',
          ghost: true
        }}
        metas={{
          title: {
            render: (_, r) => r.type,
          },
          subTitle: {
            render: (_, r) => <Link>{r.code}</Link>
          },
          content: {
            render: (_, r) => <>{r.items.map(it => <Flex vertical key={`${it.id}-${r.type}-${r.id}`}>

              <Flex gap={5}>
                <Flex> <CaretRightOutlined /> </Flex>
                <Flex> Item: </Flex>
                <Flex> {`${it.itemCode} - ${it.itemName}`} </Flex>
              </Flex>
              <Flex gap={5}>
                <Flex> <CaretRightOutlined /> </Flex>
                <Flex> Desc: </Flex>
                <Flex> {it.itemDescription} </Flex>
              </Flex>
              <Flex gap={5}>
                <Flex> <CaretRightOutlined /> </Flex>
                <Flex> Qty: </Flex>
                <Flex> {it.qty} </Flex>
                {r.type == 'PR' && <Flex> Ordered: </Flex>}
                {r.type == 'PR' && <Flex> {it.orderedQty || 0} </Flex>}

                {r.type == 'PR' && <Flex> Purchased: </Flex>}
                {r.type == 'PR' && <Flex> {it.purchasedQty || 0} </Flex>}
                {r.type == 'PR' && <Flex> Available: </Flex>}
                {r.type == 'PR' && <Flex> {it.availableQty || 0} </Flex>}
              </Flex>
              <Flex gap={5}>
                <Flex> <CaretRightOutlined /></Flex>
                <Flex> Price: </Flex>
                <Flex> {formatter.format(it.price)} </Flex>

              </Flex>
            </Flex>)}</>
          }
        }}

      />
    );
  };

  const dataValidation = async () => {
    try {
      await form.validateFields();

      if (items.length == 0) {
        message.error('No PO item is added.');
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  };
  const doMerge = () => {
    const removeItems = mergeItems.filter((it) => it.key != mergeItemEnabled?.key);
    setItems((v) =>
      v
        .filter((it) => !removeItems.some((i) => i.key == it.key))
        .map((it) =>
          it.key == mergeItemEnabled?.key
            ? {
              ...it,
              combineWith: removeItems
                .flatMap((it1) => [
                  ...(it.combineWith || []),
                  it1.item,
                  ...(it1.combineWith || []),
                ])
                .filter((it) => it.refType != 'ITEM'),
              qty: _.sum(removeItems.map((it1) => it1.qty)) + it.qty,
              amount: (_.sum(removeItems.map((it1) => it1.qty)) + it.qty) * it.price,
            }
            : it,
        )
        .map((it, index) => ({ ...it, seq: index + 1 })),
    );
    setMergeItemEnabled(undefined);
    setMergeItems([]);
  };

  const onRequestHandler = async (
    processDef: string,
    formKey: string,
    buId: number,
    requestor: UserResult,
    comment?: string,
  ) => {
    try {
      const dataForm = await form.validateFields();
      if (!vendor) return;
      const billToaddress = vendor?.billingAddressList.find(
        (it) => it.id == dataForm.billToAddressId,
      );
      const shipToAddress = companyAddress?.find((it) => it.id == dataForm.shipToAddressId);

      const data: PoRequestSavePayload = {
        buId: buId,
        requestor: requestor.id,
        comment: comment,
        vendorId: dataForm.vendorId,
        deliveredDate: dataForm.deliveredDate,
        vendorCode: vendor.code!!,
        vendorName: vendor.name,
        contactPersonId: dataForm.contactPersonId,
        contactPerson: vendor.contactList.find((it) => it.id == dataForm.contactPersonId)
          ?.contactName!!,
        phone1: dataForm.phone1,
        phone2: dataForm.phone2,
        mailAddress: dataForm.mail,
        address: dataForm.address,
        billToAddressId: dataForm.billToAddressId,
        billToAddressName: billToaddress?.address!!,
        billToAddress: dataForm.billToAddress,
        shipToAddressId: dataForm.shipToAddressId,
        shipToAddressName: shipToAddress?.name!!,
        shipToAddress: dataForm.shipToAddress,
        paymentTermId: vendor.paymentGroupId,
        paymentTerm: vendor.paymentGroup,
        totalAmount: dataForm.totalAmount,
        isService: isService,
        discountPercentage: dataForm.discountPercentage,
        discountAmount: dataForm.discountAmount,
        tax: dataForm.taxPercentage,
        taxAmount: dataForm.taxAmount,
        paymentDue: dataForm.paymentDue,

        remarks: dataForm.remarks,
        items: items.map((it) => ({
          itemId: it.itemId,
          itemCode: it.itemCode,
          itemName: it.itemName,
          baseItemId: it.baseItemId,
          baseType: it.baseType,
          uomId: it.uomId,
          uomName: it.uomName,
          price: it.price,
          qty: it.qty,
          seq: it.seq,
          amount: it.amount,
          discountPercentage: it.discountPercentage,
          discountAmount: it.discountAmount,
          amountAfterDiscount: it.amountAfterDiscount,
          description: it.description,
          remarks: it.remarks,
          linkedTo: [it.item, ...(it.combineWith || [])].map((i) => ({
            type: i.refType,
            id: i.refId,
          })),
        })),
        files: uploadFiles,
      };
      const rs = await srv.saveItem(data);
      const { processInstId, formNo } = rs;
      onView?.(processInstId, formNo)
      message.success(`Your request is submitted. Please track the request with form no ${formNo}`);
      // history.push(`/data-form/${PoRequestFormNames.processDefKey}/${processInstId}`);
    } catch (error: any) {
      message.error(error.message || 'Failed to submit.');
    }
  };

  const onReset = () => {
    setVendor(undefined);
    form.resetFields();
    setItems([]);

    const shippedAddress = companyAddress?.find((it) => it);
    form.setFieldsValue({
      shipToAddressId: shippedAddress?.id,
      shipToAddress: shippedAddress?.address,
    });
  };

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    const billingAddressId = vendor?.billingAddressList.find((it) => it)?.id;
    form.setFieldsValue({
      contactPersonId: vendor?.contactList.find((it) => it)?.id,
      billToAddressId: billingAddressId,
      phone1: vendor?.phone1,
      phone2: vendor?.phone2,
      mail: vendor?.mail,
      address: vendor?.address,
      paymentGroup: vendor?.paymentGroup,
    });

    billingAddressId && setBillingAddress(billingAddressId);
  }, [vendor]);

  useEffect(() => {
    const totalAmount = _.sum(items.map((it) => it.amountAfterDiscount)) || 0;
    const discountAmount = totalAmount == 0 ? 0 : form.getFieldValue('discountAmount') || 0;
    const tax = form.getFieldValue('taxPercentage') || 0;
    const totalAfterDiscount = totalAmount - discountAmount;

    const taxAmount = totalAmount == 0 ? 0 : round((totalAfterDiscount * tax) / 100, 2) || 0;

    form.setFieldsValue({
      totalAmount: totalAmount,
      paymentDue: totalAfterDiscount + taxAmount,
      taxAmount: taxAmount
    });
  }, [items, forceUpdate]);

  return (
    <div ref={ref}>
      <ProForm
        form={form}
        submitter={{
          render: () => (
            inView ? <FooterToolbar>
              <Button style={{ marginRight: 10 }} onClick={onBack}>
                Cancel
              </Button>
              <Button onClick={onReset}>Clear</Button>
              <Button
                type="primary"
                onClick={async () => {
                  if (!(await dataValidation())) {
                    message.error('Invalid data. please make sure all data is valid.');
                    return;
                  }
                  setRequestVisible(true);
                }}
              >
                Request
              </Button>
            </FooterToolbar> : <></>
          ),
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* <Requestor form={form} title="Requestor" /> */}
          <ProCard
            bordered
            style={{ marginBlockStart: 8 }}
            gutter={8}
            direction="row"
            size="small"
            title={'Genernal'}
          >
            <Flex justify="space-between">
              <Flex vertical>
                <ProFormSelect
                  width={470}
                  disabled={items.length > 0 && form.getFieldValue('vendorId')}

                  key={`vendor${forceReloadVendorList}`}
                  label="Vendor"
                  rules={[{ required: true }]}
                  name={'vendorId'}
                  fieldProps={{
                    popupMatchSelectWidth: 500, onClear() {
                      setVendor(undefined)
                      form.resetFields(['billToAddress'])
                    },
                  }}
                  allowClear
                  showSearch
                  request={onFindVendorHandler}
                />
                <ProFormGroup>
                  <ProFormSelect
                    label="Contact Person"
                    name={'contactPersonId'}
                    placeholder={'Contact Person'}
                    options={vendor?.contactList.map((it) => ({
                      label: it.contactName,
                      value: it.id,
                    }))}
                    width={470}
                  />
                </ProFormGroup>
                <ProFormGroup>
                  <ProFormText
                    rules={[{ required: true }]}
                    name={'phone1'}
                    label="Phone1"
                    width={'sm'}
                  />
                  <ProFormText name={'phone2'} label="Phone2" width={'sm'} />
                </ProFormGroup>
                <ProFormText width={470} name={'mail'} label="E-Mail" />
                <ProFormTextArea
                  name={'address'}
                  fieldProps={{ rows: 1, maxLength: 300 }}
                  width={500}
                  label="Address"
                />
              </Flex>

              <Flex vertical>
                <Flex justify="space-between" gap={10}>
                  <Flex vertical>
                    <ProFormSelect
                      width={'md'}
                      name={'billToAddressId'}
                      rules={[{ required: true }]}
                      options={vendor?.billingAddressList.map((it) => ({
                        label: it.address,
                        value: it.id,
                      }))}
                      label="Bill to Address"
                    />
                    <ProFormTextArea
                      name={'billToAddress'}
                      placeholder={''}
                      fieldProps={{ rows: 7, readOnly: true }}
                      width={'md'}
                    />
                    <ProFormDatePicker width={'md'} rules={[{ required: true }]} label="Delivery Date" name={"deliveredDate"} />

                  </Flex>
                  <Flex vertical>
                    <ProFormSelect
                      options={companyAddress?.map((it) => ({ label: it.name, value: it.id }))}
                      rules={[{ required: true }]}
                      name={'shipToAddressId'}
                      width={'md'}
                      label="Ship to Address"
                    />
                    <ProFormTextArea
                      placeholder={''}
                      fieldProps={{ rows: 7, readOnly: true }}
                      name={'shipToAddress'}
                      width={'md'}
                    />
                    <ProFormText label="Payment Term" name={'paymentGroup'} />
                  </Flex>
                </Flex>


              </Flex>
            </Flex>
          </ProCard>

          <ProCard
            bordered
            size="small"
            title={'Item/Service List'}
            extra={
              <Space align="baseline">
                <ProFormSwitch
                  disabled={items.length > 0}
                  fieldProps={{}}
                  labelCol={{ flex: 1 }}
                  unCheckedChildren={'Item'}
                  checkedChildren={'Service'}
                  name={'service'}
                />
                <Button danger disabled={items.length == 0} type='link' icon={<ClearOutlined />} onClick={() => {
                  setItems([])
                }} />
              </Space>
            }
          >
            <EditableProTable<SavePoItem>
              expandable={{
                expandedRowRender: linkObject,

                rowExpandable: (record) => (record.item.relatedTo?.length || 0) > 0,
              }}
              size="small"
              recordCreatorProps={{
                creatorButtonText: isService ? 'Add Services' : 'Add Items',
                onClick: () => {
                  setAddItemVisible(true);
                },
                record: () => ({} as any),
              }}
              rowKey="key"
              editableFormRef={editableFormRef}
              controlled
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

                    {!mergeItemEnabled &&
                      items.filter((it) => it.itemId == row.itemId && it.key == '-----').length > 1 && (
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
                        // disabled={!(row.item?.prItems && row.item?.prItems.length > 0)}
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
                          disabled={mergeItems.length <= 1}
                          icon={<CheckCircleOutlined />}
                        />
                      </Popconfirm>
                    )}
                  </Space>,
                ],
                onValuesChange: (_, recordList) => {
                  const newItems = recordList.map((it) => {
                    const newAmount = (it.price || 0) * (it.qty || 0);
                    const discount = round((newAmount * (it.discountPercentage || 0)) / 100, 2);

                    return {
                      ...it,
                      uomId: it.item.uomList.find((it1) => it1.name == it.uomName)?.id,
                      amount: newAmount,
                      discountAmount: discount,
                      amountAfterDiscount: newAmount - discount,
                    };
                  });
                  // setForceUpdate(v => v+1)
                  setItems(newItems);
                },
              }}
              value={items}
              columns={[
                { title: '#', readonly: true, width: 50, dataIndex: 'seq' },
                {
                  title: isService ? 'Service Name' : 'Item Name',
                  hideInTable: isService,
                  readonly: true,
                  responsive: ['xs', 'sm'],
                  renderText: (_, r) => (
                    <Flex vertical>
                      <Flex style={{ fontWeight: 'bold' }}>{r.itemCode}</Flex>{' '}
                      <Flex>{r.itemName}</Flex>
                    </Flex>
                  ),
                },
                {
                  title: 'Description',
                  valueType: 'textarea',
                  dataIndex: 'description',
                  responsive: ['xs', 'xl'],
                  fieldProps: {
                    rows: 1,
                  },
                },
                {
                  title: 'Qty',
                  formItemProps: { rules: [{ required: true }] },
                  fieldProps: {
                    style: { width: 70 },
                    // disabled: dataChangedProtection,

                    precision: 2,
                    min: 1,
                  },
                  dataIndex: 'qty',
                  align: 'center',
                  hideInTable: isService,
                  valueType: 'digit',
                  width: 80,
                },
                {
                  title: 'UoM',
                  width: 100,
                  hideInTable: isService,
                  dataIndex: 'uomName',
                  valueType: 'select',
                  formItemProps: { rules: [{ required: true }] },
                  fieldProps: {
                    style: { width: 90 },
                    // disabled: dataChangedProtection,
                    // showSearch: true,
                    popupMatchSelectWidth: 200,
                  },
                  valueEnum: (r) =>
                    r.item.uomList.reduce((acc, cur) => ({ ...acc, [cur.name]: cur.name }), {}),
                },

                {
                  title: 'Price',
                  dataIndex: 'price',
                  hideInTable: isService,
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
                  width: isService ? undefined : 100,
                  responsive: isService ? ['sm'] : undefined,
                  align: 'right',
                  editable: false,
                  renderText: (_, record) => formatter.format(record.amount),
                },
                {
                  title: 'Dis. (%)',
                  fieldProps: {
                    style: { width: 80 },
                    max: 100,
                    min: 0,
                  },
                  width: isService ? undefined : 100,
                  responsive: isService ? ['sm'] : undefined,
                  align: 'right',
                  valueType: 'percent',
                  dataIndex: 'discountPercentage',
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
                  responsive: ['xs', 'xl'],
                  fieldProps: { rows: 1 },
                  render: (_, r) => r.remarks,
                },
                {
                  valueType: 'option',
                  width: 70,
                  // hideInTable: dataChangedProtection,
                  render: () => {
                    return null;
                  },
                },
              ]}
            />
          </ProCard>
        </Space>
      </ProForm>
      <ProCard style={{ marginBlockStart: 8 }}>
        <ProForm
          form={form}
          submitter={false}
          layout="horizontal"
          labelCol={{ span: 12 }}
          wrapperCol={{ span: 12 }}
          // labelAlign="right"
          onValuesChange={(changedValues) => {
            const {
              vendorId,
              billToAddressId,
              shipToAddressId,
              discountPercentage,
              discountAmount,
              taxPercentage,
              service,
            } = changedValues;

            if ('service' in changedValues) {
              setIsService(service);
              return;
            }

            const amount = form.getFieldValue('totalAmount');

            if (discountPercentage) {
              form.setFieldsValue({
                discountAmount: (discountPercentage * amount) / 100,
              });

              setForceUpdate((v) => v + 1);
              return;
            }

            if (discountAmount) {
              form.setFieldsValue({
                discountPercentage: round((discountAmount * 100) / amount, 2),
              });
              setForceUpdate((v) => v + 1);
              return;
            }
            if (taxPercentage) {
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

            if (billToAddressId) {
              setBillingAddress(billToAddressId);
            }

            if (shipToAddressId) {
              const address = companyAddress?.find((it) => it.id == shipToAddressId);
              form.setFieldValue('shipToAddress', address?.address);
            }
          }}
        >
          <Flex justify="space-between">
            <Flex justify="flex-start">
              <ProFormTextArea
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                fieldProps={{ rows: 6 }}
                label="Remarks"
                name={'remarks'}
                width={600}
              />
            </Flex>
            <Flex vertical style={{ width: 400 }}>
              <ProFormMoney
                formItemProps={{
                  style: {
                    fontWeight: 'bolder',
                  },
                }}
                // locale="en-US"
                readonly
                label="Total Before Discount"
                name={'totalAmount'}
              />
              <ProForm.Item style={{ marginBottom: 0, fontWeight: 'bolder' }} label="Discount (-)">
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
                    width={100}
                  />
                </Space.Compact>
              </ProForm.Item>
              <ProFormDigit
                formItemProps={{
                  style: {
                    fontWeight: 'bolder',
                  },
                }}
                label="Tax (+)"
                name={'taxPercentage'}
                placeholder={'%'}
                fieldProps={{
                  max: 100,
                  min: 0,
                }}
                width={70}
              />
              <ProFormMoney
                formItemProps={{
                  style: {
                    fontWeight: 'bolder',
                  },
                }}
                // locale="en-US"
                label="Total Payment Due"
                readonly
                name={'paymentDue'}
              />
            </Flex>
          </Flex>
        </ProForm>
      </ProCard>

      <ProCard style={{ marginBlockStart: 8 }}>
        <FileUploader
          title="Attachments"
          multiple
          showTitle
          addFileInfo
          service="FILE"
          // initFiles={type == 'EDIT' ? data?.attachmentFiles : []}
          onSetFiles={(files) => {
            setUploadFiles(files.map((it) => it.response));
          }}
        />
        <ProcessFlowModalWrapper
          title="Start PO Request Process"
          formKey={PoRequestFormNames.processDefKey}
          type="action"
          action="Start"
          loading={false}
          noAttachment
          visible={requestVisible}
          actionHandlers={{
            onStartWorkflow: onRequestHandler,
            onCancel: () => {
              setRequestVisible(false);
            },
          }}
        />
      </ProCard>
      <PoItemFinder
        addedItms={items}
        open={addItemVisible}
        isService={isService}
        onOpenChange={(visible) => !visible && setAddItemVisible(false)}
        onSave={async (data) => {
          if (
            vendor &&
            data.some((it) =>
              it.item.relatedTo?.some((i) => i.type == 'VENDOR' && i.id != vendor?.id),
            )
          ) {
            message.error(
              `Only items sourced by vendor: ${[vendor.code, vendor.name].join('-')} are allowed`,
            );
            return;
          }

          const vendorFromItem = data
            .flatMap((it) => it.item.relatedTo?.find((i) => i.type == 'VENDOR'))
            .find((it) => it);

          if (!vendor && vendorFromItem) {
            onSelectVendor(vendorFromItem.id).finally(() => setForceReloadVendorList((v) => v + 1));

            form.setFieldsValue({ vendorId: vendorFromItem.id });
          }

          const itemList = (await Promise.all(data.map(it => getRelatedItms(it.refId, it.refType).query().then(items => ({ itemId: it.refId, type: it.refType, items: items }))))).flatMap(it => it)

          setItems((v) => [...v, ...data].map((it, index) => ({
            ...it,
            baseItemId: it.item.baseItemId,
            relatedObjects: itemList.find(i => i.itemId == it.refId && i.type == it.refType)?.items || [],
            baseType: it.item.baseType,
            seq: index + 1
          })));



        }}
        vendor={vendor}
      />
    </ div >
  );
};
