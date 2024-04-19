import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { SettlementLess, StockDetailItemSettle } from '@/services/sale/data';
import ProForm, {
  ProFormCheckbox,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormMoney,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { EditableProTable } from '@ant-design/pro-table';
import { Button, Card, Col, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import numeral from 'numeral';
import { useEffect, useState } from 'react';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export interface Props extends FormModalProps {
  //   forceUpdate: number;
  isLoading: boolean;
  data: {
    id: number;
    soldAmount?: number;
    salespersonCode: string;
    // isOpen: boolean;
    // saleInvoiceList?: SaleInvoiceLess[];
    dataSource: StockDetailItemSettle[];
    //settlementDetail?: SettlementLessDto;
  };
  actionHandlers?: {
    onSettlementAction: (item: SettlementLess) => void;
  };
}

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

const SettlementFormModal: React.FC<Props> = ({
  data,
  // forceUpdate,
  actionHandlers,
  ...rest
}) => {
  const [formSettlement] = useForm<SettlementLess>();

  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<StockDetailItemSettle[]>([]);
  const [isRemarkRequired, setIsRemarkRequired] = useState<boolean>(false);

  //   const [totalAmount, setTotalAmount] = useState<number>(0);

  //   useEffect(() => {
  //     if (forceUpdate) {
  //       formSettlement.setFieldsValue({ soldAmount: data.soldAmount });
  //       setDataSource(data.dataSource);
  //     }
  //   }, [forceUpdate]);

  useEffect(() => {
    if (!rest.open) return;
    setDataSource(data.dataSource);
    console.log(data.soldAmount);
    formSettlement.resetFields();
    formSettlement.setFieldsValue({ soldAmount: data.soldAmount });
    // () => {
    // };
  }, [rest.open]);

  //   useEffect(() => {
  //     if (data.settlementDetail) {
  //       setTotalAmount(calculateTotalAmount(data.settlementDetail));
  //     }
  //   }, [data.settlementDetail]);

  const onSettlementActionHandle = async () => {
    const dataForm = await formSettlement.validateFields();

    const item: SettlementLess = {
      ...dataForm,
      stockDetails: dataSource.map((it) => ({ ...it, isSettle: dataForm.isKeepForwarding })),
      salespersonCode: data.salespersonCode,
      stockControlId: data.id,
    };
    console.log(item);
    actionHandlers?.onSettlementAction(item);
  };

  const onCustomResetActionHandle = () => {
    formSettlement.resetFields();
    formSettlement.setFieldsValue({
      isKeepForwarding: true,
      settlementDate: moment(),
      exchangeRate: 4000,
      amount: undefined,
      amountKH: undefined,
      remark: undefined,
    });
  };

  //   const isSubmitted = () => {
  //     return (data.soldAmount || 0) > 0 && dataSource.length > 0;
  //   };

  //   const generalInfo: (DescriptionDisplayDataItem | undefined)[] = [
  //     { label: 'Settlement Date', value: formatDate(data.settlementDetail?.settlementDate) },
  //     { label: 'Cashier', value: data.settlementDetail?.cashierName },
  //     {
  //       label: 'Exchange Rate',
  //       value: numeral(data.settlementDetail?.exchangeRate).format('៛ 0,0'),
  //     },
  //     {
  //       label: 'Actual Amount Dollar',
  //       value: numeral(data.settlementDetail?.amount).format('$ 0,0.00'),
  //     },

  //     { label: 'System Amount', value: numeral(data.soldAmount).format('$ 0,0.00') },

  //     {
  //       label: 'Actual Amount Riel',
  //       value: numeral(data.settlementDetail?.amountKH).format('0,0'),
  //     },
  //     {
  //       label: 'Remark',
  //       value: data.settlementDetail?.remark,
  //     },
  //     {
  //       label: 'Bank Transfer Amount',
  //       value: numeral(data.settlementDetail?.bankAmount).format('$ 0,0.00'),
  //       //value: numeral(data.details?.cashOnHand).format('$ 0,0.00'),
  //     },

  //     { label: '', value: '' },
  //     { label: 'Actual Total Amount', value: numeral(totalAmount).format('$ 0,0.00') },
  //   ];

  //   const calculateTotalAmount = (settlement: SettlementLessDto | undefined): number => {
  //     return settlement
  //       ? settlement.amountKH / settlement.exchangeRate + settlement.amount + settlement.bankAmount
  //       : 0;
  //     // return numeral(total).format('$ 0,0.00');
  //   };

  return (
    <FormModalComp
      {...rest}
      width="1024px"
      footer={[
        <Button key="button" onClick={() => rest.onCancel && rest.onCancel()}>
          Cancel
        </Button>,
        <Button key="reset" onClick={onCustomResetActionHandle}>
          Reset
        </Button>,

        <Button
          loading={rest.loading}
          key="submit"
          type="primary"
          disabled={rest.isLoading}
          onClick={onSettlementActionHandle}
        >
          Submit
        </Button>,
      ]}
    >
      <ProForm<SettlementLess>
        form={formSettlement}
        {...layout}
        submitter={false}
        autoFocusFirstInput
        //onValuesChange={onValuesChange}
        layout="horizontal"
      >
        <Card size="small" title="Stock" style={{ marginBottom: 10 }}>
          <EditableProTable<StockDetailItemSettle>
            rowKey="id"
            // scroll={{
            //   x: 960,
            // }}
            recordCreatorProps={false}
            //actionRef={actionRef}
            value={dataSource}
            // onChange={setDataSource}
            onValuesChange={setDataSource}
            // onDataSourceChange={setDataSource}
            editable={{
              onlyOneLineEditorAlertMessage:
                'Please save the editing record, before start edit a new record.',
              type: 'single',
              editableKeys,
              onSave: async (rowKey, data, row) => {
                console.log(rowKey, data, row);
                await waitTime(200);
              },
              onValuesChange: (r, d) => {
                setIsRemarkRequired(r.endQty !== r.actualQty);
                if (r.remark) {
                  setDataSource(d);
                }
              },
              onChange: setEditableRowKeys,
              actionRender: (_row, _config, dom) => [dom.save, dom.cancel],
            }}
            columns={[
              // {
              //   title: 'Expired Date',
              //   readonly: true,
              //   valueType: 'date',
              //   dataIndex: 'expiredDate',
              //   width: 120,
              // },
              {
                title: 'Batch #',
                readonly: true,
                //valueType: 'date',
                dataIndex: 'batchNo',
                width: 120,
              },
              {
                title: 'Product Name',
                dataIndex: 'itemName',
                readonly: true,
              },
              {
                title: 'Begin Stock',
                align: 'right',
                dataIndex: 'beginningQty',
                readonly: true,
              },
              {
                title: 'Request Stock',
                align: 'right',
                dataIndex: 'quantity',
                readonly: true,
              },
              {
                title: 'Total Stock',
                align: 'right',
                dataIndex: 'totalQty',
                readonly: true,
              },
              {
                title: 'Stock Used',
                align: 'right',
                dataIndex: 'soldQty',
                readonly: true,
              },
              {
                title: 'End Stock',
                align: 'right',
                dataIndex: 'endQty',
                readonly: true,
              },
              {
                title: 'Actual Balance',
                align: 'right',
                dataIndex: 'actualQty',
                valueType: 'digit',
                width: 100,
                formItemProps: {
                  rules: [
                    {
                      required: true,
                      message: 'Please Enter',
                    },
                  ],
                },
              },
              {
                title: 'Remark',
                dataIndex: 'remark',
                valueType: 'text',
                // ellipsis: true,
                width: 120,
                formItemProps: {
                  rules: [
                    {
                      required: isRemarkRequired,
                      message: 'Please enter remark',
                      whitespace: false,
                    },
                  ],
                },
              },
              {
                // title: '',
                valueType: 'option',
                align: 'right',
                width: 120,
                render: (_text, record, _, action) => [
                  <a
                    key="editable"
                    onClick={() => {
                      if (!action?.isEditable)
                        setIsRemarkRequired(record.endQty !== record.actualQty);
                      action?.startEditable?.(record.id || 0);
                    }}
                  >
                    Edit
                  </a>,
                ],
              },
            ]}
          />

          <ProFormCheckbox
            name="isKeepForwarding"
            label="Stock balance is to be carried Forward"
            initialValue={true}

            // initialValue={
            //   data.settlementDetail === null ? true : data.settlementDetail?.isKeepForwarding
            // }
            // disabled={data.settlementDetail !== null}
          />
        </Card>

        {/* {data.settlementDetail && (
          <Card size="small" title={'Settlement'}>
            <DescriptionDisplay data={generalInfo} column={2} />
          </Card>
        )}
        {data.settlementDetail === null && ( */}
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
              <ProFormMoney
                rules={[{ required: true }]}
                initialValue={4000}
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
              <ProFormMoney
                // initialValue={data.soldAmount}
                name="soldAmount"
                label="System Amount USD"
                readonly
                locale="en-US"
              />
            </Col>
            <Col flex="auto">
              <ProFormText
                rules={[{ required: true }]}
                label="Cashier"
                name="cashierName"
                placeholder=""
              />
              <ProFormMoney name="amount" label="Actual Amount USD" placeholder="" min={0} />
              <ProFormDigit
                fieldProps={{
                  formatter: (value) => {
                    return numeral(value).format('0,0');
                  },
                }}
                name="amountKH"
                label="Actual Amount KH"
                placeholder=""
                min={0}
              />
              <ProFormMoney name="bankAmount" label="Bank Transfer Amount" placeholder="" min={0} />
              <ProFormTextArea label="Remark" name="remark" placeholder="" />
            </Col>
          </Row>
        </Card>
        {/* )} */}
      </ProForm>
    </FormModalComp>
  );
};

export default SettlementFormModal;
