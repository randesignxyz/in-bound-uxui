import DescriptionDisplay, { DescriptionDisplayDataItem } from '@/components/Descriptions';
import { CrmPaths } from '@/pages/crm';
import { formatDate, formatDateTime } from '@/pages/utils';
import { SoDetail, SoItemDetail } from '@/services/sale/data';
import ProForm, { ProFormField } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { Card, Col, Form, Row } from 'antd';
import numeral from 'numeral';
import React, { useEffect } from 'react';
import { history } from "@umijs/max";

interface Props {
  soDetail?: SoDetail;
}

const layout1 = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

interface SummaryAmount {
  subTotal: number;
  discountAmount: number;
  vatAmount: number;
  totalAmount: number;
}

const OrderFormView: React.FC<Props> = ({ soDetail }) => {
  const [formSum] = Form.useForm<SummaryAmount>();
  const displayItems: (DescriptionDisplayDataItem | undefined)[] = [
    { label: 'So #', value: soDetail?.soNo },
    { label: 'Orderd Date', value: formatDateTime(soDetail?.orderedDate) },
    {
      label: 'Customer',
      onClick: () => {
        history.push(`${CrmPaths.customer}/detail/${soDetail?.associatedTo.customer.id}`);
      },
      value: [soDetail?.associatedTo.customer.code, soDetail?.associatedTo.customer.name]
        .filter((it) => it)
        .join('-'),
    },
    { label: 'Ref #', value: soDetail?.refNo },
    soDetail?.invoiceNo ? { label: 'Invoice #', value: soDetail?.invoiceNo } : undefined,
    soDetail?.invoiceDate
      ? { label: 'Invoice #', value: formatDate(soDetail?.invoiceDate) }
      : undefined,
    {
      label: 'Salesperson',
      value: [
        soDetail?.associatedTo.salesperson.code,
        soDetail?.associatedTo.salesperson.name,
      ].join('-'),
    },
    { label: 'Payment Term', value: soDetail?.associatedTo?.paymentTerm?.code },
    { label: 'Status', value: soDetail?.status },
    { label: 'Created By', value: soDetail?.createdBy },
    { label: 'Created Date', value: formatDateTime(soDetail?.createdDate) },
    { label: 'SAP Posted By', value: soDetail?.postedBy },
    { label: 'SAP Posted Date', value: formatDateTime(soDetail?.postedDate) },
    { label: 'Last Modified By', value: soDetail?.lastModifiedBy },
    { label: 'Last Modifiedd Date', value: formatDateTime(soDetail?.lastModifiedDate) },
    { label: 'Remarks', value: soDetail?.remarks },
    { label: 'Distributor', value: soDetail?.distributor?.name },
  ];

  useEffect(() => {
    if (soDetail) {
      formSum.setFieldsValue({
        subTotal: soDetail?.amount,
        discountAmount: soDetail?.discountAmount,
        vatAmount: soDetail?.vatAmount,
        totalAmount: soDetail?.totalAmount,
      });
    }
    // soDetail &&
    //   formSum.setFieldsValue({
    //     subTotal: soDetail?.amount,
    //     discountAmount: soDetail?.discountAmount,
    //     vatAmount: soDetail?.vatAmount,
    //     totalAmount: soDetail?.totalAmount,
    //   });
  }, [soDetail]);

  return (
    <div>
      <Card size="small" title="General">
        <DescriptionDisplay data={displayItems} />
      </Card>
      {soDetail?.distributor && soDetail.distributor.noneOfl && (
        <Card style={{ marginTop: '10px' }} size="small" title="None OFL Outlet Info">
          <DescriptionDisplay
            data={[
              { label: 'Shop Name', value: soDetail?.distributor.noneOfl?.shop_name },
              { label: 'First Name', value: soDetail?.distributor.noneOfl?.first_name },
              { label: 'Last Name', value: soDetail?.distributor.noneOfl?.last_name },
              { label: 'Phone Number', value: soDetail?.distributor.noneOfl?.phone_number },
              { label: 'House No', value: soDetail?.distributor.noneOfl?.house_no },
              { label: 'Street No', value: soDetail?.distributor.noneOfl?.street_no },
              { label: 'Street Name', value: soDetail?.distributor.noneOfl?.street_name },
              { label: 'Village', value: soDetail?.distributor.noneOfl?.village },
              { label: 'Commune', value: soDetail?.distributor.noneOfl?.commune },
              { label: 'District', value: soDetail?.distributor.noneOfl?.district },
              { label: 'Province', value: soDetail?.distributor.noneOfl?.province },
              { label: 'Region', value: soDetail?.distributor.noneOfl?.region },
            ]}
          />
        </Card>
      )}

      <Card style={{ marginTop: '10px' }} size="small" title="Delivery">
        <DescriptionDisplay
          data={[
            { label: 'Delivery Method', value: soDetail?.associatedTo.deliveryMethod?.name },
            { label: 'Delivery Date', value: formatDate(soDetail?.deliveryDate) },
            {
              label: 'Shipping Address Code',
              value: soDetail?.associatedTo.shippingAddress.address,
            },
            {
              label: 'Shipping Address',
              value: [
                { name: 'Street', value: soDetail?.associatedTo.shippingAddress.streetNo },
                { name: 'House#', value: soDetail?.associatedTo.shippingAddress.houseNo },
                { name: 'Village', value: soDetail?.associatedTo.shippingAddress.village },
                { name: 'Commune', value: soDetail?.associatedTo.shippingAddress.commune },
                { name: 'District', value: soDetail?.associatedTo.shippingAddress.district },
                { name: 'Province', value: soDetail?.associatedTo.shippingAddress.province },
              ]
                .filter((it) => it.value)
                .map((it) => `${it.name} ${it.value}`)
                .join(', '),
            },

            // { label: 'Ship to Name', value: soDetail?.shipToName },
            // { label: 'Shipp to phone number', value: soDetail?.shipPhoneNumber }
          ]}
        />
      </Card>
      <Card style={{ marginTop: '10px' }} size="small" title="Line Items">
        <ProTable<SoItemDetail>
          size="small"
          sortDirections={['ascend']}
          showSorterTooltip={false}
          columns={[
            {
              title: '#',
              dataIndex: 'index',
              defaultSortOrder: 'ascend',
              sorter: (a, b) => a.index! - b.index!,
            },
            { title: 'Code', dataIndex: 'itemCode' },
            { title: 'Description', dataIndex: 'description' },
            { title: 'Type', dataIndex: 'type' },
            // { title: 'Delivered Date',render: (_, data) => "" /*formatDate(data.deliveredDate)*/, align: 'right'},
            { title: 'Budget Code', dataIndex: 'budgetCode' },
            {
              title: 'Qty',
              dataIndex: 'qty',
              align: 'right',
            },
            { title: 'UoM', render: (_, data) => data.uom },
            {
              title: 'Price',
              // dataIndex: 'price',
              align: 'right',
              // valueType: {
              //   type: 'money',
              //   locale: 'en-US',
              //   precision: 6,
              // },
              render: (_, r) => {
                return numeral(r.price).format('$ 0,0.000000');
              },
            },
            {
              title: 'Amount',
              // dataIndex: 'amount',
              align: 'right',
              // valueType: {
              //   type: 'money',
              //   locale: 'en-US',
              //   precision: 6,
              // },
              render: (_, r) => {
                return numeral(r.amount).format('$ 0,0.000000');
              },
            },
            {
              title: 'Discount',
              // dataIndex: 'discountPercent',
              align: 'right',
              // valueType: {
              //   type: 'percent',
              //   // locale: 'en-US',
              // },
              render: (_, r) => {
                return numeral(r.discountPercent).format('0 %');
              },
            },
            {
              title: 'Total Amount',
              // dataIndex: 'totalAmount',
              align: 'right',
              render: (_, r) => {
                // return 'aaaa'
                return numeral(r.totalAmount).format('$ 0,0.000000');
              },
              // valueType: {
              //   type: 'money',
              //   locale: 'en-US',
              //   precision: 6,
              // },
            },
            // { title: 'Remarks', dataIndex: 'remarks' },
          ]}
          rowKey="id"
          pagination={false}
          bordered={false}
          search={false}
          options={{
            setting: false,
            density: false,
            fullScreen: false,
            reload: false,
          }}
          dataSource={soDetail?.items}
        />
      </Card>
      <Card>
        <ProForm
          {...layout1}
          style={{ fontWeight: 'bolder' }}
          submitter={false}
          // labelAlign='left'
          layout="horizontal"
          form={formSum}
        >
          <Row>
            <Col flex="Auto" />
            <Col flex="350px">
              <ProFormField
                // valueType={{ type: 'money', locale: 'en-US', precision: 6 }}
                render={(_, r) => {
                  return numeral(r['value']).format('$ 0,0.000000');
                }}
                label="Sub Total"
                name="subTotal"
                readonly
              />
              {/* <ProFormField
                  valueType={{ type: 'money', locale: 'en-US' }}
                  label="Discount Amount"
                  name="discountAmount"
                  readonly
                /> */}
              <ProFormField
                // valueType={{ type: 'money', locale: 'en-US', precision: 6 }}
                render={(_, r) => {
                  return numeral(r['value']).format('$ 0,0.000000');
                }}
                label="VAT Amount"
                name="vatAmount"
                readonly
              />
              <ProFormField
                // valueType={{ type: 'money', locale: 'en-US', precision: 6 }}
                render={(_, r) => {
                  return numeral(r['value']).format('$ 0,0.000000');
                }}
                label="Total Amount"
                name="totalAmount"
                readonly
              />
            </Col>
          </Row>
        </ProForm>
      </Card>
    </div>
  );
};

export default OrderFormView;
