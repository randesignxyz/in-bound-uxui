// import { SaleInvoiceItemLess, SaleInvoiceLess } from '@/services/sale/data';
// import { DeleteOutlined, PlusCircleFilled, PlusCircleOutlined } from '@ant-design/icons';
// import ProForm, {
//   ProFormDateTimePicker,
//   ProFormField,
//   ProFormSelect,
//   ProFormText,
// } from '@ant-design/pro-form';
// import { FooterToolbar } from '@ant-design/pro-layout';
// import { useSetState } from 'ahooks';
// import { Button, Card, Col, Form, Row, Tooltip } from 'antd';
// import { useEffect, useRef, useState } from 'react';
// import { history } from 'umi';
// import { SalePaths } from '../..';
// import LeadFormModel from './LeadFormModel';
// import numeral from 'numeral';
// import ProTable, { ActionType } from '@ant-design/pro-table';
// import ItemEntryFormModal from './ItemEntryFormModal';
// import { Model } from '../model';

// type Props = {
//   type: 'new' | 'edit';
//   id?: number;
// };

// const layout = {
//   labelCol: { span: 6 },
//   wrapperCol: { span: 14 },
// };

// const blueColor = '#108ee9';

// const SoInvoiceForm: React.FC<Props> = ({ id, type }) => {
//   const { state, actions } = Model();
//   const [form] = Form.useForm<SaleInvoiceLess>();
//   const [leadModal, setLeadModal] = useSetState<{ visible?: boolean }>();
//   const [itemModal, setItemModal] = useSetState<{ visible?: boolean }>();
//   //   const [forceUpdate, setForceUpdate] = useState<number>(0);
//   const actionRef = useRef<ActionType>();

//   const [dataSource, setDataSource] = useState<SaleInvoiceItemLess[]>([]);

//   const onSaveActionHandler = async (isNew: boolean = false) => {};

//   useEffect(() => {
//     actions.initilizeData();
//     () => {
//       form.resetFields();
//     };
//   }, []);

//   useEffect(() => {
//     if (!id) return;
//   }, [id]);

//   //   useEffect(() => {
//   //     if (forceUpdate) {
//   //       actionRef.current?.reloadAndRest?.();
//   //     }
//   //   }, [forceUpdate]);

//   const onFormvalueChanged = (changedValues: any, values: SaleInvoiceLess) => {
//     if ('salespersonId' in changedValues) {
//       const empId = values['salespersonId'];
//       actions.loadProductItems(empId);
//     }
//   };

//   return (
//     <>
//       <ProForm<SaleInvoiceLess>
//         form={form}
//         onValuesChange={onFormvalueChanged}
//         layout="horizontal"
//         {...layout}
//         submitter={{
//           render: () => {
//             return (
//               <FooterToolbar>
//                 {type === 'new' && (
//                   <Button
//                     onClick={() => {
//                       form.resetFields();
//                     }}
//                   >
//                     Clear
//                   </Button>
//                 )}

//                 {type === 'edit' && (
//                   <Button
//                     onClick={() => {
//                       history.push(`${SalePaths.soInvoice}/detail/${id}`);
//                     }}
//                   >
//                     Cancel
//                   </Button>
//                 )}
//                 {type === 'edit' && (
//                   <Button
//                     onClick={() => {
//                       //form.resetFields()
//                     }}
//                   >
//                     Reset
//                   </Button>
//                 )}
//                 {type === 'new' && (
//                   <Button
//                     type="primary"
//                     onClick={() => {
//                       onSaveActionHandler(true);
//                     }}
//                   >
//                     Save & Add New
//                   </Button>
//                 )}
//                 <Button
//                   type="primary"
//                   onClick={() => {
//                     onSaveActionHandler();
//                   }}
//                 >
//                   {type === 'new' ? 'Save & View' : 'Edit'}
//                 </Button>
//               </FooterToolbar>
//             );
//           },
//         }}
//       >
//         <Card size="small" style={{ marginBottom: 16 }}>
//           <Row>
//             <Col flex="auto">
//               <ProFormText label="Invoice #" name="invoiceNo" />
//               <ProFormSelect
//                 name="salespersonId"
//                 label="Saleperson"
//                 showSearch
//                 debounceTime={300}
//                 placeholder="Please select salesperson"
//                 rules={[{ required: true, message: 'Please select salesperson' }]}
//                 options={state.data?.initData?.seList?.map((it) => ({
//                   value: it.id,
//                   label: `${it.code} - ${it.name}`,
//                 }))}
//                 fieldProps={{
//                   optionLabelProp: 'label',
//                   popupMatchSelectWidth: 200,
//                   filterOption: (input, option) =>
//                     (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >=
//                     0,
//                 }}
//               />
//             </Col>
//             <Col flex="auto">
//               <ProFormDateTimePicker label="Invoice Date" name="invoiceDate" />
//               <ProFormSelect
//                 name="customerId"
//                 label="Customer"
//                 showSearch
//                 debounceTime={300}
//                 addonAfter={
//                   <Tooltip placement="topLeft" title="Add New">
//                     <PlusCircleOutlined
//                       onClick={() => setLeadModal({ visible: true })}
//                       style={{ color: blueColor }}
//                     />
//                   </Tooltip>
//                 }
//                 request={async ({ keyWords }) => {
//                   return [
//                     {
//                       value: keyWords,
//                       label: '目标_target',
//                     },
//                   ];
//                 }}
//                 placeholder="Please select customer"
//               />
//               {/* <ProFormMoney
//                 label="Amount Riel"
//                 name="amountKH"
//                 width={300}
//                 fieldProps={{
//                   precision: 0,
//                   formatter: (value) => {
//                     //numeral(data.details?.cashOnHand).format('$ 0,0.00')
//                     return numeral(value).format('0,0');
//                   },
//                 }}
//                 min={0}
//               /> */}
//             </Col>
//             <Col flex="auto">
//               <ProFormText label="Reference #" name="referenceNo" />
//             </Col>
//           </Row>
//         </Card>
//         <ProTable<SaleInvoiceItemLess>
//           dataSource={dataSource}
//           search={false}
//           actionRef={actionRef}
//           //    rowClassName={(r) => r.parentKey && styles.subLineItem}
//           //    dataSource={data.lineItemList || []}
//           style={{ marginTop: 10 }}
//           pagination={false}
//           size="small"
//           headerTitle="Line Items"
//           options={{
//             density: false,
//             reload: false,
//             setting: false,
//             search: (
//               <Row justify="end">
//                 <Tooltip placement="topLeft" title="Add Item">
//                   <Button
//                     icon={<PlusCircleFilled style={{ color: blueColor }} />}
//                     type="link"
//                     onClick={() => setItemModal({ visible: true })}
//                   />
//                 </Tooltip>
//               </Row>
//             ),
//           }}
//           columns={[
//             {
//               title: '#',
//               dataIndex: 'index',
//               key: 'key',
//             },
//             {
//               title: 'Code',
//               dataIndex: 'itemCode',
//               // render: (_, r) => {
//               //   return `${r.itemCode} - ${r.itemName}`;
//               // },
//             },
//             {
//               title: 'Description',
//               dataIndex: 'itemName',
//               //   render: (_, r) => {
//               //     return `${r.itemCode} - ${r.itemName}`;
//               //   },
//             },
//             {
//               title: 'UOM',
//               dataIndex: 'uom',
//             },
//             {
//               title: 'Quantity',
//               dataIndex: 'quantity',
//             },
//             {
//               title: 'Unit Price',
//               align: 'right',
//               dataIndex: 'unitPrice',
//             },
//             {
//               title: 'Amout',
//               align: 'right',
//               render: (_, r) => {
//                 return r.unitPrice * r.quantity;
//               },
//             },
//             {
//               render: (_, r) => (
//                 <>
//                   <DeleteOutlined />
//                 </>
//               ),
//             },
//           ]}
//         />

//         <Card size="small" style={{ marginTop: 10, marginBottom: 20 }}>
//           <Row justify="space-between">
//             <Col flex="3" />

//             <Col flex="1">
//               <ProFormField
//                 // valueType={{ type: 'money', locale: "en-US" }}
//                 render={(_, r) => {
//                   return numeral(r['value']).format('$ 0,0.000000');
//                 }}
//                 label="Sub Total"
//                 name="subAmount"
//                 readonly
//               />
//               {/* <ProFormField valueType={{ type: 'money', locale: "en-US" }} label='Discount Amount' name='discountAmount' readonly /> */}
//               <ProFormField
//                 // valueType={{ type: 'money', locale: "en-US", precision: 6 }}
//                 render={(_, r) => {
//                   return numeral(r['value']).format('$ 0,0.000000');
//                 }}
//                 label="VAT Amount"
//                 name="discount"
//                 readonly
//               />
//               <ProFormField
//                 // valueType={{ type: 'money', locale: "en-US", precision: 6 }}
//                 render={(_, r) => {
//                   return numeral(r['value']).format('$ 0,0.000000');
//                 }}
//                 label="Total Amount"
//                 name="amount"
//                 readonly
//               />
//             </Col>
//           </Row>
//         </Card>
//       </ProForm>
//       <ItemEntryFormModal
//         title="Item"
//         visible={itemModal.visible}
//         width={'500px'}
//         onCancel={() => setItemModal({ visible: false })}
//         data={{
//           productItems: state.data?.productItems,
//         }}
//         actionHandlers={{
//           onAddItem: (item) => {
//             setDataSource([...dataSource, item]);
//             actionRef.current?.reloadAndRest?.();
//             // setForceUpdate(1);
//           },
//         }}
//       />

//       <LeadFormModel
//         title="Create Customer"
//         visible={leadModal.visible}
//         width={'500px'}
//         onCancel={() => setLeadModal({ visible: false })}
//         data={{
//           typeId: undefined,
//           regionList: undefined,
//         }}
//       />
//     </>
//   );
// };

// export default SoInvoiceForm;
