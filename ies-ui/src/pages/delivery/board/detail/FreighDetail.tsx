import ImagePreview from '@/components/ImagePreview';
import { formatDateTime, formatter } from '@/pages/utils';
import {
  cashCollectionRs,
  CheckInRs,
  CheckoutRs,
  DeliveryNote,
  DeliveryNoteItem,
  FreightDetail,
} from '@/services/delivery/data';
import { Card, Descriptions, Space, Table, Image, Row, Col } from 'antd';
import moment from 'moment';
import PaymentListView from '../../cash-collection/payment-list-view';

export default ({ data }: { data: FreightDetail }) => {
  const renderChangeLocation = () => {
    return (
      <Card size="small" title={"Change Shipping Location"} style={{ marginBottom: 10 }}>
        <Descriptions>
          <Descriptions.Item label="Location">{data.shippingLocation}</Descriptions.Item>
          <Descriptions.Item label="Paid Amount">{data.paidAmount}</Descriptions.Item>
        </Descriptions>
      </Card>
    )
  }

  const renderDeliveryNote = (item: DeliveryNote) => {
    return (
      <Card size="small" title={`DN: ${item.docNum}`}>
        <Table<DeliveryNoteItem>
          pagination={false}
          size="small"
          dataSource={item.items}
          rowKey='itemCode'
          columns={[
            { title: 'Item Code', dataIndex: 'itemCode' },
            { title: 'Item Desc', dataIndex: 'itemDescription' },
            { title: 'UoM', dataIndex: 'uomCode' },
            { title: 'Qty', align: 'right', render: (_, r) => (!!data.shippingLocation || data.canceled) ? `${r.actualQty}/${r.qty}` : r.qty },
          ]}
          footer={(data) => (
            <Row>
              <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                Total
              </Col>
              <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                {' '}
                {data.map((it) => it.qty || 0).reduce((p, c) => p + c, 0)}{' '}
              </Col>
            </Row>
          )}
        />
      </Card>
    );
  };

  const renderItemReturned = (items: DeliveryNoteItem[]) => (
    <Card size="small" title={`Items returned`}>
      <Table<DeliveryNoteItem>
        pagination={false}
        size="small"
        dataSource={items}
        rowKey='itemCode'
        columns={[
          { title: 'Item Code', dataIndex: 'itemCode' },
          { title: 'Item Desc', dataIndex: 'itemDescription' },
          { title: 'UoM', dataIndex: 'uomCode' },
          { title: 'Qty', align: 'right', render: (_, r) => r.qty },
        ]}
        footer={(data) => (
          <Row>
            <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
              Total
            </Col>
            <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
              {' '}
              {data.map((it) => it.qty || 0).reduce((p, c) => p + c, 0)}{' '}
            </Col>
          </Row>
        )}
      />
    </Card>)


  const renderInvoices = (data: FreightDetail) => {
    return (
      <Card size="small" title="Invoices" style={{ marginTop: 10 }}>
        <Table
          size="small"
          pagination={false}
          dataSource={data.invoices}
          rowKey="invoiceNum"
          columns={[
            { title: 'Invoice Num', dataIndex: 'invoiceNum' },
            {
              title: 'Amount',
              render: (_, r) => formatter.format(r.invoiceAmount),
            },
          ]}
        />
      </Card>
    );
  };

  const renderCashCollection = (cashCollections: cashCollectionRs[]) => {
    return (
      <Card size="small" title="Cash Collection" style={{ marginTop: 10 }}>
        <PaymentListView data={cashCollections} />
      </Card>
    );
  };

  const renderCheckIn = (checkIn: CheckInRs) => {
    return (
      <Card title="Check In" size="small" style={{ marginTop: 10 }}>
        <Descriptions>
          <Descriptions.Item label="Date">
            {formatDateTime(moment(checkIn.checkInDate)) || ''}
          </Descriptions.Item>
          <Descriptions.Item label="Location">
            <a
              href={[
                'https://www.google.com/maps/search/?api=1&query=',
                (checkIn.location?.coords?.latitude || '').toString(),
                ',',
                (checkIn.location?.coords?.longitude || '').toString(),
              ].join('')}
              target="_blank"
            >
              {`${checkIn.location?.coords?.latitude}, ${checkIn.location?.coords?.longitude}`}
            </a>
          </Descriptions.Item>
          <Descriptions.Item label="Remarks">{checkIn?.remarks || ''}</Descriptions.Item>
          <Descriptions.Item label="Image">
            <Image.PreviewGroup>
              <Space>
                {(checkIn.images || []).map((imageId) => (
                  <ImagePreview width={'80px'} key={imageId} fileId={imageId} fileName={''} />
                ))}
              </Space>
            </Image.PreviewGroup>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  };

  const renderCheckout = (checkout: CheckoutRs) => {
    return (
      <Card title="Checkout" size="small" style={{ marginTop: 10 }}>
        <Descriptions>
          <Descriptions.Item label="Date">
            {formatDateTime(moment(checkout.checkoutDate)) || ''}
          </Descriptions.Item>
          <Descriptions.Item label="Location">
            <a
              href={[
                'https://www.google.com/maps/search/?api=1&query=',
                (checkout.location?.coords?.latitude || '').toString(),
                ',',
                (checkout.location?.coords?.longitude || '').toString(),
              ].join('')}
              target="_blank"
            >{`${checkout.location?.coords?.latitude}, ${checkout.location?.coords?.longitude}`}</a>
          </Descriptions.Item>
          <Descriptions.Item label="Remarks">{checkout?.remarks || ''}</Descriptions.Item>
        </Descriptions>
      </Card>
    );
  };

  return (
    <>
      <Descriptions>
        <Descriptions.Item label="Customer"> {[data.customerCode, data.customerName].join(' ')}</Descriptions.Item>
      </Descriptions>
      {!!data.shippingLocation && renderChangeLocation()}
      {data.deliveryNotes.map((it) => renderDeliveryNote(it))}

      {data.itemReturns.length > 0 && renderItemReturned(data.itemReturns)}

      {data.invoices.length > 0 && renderInvoices(data)}

      {data.checkIn && renderCheckIn(data.checkIn)}

      {data.checkout && renderCheckout(data.checkout)}

      {(data.checkout?.cashCollections?.length || 0) > 0 &&
        renderCashCollection(data.checkout?.cashCollections || [])}
    </>
  );
};
