import { formatDateTime, toReadable } from '@/pages/utils';
import { LoadingListItem, PickingSlipItem } from '@/services/delivery/data';
import { ProCard } from '@ant-design/pro-components';
import ProList from '@ant-design/pro-list';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { Button, Checkbox, Col, Descriptions, Drawer, DrawerProps, Row, Space, Spin, Timeline, Typography } from 'antd';
import { SortOrder } from 'antd/lib/table/interface';
import { useEffect, useRef } from 'react';
import { ViewController } from './vc';
import moment from 'moment';

type Props = DrawerProps & ViewController

export default ({
  data: { item },
  actions: { listLoadingItems },
  requestActions,
  view: { getActions },
  ...rest
}: Props) => {

  const actionRef = useRef<ActionType>();

  const onRequestHandler = async (
    pagination: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    const rs = await listLoadingItems?.({
      criteria: {
        advanceSearch: {
          id: item?.id || 0,
        },
        sort: sort,
      },
      pagination: pagination,
    });
    return {
      success: !!rs,
      total: rs?.total,
      data: rs?.items,
    };
  };

  useEffect(() => {
    if (rest.open) {
      actionRef.current?.reloadAndRest?.();
    }
  }, [rest.open]);

  const getStatus = () => {
    if (item?.allocated) return 'Serving';
    if (item?.isActive) return 'Available';
    if (!item?.isActive) return 'Inactive';
    return '';
  };

  return (
    <Drawer {...rest} styles={{
      body: {
        backgroundColor: '#f0f2f5'
      }
    }}
      extra={item && (<Space> {getActions?.('DETAIL')?.filter(it => it.visible && !it.seperator)?.map(it => (<Button
        icon={it.icon}
        onClick={() => it.onClick?.(item.id)}
        danger={it.type == 'Danger'}
        type={it.type == 'Primary' ? "primary" : 'default'}
        key={it.key}>{it.label}
      </Button>))}
      </Space>)}>
      <Spin spinning={requestActions.request?.loading || false}>
        {item?.ticketId && (
          <ProCard size="small" style={{ marginBottom: 10 }} title="Current Serving">
            <Row>
              <Col flex={'Auto'}>
                <Descriptions>
                  <Descriptions.Item label="Ticket">{item?.ticketNum}</Descriptions.Item>
                  <Descriptions.Item label="License Plate #">{item?.truckNo}</Descriptions.Item>
                  <Descriptions.Item label="Status">{item?.status}</Descriptions.Item>
                  <Descriptions.Item label="Started Date">
                    {item?.loadingStartedDate && formatDateTime(item?.loadingStartedDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ended Date">
                    {item?.loadingEndedDate && formatDateTime(item?.loadingEndedDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Owned Truck Loading"><Checkbox checked={item.ownedTruckLoading} /> </Descriptions.Item>
                  <Descriptions.Item label="Loading Team">{item?.loadingTeam?.name}</Descriptions.Item>
                  <Descriptions.Item label="Loading Type">{item?.loadingType == 0 ? "By Manual":item?.loadingType == 1 ? "By Pallet":""}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </ProCard>
        )}

        <ProCard size="small" title="Loading dock">
          <Row>
            <Col flex={'Auto'}>
              <Descriptions>
                <Descriptions.Item label="Truck Loading Capacity">
                  {item?.loadingCapacities.map((it) => it.name).join(', ') || 'All'}
                </Descriptions.Item>
                <Descriptions.Item label="Joined">
                  {item?.combinedLoadingDocks.map((it) => it.name).join(', ') || 'None'}
                </Descriptions.Item>
                <Descriptions.Item label="Status">{getStatus()}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </ProCard>

        {item?.picking && (
          <ProCard size="small" style={{ marginTop: 10 }} title="Picking Item">
            <ProTable<PickingSlipItem>
              search={false}
              dataSource={item.picking?.items || []}
              pagination={false}
              options={{
                density: false,
                reload: false,
                setting: false,
              }}
              columns={[
                { title: 'Item Code', dataIndex: 'itemCode' },
                { title: 'Item Description', dataIndex: 'itemDescription' },
                { title: 'UoM', dataIndex: 'uom' },
                { title: 'Batch Num', dataIndex: 'batchNum' },
                { title: 'WSH Code', dataIndex: 'whsCode' },
                { title: 'Qty', dataIndex: 'qty' },
              ]}
            />
          </ProCard>
        )}

        <ProCard title="Activities" size="small" style={{ marginTop: 5 }}>
          <Timeline mode="left">
            {item?.activities.map((it) => (
              <Timeline.Item key={`timeline-${it.id}`}>
                {`${formatDateTime(moment(it.actionDate))}, ${toReadable(it.action)} by ${it.actionBy}`}{' '}
                {it.remarks && `, Remarks: ${it.remarks}`}
              </Timeline.Item>
            ))}
          </Timeline>
        </ProCard>

        <ProCard collapsible defaultCollapsed size="small" style={{ marginTop: 10 }} title="History">
          <ProList<LoadingListItem>
            request={onRequestHandler}
            actionRef={actionRef}
            showActions="hover"
            metas={{
              title: { dataIndex: 'ticketNum' },
              subTitle: {
                render: (_, r) => <Typography.Text style={{ fontSize: 10 }} ellipsis
                  type={r.status == 'COMPLETED' ? 'success' : r.status == 'LOADED' ? 'warning' : r.status == 'LOADING' ? 'warning' : 'danger'} >
                  {toReadable(r.status)} </Typography.Text>
              },
              description: {
                render: (_, r) => (
                  <Descriptions style={{ width: 800 }}>
                    <Descriptions.Item label="Loading Time">
                      {[formatDateTime(r.loadingStarted), formatDateTime(r.loadingEnded)].filter(it => it).join(" to ")}
                    </Descriptions.Item>
                    <Descriptions.Item label="License Plate #">{r.truck.licensePlate}</Descriptions.Item>
                    <Descriptions.Item label="Driver Name">
                      {[r.driver.firstName, r.driver.lastName].filter((it) => it).join(' ')}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              actions: {
                render: (_, r) => (
                  <Space direction="vertical" size={0}>
                    {r.status === 'ON-HOLD' && !item?.ticketId && (
                      <Button type="link" onClick={() => {
                        //onRecallHandler(r.id) 
                      }}>
                        Recall
                      </Button>
                    )}
                    {r.status === 'ON-HOLD' && (
                      <Button type="link" onClick={() => { }}>
                        Cancel
                      </Button>
                    )}
                  </Space>
                ),
              },
            }}
          />
        </ProCard>
      </Spin>
    </Drawer>
  );
};