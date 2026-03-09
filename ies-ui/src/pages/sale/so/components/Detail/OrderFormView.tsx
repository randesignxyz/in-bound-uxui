import DescriptionDisplay, { DescriptionDisplayDataItem } from '@/components/Descriptions';
import { CrmPaths } from '@/pages/crm';
import { formatDate, formatDateTime } from '@/pages/utils';
import { SoDetail } from '@/services/sale/data';
import { Card } from 'antd';
import React from 'react';
import { history } from "@umijs/max";

interface Props {
  actionButtons?: React.ReactNode;
  soDetail?: SoDetail;
}

const OrderFormView: React.FC<Props> = ({ actionButtons, soDetail }) => {
  const firstDelivery = soDetail?.deliveries?.reduce((earliest, curr) =>
    new Date(curr.deliveryDate) < new Date(earliest.deliveryDate) ? curr : earliest
  );

  const firstDeliveryDate = firstDelivery ? formatDateTime(firstDelivery.deliveryDate) : null;

  const displayItems: (DescriptionDisplayDataItem | undefined)[] = [
    { label: 'So #', value: soDetail?.soNo },
    { label: 'PO Created Date', value: formatDateTime(soDetail?.orderedDate) },
    {
      label: 'Customer',
      onClick: () => {
        history.push(`${CrmPaths.customer}/detail/${soDetail?.associatedTo.customer.id}`);
      },
      value: [soDetail?.associatedTo.customer.code, soDetail?.associatedTo.customer.name]
        .filter((it) => it)
        .join('-'),
    },
    { label: 'Customer PO', value: soDetail?.refNo },
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
    { label: 'PO Posted Date', value: formatDateTime(soDetail?.createdDate) },
    { label: 'PO Posted By', value: soDetail?.postedBy },
    { label: 'SO Created Date', value: formatDateTime(soDetail?.postedDate) },
    { label: 'Last Modified By', value: soDetail?.lastModifiedBy },
    { label: 'Last Modifiedd Date', value: formatDateTime(soDetail?.lastModifiedDate) },
    { label: 'Remarks', value: soDetail?.remarks },
    { label: 'Distributor', value: soDetail?.distributor?.name },
    { label: 'Document Type', value: soDetail?.target ?? "OP" },
  ];

  return (
    <div>
      <Card size="small" title="General" extra={actionButtons}>
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
            { label: 'First Delivery Date', value: formatDateTime(firstDeliveryDate) },
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
          ]}
        />
      </Card>


    </div>
  );
};

export default OrderFormView;
