import FormModalComp, { FormModalProps } from '@/components/FormModal';
import RemarkModal from '@/components/remark-modal';
import {
  DeliveryNoteDetail,
  DeliveryNoteItem,
  Freight,
  FreightDetail,
  ResolvedDNResponse,
} from '@/services/delivery/data';
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import {
  ProCard,
  ProForm,
  ProFormDatePicker,
  ProFormGroup,
  ProFormSelect,
  ProTable,
} from '@ant-design/pro-components';
import { Alert, Button, Col, message, Row, Space, Spin, Switch, Typography } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { uniq } from 'lodash';
import moment, { Moment } from 'moment';
import { useEffect, useState } from 'react';
import EditSettlmentModal from '../../cash-collection/edit-settlment-modal';
import PaymentListView from '../../cash-collection/payment-list-view';
import { CollectedInvoice } from '../assigned-docs';

interface Props extends FormModalProps {
  freight: FreightDetail;
  loading?: boolean;
  loadingDate?: Moment;
  onReload?: () => void;
  onLoadingAvailble: (dnDate?: Moment) => Promise<Freight[]>;
  onFetchResolvedDn: (dnData: Moment, shipToCode: string) => Promise<ResolvedDNResponse>;
  onSave: (
    currentFreightId: number,
    dnIds: number[],
    invoices: CollectedInvoice[],
    returnItems: DeliveryNoteItem[],
  ) => void;
}

export default ({
  freight,
  loadingDate,
  loading,
  onLoadingAvailble,
  onFetchResolvedDn,
  onReload,
  onSave,
  ...props
}: Props) => {
  const [form] = useForm<{ shipToCode: string; dnDate: Moment }>();
  const [data, setData] = useState<ResolvedDNResponse>();
  const [freightChangedList, setFreightChangedList] = useState<Freight[]>([]);
  const [invoices, setInvoices] = useState<CollectedInvoice[]>([]);
  const [commentModal, setCommentModal] = useState<{ visible: boolean; item?: CollectedInvoice }>({
    visible: false,
  });

  const onHide = () => setCommentModal({ visible: false });

  const [checkAmount, setCheckAmount] = useState<{
    returnItems?: DeliveryNoteItem[];
    payment?: number;
    currentInvoice?: number;
  }>({
    payment: freight.checkout?.cashCollections
      ?.filter((it) => it.paymentMethod != 'NONE')
      ?.map((it) => it.paidAmount)
      ?.reduce((p, c) => p + c, 0),
  });

  const returnItem = (newItem?: DeliveryNoteItem[]) => {
    const items = freight.deliveryNotes
      .flatMap((it) => it.items)
      .map((it) => {
        const qty = newItem
          ?.filter((i) => i.itemCode === it.itemCode)
          .map((i) => i.qty)
          .reduce((p, c) => p + c, 0);
        const returnQty = (it.qty || 0) - (qty || 0);
        return { ...it, qty: returnQty, actualQty: returnQty };
      });

    return items;
  };

  const initData = async (dnDate?: Moment) => {
    try {
      const data = await onLoadingAvailble(dnDate || moment());
      setFreightChangedList(data);
      if (data.length === 1) {
        const shipToCode = data.find((it) => it)?.shipToCode || '';
        form.setFieldValue('shipToCode', shipToCode);
        loadDn(dnDate || moment(), shipToCode);
      } else {
        setData(undefined);
        setFreightChangedList([]);
        setInvoices([]);
        form.resetFields(['shipToCode']);
        setCheckAmount((v) => ({
          ...v,
          returnItems: returnItem(),
          newDeliveryAmount: 0,
          currentInvoice: 0,
        }));
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load data.');
    }
  };

  const loadDn = async (dnDate: Moment, shipToCode?: string) => {
    if (!shipToCode) {
      setCheckAmount((v) => ({
        ...v,
        returnItems: returnItem(),
        newDeliveryAmount: 0,
        currentInvoice: 0,
      }));
      setData(undefined);
      setInvoices([]);
    } else {
      try {
        const data = await onFetchResolvedDn(dnDate, shipToCode);
        setData(data);
        setInvoices(data.invoices.map((it) => ({ ...it, collected: true, included: true })));
        setCheckAmount((v) => ({
          ...v,
          returnItems: returnItem(data.deliveryNotes.flatMap((it) => it.items)),
          currentInvoice: data.invoices.map((it) => it.amount).reduce((p, c) => p + c, 0),
        }));
      } catch (error: any) {
        setCheckAmount((v) => ({
          ...v,
          returnItems: returnItem(),
          newDeliveryAmount: 0,
          currentInvoice: 0,
        }));
        setData(undefined);
        setInvoices([]);
        message.error(error.message || 'Failed to load data.');
      }
    }
  };

  useEffect(() => {
    if (props.open) {
      form.setFieldValue('dnDate', loadingDate || moment());
      initData(loadingDate);
    }
  }, [props.open]);

  useEffect(() => {
    setCheckAmount((v) => ({
      ...v,
      payment: freight.checkout?.cashCollections
        ?.filter((it) => it.paymentMethod != 'NONE')
        ?.map((it) => it.paidAmount)
        ?.reduce((p, c) => p + c, 0),
    }));
  }, [freight]);

  const expandedRowRender = (item: DeliveryNoteDetail) => {
    return (
      <ProTable<DeliveryNoteItem>
        key={item.id}
        search={false}
        size={'small'}
        options={{
          density: false,
          setting: false,
          reload: false,
        }}
        pagination={false}
        dataSource={item.items}
        rowKey="id"
        columns={[
          {
            width: 200,
            title: 'Item Code',
            dataIndex: 'itemCode',
            render: (_, r) =>
              freight.deliveryNotes
                .flatMap((it) => it.items)
                .some((it) => it.itemCode === r.itemCode) ? (
                r.itemCode
              ) : (
                <Alert type="error" showIcon message={r.itemCode} />
              ),
          },
          { title: 'Description', dataIndex: 'itemDescription' },
          { title: 'UoM', dataIndex: 'uomCode' },
          { title: 'Qty', dataIndex: 'qty' },
        ]}
      />
    );
  };

  return (
    <FormModalComp
      title={`Resolve Shipping to ${freight.shippingAddress.shipToCode}`}
      {...props}
      onResetForm={() => {
        form.resetFields();
        form.setFieldValue('dnDate', moment());
        initData();
      }}
      onSubmit={async () => {
        const notExists = data?.deliveryNotes
          ?.flatMap((it) => it.items)
          .filter(
            (it) =>
              !freight.deliveryNotes
                .flatMap((i) => i.items)
                .some((i) => i.itemCode === it.itemCode),
          )
          .map((it) => it.itemCode);

        const items = checkAmount.returnItems?.filter((it) => (it.qty || 0) < 0);

        const messages = [
          (notExists?.length || 0) > 0 && `${uniq(notExists).join()} - not delivered`,
          (items?.length || 0) > 0 &&
            `${items
              ?.map((it) => `${it.itemCode}: ${it.qty}`)
              .join(', ')} - not available to return.`,
          (checkAmount.payment || 0) !== (checkAmount.currentInvoice || 0) &&
            'Payment amount is not matched',
        ].filter((it) => it);

        if (messages.length > 0) {
          message.error(messages.join(', '));
          return;
        }
        onSave(
          freight.id,
          data?.deliveryNotes.map((it) => it.docEntry) || [],
          invoices,
          checkAmount.returnItems?.filter((it) => it.qty > 0) || [],
        );
      }}
    >
      <ProForm
        form={form}
        submitter={false}
        onValuesChange={(changeValues, values) => {
          const { shipToCode, dnDate } = changeValues;

          if ('shipToCode' in changeValues) {
            loadDn(values.dnDate, shipToCode);
          } else if ('dnDate' in changeValues) {
            initData(dnDate);
          } else if (!values.shipToCode) {
            loadDn(values.dnDate);
          }
        }}
      >
        <Spin spinning={loading}>
          <ProCard size="small" boxShadow style={{ marginBottom: '2px' }}>
            <ProFormGroup>
              <ProFormDatePicker allowClear={false} label={'DN Date'} name="dnDate" />
              <ProFormSelect
                label="Shipping To"
                name={'shipToCode'}
                fieldProps={{
                  popupMatchSelectWidth: 800,
                }}
                width="xl"
                options={freightChangedList.map((it) => ({
                  label: [it.customerCode, it.customerName, it.shipToCode].join('/'),
                  value: it.shipToCode,
                }))}
              />
            </ProFormGroup>
          </ProCard>
          {(checkAmount.payment || 0) !== (checkAmount.currentInvoice || 0) && (
            <Alert
              style={{ marginBottom: '2px' }}
              type="error"
              action={
                <EditSettlmentModal
                  disabledAddInvoice
                  onRefresh={() => {
                    onReload?.();
                  }}
                  data={{
                    checkout: {
                      id: freight.id,
                      customerCode: freight.customerCode,
                      customerName: freight.customerName,
                      shipToCode: freight.shippingAddress.shipToCode,
                      totalInvoiceAmount: freight.amount,
                      totalPaidAmount: freight.paidAmount || 0,
                      cashCollections: freight.checkout?.cashCollections || [],
                      invoices:
                        data?.invoices?.map((it) => ({
                          id: it.id,
                          invoiceNum: it.docNum,
                          invoiceAmount: it.amount,
                          paymentTerm: it.paymentTerm,
                          manualAdded: it.manualAdded,
                        })) || [],
                    },
                    freightId: freight.id,
                  }}
                  trigger={<Button type="link" icon={<EditOutlined />} />}
                />
              }
              message={`Payment amount and invoice amount are not matched.`}
              showIcon
            />
          )}
          {(data?.invoices?.length || 0) === 0 && (
            <Alert
              style={{ marginBottom: '2px' }}
              type="warning"
              message="No invoice available."
              showIcon
            />
          )}

          {(() => {
            const notExists = data?.deliveryNotes
              ?.flatMap((it) => it.items)
              .filter(
                (it) =>
                  !freight.deliveryNotes
                    .flatMap((i) => i.items)
                    .some((i) => i.itemCode === it.itemCode),
              )
              .map((it) => it.itemCode);
            return (
              (notExists?.length || 0) > 0 && (
                <Alert
                  style={{ marginBottom: '2px' }}
                  type="error"
                  showIcon
                  message={`${uniq(notExists).join()} - not delivered`}
                />
              )
            );
          })()}
          {!data && (
            <Alert
              style={{ marginBottom: '2px' }}
              type="warning"
              message="No delivery note available."
              showIcon
            />
          )}
          {(() => {
            const items = checkAmount.returnItems?.filter((it) => (it.qty || 0) < 0);
            return (
              (items?.length || 0) > 0 && (
                <Alert
                  style={{ marginBottom: '2px' }}
                  showIcon
                  type="error"
                  message={`${items
                    ?.map((it) => `${it.itemCode}: ${it.qty}`)
                    .join(', ')} - not available to return.`}
                />
              )
            );
          })()}

          {(freight.checkout?.cashCollections?.length || 0) === 0 && (
            <Alert style={{ marginBottom: '2px' }} type="warning" message="No payment." showIcon />
          )}
          <ProCard size="small" bordered style={{ marginBottom: '2px' }}>
            <ProTable<DeliveryNoteItem>
              search={false}
              headerTitle={<Typography.Text type="success"> Delivered Items </Typography.Text>}
              size="small"
              options={{
                density: false,
                setting: false,
                reload: false,
              }}
              pagination={false}
              dataSource={freight.deliveryNotes.flatMap((it) => it.items)}
              rowKey="id"
              columns={[
                { title: 'Item Code', dataIndex: 'itemCode' },
                { title: 'Description', dataIndex: 'itemDescription' },
                { title: 'UoM', dataIndex: 'uomCode' },
                { title: 'Qty', render: (_, r) => `${r.actualQty || 0}/${r.qty}`, align: 'right' },
              ]}
              footer={(data) => (
                <Row>
                  <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                    Total
                  </Col>
                  <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                    {`${data.map((it) => it.actualQty || 0)?.reduce((p, c) => p + c, 0)} / ${data
                      .map((it) => it.qty || 0)
                      ?.reduce((p, c) => p + c, 0)}`}
                  </Col>
                </Row>
              )}
            />
          </ProCard>
          {data && (
            <ProCard size="small" bordered style={{ marginBottom: '2px' }}>
              {' '}
              <ProTable<DeliveryNoteDetail>
                search={false}
                headerTitle="Delivery Notes"
                size={'small'}
                options={{
                  density: false,
                  setting: false,
                  reload: false,
                }}
                pagination={false}
                dataSource={data?.deliveryNotes}
                expandable={{
                  expandedRowRender,
                }}
                rowKey="id"
                columns={[
                  {
                    width: 200,
                    title: 'DN Num',
                    dataIndex: 'docNum',
                    align: 'left',
                    render: (_, r) => {
                      const error = r.items.every((it) =>
                        freight.deliveryNotes
                          .flatMap((i) => i.items)
                          .some((i) => i.itemCode === it.itemCode),
                      );
                      return error ? r.docNum : <Alert showIcon type="error" message={r.docNum} />;
                    },
                  },
                  { title: 'Customer Code', dataIndex: 'cardCode', align: 'left' },
                  { title: 'Ship to Code', dataIndex: 'shipToCode' },
                  { title: 'Address', dataIndex: 'address' },
                  { title: 'Total Qty', dataIndex: 'qty', align: 'right' },
                ]}
                footer={(data) => {
                  return (
                    <Row>
                      <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                        <div>Total</div>
                      </Col>
                      <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                        {data?.map((it) => it.qty)?.reduce((p, c) => p + c, 0)}
                      </Col>
                    </Row>
                  );
                }}
              />
            </ProCard>
          )}

          {(checkAmount.returnItems?.filter((it) => (it.qty || 0) > 0)?.length || 0) > 0 && (
            <ProCard size="small" bordered style={{ marginBottom: '2px' }}>
              <ProTable<DeliveryNoteItem>
                search={false}
                headerTitle={<Typography.Text type="warning">Return Items</Typography.Text>}
                size="small"
                options={{
                  density: false,
                  setting: false,
                  reload: false,
                }}
                pagination={false}
                dataSource={checkAmount.returnItems}
                rowKey="id"
                columns={[
                  {
                    width: 200,
                    title: 'Item Code',
                    render: (_, r) =>
                      r.qty < 0 ? <Alert showIcon type="error" message={r.itemCode} /> : r.itemCode,
                  },
                  { title: 'Description', dataIndex: 'itemDescription' },
                  { title: 'UoM', dataIndex: 'uomCode' },
                  { title: 'Qty', dataIndex: 'qty', align: 'right' },
                ]}
                footer={(data) => (
                  <Row>
                    <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                      Total
                    </Col>
                    <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                      {data.map((it) => it.qty || 0)?.reduce((p, c) => p + c, 0)}
                    </Col>
                  </Row>
                )}
              />
            </ProCard>
          )}

          {(data?.invoices?.length || 0) > 0 && (
            <ProCard size="small" bordered style={{ marginBottom: '2px' }}>
              <ProTable<CollectedInvoice>
                search={false}
                rowKey="id"
                headerTitle={<Typography.Text type="success">Invoices </Typography.Text>}
                size={'small'}
                options={{
                  density: false,
                  setting: false,
                  reload: false,
                }}
                pagination={false}
                dataSource={invoices}
                columns={[
                  { title: 'Inv Num', dataIndex: 'docNum', width: 100 },
                  { title: 'Doc Date', dataIndex: 'docDate', width: 100 },
                  { title: 'Customer Code', dataIndex: 'cardCode', align: 'left' },
                  { title: 'Remarks', dataIndex: 'remarks' },
                  { title: 'Amount', dataIndex: 'amount', align: 'right', width: 100 },
                  {
                    title: 'Included',
                    width: 50,
                    render: (_, r) => (
                      <Switch
                        onChange={(checked) => {
                          if (!checked) {
                            setCommentModal({ visible: true, item: r });
                          } else {
                            setInvoices((v) => {
                              const data = v.map((it) => {
                                if (it.docEntry === r.docEntry) {
                                  return { ...it, collected: checked, remarks: undefined };
                                } else {
                                  return it;
                                }
                              });
                              setCheckAmount((v) => ({
                                ...v,
                                currentInvoice: data
                                  .filter((it) => it.collected)
                                  .map((it) => it.amount)
                                  .reduce((p, c) => p + c, 0),
                              }));
                              return data;
                            });
                          }
                        }}
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        checked={r.collected}
                      />
                    ),
                  },
                ]}
                footer={(data) => (
                  <Row>
                    <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                      <Space>
                        {' '}
                        <div>Total</div> {}
                      </Space>
                    </Col>
                    <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                      <div>
                        {data
                          .filter((it) => it.collected)
                          .map((it) => it.amount)
                          .reduce((p, c) => p + c, 0)}
                      </div>
                    </Col>
                    <Col flex={'70px'} />
                  </Row>
                )}
              />
            </ProCard>
          )}

          {(freight.checkout?.cashCollections?.length || 0) > 0 && (
            <ProCard size="small" style={{ marginBottom: '2px' }}>
              <PaymentListView
                title="Cash Collection"
                data={freight.checkout?.cashCollections || []}
              />
            </ProCard>
          )}
        </Spin>
      </ProForm>

      <RemarkModal
        title="Exclude Invoice"
        width="400px"
        open={commentModal.visible}
        onCancel={() => {
          onHide();
        }}
        onSave={(_, remarks) => {
          setInvoices((v) => {
            const data = v.map((it) => {
              if (it.docEntry === commentModal.item?.docEntry) {
                return { ...it, collected: false, remarks: remarks };
              } else {
                return it;
              }
            });

            setCheckAmount((v) => ({
              ...v,
              currentInvoice: data
                .filter((it) => it.collected)
                .map((it) => it.amount)
                .reduce((p, c) => p + c, 0),
            }));
            return data;
          });

          onHide();
        }}
      />
    </FormModalComp>
  );
};
