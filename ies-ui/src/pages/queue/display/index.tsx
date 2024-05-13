import {
  formatDateTime,
  isOffline,
  offlineToken,
  removeOfflineToken,
  server,
  setOfflineToken,
} from '@/pages/utils';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { simpleRequestActions } from '@/services/model';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CaretRightFilled,
  ClockCircleOutlined,
  FieldTimeOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  LogoutOutlined,
  ReloadOutlined,
  SelectOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Flex, List, Row, Space, Typography } from 'antd';
import _ from 'lodash';
import moment, { Moment } from 'moment';
import { useEffect, useRef, useState } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { QueueLayoutItemList } from '../services/queue';
import { QueueServices } from '../services/queue-service';
import LayoutConfigList from './LayoutConfigList';
import { useFullscreen } from 'ahooks';
import styles from './style.less';
import { history } from '@umijs/max';
import Login from '@/pages/User/Login';
import Item from 'antd/lib/list/Item';
import { FieldTimePicker, ProDescriptions, ProList } from '@ant-design/pro-components';

const { Title } = Typography;

type QueueDisplay = {
  id?: number;
  loadingId?: number;
  assignedDate?: Moment;
  ticketNo?: string;
  loadingDock?: string;
  driver?: string;
  truck?: string;
  startedTime?: Moment;
};

export default () => {
  const ref = useRef<any>();
  const [isFullscreen, { enterFullscreen, exitFullscreen }] = useFullscreen(ref);
  const [ticketList, setTicketList] = useState<QueueDisplay[]>([]);

  const [dispayGrid, setDisplayGrid] = useState<{ index: number, data?: QueueDisplay }[]>()
  const requestActions = simpleRequestActions();
  const services = DeliveryServiceAPI(requestActions);
  const [callLoading, setCallLoading] = useState<number[]>([]);
  const sound = new Audio('./../sound.mp3');
  const [forcePlaySound, setForcePlaySound] = useState(0);
  const [configVisible, SetConfigVisible] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<QueueLayoutItemList>();
  const [auth, setAuth] = useState(true);
  const [forceUpdate, setForceUpdate] = useState<{ increase: number, loadingId?: number }>({ increase: 1 })

  useEffect(() => {

    (async () => {
      if (!selectedLayout) {
        const rs = await QueueServices.fetchDefaultQueueLayout.query(requestActions);
        setSelectedLayout(rs);
      }
    })()
    const checkOffline = isOffline();

    var clientWebSocket = new ReconnectingWebSocket(`ws://${server}/event-emitter`);
    clientWebSocket.onopen = () => {
      clientWebSocket.onmessage = (ev) => {
        const message = ev.data as string;
        const data = message.split(':');
        const loadingId = parseInt(data.length > 1 ? data[1] : '0');
        console.log(selectedLayout);
        if (message.includes('refresh')) {
          setForceUpdate(v => ({ increase: v.increase + 1, loadingId: loadingId }))
          /*
          loadData().then(() => {
            if (loadingId > 0) {
              setForcePlaySound((v) => v + 1);
              setCallLoading((v) => [...v, loadingId]);
              setTimeout(() => {
                setCallLoading((v) => v.filter((it) => it !== loadingId));
              }, 3000);
            }
          });
          */
        }
      };
    };

    const auth = !checkOffline || offlineToken() !== null;
    setAuth(auth);
    auth && loadData();
  }, []);

  useEffect(() => {
    prepareLayout()
  }, [selectedLayout])

  useEffect(() => {
    isFullscreen && sound.play();
  }, [forcePlaySound]);

  useEffect(() => {
    if (selectedLayout && auth) {
      loadData();
    }
  }, [selectedLayout, auth]);


  useEffect(() => {
    if (selectedLayout && auth) {
      loadData().then(() => {
        if (forceUpdate.loadingId && forceUpdate.loadingId > 0) {
          setForcePlaySound((v) => v + 1);
          setCallLoading((v) => [...v, forceUpdate.loadingId || 0]);
          setTimeout(() => {
            setCallLoading((v) => v.filter((it) => it !== forceUpdate.loadingId));
          }, 3000);
        }
      });
    }
  }, [forceUpdate.increase]);

  const prepareLayout = async () => {
    const fillup =
      (selectedLayout?.columns || 0) * (selectedLayout?.rows || 0);
    const fillupNum = fillup > 0 ? fillup : 0;
    const fillupData = Array.from(Array(fillupNum).keys()).map((it) => ({ index: it }));
    setDisplayGrid(fillupData)
  }

  const loadData = async () => {
    const rs = await services.fetchQueueDisplayData(selectedLayout?.id);
    const list = rs.ticketList.map((it) => {
      const loading = rs.loading.find((i) => it.processInstance.id == i.processInstance.id);
      return {
        id: it.id,
        loadingId: loading?.id,
        ticketNo: it.ticketNum,
        assignedDate: loading?.assignedDate && moment(loading.assignedDate),
        loadingDock: loading?.loadingDock.name,
        driver: [it.processInstance.driver.firstName, it.processInstance.driver.lastName].join(' '),
        truck: it.processInstance.truck.licensePlate,
        startedTime: loading?.loadingStarted,
      } as QueueDisplay;
    })
    setTicketList([
      ..._.sortBy(
        list.filter((it) => it.assignedDate),
        'assignedDate',
      ).reverse(),
      ...list.filter((it) => !it.assignedDate),
    ]);
  };

  const gridRender = (item: { index: number, data?: QueueDisplay }) => {
    const ticket = ticketList.length > item.index ? ticketList[item.index] : undefined
    const color = ticket?.loadingDock ? '#ffbe6d' : '#dcdbd6';

    return (
      <List.Item

        style={{

          height: selectedLayout?.displayBoxHeight || undefined,
          width: selectedLayout?.displayBoxWidth || undefined,
          backgroundColor: color,
        }}
      >

        <Flex className={callLoading.some((it) => it == ticket?.loadingId) && styles.blinking} justify='space-between' align='center'>
          <Flex vertical align='flex-start'>
            <Typography.Text style={{ color: ticket?.loadingDock ? 'blue' : 'black', fontSize: 45, fontWeight: 'bolder' }}>
              {ticket?.ticketNo && ticket?.ticketNo}
            </Typography.Text>
            <Typography.Text style={{ fontSize: 20, fontWeight: 'bold', fontStyle: 'oblique' }} >{ticket?.truck && `${ticket?.truck}`}</Typography.Text>
          </Flex>
          <Flex> {ticket?.ticketNo && <CaretRightFilled style={{ fontSize: '32px', color: 'green' }} />}</Flex>
          <Flex vertical align='flex-end'>
            <Typography.Text style={{ color: ticket?.loadingDock ? 'blue' : 'black', fontSize: 45, fontWeight: 'bolder' }}>
              {ticket?.loadingDock || (ticket?.ticketNo && "រង់ចាំ")}
            </Typography.Text>
            <Typography.Text style={{ fontSize: 20, fontWeight: 'bold', fontStyle: 'oblique' }}>{ticket?.driver && `${ticket?.driver}`} </Typography.Text>

          </Flex>
        </Flex>

      </List.Item>
    );
  }

  const listRender = (item: { index: number, data?: QueueDisplay }) => {
    const ticket = ticketList.length > item.index ? ticketList[item.index] : undefined
    const color = ticket?.loadingDock ? '#ffbe6d' : '#dcdbd6';
    return <Item.Meta avatar={<FieldTimeOutlined />} title={ticket?.driver} description={ticket?.assignedDate} />
  }

  return (
    <div>
      {auth && (
        <Row>
          <Col>
            <Title level={4}>{selectedLayout?.layoutName}</Title>
          </Col>
          <Col flex="Auto" />
          <Col>
            <Space size={2}>
              {isOffline() && (
                <Button
                  type="link"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => {
                    history.push("/delivery/display")
                  }}
                />
              )}
              {isOffline() && (
                <Button
                  type="link"
                  icon={<LogoutOutlined />}
                  onClick={() => {
                    removeOfflineToken();
                    setAuth(false);
                  }}
                />
              )}

              {!isOffline() && (
                <Button
                  type="link"
                  icon={<SelectOutlined />}
                  onClick={() => {
                    history.push("/offline/delivery/display")
                  }}
                />
              )}

              <Button onClick={() => SetConfigVisible(true)} type="link" icon={<SettingOutlined />} />
              <Button
                type="link"
                onClick={() => {
                  loadData();
                }}
                icon={<ReloadOutlined />}
              />

              {isOffline() && (
                <Button
                  type="link"
                  icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                  onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                />
              )}
            </Space>
          </Col>
        </Row>
      )}
      {auth && (
        <div ref={ref}>
          <Card styles={{
            body: {
              backgroundColor: 'white'
            }
          }}>
            {isFullscreen && <List<{ index: number, data?: QueueDisplay }>
              grid={{ gutter: 15, lg: 3, md: 2, sm: 1, xs: 1, column: selectedLayout?.columns || 3 }}
              dataSource={dispayGrid}
              renderItem={gridRender}
            />}

            {!isFullscreen && <ProList<QueueDisplay> dataSource={ticketList}


              metas={{
                avatar: {
                  render: () => <FieldTimeOutlined />
                },
                title: {
                  render: (_, r) => r.truck
                },
                subTitle: {
                  render: (_, r) => r.ticketNo
                },
                description: {
                  render: (_, r) => <ProDescriptions<QueueDisplay> dataSource={r} column={4} columns={[
                    { title: "Ticket No", render: () => r.ticketNo },
                    { title: "Issued On", render: () => r.startedTime && formatDateTime(r.startedTime) },
                    { title: "Loading Dock", render: () => r.loadingDock || "Waiting" }
                  ]} />
                }
              }} />}
          </Card>
        </div>
      )}

      {!auth && (
        <Login
          onLogin={async (token) => {
            setOfflineToken(token);
            setAuth(true);
            await loadData();
          }}
        />
      )}

      <LayoutConfigList
        selectedItem={selectedLayout}
        onSelectedLayout={setSelectedLayout}
        open={configVisible}
        onClose={() => SetConfigVisible(false)}
      />
    </div>
  );
};
