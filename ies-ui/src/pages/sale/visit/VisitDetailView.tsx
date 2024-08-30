import { simpleRequestActions } from '@/services/model';
import { PageContainer, ProDescriptions, ProTable } from '@ant-design/pro-components';
import { Card, Image, List, Spin, Tag, Typography } from 'antd';
import { join, startCase } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

import ImagePreview from '@/components/ImagePreview';
import { formatConfig, formatDate, formatWithDuration } from '@/pages/utils';
import { history } from '@umijs/max';
import OrderGoogleMap from '../retailer/orders/components/OrderGoogleMap';
import { SaleInvoiceItemInfo, VisitDTO } from './data';
import { VisitServiceAPI } from './services';

interface Props {
  id: number;
}

export default ({ id }: Props) => {
  const requestActions = simpleRequestActions();
  const services = VisitServiceAPI(requestActions);
  const [visit, setVisit] = useState<VisitDTO>();

  const { Text } = Typography;

  const initdata = useCallback(async () => {
    setVisit(await services.detail(id));
  }, []);
  useEffect(() => {
    initdata();
    return () => {};
  }, []);

  // const routes = [
  //   {
  //     path: `${SalePaths.visit}/list`,
  //     label: 'List Visit',
  //   },
  //   {
  //     path: '',
  //     label: 'Detail',
  //   },
  // ];
  return (
    // <PageContainer
    //   breadcrumb={undefined}
    //   title={`${visit?.customerName} - ${formatDate(visit?.visitDate)}`}
    //   onBack={history.back}
    // >
      <Spin spinning={requestActions.request?.loading}>
        {/* <Row justify="space-between">
          <BreadCrumbCom separator=">" routes={routes} />
        </Row> */}

        <Card style={{ marginTop: 10 }} size="small" title={<Text>Visit Detail</Text>}>
          <ProDescriptions
            size="small"
            dataSource={visit}
            key="general-info"
            column={3}
            contentStyle={{ fontWeight: 500 }}
            columns={[
              {
                title: 'Visit Date',
                key: 'visitDate',
                render: (_, r) => {
                  return formatDate(r.visitDate);
                },
              },
              {
                title: 'Salesperson',
                key: 'salesperson',
                render: (_, r) => join([r.salespersonCode, r.salespersonName], ' - '),
              },
              {
                title: 'Status',
                key: 'status',
                render: (_, r) => {
                  return (
                    <Tag color={r.status !== 'checked out' ? 'default' : 'green'}>
                      {startCase(r.status)}
                    </Tag>
                  );
                },
              },
              {
                title: 'Check In Time',
                key: 'checkIn',
                render: (_, r) => {
                  return formatDate(r.checkInDateTime, formatConfig.duration);
                },
              },
              {
                title: 'Check Out Time',
                key: 'checkOut',
                render: (_, r) => {
                  return formatDate(r.checkOutDateTime, formatConfig.duration);
                },
              },

              {
                title: 'Duration',
                key: 'duration',
                render: (_, r) => {
                  return (
                    <Tag color="default">
                      {formatWithDuration(r.checkInDateTime, r.checkOutDateTime)}
                    </Tag>
                  );
                },
              },
            ]}
          />
        </Card>
        <Card style={{ marginTop: 10 }} size="small" title={<Text>Customer Info</Text>}>
          <ProDescriptions
            size="small"
            dataSource={visit}
            key="general-info"
            column={2}
            columns={[
              {
                title: 'Name',
                key: 'customerName',
                dataIndex: 'customerName',
              },
              {
                title: 'Phone',
                key: 'customerPhone',
                dataIndex: 'customerPhone',
              },
              {
                title: 'Address',
                key: 'customerAddress',
                dataIndex: 'customerAddress',
              },
            ]}
          />
        </Card>

        {visit !== undefined && visit.salesInvoice !== undefined && visit.salesInvoice !== null && (
          <>
            <Card style={{ marginTop: 10 }} size="small" title={<Text>Sales Invoice</Text>}>
              <ProDescriptions
                size="small"
                dataSource={visit.salesInvoice}
                key="general-info"
                column={3}
                //contentStyle={{ fontWeight: 'bold' }}
                columns={[
                  {
                    title: 'Invoice No',
                    key: 'invoiceNo',
                    dataIndex: 'invoiceNo',
                  },
                  {
                    title: 'Invoice Date',
                    key: 'invoiceDate',
                    render: (_, r) => {
                      return formatDate(r.invoiceDate);
                    },
                  },
                  {
                    title: 'Amount',
                    key: 'amount',
                    valueType: 'money',
                    dataIndex: 'amount',
                  },
                ]}
              />
            </Card>
            {visit.salesInvoice.items !== undefined && (
              <ProTable<SaleInvoiceItemInfo>
                search={false}
                options={{
                  fullScreen: false,
                  density: false,
                  reload: false,
                  setting: false,
                }}
                dataSource={visit.salesInvoice.items}
                columns={[
                  {
                    title: 'Batch No',
                    dataIndex: 'batchNo',
                  },
                  {
                    title: 'Description',
                    render: (_, r) => join([r.itemName, r.itemCode], ' - '),
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    valueType: 'digit',
                  },
                  {
                    title: 'Unit Price',
                    dataIndex: 'unitPrice',
                    valueType: 'money',
                  },
                  {
                    title: 'Amount',
                    valueType: 'money',
                    render: (_, r) => r.quantity * r.unitPrice,
                  },
                ]}
              />
            )}
          </>
        )}

        {visit !== undefined &&
          visit?.attachments !== undefined &&
          visit?.attachments.length > 0 && (
            <Card style={{ marginTop: 10 }} size="small" title={<Text>Attachements</Text>}>
              <Image.PreviewGroup>
                <List
                  grid={{ gutter: 5 }}
                  dataSource={visit?.attachments?.filter((it) => it) || []}
                  renderItem={(it) => {
                    return (
                      <List.Item>
                        <ImagePreview
                          version={1}
                          width={'200px'}
                          key={it}
                          fileId={it || ''}
                          // fileName={it.name}
                        />
                      </List.Item>
                    );
                  }}
                />
              </Image.PreviewGroup>
            </Card>
          )}

        {visit !== undefined && (
          <Card style={{ marginTop: 10 }} size="small" title={<Text>Checked In Location</Text>}>
            <OrderGoogleMap
              googleMapApiKey="AIzaSyACftO4Dtfn7BQETFuT4YQZ_wOrO3hgszc"
              zoomNumber={12}
              center={{
                id: `${visit?.id}`,
                lat: parseFloat(visit?.checkInLatitude),
                lng: parseFloat(visit?.checkInLongitude),
                name: 'Check In Location',
                internalName: '',
                phone: '',
              }}
              positions={[]}
            />
          </Card>
        )}
      </Spin>
    // </PageContainer>
  );
};
