import DescriptionDisplay, { DescriptionDisplayDataItem } from '@/components/Descriptions';
import { formatDateTime } from '@/pages/utils';
import {
  SalesTeamWorkLess,
  SettlementLess,
  SettlementLessDto,
  StockDetailItemSettle,
} from '@/services/sale/data';
import { FooterToolbar, ProForm, ProFormCheckbox, ProFormDateTimePicker, ProFormDigit, ProFormMoney, ProFormText, ProFormTextArea } from '@ant-design/pro-components';

import { EditableProTable } from '@ant-design/pro-table';
import { Card, Col, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import numeral from 'numeral';
import { useEffect, useState } from 'react';
const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

type Props = {
  forceUpdate: number;
  data: {
    id: number;
    soldAmount?: number;
    salespersonList?: SalesTeamWorkLess[];
    isOpen: boolean;
    dataSource: StockDetailItemSettle[];
    settlementDetail?: SettlementLessDto;
  };
  actionHandlers?: {
    onSettlementAction: (item: SettlementLess) => void;
  };
};

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

const StockControlDetailTabItem: React.FC<Props> = ({ data, forceUpdate, actionHandlers }) => {
  const [formSettlement] = useForm<SettlementLess>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<StockDetailItemSettle[]>([]);
  const [isRemarkRequired, setIsRemarkRequired] = useState<boolean>(false);

  const [totalAmount, setTotalAmount] = useState<number>(0);

  useEffect(() => {
    if (forceUpdate) {
      formSettlement.setFieldsValue({ soldAmount: data.soldAmount });
      setDataSource(data.dataSource);
    }
  }, [forceUpdate]);

  useEffect(() => {
    setDataSource(data.dataSource);
  }, []);

  useEffect(() => {
    if (data.settlementDetail) {
      setTotalAmount(calculateTotalAmount(data.settlementDetail));
    }
  }, [data.settlementDetail]);

  const onSettlementActionHandle = async () => {
    const dataForm = await formSettlement.validateFields();

    const item: SettlementLess = {
      ...dataForm,
      stockDetails: dataSource.map((it) => ({ ...it, isSettle: dataForm.isKeepForwarding })),
      //salespersonCode: data.salespersonCode,
      stockControlId: data.id,
    };
    console.log(item);
    actionHandlers?.onSettlementAction(item);
  };

  const onCustomResetActionHandle = () => {
    formSettlement.setFieldsValue({
      isKeepForwarding: true,
      settlementDate: moment(),
      exchangeRate: 4000,
      amount: undefined,
      amountKH: undefined,
      remark: undefined,
    });
  };

  const isSubmitted = () => {
    return (data.soldAmount || 0) > 0 && dataSource.length > 0;
  };

  const generalInfo: (DescriptionDisplayDataItem | undefined)[] = [
    { label: 'Settlement Date', value: formatDateTime(data.settlementDetail?.settlementDate) },
    { label: 'Cashier', value: data.settlementDetail?.cashierName },
    {
      label: 'Exchange Rate',
      value: numeral(data.settlementDetail?.exchangeRate).format('៛ 0,0'),
    },
    {
      label: 'Actual Amount USD',
      value: numeral(data.settlementDetail?.amount).format('$ 0,0.00'),
    },

    { label: 'System Amount', value: numeral(data.soldAmount).format('$ 0,0.00') },

    {
      label: 'Actual Amount KH',
      value: numeral(data.settlementDetail?.amountKH).format('0,0'),
    },
    {
      label: 'Remark',
      value: data.settlementDetail?.remark,
    },
    {
      label: 'Bank Transfer Amount',
      value: numeral(data.settlementDetail?.bankAmount).format('$ 0,0.00'),
      //value: numeral(data.details?.cashOnHand).format('$ 0,0.00'),
    },

    { label: '', value: '' },
    { label: 'Actual Total Amount', value: numeral(totalAmount).format('$ 0,0.00') },
  ];

  const calculateTotalAmount = (settlement: SettlementLessDto | undefined): number => {
    return settlement
      ? settlement.amountKH / settlement.exchangeRate + settlement.amount + settlement.bankAmount
      : 0;
    // return numeral(total).format('$ 0,0.00');
  };

  return (
    <ProForm<SettlementLess>
      form={formSettlement}
      {...layout}
      submitter={{
        onReset: () => onCustomResetActionHandle(),
        onSubmit: () => onSettlementActionHandle(),
        render: (_, dom) => {
          return (
            data.isOpen && (
              <FooterToolbar>
                {dom}
                {/* {dom[0]}
                {isSubmitted() && dom[1]} */}
              </FooterToolbar>
            )
          );
        },
      }}
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
          //onChange={setDataSource}
          onValuesChange={setDataSource}
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
              setDataSource(d);
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
              title: 'UoM',
              dataIndex: 'uom',
              readonly: true,
              align: 'center',
              width: 60,
            },
            {
              title: 'Beginning Stock',
              align: 'right',
              dataIndex: 'beginningQty',
              readonly: true,
              width: 130,
            },
            {
              title: 'Request Stock',
              align: 'right',
              dataIndex: 'quantity',
              readonly: true,
              width: 130,
            },
            {
              title: 'Total Stock',
              align: 'right',
              dataIndex: 'totalQty',
              readonly: true,
              width: 130,
            },
            {
              title: 'Stock Used',
              align: 'right',
              dataIndex: 'soldQty',
              readonly: true,
              width: 130,
            },
            {
              title: 'End Stock',
              align: 'right',
              dataIndex: 'endQty',
              readonly: true,
              width: 100,
            },
            {
              title: 'Actual Balance',
              align: 'right',
              dataIndex: 'actualQty',
              valueType: 'digit',
              formItemProps: {
                rules: [
                  {
                    required: true,
                    message: 'Please Enter',
                  },
                ],
              },
              width: 130,
            },
            {
              title: 'Remark',
              dataIndex: 'remark',
              valueType: 'text',
              // ellipsis: true,
              formItemProps: {
                rules: [
                  {
                    required: isRemarkRequired,
                    message: 'Please enter remark',
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
                isSubmitted() && data.isOpen && (
                  <a
                    key="editable"
                    onClick={() => {
                      if (!action?.isEditable)
                        setIsRemarkRequired(record.endQty !== record.actualQty);
                      action?.startEditable?.(record.id || 0);
                    }}
                  >
                    Edit
                  </a>
                ),
              ],
            },
          ]}
        />

        <ProFormCheckbox
          name="isKeepForwarding"
          label="Stock balance is to be carried Forward"
          initialValue={
            data.settlementDetail === null ? true : data.settlementDetail?.isKeepForwarding
          }
          disabled={data.settlementDetail !== null}
        />
      </Card>

      {data.settlementDetail && (
        <Card size="small" title={'Settlement'}>
          <DescriptionDisplay data={generalInfo} column={2} />
        </Card>
      )}
      {data.settlementDetail === null && (
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
                initialValue={data.soldAmount}
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
      )}
    </ProForm>
  );
};

export default StockControlDetailTabItem;
