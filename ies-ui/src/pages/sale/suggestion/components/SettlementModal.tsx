import type { FormModalProps } from '@/components/FormModal';
import { formatDate } from '@/pages/utils';
import type {
  ExchangeRate,
  SettlementModel,
  StockAdjustmentDto,
  StockControlLess,
} from '@/services/sale/data';
import {
  ModalForm,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormMoney,
  ProFormTextArea,
} from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { Card, Col, message, Row, Table, Typography } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import numeral from 'numeral';
import { useCallback, useEffect } from 'react';

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

interface Props extends FormModalProps {
  data?: StockControlLess;
  // exchangeRate?: ExchangeRate;
  dsdExchangeRate?: ExchangeRate;
  actionHandlers: {
    onAddItem?: (item: SettlementModel) => void;
    onCancel?: () => void;
  };
}

interface ModelModalForm {
  settlementDate?: moment.Moment;
  exchangeRate: number;
  invoicesAmount?: number;
  lostAmount?: number;
  systemAmount: number;
  actualAmount?: number;
  actualAmountKH?: number;
  bankAmount?: number;
  remark?: string;
  actualTotalAmount: number;
}

const SettlementModal: React.FC<Props> = ({
  data,
  actionHandlers,
  // exchangeRate,
  loading,
  dsdExchangeRate,
  ...props
}) => {
  const [formModal] = useForm<ModelModalForm>();

  const { Text } = Typography;

  const onResetActionHandler = useCallback(() => {
    const invoiceAmount =
      data?.invoices?.reduce(function (acc, it) {
        return acc + it.amount;
      }, 0) || 0;
    const lostAmount =
      data?.adjustmentItems?.reduce(function (acc, it) {
        return acc + (it.originQuantity - it.adjustQuantity) * it.unitPrice!!;
      }, 0) || 0;
    const systemAmount = invoiceAmount + lostAmount;
    formModal.setFieldsValue({
      actualAmount: 0,
      settlementDate: moment(),
      actualAmountKH: systemAmount * (dsdExchangeRate?.source_amount || 0.0),
      bankAmount: 0,
      exchangeRate: dsdExchangeRate?.source_amount,
      invoicesAmount:
        data?.invoices?.reduce(function (acc, it) {
          return acc + it.amount;
        }, 0) || 0,
      lostAmount:
        data?.adjustmentItems?.reduce(function (acc, it) {
          return acc + (it.originQuantity - it.adjustQuantity) * it.unitPrice!!;
        }, 0) || 0,
      systemAmount: systemAmount,
      remark: '',
      actualTotalAmount: systemAmount,
    });
  }, [
    data?.adjustmentItems,
    data?.invoices,
    dsdExchangeRate?.source_amount,
    // exchangeRate?.target_amount,
  ]);

  useEffect(() => {
    if (!props.open) return;
    onResetActionHandler();
    return () => {
      //   formStock.resetFields();
    };
  }, [onResetActionHandler, props.open]);

  const onSubmitActionHandler = async () => {
    const form = await formModal.validateFields();
    const formData = formModal.getFieldsValue();
    const amountKH = formData.actualAmountKH || 0;
    const amount = formData.actualAmount || 0;
    // const systemAmountKH = form.systemAmount * (dsdExchangeRate?.source_amount ?? 0);
    if (form.systemAmount > calculateActualAmount(formData)) {
      message.error('Settle amount is not correct.');
      return Promise.reject(false);
    } else {
      const item: SettlementModel = {
        amount: amount,
        amountKH: amountKH,
        exchangeRate: form.exchangeRate,
        remark: form.remark || '',
        settlementDate: form.settlementDate!!,
        soldAmount: form.systemAmount,
        stockControlId: data?.id || -1,
        bankAmount: form.bankAmount,
      };
      if (actionHandlers.onAddItem) {
        actionHandlers.onAddItem(item);
      }
      return Promise.resolve(true);
    }
  };

  const _onChange = (changedValues: any, values: ModelModalForm) => {
    const fields = ['exchangeRate', 'actualAmount', 'actualAmountKH', 'bankAmount'];
    
    if (fields.some((it) => it in changedValues) || changedValues) {
      const totalAmount = calculateActualAmount(formModal.getFieldsValue());
      formModal.setFieldsValue({ actualTotalAmount: totalAmount });
    }
  };

  function calculateActualAmount(model: ModelModalForm) {
    // const amount = (model.actualAmountKH || 0) / model.exchangeRate;
    // const actualAmount = model.actualAmount || 0;
    // const backAmount = model.bankAmount || 0;
    
    const amount = (model.actualAmountKH || 0) / model.exchangeRate;
    const actualAmount = (model.actualAmount || 0) ;
    const backAmount = (model.bankAmount || 0) ;
    return actualAmount + amount + backAmount;
  }

  return (
    <ModalForm<ModelModalForm>
      key={`SettlementModal`}
      width="1024px"
      layout={'horizontal'}
      {...layout}
      form={formModal}
      onValuesChange={_onChange}
      autoFocusFirstInput
      submitTimeout={1000}
      //visible={props.visible}
      open={props.open}
      modalProps={{
        onCancel: () => actionHandlers.onCancel && actionHandlers.onCancel(),
        okText: <Text style={{ color: 'white' }}>Submit</Text>,
      }}
      onFinish={onSubmitActionHandler}
    >
      <Card size="small" title={'Settlement'}>
        <Row>
          <Col flex="auto">
            <ProFormDateTimePicker
              initialValue={moment()}
              rules={[{ required: true }]}
              name="settlementDate"
              label="Settlement Date"
              placeholder=""
            />
            <ProFormDigit
              rules={[{ required: true }]}
              initialValue={dsdExchangeRate?.target_amount}
              min={3900}
              max={4200}
              name="exchangeRate"
              label="Exchange Rate"
              width={205}
              fieldProps={{
                formatter: (value) => {
                  return numeral(value).format('0,0');
                },
              }}
            />
            {data?.adjustmentItems && data?.adjustmentItems.length > 0 && (
              <>
                <ProFormDigit
                  name="invoicesAmount"
                  label="Invoices Amount"
                  readonly
                  proFieldProps={{
                    render: () => {
                      const amount =
                        formModal.getFieldValue('invoicesAmount') *
                        (dsdExchangeRate?.target_amount ?? 0);
                      return `${dsdExchangeRate?.target_symbol} ${numeral(amount).format(
                        '0,0.00',
                      )}`;
                    },
                  }}
                  // locale="en-US"
                />
                <ProFormDigit
                  name="lostAmount"
                  label="Lost Amount"
                  readonly
                  proFieldProps={{
                    render: () => {
                      const amount =
                        formModal.getFieldValue('lostAmount') *
                        (dsdExchangeRate?.target_amount ?? 0);
                      return `${dsdExchangeRate?.target_symbol} ${numeral(amount).format(
                        '0,0.00',
                      )}`;
                    },
                  }}
                  //locale="en-US"
                />
              </>
            )}
            <ProFormDigit
              // initialValue={getSystemAmount()}
              name="systemAmount"
              label={`System Amount ${dsdExchangeRate?.target_currency}`}
              readonly
              proFieldProps={{
                render: () => {
                  const amount =
                    formModal.getFieldValue('systemAmount') * (dsdExchangeRate?.target_amount ?? 0);
                  return `${dsdExchangeRate?.target_symbol} ${numeral(amount).format('0,0.00')}`;
                },
              }}
              //locale="en-US"
            />
          </Col>
          <Col flex="auto">
            <ProFormDigit
              name="actualAmount"
              label="Actual Amount USD"
              placeholder="$ 0.00"
              min={0}
            />
            <ProFormDigit
              fieldProps={{
                formatter: (value) => {
                  return numeral(value).format('0,#00');
                },
              }}
              name="actualAmountKH"
              label="Actual Amount KH"
              placeholder=""
              min={0}
            />
            <ProFormDigit name="bankAmount" label="Bank Transfer Amount" placeholder="" min={0} />
            <ProFormTextArea label="Remark" name="remark" placeholder="" />
            <ProFormDigit
              // initialValue={getSystemAmount()}
              name="actualTotalAmount"
              label="Actual Total Amount"
              readonly
              // locale="en-US"
              proFieldProps={{
                render: () => {
                  const amount = formModal.getFieldValue('actualTotalAmount');
                  return `${dsdExchangeRate?.target_symbol} ${numeral(amount).format('0,00.00')}`;
                  // return `${dsdExchangeRate?.target_symbol} ${numeral(t).format('0,00.00')}`;
                },
              }}
              min={0}
            />
          </Col>
        </Row>
      </Card>
      {data?.adjustmentItems && data?.adjustmentItems.length > 0 && (
        <ProTable<StockAdjustmentDto>
          title={() => <Text type="success">Warehouse Report</Text>}
          key={'stockAdjustment'}
          rowKey={(record) => `row-key-${record.itemId}`}
          toolBarRender={false}
          options={{
            density: false,
            setting: false,
            reload: false,
            search: false,
          }}
          search={false}
          dataSource={data?.adjustmentItems}
          summary={(records) => {
            const total = records.reduce(function (acc, it) {
              return acc + (it.originQuantity - it.adjustQuantity) * it.unitPrice!!;
            }, 0);
            const tatalKh = total * (dsdExchangeRate?.target_amount ?? 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} align="right" colSpan={6}>
                  <Text type="danger">Total</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text type="danger">{`$ ${numeral(tatalKh).format( '0,0.00' )}`}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
          columns={[
            {
              title: 'Product Name',
              dataIndex: 'itemName',
            },
            {
              title: 'Adjust By',
              dataIndex: 'adjustBy',
            },
            {
              title: 'Adj. Date',
              //dataIndex: 'invoiceNo'
              render: (_, r) => {
                return formatDate(r.adjustmentDate);
              },
            },
            {
              title: 'Reason',
              width: 200,
              dataIndex: 'reason',
            },
            {
              title: 'Lost Quantity',
              align: 'right',
              render: (_, r) => {
                return r.originQuantity - r.adjustQuantity;
              },
            },
            {
              title: 'Default Price',
              align: 'right',
              render: (_, r) => {
                const unitPriceKh = (dsdExchangeRate?.target_amount ?? 0) * (r.unitPrice ?? 0);
                return `${dsdExchangeRate?.target_symbol} ${numeral(unitPriceKh).format('0,0.00')}`;
              },
            },
            {
              title: 'Amount',
              align: 'right',
              render: (_, r) => {
                const amount = (r.originQuantity - r.adjustQuantity) * r.unitPrice!!;
                const amountKh = amount * (dsdExchangeRate?.target_amount ?? 0);
                return `${dsdExchangeRate?.target_symbol} ${numeral(amountKh).format('0,0.00')}`;
              },
            },
          ]}
        />
      )}
    </ModalForm>
  );
};

export default SettlementModal;
