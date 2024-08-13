import AttachedFileList from '@/components/Attachment/AttachedFileList';
import { formatDateTime, formatter } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import { FieldTimeOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProDescriptions, ProList, ProTable } from '@ant-design/pro-components';
import { Card, Divider, Space, Spin, Tabs, Tag, Tooltip } from 'antd';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FleetPaths } from '..';
import BreadCrumbCom from '../components/BreadCrumbCom';
import { MaintenanceHistory, MaintenanceItem, MaintenneceDTO, MaintenneceDetailDTO } from './data';
import { MaintenanceServiceAPI } from './service';
import { history } from '@umijs/max';
import { ExternalLayout } from '../fleet';

interface Props {
  onEdit: (id: string) => void;
  onAdd?: () => void;
  id: string;
}

export default ({ id, onEdit }: Props) => {
  const requestActions = simpleRequestActions();
  const actionRef = useRef<ActionType>();
  const service = MaintenanceServiceAPI(requestActions);
  const [maintenanceData, setMaintenanceData] = useState<MaintenneceDetailDTO>();

  const initData = useCallback(async () => {
    setMaintenanceData(await service.detail(id));
  }, []);

  const routes = [
    {
      path: FleetPaths.fleet,
      label: 'Fleet',
    },
    {
      path: FleetPaths.mantenence + '/list',
      label: 'Maintenance',
    },
    {
      path: '',
      label: 'Detail',
    },
  ];

  useEffect(() => {
    initData();
  }, []);

  const durationDate = (r: MaintenneceDTO) => {
    if ((r.formDate && r.toDate) !== null) {
      const start = moment(r.formDate);
      const end = moment(r.toDate);
      return moment.duration(start.diff(end)).humanize();
    }
    return '';
  };

  return (
    <>
     <PageContainer 
      onBack={!ExternalLayout.isExternal("fleet/maintenance") ? ExternalLayout.handleBackHandler : undefined}
      title={"Maintenance"}
      subTitle={`#${maintenanceData?.vehicle?.plateNumber}`}
     >
     <Spin spinning={requestActions.request?.loading || false}>
        {/* <BreadCrumbCom separator=">" routes={routes} /> */}
        <Space size={12} direction="vertical">
          <Card key={'maintenance'} size={'small'}>
            <ProDescriptions<MaintenneceDetailDTO>
              dataSource={maintenanceData}
              contentStyle={{ fontWeight: 'bold' }}
              column={3}
              columns={[
                {
                  key: 'vehicle',
                  title: 'Truck Number',
                  dataIndex: 'vehicleNumber',
                  render: (_, r) => r.vehicle?.plateNumber,
                },
                {
                  key: 'vendor',
                  title: 'Driver',
                  render: (_, r) =>
                    [r.driver?.firstName, r.driver?.lastName].filter((it) => it).join('-'),
                },
                {
                  key: 'karas',
                  title: 'Vendor Name',
                  dataIndex: 'vendorName',
                  render: (_, r) => r.vendorName?.name,
                },
                {
                  key: 'meter',
                  title: 'Odometer',
                  dataIndex: 'odometer',
                  render: (_, r) => <Tag color="green">{r.odometer?.toFixed(2)} km</Tag>,
                },
                {
                  key: 'totalcost',
                  title: 'Total Amount',
                  dataIndex: 'totalCost',
                  render: (_, r) => <Tag color={'gold'}>{formatter.format(r.totalCost)}</Tag>,

                },
                {
                  key: 'status',
                  title: 'Status',
                  render: (_, r) => <Tag color={'gold'}>{r.status}</Tag>,

                },
                {
                  key: 'duration',
                  title: 'Duration Maintenance',
                  render: (_, r) => <Tooltip
                  title={
                    <>
                    <span>{moment(r.formDate).format('YYYY-MM-DD HH:mm:ss')}</span><br/>
                    <span>{moment(r.toDate).format('YYYY-MM-DD HH:mm:ss')}</span>
                    </>
                  }
                    color={'blue'}
                  >
                    {durationDate(r) || '-'}
                  </Tooltip>,
                  
                },
                {
                  key: 'reference',
                  title: 'Reference number',
                  dataIndex:"referentNumber",
                  span: 2
                },
                {
                  render: () => <Divider />,
                  span: 3
                },
                {
                  key: 'createdby',
                  title: 'Created By',
                  dataIndex: 'createdBy',
                  span: 3,

                },
                {
                  key: 'createddate',
                  title: 'Created Date',
                  valueType: "dateTime",
                  dataIndex: 'createdDate',
                },
              ]}
            />
          </Card>
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: `Maintenance Item`,
                children: (
                  <ProTable<MaintenanceItem>
                    dataSource={maintenanceData?.item}
                    toolBarRender={false}
                    search={false}
                    columns={[
                      {
                        key: 'itemName',
                        title: 'Items Service',
                        dataIndex: 'itemName',
                        search: false,
                        render: (_, r) => r.serviceId?.name,
                      },
                      {
                        title: 'Categories',
                        search: false,
                        key: 'itemName',
                        dataIndex: 'itemName',
                        render: (_, r) => r.sparePart?.name,
                      },
                      {
                        key: 'maintenanceType',
                        search: false,
                        title: 'Type',
                        render: (_, r) => r.maintenanceType?.name,
                      },
                      {
                        key: 'quantity',
                        search: false,
                        title: 'Quantity',
                        dataIndex: 'quantity',
                      },
                      {
                        key: 'uom',
                        search: false,
                        title: 'UOM',
                        dataIndex: 'uom',
                      },
                      {
                        search: false,
                        key: 'cost',
                        title: 'Cost',
                        dataIndex: 'cost',
                        render: (_, r) => formatter.format(r.cost),
                      },
                      {
                        search: false,
                        key: 'totalcost',
                        title: 'Total Cost',
                        dataIndex: 'totlaCost',
                        render: (_, r) => formatter.format(r.totalCost),
                      },
                      {
                        search: false,
                        key: 'warranty',
                        title: 'Warranty',

                        render: (_, r) =>
                          r.warrantyStartDate
                            ? [moment(r.warrantyStartDate).format("DD-MM-YYYY"), moment(r.warrantyEndDate).format("DD-MM-YYYY")]
                              .filter((it) => it)
                              .join(' / ')
                            : 'No Warranty',
                      },
                    ]}
                  ></ProTable>
                ),
              },
              {
                key: '2',
                label: `Attachment`,
                children: <AttachedFileList initFiles={maintenanceData?.attacheFile} readonly />,
              },
              {
                key: '3',
                label: `Activity`,
                children: (
                  <Card>
                    <ProList<MaintenanceHistory>
                      dataSource={maintenanceData?.history}
                      actionRef={actionRef}
                      metas={{
                        avatar: { render: () => <FieldTimeOutlined style={{ color: '#00b7f1' }} /> },
                        title: { dataIndex: 'activityType' },
                        subTitle: {
                          render: (_, r) =>
                            `by ${r.createdBy} ${moment(moment(r.createdDate)).fromNow()}`,
                        },
                        description: { dataIndex: 'remark' },
                        actions: { render: (_, r) => [formatDateTime(moment(r.createdDate))] },
                      }}
                    />
                  </Card>
                ),
              },
            ]}
          />
        </Space>
      </Spin>
     </PageContainer>
    </>
  );
};

