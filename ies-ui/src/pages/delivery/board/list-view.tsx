import { execDataService0, fetchDataItemService, singleRequest } from '@/services/apiGateway';
import { InstanceSrvParams } from '@/services/delivery/instance-service-params';
import {
    InstanceAdvanceSearchParams,
    InstanceListItem,
} from '@/services/delivery/instance.types';
import ProList from '@ant-design/pro-list';
import {
    Affix,
    Badge,
    Button, Checkbox, Col, Descriptions, Input,
    message, Popconfirm, Row, Space, Spin, Tag,
} from 'antd';
import forkLift from '@/assets/fork-lift.png';
import slipIcon from '@/assets/packing-list.png';
import shippingIcon from '@/assets/shipping.png';
import {
    CheckCircleOutlined, ClockCircleOutlined,
    ExclamationCircleOutlined,
    HistoryOutlined, HourglassOutlined, InfoCircleOutlined, LoginOutlined,
    LogoutOutlined, PauseCircleOutlined, PlayCircleOutlined,
    ReloadOutlined, StopOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { history } from 'umi';
import { DeliveryPaths } from '..';
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import ReconnectingWebSocket from 'reconnecting-websocket';
import styles from './style.less';
import { CheckCard, ProCard, ProDescriptions } from '@ant-design/pro-components';
import { durationFormat, server, toReadable } from '@/pages/utils';
import DropdownButton from 'antd/es/dropdown/dropdown-button';
import { ViewController } from './view-controller';
import { getStatus } from '.';
import moment from 'moment';
import Checkin from '../checkin';
import { OperatorCheckIn } from './data';
import RemarkModalV2 from '@/components/remark-modal-v2';
import CheckinInfo from '../checkin/CheckinInfo';
import _ from 'lodash';

const HOLD = "HOLD"
const NONE_DN = "NONE_DN"
const DN_ASSIGNED = "DN_ASSIGNED"
const TRUCK_LOADING = "TRUCK_LOADING"
const NONE_DOC = "NONE_DOC"
const DOC_ASSIGNED = "DOC_ASSIGNED"
const TRIP_STARTED = "TRIP_STARTED"
const SHIPPING_CHANGED = "SHIPPING_CHANGED"


export default ({
    requestActions,
    view: { actionRef, getActions },
    actions: {
        onOpenModal,
    },
}: ViewController) => {

    const [status, setStatus] = useState<{ loading?: number; delivery?: number }>();
    const [operatorCheckIn, setOperatorCheckIn] = useState<OperatorCheckIn>()
    const [statusFilter, setStatusFilter] = useState<string>('NONE_DN')
    const [list, setList] = useState<InstanceListItem[]>()
    const [statusCount, setStatusCount] = useState<{ status: string, count?: number }[]>([

    ])

    const [searchParams, setSearchParams] = useState<
        TableViewSearchParams<InstanceAdvanceSearchParams>
    >({
        criteria: {
            advanceSearch: {
                canAssignDocs: undefined,
                canPick: false,
                activity: 'ALL',
                status: 'ALL',
                activeOnly: false,
            },
        },
    });

    const onRequestHandler = async (params: TableViewSearchParams<InstanceAdvanceSearchParams>) => {
        try {
            const rs = (await singleRequest(InstanceSrvParams.listBoard(params))(requestActions)) as InstanceListItem[];
            setStatus({
                loading: rs.filter((it) => params.criteria?.advanceSearch?.activity === 'LOADING' && !it.delivery).length,
                delivery: rs.filter((it) => params.criteria?.advanceSearch?.activity === 'DELIVERY' && it.delivery).length,
            });

            const result = rs
                .filter(it =>
                    'ALL' === params.criteria?.advanceSearch?.activity ||
                    (params.criteria?.advanceSearch?.activity === 'LOADING' && !it.delivery) ||
                    (params.criteria?.advanceSearch?.activity === 'DELIVERY' && it.delivery),
                )

            const list1 = _.sortBy<InstanceListItem>(result, it => it.ticketNum + (10000 * it.reset)).reverse()
            const list2 = _.sortBy<InstanceListItem>(list1, it => it.priority).reverse()
            setList(list2)
            const list3 = list2.filter(it => it.changeRequest || !(it.isOwner && (it.loading.status == "PENDING" || it.loading.status == "LOADED")))

            const list = statusFilter ? list3 : _.sortBy<InstanceListItem>(list3, it => {
                if (!it.loading.canPick && it.activity == "LOADING" && it.loading.status == 'PENDING' && !it.holdBy) {
                    return 1
                }
                else if (it.activity == "DELIVERY" && it.delivery.status == 'PENDING' && !it.delivery.assignedDocDate && !it.holdBy) {
                    return 10
                } else if (it.holdBy) {
                    return 20
                } else if (it.activity == "DELIVERY" && it.delivery.status == 'PENDING' && !it.delivery.startedDate && !!it.delivery.assignedDocDate) {
                    return 30
                } else if (it.activity == "LOADING" && it.loading.status == 'LOADING' && !it.holdBy) {
                    return 40
                } else if (!!it.endedDate) {
                    return 50
                } else if (it.activity == "DELIVERY" && !!it.delivery.startedDate) {
                    return 60

                } else return 100

            })


            setStatusCount([
                { status: HOLD, count: list.filter(it => it.holdBy).length },
                { status: NONE_DN, count: list.filter(it => !it.loading.canPick && it.activity == "LOADING" && it.loading.status == 'PENDING' && !it.holdBy).length },
                { status: DN_ASSIGNED, count: list.filter(it => it.loading.canPick && it.activity == "LOADING" && it.loading.status == 'PENDING' && !it.holdBy).length },
                { status: TRUCK_LOADING, count: list.filter(it => it.loading.canPick && it.activity == "LOADING" && (it.loading.status == 'LOADING' || it.loading.status == 'LOADING_STARTED') && !it.holdBy).length },
                { status: NONE_DOC, count: list.filter(it => it.activity == "DELIVERY" && it.delivery.status == 'PENDING' && !it.delivery.assignedDocDate && !it.holdBy).length },
                { status: DOC_ASSIGNED, count: list.filter(it => it.activity == "DELIVERY" && it.delivery.status == 'PENDING' && !!it.delivery.assignedDocDate && !it.holdBy).length },
                { status: TRIP_STARTED, count: list.filter(it => it.activity == "DELIVERY" && !!it.delivery.startedDate && !it.endedDate).length },
                { status: SHIPPING_CHANGED, count: list.filter(it => it.activity == "DELIVERY" && !!it.delivery.startedDate && !!it.endedDate).length },
            ])
            return {
                data: list.filter(it => !statusFilter || (statusFilter == HOLD && it.holdBy) ||
                    (statusFilter == NONE_DN && !it.loading.canPick && it.activity == "LOADING" && it.loading.status == 'PENDING' && !it.holdBy) ||
                    (statusFilter == DN_ASSIGNED && it.loading.canPick && it.activity == "LOADING" && it.loading.status == 'PENDING' && !it.holdBy) ||
                    (statusFilter == TRUCK_LOADING && it.loading.canPick && it.activity == "LOADING" && (it.loading.status == 'LOADING' || it.loading.status == 'LOADING_STARTED') && !it.holdBy) ||
                    (statusFilter == NONE_DOC && it.activity == "DELIVERY" && it.delivery.status == 'PENDING' && !it.delivery.assignedDocDate && !it.holdBy) ||
                    (statusFilter == DOC_ASSIGNED && it.activity == "DELIVERY" && it.delivery.status == 'PENDING' && !!it.delivery.assignedDocDate && !it.holdBy) ||
                    (statusFilter == TRIP_STARTED && it.activity == "DELIVERY" && !!it.delivery.startedDate && !it.endedDate) ||
                    (statusFilter == SHIPPING_CHANGED && it.activity == "DELIVERY" && !!it.delivery.startedDate && !!it.endedDate)
                )
            };


        } catch (error: any) {
            message.error(error.message || 'Failed to load data');
            return Promise.reject();
        }
    };

    const getTagDataList = (item: InstanceListItem) => {
        const status = getStatus(item)
        return [
            { key: 'pickingSlipAssigned', title: 'Picking Slip', color: 'success', icon: <CheckCircleOutlined />, visible: status.delivering || status.pendingDelivery || status.isLoading },
            { key: 'loaded', title: 'Loaded', color: 'success', icon: <CheckCircleOutlined />, visible: status.delivering || status.pendingDelivery },
            { key: 'docAssigned', title: 'DN, INV', icon: <CheckCircleOutlined />, color: 'success', visible: status.delivering },
            { key: 'hold', title: 'Hold', icon: <PauseCircleOutlined />, color: 'warning', visible: !!item.holdBy },
            { key: 'pickingChangeRequested', title: 'Picking Change', icon: <ClockCircleOutlined />, color: 'warning', visible: item.changeRequest },
        ]

    }

    const getIcon = (item: InstanceListItem) => {
        if (item.activity === 'LOADING' && item.loading.status === 'PENDING') {
            return slipIcon;
        } else if (item.activity === 'LOADING' && item.loading.status === 'LOADING') {
            return forkLift;
        } else if (item.activity === 'DELIVERY') {
            return shippingIcon;
        }

        return forkLift;
    };

    const getColor = (item: InstanceListItem) => {
        if (item.holdBy) return styles.color2;
        if (item.endedDate !== null) return styles.color1;
        if (item.delivery?.assignedDocDate || (!item.delivery && item.loading.loadingStarted))
            return styles.color2;
        if (item.activity === 'DELIVERY') return styles.color3;
        return styles.color4;
        // const color = (item.delivery?.assignedDocDate || (!item.delivery && item.loading.loadingStarted)) ? '#D3D3D3' : '#d8f9ff';
    };

    const renderServingCreateDN = () => {

        const itemToClaim = list?.find(it => !it.claimedBy && !it.holdBy && !it.loading.canPick && it.loading.status == 'PENDING')
        const claimedItem = list?.find(it => it.isOwner && !it.holdBy && !it.loading.canPick && it.loading.status == 'PENDING')

        return <ProCard style={claimedItem && { backgroundColor: 'Highlight' }} bordered boxShadow colSpan={'50%'} title="Issue DN from SAP" extra={

            (() => {
                if (claimedItem) {
                    const actions = getActions?.('LIST', claimedItem).filter(it => it.visible)
                    const mainAction = actions?.find(it => it.main)
                    return <DropdownButton size='small' onClick={() => {
                        mainAction?.onClick?.(claimedItem.id)
                    }} key={claimedItem.id}
                        menu={{
                            items: actions?.filter(it => it.key != mainAction?.key).map(it => ({
                                icon: it.icon, key: it.key, label: it.label, onClick: () => it.onClick?.(claimedItem.id),
                                danger: it.type == 'Danger'
                            }))
                        }} > {
                            mainAction?.label
                        }</DropdownButton>
                }
                if (itemToClaim)
                    return <Button icon={<PlayCircleOutlined />}
                        onClick={() => {
                            getActions?.('LIST', itemToClaim).find(it => it.key == 'claimed')?.onClick?.(itemToClaim?.id)
                        }}
                        loading={requestActions.request?.loading || false}
                        disabled={!operatorCheckIn} size='small' type='primary'>
                        Serve Next
                    </Button>

                return <Tag>No waiting</Tag>
            })()

        }>
            {/* {renderServingCreateDN()} */}

            <Descriptions>
                <Descriptions.Item contentStyle={{ fontWeight: 'bolder' }} label="Ticket #">
                    {claimedItem?.ticketNo}
                </Descriptions.Item>
                <Descriptions.Item label="Driver">{[claimedItem?.driver?.firstName, claimedItem?.driver?.lastName].filter(it => it).join(" ")}</Descriptions.Item>
                <Descriptions.Item label="Truck">{claimedItem?.truck?.licensePlate}</Descriptions.Item>
                <Descriptions.Item label="Capacity">{claimedItem?.truck?.loadingCapacity?.name}</Descriptions.Item>
                <Descriptions.Item label="Status">{[claimedItem?.activity, claimedItem?.loading.status].filter(it => it)?.map(it => toReadable(it)).join(" / ")}</Descriptions.Item>
            </Descriptions>

        </ProCard>

    }

    const renderAssignDn = () => {

        const itemToClaim = list?.find(it => !it.claimedBy && !it.holdBy && it.loading.status == 'LOADED' && !it.changeRequest)
        const claimedItem = list?.find(it => it.isOwner && !it.holdBy && it.loading.status == 'LOADED' && !it.changeRequest)

        return <ProCard style={claimedItem && { backgroundColor: 'Highlight' }} bordered boxShadow colSpan={'50%'} title="Assign Docs" extra={
            (() => {
                if (claimedItem) {
                    const actions = getActions?.('LIST', claimedItem).filter(it => it.visible)
                    const mainAction = actions?.find(it => it.main)
                    return <DropdownButton size='small' onClick={() => {
                        mainAction?.onClick?.(claimedItem.id)
                    }}
                        key={claimedItem.id}
                        menu={{
                            items: actions?.filter(it => it.key != mainAction?.key).map(it => ({
                                icon: it.icon, key: it.key, label: it.label, onClick: () => it.onClick?.(claimedItem.id),
                                danger: it.type == 'Danger'
                            }))
                        }} > {
                            mainAction?.label
                        }</DropdownButton>
                }

                if (itemToClaim)
                    return <Button icon={<PlayCircleOutlined />}
                        loading={requestActions.request?.loading || false}
                        onClick={() => {
                            getActions?.('LIST', itemToClaim).find(it => it.key == 'claimed')?.onClick?.(itemToClaim?.id)
                        }}
                        disabled={!operatorCheckIn} size='small' type='primary'>
                        Serve Next
                    </Button>


                return <Tag>No waiting</Tag>
            })()
        }>
            <Descriptions>
                <Descriptions.Item contentStyle={{ fontWeight: 'bolder' }} label="Ticket #">
                    {claimedItem?.ticketNo}
                </Descriptions.Item>
                <Descriptions.Item label="Driver">{[claimedItem?.driver?.firstName, claimedItem?.driver?.lastName].filter(it => it).join(" ")}</Descriptions.Item>
                <Descriptions.Item label="Truck">{claimedItem?.truck?.licensePlate}</Descriptions.Item>
                <Descriptions.Item label="Capacity">{claimedItem?.truck?.loadingCapacity?.name}</Descriptions.Item>
                <Descriptions.Item label="Status">{[claimedItem?.activity, claimedItem?.loading.status].filter(it => it)?.map(it => toReadable(it)).join(" / ")}</Descriptions.Item>
            </Descriptions>
        </ProCard>

    }

    const fetchOperatorCheckIn = async () => {
        const rs = await fetchDataItemService<OperatorCheckIn, { type: string }>({
            actionName: 'fetch-operator-check-in',
            endpoint: 'DELIVERY',
            payload: { type: 'DELIVERY' }
        }).query(requestActions)

        setOperatorCheckIn(rs)

        actionRef.current?.reloadAndRest?.()
    }

    useEffect(() => {
        let clientWebSocket = new ReconnectingWebSocket(`ws://${server}/event-emitter`);
        clientWebSocket.onopen = () => {
            clientWebSocket.onmessage = (ev) => {
                const message = ev.data as string;
                if (message.includes('refresh')) {
                    actionRef.current?.reloadAndRest?.();
                }
            };
        };

        fetchOperatorCheckIn()
    }, []);
    useEffect(() => {
        actionRef.current?.reloadAndRest?.();
    }, [
        searchParams.criteria?.advanceSearch?.activity,
        searchParams.criteria?.advanceSearch?.status,
        searchParams.criteria?.advanceSearch?.activeOnly,
        statusFilter
    ]);
    return (
        <>
            <Row style={{ marginBottom: 10 }}>
                <Col flex="300px">
                    {' '}
                    <Input.Search
                        allowClear
                        onSearch={(value) => {
                            setSearchParams((v) => ({
                                ...v,
                                criteria: {
                                    ...v.criteria,
                                    searchValue: value,
                                },
                            }));
                            actionRef.current?.reloadAndRest?.();
                        }}
                    />
                </Col>
                <Col flex="20px" />

                <Col flex={'Auto'}></Col>
                <Col>
                    <Space>
                        {!operatorCheckIn && <Checkin type='DELIVERY' onRefresh={fetchOperatorCheckIn} trigger={<Button icon={<LoginOutlined />} type='primary' >Check In </Button>} />}
                        {operatorCheckIn && <CheckinInfo trigger={<Button icon={<InfoCircleOutlined />} />} type={'DELIVERY'} />}
                        {operatorCheckIn && <RemarkModalV2<OperatorCheckIn> trigger={<Button icon={<LogoutOutlined />} danger>Checkout </Button>} item={operatorCheckIn}
                            onSave={async (_, remarks) => {

                                try {
                                    await execDataService0<{ type: string, remarks?: string }>({
                                        actionName: 'operator-checkout',
                                        endpoint: 'DELIVERY',
                                        payload: { type: 'DELIVERY', remarks: remarks }
                                    })(requestActions)
                                    fetchOperatorCheckIn()
                                    actionRef.current?.reloadAndRest?.()
                                    return true
                                } catch (error: any) {
                                    message.error(error.message || 'Failed to checkout.')
                                    return false
                                }

                            }} />}
                        <Button
                            // type="link"
                            onClick={() => {
                                history.push(DeliveryPaths.history);
                            }}
                            icon={<HistoryOutlined />}
                        >
                            Transanction
                        </Button>
                        <Button
                            type="link"
                            onClick={() => actionRef.current?.reloadAndRest?.()}
                            icon={<ReloadOutlined />}
                        />
                    </Space>
                </Col>
            </Row>
            <Spin spinning={requestActions.request?.loading || false}>
                <ProCard split="horizontal">
                    <Affix offsetTop={50}>
                        <ProCard gutter={5}>
                            {renderServingCreateDN()}
                            {renderAssignDn()}
                        </ProCard>
                    </Affix>
                    <ProCard>
                        <CheckCard.Group onChange={values => setStatusFilter(values as string)} size='small' defaultValue={statusFilter}>
                            <CheckCard style={{ width: 110 }} value={HOLD} avatar={<PauseCircleOutlined />} title="Hold" extra={<Badge count={statusCount.find(it => it.status == HOLD)?.count} />} />
                            <CheckCard style={{ width: 140 }} value={NONE_DN} avatar={<StopOutlined />} title="None DN" extra={<Badge count={statusCount.find(it => it.status == NONE_DN)?.count} />} />
                            <CheckCard style={{ width: 170 }} value={DN_ASSIGNED} avatar={<CheckCircleOutlined />} title="DN Assigned" extra={<Badge style={{ backgroundColor: '#52c41a' }} count={statusCount.find(it => it.status == DN_ASSIGNED)?.count} />} />
                            <CheckCard style={{ width: 180 }} value={TRUCK_LOADING} avatar={<HourglassOutlined />} title="Truck Loading" extra={<Badge style={{ backgroundColor: '#52c41a' }} count={statusCount.find(it => it.status == TRUCK_LOADING)?.count} />} />
                            <CheckCard style={{ width: 210 }} value={NONE_DOC} avatar={<StopOutlined />} title="Docs not Assigned" extra={<Badge count={statusCount.find(it => it.status == NONE_DOC)?.count} />} />
                            <CheckCard style={{ width: 180 }} value={DOC_ASSIGNED} avatar={<CheckCircleOutlined />} title="Docs Assigned" extra={<Badge style={{ backgroundColor: '#52c41a' }} count={statusCount.find(it => it.status == DOC_ASSIGNED)?.count} />} />
                            <CheckCard style={{ width: 180 }} value={TRIP_STARTED} avatar={<CheckCircleOutlined />} title="Trip Started" extra={<Badge style={{ backgroundColor: '#52c41a' }} count={statusCount.find(it => it.status == TRIP_STARTED)?.count} />} />
                            <CheckCard style={{ width: 180 }} value={SHIPPING_CHANGED} avatar={<ExclamationCircleOutlined />} title="Ship. Changed" extra={<Badge count={statusCount.find(it => it.status == SHIPPING_CHANGED)?.count} />} />
                        </CheckCard.Group>
                        <ProList<InstanceListItem>
                            showActions='hover'
                            size='small'
                            loading={false}
                            request={(criteria, pagination) =>
                                onRequestHandler({
                                    criteria: {
                                        ...criteria,
                                        searchValue: searchParams.criteria?.searchValue,
                                        advanceSearch: searchParams.criteria?.advanceSearch,
                                    },
                                    pagination,
                                })
                            }
                            actionRef={actionRef}
                            rowClassName={(record: InstanceListItem) => getColor(record)}
                            metas={{
                                avatar: { render: (_, r) => <img height="50px" src={getIcon(r)} /> },
                                title: {
                                    render: (_, r) => <a onClick={() => onOpenModal('LIST', 'detail', r.id, true)}>{[r.driver.firstName, r.driver.lastName].filter((it) => it).join(' ')}</a>
                                },
                                subTitle: {
                                    render: (_, r) => (<Space>
                                        {r.truck.licensePlate}
                                        {
                                            getTagDataList(r).filter(it => it.visible).map(it => (<Tag key={it.key} icon={it.icon} color={it.color}>{it.title}</Tag>))
                                        }
                                        {<Tag icon={<ClockCircleOutlined spin />} color="processing">{toReadable(r.activity)} - {toReadable(r.status)}</Tag>}
                                    </Space>)
                                },
                                description: {
                                    render: (_, r) => {
                                        return <div>
                                            <ProDescriptions size='small' column={4} style={{ width: 'calc(100vh - 5px)' }}>
                                                <ProDescriptions.Item label="Ticket No"> {r.ticketNo}</ProDescriptions.Item>
                                                <ProDescriptions.Item label="Loading Dock"> {r.loading.loadingDock}</ProDescriptions.Item>
                                                {
                                                    r.loading.status == 'PENDING' && <ProDescriptions.Item label="Waiting time">{
                                                        moment(r.loading.assignedDate).toNow()
                                                    }</ProDescriptions.Item>
                                                }

                                                {
                                                    r.loading.status == 'LOADING' && r.loading.loadingStarted && <ProDescriptions.Item label="Loading time">{
                                                        moment(r.loading.loadingStarted).toNow()
                                                    }</ProDescriptions.Item>
                                                }
                                                {
                                                    r.delivery?.status == 'PENDING' && r.delivery.deliveryDate && !r.delivery?.assignedDocDate && <ProDescriptions.Item label="Waiting time(Docs)">{
                                                        moment(r.delivery.deliveryDate).toNow()
                                                    }</ProDescriptions.Item>
                                                }
                                                {
                                                    r.delivery?.status == 'PENDING' && r.delivery?.assignedDocDate && <ProDescriptions.Item label="Waiting time">{
                                                        moment(r.delivery.assignedDocDate).toNow()
                                                    }</ProDescriptions.Item>
                                                }
                                                {
                                                    r.delivery?.status == 'IN_PROGRESS' && <ProDescriptions.Item label="Delivery time">{
                                                        moment(r.delivery.startedDate).toNow()
                                                    }</ProDescriptions.Item>
                                                }
                                                {
                                                    r.delivery?.status == 'DELIVERED' && <ProDescriptions.Item label="Delivery duration">{
                                                        durationFormat(moment(r.delivery.startedDate), moment(r.delivery.finishedDate))
                                                    }</ProDescriptions.Item>
                                                }

                                                {r.claimedBy && <ProDescriptions.Item label="Claimed By"> {r.claimedBy || 'N/A'} </ProDescriptions.Item>}
                                                {r.loading.ownedTruckLoading && <ProDescriptions.Item label="Owned Truck Loading"> <Checkbox checked /> </ProDescriptions.Item>}
                                            </ProDescriptions>
                                        </div>
                                    }
                                },

                                actions: {
                                    render: (_, r) => {
                                        if (!r.changeRequest && r.holdBy && ((!r.loading.canPick && r.loading.status == "PENDING") || r.loading.status == "LOADED") && !list?.some(it => it.isOwner && (it?.loading?.status === 'PENDING' || it.loading.status == 'LOADED'))) {
                                            return <Button onClick={() => {
                                                getActions?.('LIST', r).find(it => it.key == 'claimed')?.onClick?.(r?.id)
                                            }}>Unhold</Button>
                                        }
                                        if (!r.changeRequest && (r?.loading?.status === 'PENDING' || r.loading.status == 'LOADED')) {
                                            return
                                        }

                                        const actions = getActions?.('LIST', r).filter(it => it.visible)

                                        if (actions?.length == 1) {
                                            const action = actions[0]
                                            return <Button type='link' icon={action.icon} onClick={() => action.onClick?.(r.id)} >{action.label}</Button>
                                        }

                                        const mainAction = actions?.find(it => it.main)



                                        return <DropdownButton onClick={() => {
                                            mainAction?.onClick?.(r.id)
                                        }} key={r.id}
                                            menu={{
                                                items: actions?.filter(it => it.key != mainAction?.key).map(it => ({
                                                    icon: it.icon, key: it.key, label: it.label, onClick: () => it.onClick?.(r.id),
                                                    danger: it.type == 'Danger'
                                                }))
                                            }} > {
                                                mainAction?.label
                                            }</DropdownButton>
                                    }
                                }

                            }}
                        />
                    </ProCard>
                </ProCard>
            </Spin>
        </>

    );
};
