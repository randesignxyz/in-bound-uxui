import type { FormModalProps } from '@/components/FormModal';
import FormModalComp from '@/components/FormModal';
import type {
  ExchangeRate,
  StockControlLess,
} from '@/services/sale/data';
import { queryCurrent } from '@/services/user';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { ActionType, EditableFormInstance, EditableProTable, ProDescriptions, ProForm, ProFormTextArea } from '@ant-design/pro-components';
import {
  ProFormDateTimePicker,
  ProFormDigit,
} from '@ant-design/pro-form';
import { Alert, Button, Card, Col, Flex, message, Row, Typography, Upload } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import numeral from 'numeral';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props extends FormModalProps {
  data?: StockControlLess;
  dsdExchangeRate?: ExchangeRate;
  onSave: (item: SettlementEntry) => void;
}

const SettlementModal: React.FC<Props> = ({ data, onSave, dsdExchangeRate, ...props }) => {
  const [form] = useForm<SettlementEntry>();
  const { Text } = Typography;
  const [settlemetData, setSettlementData] = useState<SettleMethod[]>();
  const editableFormRef = useRef<EditableFormInstance>();
  const actionRef = useRef<ActionType>();

  const innitalAmount = () => {
    const invoiceAmount = data?.invoices?.reduce((acc, it) => acc + it.amount, 0) || 0;
    const lostAmount = data?.adjustmentItems?.reduce((acc, it) => (acc + (it.originQuantity - it.adjustQuantity) * it.unitPrice!!), 0) || 0;
    return parseFloat(numeral(invoiceAmount + lostAmount).format("0,000.00"));
  }

  useEffect(() => {
    props.open && form.resetFields();
  }, [props.open]);
  useEffect(() => {
    props.open && setSettlementData([]);
  }, [data?.id, props.open]);

  const disableButton = useCallback(() => {
    const exchangeRate= form.getFieldValue("exchangeRate")
      
    const amount = settlemetData?.reduce((p, c) => {
      return {
        amount: c.currency === "USD" ? p.amount + c.amount : p.amount,
        amountKH: c.currency !== "USD" ? p.amountKH + (c.amount / (exchangeRate || dsdExchangeRate)) : p.amountKH,
      };
    }, { amount: 0, amountKH: 0 });
    return settlemetData?.some(p => ((amount?.amount || 0) + (amount?.amountKH || 0)) < innitalAmount() && settlemetData.length > 0 ? true : false)
  }, [settlemetData])

  return <FormModalComp
    {...props}
    disabled={disableButton()}
    title='Settlement Information'
    onSubmit={async () => {
      const formData = await form.validateFields();
      await editableFormRef.current?.validateFields();
      const cashierName = await queryCurrent();
      const amount = settlemetData?.reduce((p, c) => {
        return {
          amount: c.currency === "USD" ? p.amount + c.amount : p.amount,
          amountKH: c.currency !== "USD" ? p.amountKH + c.amount  : p.amountKH,
        };
      }, { amount: 0, amountKH: 0 });
      const entry: SettlementEntry = {
        ...formData,
        salespersonCode: data?.owner.split("-")[0].trim(),
        ...amount,
        cashierId: -1,
        cashierName: cashierName.login,
        storeId: data?.storeId,
        stockControlId: data?.id,
        isKeepForwarding: data?.isKeepForwarding,
        stockCountId: data?.stockCountId,
        items: settlemetData?.map((p) => ({ ...p, exchangeRate: p.currency =="USD"?1:formData.exchangeRate }))
      }
      if (settlemetData?.length) {
        onSave(entry);
      }
      else {
        message.warning("Please make the payment.")
      }
    }}
  >
    <Flex vertical gap={12}>
      <ProForm submitter={false} form={form}>
        <Flex vertical gap={12}>
          <Alert
            description={
              <ProDescriptions<StockControlLess>
                dataSource={data}
                contentStyle={{
                  fontWeight: 500,
                }}
                columns={[
                  {
                    title: "Store Name",
                    dataIndex: "stockName"
                  },
                  {
                    title: "Owner",
                    dataIndex: "owner"
                  },
                  {
                    title: "Invoice Count",
                    render: (_, r) => <Typography.Text type='success'>{r.invoices?.length}</Typography.Text>
                  },
                  {
                    title: "Items Count",
                    render: (_, r) => <Typography.Text type='warning'>{r.items?.length}</Typography.Text>
                  },
                  {
                    title: "System Amount USD",
                    render: (_, r) => {
                      const invoiceAmount = data?.invoices?.reduce((acc, it) => acc + it.amount, 0) || 0;
                      const lostAmount = data?.adjustmentItems?.reduce((acc, it) => (acc + (it.originQuantity - it.adjustQuantity) * it.unitPrice!!), 0) || 0;
                      const systemAmount = invoiceAmount + lostAmount;
                      return <Typography.Text type='success'>{numeral(systemAmount).format("$ 0,000.00")}</Typography.Text>
                    }
                  },
                ]}
              />}
          />
          <Card size='small' >
            <Row gutter={12} >
              <Col span={6}>
                <ProFormDateTimePicker
                  label="Settlement Date"
                  name={"settlementDate"}
                  rules={[{ required: true }]}
                  initialValue={moment()}
                />
              </Col>
              <Col span={6}>
                <ProFormDigit
                  label="Exchange Rate"
                  name={"exchangeRate"}
                  rules={[{ required: true }]}
                  initialValue={dsdExchangeRate?.target_amount}
                  fieldProps={{
                    onChange:(value) =>{
                      actionRef.current?.reload?.();
                    },
                    formatter: (value) => {
                      return numeral(value).format('0,0');
                    },
                  }}
                />
              </Col>
              <Col span={12}>
                <ProFormTextArea
                  name={"remark"}
                  label={"Remark"}
                  fieldProps={{
                    rows: 1
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Flex>
      </ProForm>
      <Card
        size='small'
        styles={{ body: { margin: 0, padding: 0 } }}
        title="Payment Method"
      >
        <EditableProTable<SettleMethod>
          ghost
          size='small'
          rowKey={"key"}
          value={settlemetData}
          editableFormRef={editableFormRef}
          actionRef={actionRef}
          onValuesChange={setSettlementData}
          recordCreatorProps={{
            record: (_, row) => ({ ...row[_], key: (Math.random() * 1000000).toFixed(0) }),
            newRecordType: "dataSource",
            creatorButtonText: "New",
          }}
          editable={{
            type: "multiple",
            actionRender: (r, e, p) => [
              <Button icon={<DeleteOutlined />} type='link' danger onClick={() => e.onDelete?.(r.key || "", r)} />
            ],
          }}
          columns={[
            {
              title: "Method Type",
              dataIndex: "settlementMethod",
              valueType: "select",
              initialValue: "Cash",
              formItemProps: {
                rules: [
                  { required: true }
                ]
              },
              fieldProps: {
                required: true,
                options: [
                  {
                    label: 'Cash',
                    value: 'Cash',
                  },
                  {
                    label: 'Bank',
                    value: 'Bank',
                  },
                ],
                placeholder: '',
              },
            },
            {
              title: "Bank Name",
              dataIndex: "bankName",
              valueType: "text",
              formItemProps: (f, c) => {
                return {
                  rules: [
                    {
                      required: c.entity.settlementMethod === "Bank" ? true : false
                    }
                  ]
                }
              }
            },
            {
              title: "Currency",
              dataIndex: "currency",
              valueType: "select",
              initialValue: "USD",
              fieldProps: {
                options: [
                  {
                    label: 'USD',
                    value: 'USD',
                  },
                  {
                    label: 'KHR',
                    value: 'KHR',
                  }
                ],
                placeholder: '',
              },
            },
            {
              title: "Amount",
              dataIndex: "amount",
              valueType: "digit",
              initialValue: 0,
              formItemProps: {
                rules: [
                  { required: true },
                  {
                    validator: (_, value) => {
                      return value === 0
                        ? Promise.reject('Quantity sould be greater than 0.')
                        : Promise.resolve(undefined);
                    },
                    whitespace: false,
                  },
                ]
              },
              render: (_, r) => {
                if (r.currency === "USD") {
                  return numeral(r.amount).format("$ 0,000.00")
                }
                else {
                  return numeral(r.amount).format("R 0,000")
                }
              },
              fieldProps: {
                placeholder: "",
              }
            },
            {
              title: "Reference No",
              dataIndex: "referenceNo"
            },
            {
              valueType: "option",
              render: (_text, record, _, action) => [
                <Upload><Button icon={<UploadOutlined />} /></Upload>,
                <Button
                  type='link'
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => {
                    setSettlementData((prev) => prev?.filter(o => o.key !== record.key))
                    actionRef.current?.reload?.();
                  }}
                />,
              ]
            }
          ]}
        />
      </Card>
      <Flex justify='flex-end' align='flex-end'>

        <Card size='small' style={{ width: "350px" }}>
          <ProDescriptions<{
            actionAmount: number;
            actionAmountKHR: number;
          }>
            colon={false}
            column={1}
            size='small'
            contentStyle={{
              fontWeight: 500,
             display:"flex",
             justifyContent:"flex-end"
            }}
            labelStyle={{
              width: "200px"
            }}
            actionRef={actionRef}
            dataSource={settlemetData?.reduce((p, c) => {
              return {
                actionAmount: c.currency === "USD" ? p.actionAmount + c.amount : p.actionAmount,
                actionAmountKHR: c.currency !== "USD" ? p.actionAmountKHR + (c.amount) : p.actionAmountKHR,
              };
            }, { actionAmount: 0, actionAmountKHR: 0 })}
            columns={[
              {
                title: "Actual Amount Total (USD)",
                render: (_, r) => {
                  return <Text type='success'>{numeral(r.actionAmount).format("$ 0,000.00")}</Text>
                }
              },
              {
                title: "Actual Amount Total (KHR)",
                render: (_, r) => <Text type='success'>៛​ {numeral(r.actionAmountKHR||0).format(" 0,#00")}</Text>
              },
              {
                title: "Actual Total",
                render: (_, r) => {
                  const exch = form.getFieldValue("exchangeRate")
                  const total = r.actionAmount + ((r.actionAmountKHR ||0) / (exch || 0));
                  return <Typography.Text type='warning'>{numeral(total).format("$ 0,000.00")}</Typography.Text>
                }
              }
            ]}
          />
        </Card>
      </Flex>
    </Flex>
  </FormModalComp>


  // return (
  //   <ModalForm<ModelModalForm>
  //     key={`SettlementModal`}
  //     width="1024px"
  //     layout={'horizontal'}
  //     // {...layout}
  //     form={formModal}
  //     onValuesChange={_onChange}
  //     autoFocusFirstInput
  //     submitTimeout={1000}

  //     open={props.open}
  //     modalProps={{
  //       onCancel: () => actionHandlers.onCancel && actionHandlers.onCancel(),
  //       okText: <Text style={{ color: 'white' }}>Submit</Text>,

  //     }}
  //     title="Settlement"
  //     onFinish={onSubmitActionHandler}
  //   >

  //     <Space direction='vertical' size={12}>
  //       <Alert
  //         description={
  //           <ProDescriptions<StockControlLess>
  //             dataSource={data}
  //             contentStyle={{
  //               fontWeight: 500,
  //             }}
  //             columns={[
  //               {
  //                 title: "Store Name",
  //                 dataIndex: "stockName"
  //               },
  //               {
  //                 title: "Owner",
  //                 dataIndex: "owner"
  //               },
  //               {
  //                 title: "Invoice Count",
  //                 render: (_, r) => <Typography.Text type='success'>{r.invoices?.length}</Typography.Text>
  //               },
  //               {
  //                 title: "Items Count",
  //                 render: (_, r) => <Typography.Text type='warning'>{r.items?.length}</Typography.Text>
  //               },
  //               {
  //                 title: "System Amount USD",
  //                 render: (_, r) => {
  //                   const invoiceAmount = data?.invoices?.reduce((acc, it) => acc + it.amount, 0) || 0;
  //                   const lostAmount = data?.adjustmentItems?.reduce((acc, it) => (acc + (it.originQuantity - it.adjustQuantity) * it.unitPrice!!), 0) || 0;
  //                   const systemAmount = invoiceAmount + lostAmount;
  //                   return <Typography.Text type='success'>{numeral(systemAmount).format("$ 0,000.00")}</Typography.Text>
  //                 }
  //               },
  //             ]}
  //           />}
  //       />

  //       <Card size='small' >
  //         <ProFormGroup>
  //           <ProFormDateTimePicker
  //             label="Settlement Date"
  //             name={"settlementDate"}
  //             rules={[{ required: true }]}
  //             initialValue={moment()}
  //           />
  //           <ProFormDigit
  //             label="Exchange Rate"
  //             name={"exchangeRate"}
  //             rules={[{ required: true }]}
  //             initialValue={dsdExchangeRate?.target_amount}
  //             fieldProps={{
  //               formatter: (value) => {
  //                 return numeral(value).format('0,0');
  //               },
  //             }}
  //           />
  //         </ProFormGroup>
  //       </Card>
  //       <Card size='small' styles={{ body: { margin: 0, padding: 0 } }} title="Payment Method">
  //         <EditableProTable<SettleMethod, { key: string }>
  //           size='small'
  //           rowKey={"key"}
  //           value={settlemetData}
  //           formRef={editableFormRef}
  //           actionRef={actionRef}
  //           onValuesChange={setSettlementData}
  //           recordCreatorProps={{
  //             record: () => ({ key: (Math.random() * 1000000).toFixed(0) }),
  //             newRecordType: "dataSource",
  //             creatorButtonText: "New",

  //           }}
  //           editable={{
  //             type: "multiple",
  //             onCancel: (key, record, originRow, newLineConfig) => {
  //               setSettlementData(p => (p?.filter(o => o.key !== key)))
  //             },
  //             onValuesChange: () => {
  //               console.log(settlemetData?.reduce((p, c) => {
  //                 return {
  //                   actionAmount: c.currency === "USD" ? p.actionAmount + c.amount : p.actionAmount,
  //                   actionAmountKHR: c.currency !== "USD" ? p.actionAmountKHR + (c.amount / exchangeRate) : p.actionAmountKHR,
  //                 };
  //               }, { actionAmount: 0, actionAmountKHR: 0 }));

  //             },

  //           }}
  //           columns={[
  //             {
  //               title: "Method Type",
  //               dataIndex: "settlementMethod",
  //               valueType: "select",
  //               initialValue: "Cash",
  //               formItemProps: {
  //                 rules: [
  //                   { required: true }
  //                 ]
  //               },
  //               fieldProps: {
  //                 required: true,
  //                 options: [
  //                   {
  //                     label: 'Cash',
  //                     value: 'Cash',
  //                   },
  //                   {
  //                     label: 'Bank',
  //                     value: 'Bank',
  //                   }
  //                 ],
  //                 placeholder: '',
  //               },
  //             },
  //             {
  //               title: "Bank Name",
  //               dataIndex: "bankName",
  //               valueType: "text",
  //               formItemProps: (f, c) => {
  //                 return {
  //                   rules: [
  //                     {
  //                       required: c.entity.settlementMethod === "Bank" ? true : false
  //                     }
  //                   ]
  //                 }
  //               }
  //             },
  //             {
  //               title: "Currency",
  //               dataIndex: "currency",
  //               valueType: "select",
  //               initialValue: "USD",
  //               fieldProps: {
  //                 options: [
  //                   {
  //                     label: 'USD',
  //                     value: 'USD',
  //                   },
  //                   {
  //                     label: 'KHR',
  //                     value: 'KHR',
  //                   }
  //                 ],
  //                 placeholder: '',
  //               },
  //             },
  //             {
  //               title: "Amount",
  //               dataIndex: "amount",
  //               valueType: "digit",
  //               initialValue: 0,
  //               formItemProps: {
  //                 rules: [
  //                   { required: true },
  //                   {
  //                     validator: (_, value) => {
  //                       return value === 0
  //                         ? Promise.reject('Quantity sould be greater than 0.')
  //                         : Promise.resolve(undefined);
  //                     },
  //                     whitespace: false,
  //                   },
  //                 ]
  //               },
  //               render: (_, r) => {
  //                 if (r.currency === "USD") {
  //                   return numeral(r.amount).format("$ 0,000.00")
  //                 }
  //                 else {
  //                   return numeral(r.amount).format("R 0,000")
  //                 }
  //               },
  //               fieldProps: {
  //                 placeholder: "",
  //               }
  //             },
  //             {
  //               title: "Reference No",
  //               dataIndex: "referenceNo"
  //             },
  //             {
  //               valueType: "option",
  //               render: (_text, record, _, action) => [
  //                 <Button
  //                   type='link'
  //                   icon={<DeleteOutlined />}
  //                   danger
  //                   onClick={() => {
  //                     setSettlementData((prev) => prev?.filter(o => o.key !== record.key))
  //                     actionRef.current?.reload?.();
  //                   }}
  //                 />,
  //               ]
  //             }
  //           ]}
  //         />
  //       </Card>
  //       <Flex justify='flex-end' align='flex-end'>
  //         <Card size='small' style={{ width: "300px" }}>
  //           {/* <Table
  //             showHeader={false}
  //             size='small'
  //             columns={[
  //               {
  //                 title: "",
  //                 dataIndex: "label",
  //               },
  //               {
  //                 title: "",
  //                 dataIndex: "actionAmount",
  //                 align: "right",
  //                 render: (_, r) => {
  //                   return <Text type='success'>{numeral(r.value).format("$ 0,000.00")}</Text>
  //                 }
  //               },
  //             ]}
  //             dataSource={[
  //               {
  //                 label:"Actual Amount Total (USD)",
  //                 value:settlemetData?.reduce((p, c) => {
  //                     return  c.currency === "USD" ? p + c.amount : p;
  //                   },0)
  //               },
  //               {
  //                 label:"Actual Amount Total (KHR)",
  //                 value:settlemetData?.reduce((p, c) => {
  //                     return  c.currency !== "USD" ? p + c.amount : p;
  //                   },0)
  //               },
  //               {
  //                 label:"Actual Total",
  //                 value:settlemetData?.reduce((p, c) => {
  //                     return  c.currency !== "USD" ? p + c.amount : p;
  //                   },0)
  //               },
  //             ]}
  //           /> */}
  //           <ProDescriptions<{
  //             actionAmount: number;
  //             actionAmountKHR: number;
  //           }>
  //             column={1}
  //             size='small'
  //             contentStyle={{
  //               fontWeight: 500
  //             }}
  //             labelStyle={{
  //               width: "200px"
  //             }}
  //             // bordered
  //             actionRef={actionRef}
  //             dataSource={settlemetData?.reduce((p, c) => {
  //               return {
  //                 actionAmount: c.currency === "USD" ? p.actionAmount + c.amount : p.actionAmount,
  //                 actionAmountKHR: c.currency !== "USD" ? p.actionAmountKHR + (c.amount) : p.actionAmountKHR,
  //               };
  //             }, { actionAmount: 0, actionAmountKHR: 0 })}
  //             columns={[
  //               {
  //                 title: "Actual Amount Total (USD)",

  //                 render: (_, r) => {
  //                   return <Text type='success'>{numeral(r.actionAmount).format("$ 0,000.00")}</Text>
  //                 }
  //               },
  //               {
  //                 title: "Actual Amount Total (KHR)",
  //                 render: (_, r) => <Text type='success'>៛​ {numeral(r.actionAmountKHR).format(" 0,#00")}</Text>
  //               },
  //               {
  //                 title: "Actual Total",
  //                 render: (_, r) => {
  //                   const total = r.actionAmount + (r.actionAmountKHR / exchangeRate)
  //                   return <Typography.Text type='warning'>{numeral(total).format("$ 0,000.00")}</Typography.Text>
  //                 }
  //               }
  //             ]}
  //           />
  //         </Card>
  //       </Flex>
  //     </Space >

  //     {/* <Card size="small" >
  //       <Row>

  //         <Col flex="auto">
  //           <ProFormDateTimePicker
  //             initialValue={moment()}
  //             rules={[{ required: true }]}
  //             name="settlementDate"
  //             label="Settlement Date"
  //             placeholder=""
  //           />
  //           <ProFormDigit
  //             rules={[{ required: true }]}
  //             initialValue={dsdExchangeRate?.target_amount}
  //             min={3900}
  //             max={4200}
  //             name="exchangeRate"
  //             label="Exchange Rate"
  //             width={205}
  //             fieldProps={{
  //               formatter: (value) => {
  //                 return numeral(value).format('0,0');
  //               },
  //             }}
  //           />
  //           {data?.adjustmentItems && data?.adjustmentItems.length > 0 && (
  //             <>
  //               <ProFormDigit
  //                 name="invoicesAmount"
  //                 label="Invoices Amount"
  //                 readonly
  //                 proFieldProps={{
  //                   render: () => {
  //                     const amount =
  //                       formModal.getFieldValue('invoicesAmount') *
  //                       (dsdExchangeRate?.target_amount ?? 0);
  //                     return `${dsdExchangeRate?.target_symbol} ${numeral(amount).format(
  //                       '0,0.00',
  //                     )}`;
  //                   },
  //                 }}
  //               // locale="en-US"
  //               />
  //               <ProFormDigit
  //                 name="lostAmount"
  //                 label="Lost Amount"
  //                 readonly
  //                 proFieldProps={{
  //                   render: () => {
  //                     const amount =
  //                       formModal.getFieldValue('lostAmount') *
  //                       (dsdExchangeRate?.target_amount ?? 0);
  //                     return `${dsdExchangeRate?.target_symbol} ${numeral(amount).format(
  //                       '0,0.00',
  //                     )}`;
  //                   },
  //                 }}
  //               //locale="en-US"
  //               />
  //             </>
  //           )}
  //           <ProFormDigit
  //             // initialValue={getSystemAmount()}
  //             name="systemAmount"
  //             label={`System Amount ${dsdExchangeRate?.target_currency}`}
  //             readonly
  //             proFieldProps={{
  //               render: () => {
  //                 const amount =
  //                   formModal.getFieldValue('systemAmount') * (dsdExchangeRate?.target_amount ?? 0);
  //                 return `${dsdExchangeRate?.target_symbol} ${numeral(amount).format('0,0.00')}`;
  //               },
  //             }}
  //           //locale="en-US"
  //           />
  //         </Col>
  //         <Col flex="auto">
  //           <ProFormDigit
  //             name="actualAmount"
  //             label="Actual Amount USD"
  //             placeholder="$ 0.00"
  //             min={0}
  //           />
  //           <ProFormDigit
  //             fieldProps={{
  //               formatter: (value) => {
  //                 return numeral(value).format('0,#00');
  //               },
  //             }}
  //             name="actualAmountKH"
  //             label="Actual Amount KH"
  //             placeholder=""
  //             min={0}
  //           />
  //           <ProFormDigit name="bankAmount" label="Bank Transfer Amount" placeholder="" min={0} />
  //           <ProFormTextArea label="Remark" name="remark" placeholder="" />
  //           <ProFormDigit
  //             // initialValue={getSystemAmount()}
  //             name="actualTotalAmount"
  //             label="Actual Total Amount"
  //             readonly
  //             // locale="en-US"
  //             proFieldProps={{
  //               render: () => {
  //                 const amount = formModal.getFieldValue('actualTotalAmount');
  //                 return `${dsdExchangeRate?.target_symbol} ${numeral(amount).format('0,00.00')}`;
  //                 // return `${dsdExchangeRate?.target_symbol} ${numeral(t).format('0,00.00')}`;
  //               },
  //             }}
  //             min={0}
  //           />
  //         </Col>
  //       </Row>
  //     </Card>
  //     {data?.adjustmentItems && data?.adjustmentItems.length > 0 && (
  //       <ProTable<StockAdjustmentDto>
  //         title={() => <Text type="success">Warehouse Report</Text>}
  //         key={'stockAdjustment'}
  //         rowKey={(record) => `row-key-${record.itemId}`}
  //         toolBarRender={false}
  //         options={{
  //           density: false,
  //           setting: false,
  //           reload: false,
  //           search: false,
  //         }}
  //         search={false}
  //         dataSource={data?.adjustmentItems}
  //         summary={(records) => {
  //           const total = records.reduce(function (acc, it) {
  //             return acc + (it.originQuantity - it.adjustQuantity) * it.unitPrice!!;
  //           }, 0);
  //           const tatalKh = total * (dsdExchangeRate?.target_amount ?? 0);
  //           return (
  //             <Table.Summary.Row>
  //               <Table.Summary.Cell index={0} align="right" colSpan={6}>
  //                 <Text type="danger">Total</Text>
  //               </Table.Summary.Cell>
  //               <Table.Summary.Cell index={1} align="right">
  //                 <Text type="danger">{`$ ${numeral(tatalKh).format('0,0.00')}`}</Text>
  //               </Table.Summary.Cell>
  //             </Table.Summary.Row>
  //           );
  //         }}
  //         columns={[
  //           {
  //             title: 'Product Name',
  //             dataIndex: 'itemName',
  //           },
  //           {
  //             title: 'Adjust By',
  //             dataIndex: 'adjustBy',
  //           },
  //           {
  //             title: 'Adj. Date',
  //             //dataIndex: 'invoiceNo'
  //             render: (_, r) => {
  //               return formatDate(r.adjustmentDate);
  //             },
  //           },
  //           {
  //             title: 'Reason',
  //             width: 200,
  //             dataIndex: 'reason',
  //           },
  //           {
  //             title: 'Lost Quantity',
  //             align: 'right',
  //             render: (_, r) => {
  //               return r.originQuantity - r.adjustQuantity;
  //             },
  //           },
  //           {
  //             title: 'Default Price',
  //             align: 'right',
  //             render: (_, r) => {
  //               const unitPriceKh = (dsdExchangeRate?.target_amount ?? 0) * (r.unitPrice ?? 0);
  //               return `${dsdExchangeRate?.target_symbol} ${numeral(unitPriceKh).format('0,0.00')}`;
  //             },
  //           },
  //           {
  //             title: 'Amount',
  //             align: 'right',
  //             render: (_, r) => {
  //               const amount = (r.originQuantity - r.adjustQuantity) * r.unitPrice!!;
  //               const amountKh = amount * (dsdExchangeRate?.target_amount ?? 0);
  //               return `${dsdExchangeRate?.target_symbol} ${numeral(amountKh).format('0,0.00')}`;
  //             },
  //           },
  //         ]}
  //       />
  //     )}
  //     <Divider /> */}
  //   </ModalForm >
  // );
};

export default SettlementModal;
