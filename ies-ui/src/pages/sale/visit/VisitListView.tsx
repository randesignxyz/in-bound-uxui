import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import TableView from '@/components/DataCrud/TableView';
import { formatDate, formatWithDuration } from '@/pages/utils';
import type { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { SalesTeamWorkLess } from '@/services/sale/data';
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import { history, useModel } from '@umijs/max';
import { Button, Radio, Space, Tag, message } from 'antd';
import { join, startCase } from 'lodash';
import Omit from 'omit.js';
import { useEffect, useRef, useState } from 'react';
import { SalePaths } from '..';
import { ReportName } from '../reports';
import VisitReports from '../reports/VisitReports';
import { DSDReportAPI } from '../reports/service';
import GoogleMapModal from '../retailer/orders/components/GoogleMapModal';
import { GoogleEntity } from '../retailer/orders/data';
import type { VisitAvanceSearchParam, VisitDTO } from './data';
import { VisitServiceAPI } from './services';

interface Props {
  onAdd?: () => void;
  // onEdit?: (id: number) => void;
  onDetail?: (id: number) => void;
}

export default ({ onAdd, onDetail }: Props) => {
  const requestActions = simpleRequestActions();
  const services = VisitServiceAPI(requestActions);
  const dsdService = DSDReportAPI(requestActions);
  const [salesperson, setSalesperson] = useState<SalesTeamWorkLess[]>([]);

  useEffect(() => {
    (async () => {
      const salesTeam = await dsdService.salespersonList();
      setSalesperson(salesTeam.filter((it) => it.isApprover === false));
    })();
  }, []);

  const [advanceSearchParams, setAdvanceSearchParams] = useState<VisitAvanceSearchParam>({
    status: 'ALL',
  });
  const actionRef = useRef<ActionType>();
  const [report, setReport] = useState<ReportName>();

  const cacheList = useModel('dataList');

  const [googleModal, setGoogleModal] = useState<GoogleEntity>({
    visible: false,
    id: '',
    lat: -1,
    lng: -1,
    name: '',
    internalName: '',
    phone: '',
  });

  const resetModal = () => {
    setGoogleModal({
      visible: false,
      id: '',
      lat: -1,
      lng: -1,
      internalName: '',
      name: '',
      phone: '',
    });
  };

  const onRequestHandler = async (params: TableViewSearchParams<VisitAvanceSearchParam>) => {
    try {
      return services.page(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'sale-visit',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<VisitDTO>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  return (
    <PageContainer breadcrumb={undefined} title={'Visit'} onBack={() => history.push('/sale')}>
      <TableView<VisitDTO, { searchValue?: string; advanceSearch: VisitAvanceSearchParam }>
        hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
        cache
        // disableSearch
        advanceSearch={undefined}
        displayOnly
        extraRightFilter={[
          <Button
            key={'visit-export-button'}
            type="primary"
            onClick={() => {
              setReport('visit-report');
            }}
          >
            Visit Report
          </Button>,
        ]}
        extraFilter={
          <Space size="large">
            <Radio.Group
              value={advanceSearchParams.status}
              onChange={(e) => {
                setAdvanceSearchParams((v) => ({
                  ...v,
                  status: e.target.value,
                }));

                actionRef.current?.reloadAndRest?.();
              }}
            >
              {/*
              <Radio.Button value="ALL">All</Radio.Button>
               <Badge size="small" offset={[-20, 0]} count={0}>
                <Radio.Button value="ACTIVE">Active</Radio.Button>
              </Badge>
              <Badge size="small" offset={[-20, 0]} count={0}>
                <Radio.Button value="INACTIVE">Inactive</Radio.Button>
              </Badge> */}
            </Radio.Group>
          </Space>
        }
        columns={[
          {
            title: 'Visit Date',
            render: (_, r) => (
              <Button
                type="link"
                onClick={() => {
                  if (onDetail !== undefined) onDetail(r.id);
                }}
              >
                {formatDate(r.checkInDateTime)}
              </Button>
            ),
          },
          {
            title: 'Duration',
            align: 'right',
            render: (_, r) => formatWithDuration(r.checkInDateTime, r.checkOutDateTime),
          },
          {
            title: 'Customer Name',
            dataIndex: 'customerName',
          },
          {
            title: 'Phone',
            dataIndex: 'customerPhone',
          },
          {
            title: 'Checked In Location',
            // dataIndex: 'customerAddress',
            render: (_, r) => (
              <Button
                type="link"
                onClick={() =>
                  setGoogleModal({
                    visible: true,
                    id: r.id,
                    lat: parseFloat(r.checkInLatitude) ?? -1,
                    lng: parseFloat(r.checkInLongitude) ?? -1,
                    name: r.customerName,
                    internalName: `Address: ${r.customerAddress}`,
                    phone: `Phone: ${r.customerPhone}`,
                  })
                }
              >
                {`${r.checkInLatitude}, ${r.checkInLongitude}`}
              </Button>
            ),
          },
          {
            title: 'Region',
            dataIndex: 'region',
          },
          {
            title: 'Salesperson',
            render: (_, r) => join([r.salespersonCode, r.salespersonName], ' - '),
          },
          {
            title: 'Status',
            render: (_, r) => (
              <Tag color={r.status === 'checked out' ? 'green' : 'red'}>{startCase(r.status)}</Tag>
            ),
          },
          {
            title: 'Sales Invoice',
            render: (_, r) => {
              if (r.salesInvoice !== undefined && r.salesInvoice !== null) {
                return (
                  <Button
                    type="link"
                    onClick={() =>
                      history.push(`${SalePaths.soInvoice}/detail/${r.salesInvoiceId}`)
                    }
                  >
                    {r.salesInvoice.invoiceNo}
                  </Button>
                );
              }
              return '-';
            },
          },
          // {
          //   title: 'Action',
          //   align: 'center',
          //   render: (_, r) => {
          //     return (
          //       <EditOutlined
          //         style={{ color: '#448DF7' }}
          //         onClick={() => {
          //           onEdit?.(r.id);
          //         }}
          //       />
          //     );
          //   },
          // },
        ]}
        actionHandlers={{
          onAdd: onAdd,
          //   onAdvanceSearchClicked: () => {
          //setAdvanceSearch({ visible: true });
          //   },
          onRequest: (criteria, pagination, sort) =>
            onRequestHandler({
              criteria: {
                ...criteria,
                advanceSearch: advanceSearchParams,
                sort,
              },
              pagination,
            }),
          onFirstLoad: () =>
            cacheList.fetchDataList('retailer-product').then((v) => {
              if (v) {
                setAdvanceSearchParams({
                  ...v.creteria?.criteria,
                  status: v.creteria?.criteria?.advanceSearch?.status ?? 'ALL',
                });
                return v.dataList;
              } else {
                return onRequestHandler({
                  criteria: {
                    advanceSearch: advanceSearchParams,
                  },
                });
              }
            }) as Promise<Paging<VisitDTO>>,
        }}
        tableProps={{
          actionRef: actionRef,
        }}
      />
      <GoogleMapModal
        open={googleModal.visible}
        onCancel={resetModal}
        onSubmit={resetModal}
        centerPoint={{ ...googleModal }}
      />
      <VisitReports
        salespersons={salesperson}
        title="Visit Rport"
        width="700px"
        open={report === 'visit-report'}
        onCancel={() => setReport(undefined)}
      />
    </PageContainer>
  );
};
