import React, { useState } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { EditableProTable, ProCard, ProList, ProTable } from '@ant-design/pro-components';
import { Button, Popconfirm, Tag, Space, Typography, Input, Tooltip, Badge, Divider, theme, Empty, Segmented, message } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    FolderAddOutlined,
    ReloadOutlined,
    AppstoreOutlined,
    BarsOutlined,
    SettingOutlined,
    UnorderedListOutlined,
    TableOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    CheckOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { MasterData as MasterDataType, MasterDataItem } from './data.d';
import { useQuery } from '@umijs/max';
import { DataSetupService } from './service';
import { simpleRequestActions } from '@/services/model';
import DataSetupItemForm from './DataSetupItemForm';

const { Text } = Typography;

interface MasterItemViewProps {
    // selectedType: MasterDataType | null;
    // dataSource: MasterDataItem[];
    // setDataSource: (data: MasterDataItem[]) => void;
    // loading: boolean;
    // onRefresh: () => void;
    // onEditRow: (record: MasterDataItem) => void;
    // onSaveRow: (rowKey: React.Key, data: MasterDataItem) => Promise<void>;
    // onDeleteRow: (id: number) => void;
    // onMoveRow: (id: number, direction: 'up' | 'down') => void;
    // onCreateRootItem: () => void;
    // onCreateSubItem: (record: MasterDataItem) => void;
    // editableKeys: React.Key[];
    // setEditableRowKeys: (keys: React.Key[]) => void;
    // expandedRowKeys: React.Key[];
    // setExpandedRowKeys: (keys: React.Key[]) => void;
    dataSetup: any
}

export default function MasterItemView({
    dataSetup
}: MasterItemViewProps) {
    const { token } = theme.useToken();
    const actionRef = React.useRef<ActionType>();
    const requestAction = simpleRequestActions();
    const [modalAction, setModalAction] = useState<{ open: boolean, record?: MasterDataItem | null }>({ open: false, record: null });
    const { data, isFetching, refetch } = useQuery({
        queryKey: ['master-data-items', dataSetup?.id],
        queryFn: () => DataSetupService.pageDataSetupItems({
            criteria: { advanceSearch: { dataSetupId: dataSetup?.id } }
        }),
        refetchOnWindowFocus: false,
        // enabled: !!dataSetId
    })



    const columns: ProColumns<MasterDataItem>[] = [
        {
            title: 'Name',
            // dataIndex: 'nameEn',
            width: '20%',
            // formItemProps: {
            //     rules: [{ required: true, message: 'Name (EN) is required' }],
            // },
            render: (dom, entity) => (
                <Space direction='vertical'>
                    <Text style={{ whiteSpace: 'pre-line' }}>{entity.nameEn}</Text>
                    <Text type="secondary" style={{ whiteSpace: 'pre-line' }}>{entity.nameKm}</Text>
                </Space>
            )
        },
        {
            title: 'Code',
            dataIndex: 'code',
            width: '15%',
            render: (_, r) => <Space direction='vertical'>
                <Tag bordered={false} style={{ fontFamily: 'monospace' }}>{r.code}</Tag>
                {r.access?.map((a: string) => <Tag key={a}
                    icon={<CheckCircleOutlined />}
                    bordered={false}
                    color='success'
                >{a}</Tag>)}
            </Space>,
            formItemProps: {
                rules: [{ required: true, message: 'Code is required' }],
                getValueFromEvent: (e) => e.target.value?.toUpperCase(),
            },
        },
        {
            title: 'Description',
            dataIndex: 'descriptionEn',
            render: (dom, entity) => (
                <Space direction='vertical'>
                    <Text style={{ whiteSpace: 'pre-line' }}>{entity.descriptionEn}</Text>
                    <Text type="secondary" style={{ whiteSpace: 'pre-line' }}> {entity.descriptionKm}</Text>
                </Space>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            valueType: 'select',
            initialValue: 'Active',
            valueEnum: {
                Active: { text: 'Active', status: 'Success' },
                Inactive: { text: 'Inactive', status: 'Error' },
                Pending: { text: 'Pending', status: 'Warning' },
            },
            width: 100,
            render: (_: any, record: MasterDataItem) => (
                <Badge
                    status={record.status === 'Active' ? 'success' : record.status === 'Inactive' ? 'error' : 'warning'}
                    text={record.status}
                    style={{ color: record.status === 'Inactive' ? token.colorTextDisabled : undefined }}
                />
            )
        },
        {
            title: 'Action',
            valueType: 'option',
            width: 100,
            fixed: 'right',
            render: (text, record, _) => [
                <Tooltip title="Edit" key="edit">
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined style={{ color: token.colorWarning }} />}
                        onClick={() => record.id && setModalAction({
                            open: true,
                            record
                        })}
                    />
                </Tooltip>,
                <Tooltip title="Move Up" key="up">
                    <Button
                        type="text"
                        size="small"
                        icon={<ArrowUpOutlined />}
                    // onClick={() => record.id && onMoveRow(record.id, 'up')}
                    />
                </Tooltip>,
                <Tooltip title="Move Down" key="down">
                    <Button
                        type="text"
                        size="small"
                        icon={<ArrowDownOutlined />}
                    // onClick={() => record.id && onMoveRow(record.id, 'down')}
                    />
                </Tooltip>,
                // (
                //     <Tooltip title="Add Sub Item" key="sub">
                //         <Button
                //             type="text"
                //             size="small"
                //             icon={<FolderAddOutlined style={{ color: token.colorPrimary }} />}
                //         // onClick={() => onCreateSubItem(record)}
                //         />
                //     </Tooltip>
                // ),
                <Popconfirm
                    key="delete"
                    title="Delete?"
                // onConfirm={() => record.id && onDeleteRow(record.id)}
                >
                    <Tooltip title="Delete">
                        <Button type="text" size="small" icon={<DeleteOutlined style={{ color: token.colorError }} />} />
                    </Tooltip>
                </Popconfirm>,
            ],
        },
    ];


    return (
        <ProCard
            title={
                <Space size={16} align="center">
                    <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        backgroundColor: token.colorPrimaryBg, color: token.colorPrimary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                    }}>
                        {<AppstoreOutlined />}
                    </div>
                    <Text>{dataSetup?.name}</Text>
                </Space>
            }
            extra={
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setModalAction({ open: true })}
                    >
                        New Item
                    </Button>
                    <Button
                        onClick={() => refetch()}
                        type='link'
                        icon={<ReloadOutlined />}
                    />
                </Space>
            }
            style={{ height: '100%', overflow: 'hidden' }}
            bodyStyle={{ padding: 0 }}
        >

            <ProTable<MasterDataItem>
                actionRef={actionRef}
                rowKey="id"
                // scroll={{ y: 'calc(100vh - 260px)' }}
                cardProps={{ bodyStyle: { padding: 0 }, bordered: false }}
                loading={isFetching}
                columns={columns}
                dataSource={data?.items ?? []}
                // toolBarRender={() => [
                //     <Input.Search key="search" placeholder="Search items..." style={{ width: 200 }} />,
                // ]}
                options={false}
                search={false}
                pagination={false}
            />

            <DataSetupItemForm
                open={modalAction.open}
                record={modalAction.record}
                parent={dataSetup}
                lastRecord={data?.total || 0}
                onFinish={async (data) => {
                    await DataSetupService.saveDataSetupItem({
                        ...data,
                        id: modalAction.record?.id,
                        dataSetupId: dataSetup?.id
                    })(requestAction);
                    setModalAction({ open: false });
                    refetch();
                }}
                drawerProps={{
                    onClose: () => setModalAction({ open: false }),
                    width: 500
                }}
            />
        </ProCard>
    );
}
