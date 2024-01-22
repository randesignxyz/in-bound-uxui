import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { Locations } from '@/services/crm/data';
import { LocationType } from '@/services/crm/services';
import {
  LeadLess,
  SaleInvoiceItemLess,
  SaleInvoiceLess,
  SaleItem,
  SalesTeamWorkLess,
} from '@/services/sale/data';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import ProForm, {
  ProFormDateTimePicker,
  ProFormMoney,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { useSetState } from 'ahooks';
import { Button, Card, Col, message, Row, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import numeral from 'numeral';
import { useEffect, useRef, useState } from 'react';
import ItemEntryFormModal from '../../so-invoice/components/ItemEntryFormModal';
import LeadFormModel from '../../so-invoice/components/LeadFormModel';
import { Model } from '../../stock-control/model';

export interface Props extends FormModalProps {
  data?: {
    // saleTypes?: LookupData[];
    detail?: SaleInvoiceLess;
    typeProductItems?: { itemId: number; itemType: number }[];
    saleItems: SaleItem[];
    stockControlId?: number;
    salespersonList?: SalesTeamWorkLess[];
    regionList?: Locations[];
    locations?: {
      communeList?: Locations[];
      districtList?: Locations[];
      provinceList?: Locations[];
      villageList?: Locations[];
    };
  };
  isLoading: boolean;
  actionHandlers?: {
    onSubmit: (item: SaleInvoiceLess) => void;
    onLoadLocations: (type: LocationType, isNotClearChild: boolean, parentId?: number) => void;
  };
}

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const SaleInvoiceFormModal: React.FC<Props> = ({ isLoading, data, actionHandlers, ...rest }) => {
  const { actions } = Model();
  const [formSaleInvoice] = useForm<SaleInvoiceLess>();
  const [leadModal, setLeadModal] = useSetState<{ visible?: boolean; phoneNumber?: string }>({});
  const [itemModal, setItemModal] = useSetState<{ visible?: boolean }>({});

  const [selectedSalespersonCode, setSelectedSalespersonCode] = useState<string>();

  const actionRef = useRef<ActionType>();

  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [dataSource, setDataSource] = useState<SaleInvoiceItemLess[]>([]);

  const onSubmitActionHandler = async () => {
    const dataFormat = await formSaleInvoice.validateFields();
    const saleInvoice: SaleInvoiceLess = {
      ...dataFormat,
      items: dataSource,
      id: data?.detail?.id,
      //salespersonCode: dataFormat.salespersonCode,
      stockControlId: data?.stockControlId || -1,
    };
    actionHandlers && actionHandlers.onSubmit(saleInvoice);
  };

  const onCustomReset = () => {
    formSaleInvoice.setFieldsValue({
      invoiceDate: new Date(),
      customerId: undefined,
      referenceNo: undefined,
      subAmount: 0,
      discount: 0,
      amount: 0,
    });
    setDataSource([]);
  };

  const onValuesChange = (changedValues: any, values: any) => {
    const { salespersonCode } = values;

    if ('salespersonCode' in changedValues) {
      setSelectedSalespersonCode(salespersonCode);
    }
    if (salespersonCode === undefined) {
      setSelectedSalespersonCode(salespersonCode);
    }
  };

  useEffect(() => {
    if (!rest.open) return;
    // load region

    if (!data?.detail) {
      actions.fetchInvoiceNo().then((it) => {
        formSaleInvoice.setFieldsValue({
          invoiceDate: new Date(),
          invoiceNo: it,
          subAmount: 0,
          discount: 0,
          amount: 0,
        });
      });
    } else {
      formSaleInvoice.setFieldsValue({
        invoiceDate: data.detail?.invoiceDate,
        invoiceNo: data.detail?.invoiceNo,
        referenceNo: data.detail?.referenceNo,
        customerId: data.detail?.customer?.phone,
        salespersonCode: data.detail?.salesperson.salespersonCode,
        subAmount: 0,
        discount: 0,
        amount: 0,
      });
    }
    setDataSource([]);

    return () => {
      formSaleInvoice.resetFields();
    };
  }, [rest.open]);

  const sortFun = (a: SaleInvoiceItemLess, b: SaleInvoiceItemLess) => {
    if (a.itemCode < b.itemCode) return -1;
    if (a.itemCode > b.itemCode) return 1;
    return 0;
  };

  return (
    <FormModalComp
      {...rest}
      width="850px"
      footer={[
        <Button key="button" onClick={() => rest.onCancel && rest.onCancel()}>
          Cancel
        </Button>,
        !data?.detail && (
          <Button key="reset" onClick={onCustomReset}>
            Reset
          </Button>
        ),

        <Button
          loading={rest.confirmLoading}
          disabled={!data?.detail && (rest.disabled || dataSource.length <= 0)}
          key="submit"
          type="primary"
          onClick={onSubmitActionHandler}
        >
          {data?.detail ? 'Update' : 'Submit'}
        </Button>,
        // <Button
        //   loading={rest.confirmLoading}
        //   disabled={rest.disabled}
        //   key="submitView"
        //   type="primary"
        //   onClick={async () => await onSubmitActionHandler(true)}
        // >
        //   Submit & Detail
        // </Button>,
      ]}
    >
      <ProForm<SaleInvoiceLess>
        form={formSaleInvoice}
        submitter={false}
        {...layout}
        autoFocusFirstInput
        onValuesChange={onValuesChange}
        layout="horizontal"
      >
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row>
            <Col flex="auto">
              <ProFormText label="Invoice #" name="invoiceNo" disabled />
              <ProFormText label="Reference #" name="referenceNo" />
              <ProFormSelect
                name="salespersonCode"
                disabled={data?.salespersonList ? false : true}
                help={<span />}
                rules={[{ required: true }]}
                label="Owner By"
                showSearch
                fieldProps={{
                  optionLabelProp: 'label',
                  // dropdownMatchSelectWidth: 400,
                  filterOption: (input, option) =>
                    (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >=
                    0,
                }}
                options={data?.salespersonList
                  ?.filter((it) => !it.isApprover)
                  .map((it) => {
                    return {
                      value: it.salespersonCode,
                      label: `${it.salespersonCode} - ${it.salespersonName}`,
                    };
                  })}
              />
            </Col>
            <Col flex="auto">
              <ProFormDateTimePicker label="Invoice Date" name="invoiceDate" />
              <ProFormSelect
                rules={[{ required: true }]}
                name="customerId"
                label="Customer"
                showSearch
                debounceTime={300}
                addonAfter={
                  <Tooltip placement="topLeft" title="Add Customer">
                    <Button
                      size="small"
                      icon={<PlusOutlined />}
                      type="primary"
                      onClick={() => {
                        if (selectedSalespersonCode) {
                          setLeadModal({ visible: true, phoneNumber: phoneNumber });
                        } else {
                          message.info('Please select owner');
                        }
                      }}
                    />
                  </Tooltip>
                }
                request={async ({ keyWords }) => {
                  setPhoneNumber(keyWords);
                  const result =
                    keyWords && keyWords.length > 1 && (await actions.searchLeadByPhone(keyWords));
                  return result.map((it: { phone: string }) => ({
                    label: it.phone,
                    value: it.phone,
                  }));
                }}
                placeholder="Please select customer"
              />
              {/* <ProFormMoney
                label="Amount Riel"
                name="amountKH"
                width={300}
                fieldProps={{
                  precision: 0,
                  formatter: (value) => {
                    //numeral(data.details?.cashOnHand).format('$ 0,0.00')
                    return numeral(value).format('0,0');
                  },
                }}
                min={0}
              /> */}
            </Col>
          </Row>
        </Card>
        {!data?.detail && (
          <>
            <ProTable<SaleInvoiceItemLess>
              // dataSource={dataSource}
              search={false}
              actionRef={actionRef}
              //    rowClassName={(r) => r.parentKey && styles.subLineItem}
              //    dataSource={data.lineItemList || []}
              dataSource={dataSource}
              style={{ marginTop: 10 }}
              pagination={false}
              size="small"
              headerTitle="Line Items"
              rowKey={'id'}
              toolBarRender={() => [
                <Tooltip placement="topLeft" title="Add Item">
                  <Button
                    size="small"
                    //   icon={<PlusCircleFilled style={{ color: blueColor }} />}
                    icon={<PlusOutlined />}
                    type="primary"
                    onClick={() => setItemModal({ visible: true })}
                  />
                </Tooltip>,
              ]}
              options={{
                density: false,
                reload: false,
                setting: false,
                search: false,
              }}
              columns={[
                // {
                //   title: '#',
                //   dataIndex: 'index',
                //   key: 'key',
                // },
                {
                  title: 'Code',
                  dataIndex: 'itemCode',
                },
                {
                  title: 'UOM',
                  dataIndex: 'uom',
                },
                {
                  title: 'Description',
                  dataIndex: 'itemName',
                },

                {
                  title: 'Item Type',
                  dataIndex: 'itemType',
                },

                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                },
                {
                  title: 'Unit Price',
                  align: 'right',
                  render: (_, r) => {
                    return numeral(r.unitPrice).format('$ 0,0.00');
                  },
                },
                {
                  title: 'Amount',
                  align: 'right',
                  render: (_, r) => {
                    return numeral(r.amount).format('$ 0,0.00');
                  },
                },
                {
                  render: (_, r) => (
                    <Tooltip placement="topRight" title="Remove Item">
                      <DeleteOutlined
                        key={`${r.itemId}${r.stockCategoryId}`}
                        onClick={() => {
                          setDataSource(dataSource.filter((it) => it.key !== r.key));

                          const amount: number = dataSource.reduce<number>(
                            (itemAmount, current) => {
                              return (itemAmount += current.amount);
                            },
                            -r.amount,
                          );

                          formSaleInvoice.setFieldsValue({
                            subAmount: amount,
                            discount: 0.0,
                            amount: amount,
                          });
                        }}
                      />
                    </Tooltip>
                  ),
                },
              ]}
            />
            <Card size="small" style={{ marginTop: 10 }}>
              <Row justify="end">
                <Col flex="3" />
                <Col style={{ textAlign: 'right', flex: '30px' }}>
                  <ProFormMoney
                    fieldProps={{
                      precision: 4,
                    }}
                    label="Sub Total"
                    labelCol={{ span: 10 }}
                    name="subAmount"
                    readonly
                    width="sm"
                    locale="en-US"
                  />
                  <ProFormMoney
                    labelAlign="right"
                    label="VAT Amount"
                    labelCol={{ span: 10 }}
                    name="discount"
                    readonly
                    width="sm"
                    locale="en-US"
                  />
                  <ProFormMoney
                    labelAlign="right"
                    label="Total Amount"
                    labelCol={{ span: 10 }}
                    name="amount"
                    readonly
                    width="sm"
                    locale="en-US"
                  />
                </Col>
              </Row>
            </Card>
          </>
        )}
      </ProForm>
      <ItemEntryFormModal
        title="Item"
        open={itemModal.visible}
        width={'500px'}
        onCancel={() => setItemModal({ visible: false })}
        data={{
          // saleTypes: data?.saleTypes,
          productItems: data?.saleItems,
          typeProductItems: data?.typeProductItems,
        }}
        actionHandlers={{
          onAddItem: async (item) => {
            // console.log(item);
            setItemModal({ visible: false });
            // const items = dataSource;
            const index = dataSource.findIndex(
              (it) => it.itemId === item.itemId && it.itemType === item.itemType,
            );
            let initialAmount = 0;
            if (index !== -1) {
              const foundItme = dataSource.splice(index, 1)[0];
              const adjustQty = foundItme.quantity + item.quantity;
              const adjustItem: SaleInvoiceItemLess = {
                ...foundItme,
                quantity: adjustQty,
                amount: adjustQty * foundItme.unitPrice,
              };
              initialAmount = adjustItem.amount;
              setDataSource([...dataSource, adjustItem].sort(sortFun));
            } else {
              initialAmount = item.amount;
              setDataSource([...dataSource, item].sort(sortFun));
            }
            // const dataForm = await formSaleInvoice.validateFields();
            const amount: number = dataSource.reduce<number>((itemAmount, current) => {
              return (itemAmount += current.amount);
            }, initialAmount);
            const totalAmount = amount; //- (dataForm.discount || 0);

            formSaleInvoice.setFieldsValue({
              subAmount: amount,
              discount: 0.0,
              amount: totalAmount,
            });
            actionRef.current?.reloadAndRest?.();
          },
        }}
      />

      <LeadFormModel
        title="Create Customer"
        open={leadModal.visible}
        width={'500px'}
        onCancel={() => setLeadModal({ visible: false, phoneNumber: '' })}
        data={{
          typeId: undefined,
          regionList: data?.regionList,
          phone: leadModal.phoneNumber,
          salespersonCode: selectedSalespersonCode,
        }}
        locations={data?.locations}
        actionHandlers={{
          onLoadLocations: (type, isNotClearChild, parentId) => {
            actionHandlers && actionHandlers.onLoadLocations(type, isNotClearChild, parentId);
          },

          onSave: async (item: LeadLess) => {
            const result = await actions.saveLead(item);
            if (result) {
              formSaleInvoice.setFieldsValue({ customerId: item.phone });
              setLeadModal({ visible: false, phoneNumber: item.phone });
              message.info(result?.message);
            }
          },
        }}
      />
    </FormModalComp>
  );
};

export default SaleInvoiceFormModal;
