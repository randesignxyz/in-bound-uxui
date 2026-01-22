
import React, { useState, useEffect } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { EditableProTable, ProCard, ProList, ModalForm, ProFormText, ProFormSwitch, ProFormTextArea } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Tag, Space, Typography, Input, Tooltip, Badge, Divider, Select, theme, Empty } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    FolderAddOutlined,
    SearchOutlined,
    ReloadOutlined,
    AppstoreOutlined,
    BarsOutlined,
    SettingOutlined,
    MoreOutlined,
    UnorderedListOutlined,
    TableOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons';
import { MasterDataService } from './service';
import { MasterData as MasterDataType, MasterDataItem, mockMasterDataItems, mockMasterDataTypes } from './data.d';
import { Segmented } from 'antd'; // Add Segmented

const { Text, Title, Paragraph } = Typography;

export default function MasterDataPage() {
    const { token } = theme.useToken();
    const actionRef = React.useRef<ActionType>();

    // Data States
    const [masterDataTypes, setMasterDataTypes] = useState<MasterDataType[]>([]);
    const [selectedType, setSelectedType] = useState<MasterDataType | null>(null);
    const [dataSource, setDataSource] = useState<MasterDataItem[]>([]);

    // UI States
    const [loadingTypes, setLoadingTypes] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [createTypeModalVisible, setCreateTypeModalVisible] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'list'>('table'); // View Mode State

    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

    // --- Initial Load ---
    useEffect(() => {
        loadTypes();
    }, []);

    const loadTypes = async () => {
        setLoadingTypes(true);
        try {
            const types = await MasterDataService.getTypes();
            setMasterDataTypes(types);
            if (types.length > 0 && !selectedType) {
                setSelectedType(types[0]);
            }
        } finally {
            setLoadingTypes(false);
        }
    };

    // --- Load Items when Type Changes ---
    useEffect(() => {
        if (selectedType) {
            loadItems(selectedType.id);
        } else {
            setDataSource([]); // Clear data if no type is selected
        }
    }, [selectedType]);

    const loadItems = async (typeId: number) => {
        setLoadingData(true);
        try {
            const items = await MasterDataService.getItems(typeId);
            setDataSource(items);
        } finally {
            setLoadingData(false);
        }
    };

    // --- Persistence Helper ---
    // We save the ENTIRE list for this type whenever it changes
    const persistItems = (newItems: MasterDataItem[]) => {
        setDataSource(newItems);
        if (selectedType) {
            MasterDataService.saveAllItems(newItems, selectedType.id);
        }
    }

    // --- Helpers for Tree Data ---
    const addChildToNode = (nodes: MasterDataItem[], parentId: number, newChild: MasterDataItem): MasterDataItem[] => {
        return nodes.map((node) => {
            if (node.id === parentId) {
                return {
                    ...node,
                    children: node.children ? [...node.children, newChild] : [newChild],
                };
            }
            if (node.children) {
                return {
                    ...node,
                    children: addChildToNode(node.children, parentId, newChild),
                };
            }
            return node;
        });
    };

    const deleteNode = (nodes: MasterDataItem[], id: number): MasterDataItem[] => {
        return nodes
            .filter((node) => node.id !== id)
            .map((node) => {
                if (node.children) {
                    return {
                        ...node,
                        children: deleteNode(node.children, id),
                    };
                }
                return node;
            });
    };

    const updateNode = (nodes: MasterDataItem[], updatedItem: MasterDataItem): MasterDataItem[] => {
        return nodes.map(node => {
            if (node.id === updatedItem.id) {
                return { ...node, ...updatedItem };
            }
            if (node.children) {
                return {
                    ...node,
                    children: updateNode(node.children, updatedItem)
                }
            }
            return node;
        })
    }

    const moveNode = (nodes: MasterDataItem[], id: number, direction: 'up' | 'down'): MasterDataItem[] => {
        const index = nodes.findIndex(n => n.id === id);

        // If found in current level
        if (index !== -1) {
            const newNodes = [...nodes];
            if (direction === 'up' && index > 0) {
                [newNodes[index], newNodes[index - 1]] = [newNodes[index - 1], newNodes[index]];
                return newNodes;
            }
            if (direction === 'down' && index < newNodes.length - 1) {
                [newNodes[index], newNodes[index + 1]] = [newNodes[index + 1], newNodes[index]];
                return newNodes;
            }
            return nodes; // Cannot move
        }

        // Search in children
        return nodes.map(node => {
            if (node.children) {
                return {
                    ...node,
                    children: moveNode(node.children, id, direction)
                };
            }
            return node;
        });
    };

    const getAllKeys = (data: MasterDataItem[]): React.Key[] => {
        let keys: React.Key[] = [];
        data.forEach((item) => {
            if (item.children && item.children.length > 0) {
                keys.push(item.id);
                keys = keys.concat(getAllKeys(item.children));
            }
        });
        return keys;
    };

    useEffect(() => {
        setExpandedRowKeys(getAllKeys(dataSource));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataSource.length, selectedType?.id]);

    // --- Handlers ---

    const handleCreateSubItem = (record: MasterDataItem) => {
        const newId = Date.now() + Math.random();
        const newChild: MasterDataItem = {
            id: newId,
            mdTypeId: selectedType!.id,
            code: '',
            parentId: record.id,
            status: 'ACTIVE'
        };

        const newData = addChildToNode(dataSource, record.id, newChild);
        persistItems(newData);

        setEditableRowKeys((prev) => [...prev, newId]);
        if (!expandedRowKeys.includes(record.id)) {
            setExpandedRowKeys((prev) => [...prev, record.id]);
        }
    };

    const handleCreateRootItem = () => {
        if (!selectedType) return;
        const newId = Date.now() + Math.random();
        const newItem: MasterDataItem = {
            id: newId,
            mdTypeId: selectedType.id,
            code: '',
            nameEn: '',
            status: 'ACTIVE'
        };

        const newData = [newItem, ...dataSource];
        persistItems(newData);
        setEditableRowKeys((prev) => [...prev, newId]);
    }

    const handleCreateType = async (values: any) => {
        const newType: MasterDataType = {
            id: Date.now(),
            name: values.name,
            code: values.code,
            isHierarchical: values.isHierarchical,
            allowUserCreate: true,
            isActive: true
        };

        const newTypes = [...masterDataTypes, newType];
        setMasterDataTypes(newTypes);
        await MasterDataService.saveTypes(newTypes);

        setSelectedType(newType);
        setCreateTypeModalVisible(false);
        message.success('Master Data Type Created');
        return true;
    };

    // --- Update Handler Wrapper (for Table) ---
    const handleSaveRow = async (rowKey: React.Key, data: MasterDataItem) => {
        const newData = updateNode(dataSource, data);
        persistItems(newData);
        setEditableRowKeys(editableKeys.filter(key => key !== rowKey));
    }

    const handleDeleteRow = (id: number) => {
        const newData = deleteNode(dataSource, id);
        persistItems(newData);
    }

    const handleMoveRow = (id: number, direction: 'up' | 'down') => {
        const newData = moveNode(dataSource, id, direction);
        persistItems(newData);
    }

    const columns: ProColumns<MasterDataItem>[] = [
        {
            title: 'Name (EN)',
            dataIndex: 'nameEn',
            width: '20%',
            formItemProps: {
                rules: [{ required: true, message: 'Name (EN) is required' }],
            },
            render: (dom, entity) => (
                <Space>
                    {selectedType && selectedType.isHierarchical && !entity.parentId ? <Tag color="blue">Root</Tag> : null}
                    <span style={{ fontWeight: 600, color: token.colorTextHeading }}>{dom}</span>
                </Space>
            )
        },
        {
            title: 'Name (KM)',
            dataIndex: 'nameKm',
            width: '18%',
        },
        {
            title: 'Code',
            dataIndex: 'code',
            width: '15%',
            render: (dom) => <Tag bordered={false} style={{ fontFamily: 'monospace' }}>{dom}</Tag>,
            formItemProps: {
                rules: [{ required: true, message: 'Code is required' }],
                getValueFromEvent: (e) => e.target.value?.toUpperCase(),
            },
        },
        {
            title: 'Abbr (EN)',
            dataIndex: 'abbreviationEn',
            width: '10%'
        },
        {
            title: 'Abbr (KM)',
            dataIndex: 'abbreviationKm',
            width: '10%'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: {
                ACTIVE: { text: 'Active', status: 'Success' },
                INACTIVE: { text: 'Inactive', status: 'Error' },
                PENDING: { text: 'Pending', status: 'Warning' },
            },
            width: 100,
            render: (_: any, record: MasterDataItem) => (
                <Badge
                    status={record.status === 'ACTIVE' ? 'success' : record.status === 'INACTIVE' ? 'error' : 'warning'}
                    text={record.status}
                    style={{ color: record.status === 'INACTIVE' ? token.colorTextDisabled : undefined }}
                />
            )
        },
        {
            title: 'Action',
            valueType: 'option',
            width: 100,
            fixed: 'right',
            render: (text, record, _, action) => [
                <Tooltip title="Edit" key="edit">
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined style={{ color: token.colorWarning }} />}
                        onClick={() => action?.startEditable?.(record.id)}
                    />
                </Tooltip>,
                <Tooltip title="Move Up" key="up">
                    <Button
                        type="text"
                        size="small"
                        icon={<ArrowUpOutlined />}
                        onClick={() => handleMoveRow(record.id, 'up')}
                    />
                </Tooltip>,
                <Tooltip title="Move Down" key="down">
                    <Button
                        type="text"
                        size="small"
                        icon={<ArrowDownOutlined />}
                        onClick={() => handleMoveRow(record.id, 'down')}
                    />
                </Tooltip>,
                selectedType && selectedType.isHierarchical && (
                    <Tooltip title="Add Sub Item" key="sub">
                        <Button
                            type="text"
                            size="small"
                            icon={<FolderAddOutlined style={{ color: token.colorPrimary }} />}
                            onClick={() => handleCreateSubItem(record)}
                        />
                    </Tooltip>
                ),
                <Popconfirm
                    key="delete"
                    title="Delete?"
                    onConfirm={() => handleDeleteRow(record.id)}
                >
                    <Tooltip title="Delete">
                        <Button type="text" size="small" icon={<DeleteOutlined style={{ color: token.colorError }} />} />
                    </Tooltip>
                </Popconfirm>,
            ],
        },
    ];

    // Filter types based on search
    const filteredTypes = masterDataTypes.filter(t =>
        t.name.toLowerCase().includes(searchText.toLowerCase()) ||
        t.code.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <ProCard
            split="vertical"
            bordered

            style={{
                // height: 'calc(100vh - 120px)',
                minHeight: 600,
                background: token.colorBgContainer
            }}
            bodyStyle={{ padding: 0 }}
        >
            <ProCard
                colSpan={{ xs: 24, md: 6 }} // Responsive width
                title={<span style={{ fontWeight: 600 }}>Master Types</span>}
                extra={
                    <Space>
                        <Tooltip title="Create New Type">
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="small"
                                shape="circle"
                                onClick={() => setCreateTypeModalVisible(true)}
                            />
                        </Tooltip>
                    </Space>
                }
                headerBordered
                bodyStyle={{ padding: 0, backgroundColor: '#fcfcfc' }}
                style={{ borderRight: `1px solid ${token.colorSplit}` }}
            >
                <div style={{ padding: '16px', borderBottom: `1px solid ${token.colorSplit}` }}>
                    <Input
                        prefix={<SearchOutlined style={{ color: token.colorTextDescription }} />}
                        placeholder="Search types..."
                        allowClear
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ borderRadius: 6 }}
                    />
                </div>
                <ProList<MasterDataType>
                    loading={loadingTypes}
                    dataSource={filteredTypes}
                    metas={{
                        title: {
                            render: (_, row) => (
                                <Text strong={selectedType?.id === row.id} style={{ color: selectedType?.id === row.id ? token.colorPrimary : token.colorText }}>
                                    {row.name}
                                </Text>
                            )
                        },
                        description: {
                            render: (_, row) => <Text type="secondary" style={{ fontSize: 11 }}>{row.code}</Text>
                        },
                        avatar: {
                            render: (_, row) => (
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 6,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: selectedType?.id === row.id ? token.colorPrimaryBg : '#f0f0f0',
                                    color: selectedType?.id === row.id ? token.colorPrimary : token.colorTextSecondary
                                }}>
                                    <AppstoreOutlined />
                                </div>
                            )
                        }
                    }}
                    rowKey="id"
                    onRow={(record) => ({
                        onClick: () => setSelectedType(record),
                        style: {
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            padding: '12px 16px',
                            backgroundColor: selectedType?.id === record.id ? '#fff' : 'transparent',
                            borderRight: selectedType?.id === record.id ? `3px solid ${token.colorPrimary}` : '3px solid transparent'
                        },
                    })}
                    split={true}
                />
            </ProCard>
            <ProCard
                title={
                    <Space size={16} align="center">
                        <div style={{
                            width: 36, height: 36, borderRadius: 8,
                            backgroundColor: token.colorPrimaryBg, color: token.colorPrimary,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                        }}>
                            {selectedType?.isHierarchical ? <BarsOutlined /> : <AppstoreOutlined />}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Text strong style={{ fontSize: 16, lineHeight: 1.2 }}>{selectedType?.name || 'Select a Type'}</Text>
                            <Space size={8}>
                                <Text type="secondary" style={{ fontSize: 12 }}>{selectedType?.code}</Text>
                                {selectedType?.isHierarchical && <Tag color="blue" style={{ fontSize: 10, lineHeight: '16px' }}>HIERARCHY</Tag>}
                            </Space>
                        </div>
                    </Space>
                }
                headerBordered
                extra={
                    <Space>
                        <Segmented
                            value={viewMode}
                            onChange={(val) => setViewMode(val as 'table' | 'list')}
                            options={[
                                { label: 'Table', value: 'table', icon: <TableOutlined /> },
                                { label: 'List', value: 'list', icon: <UnorderedListOutlined /> },
                            ]}
                        />
                        <Divider type="vertical" />
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                if (selectedType) loadItems(selectedType.id);
                                loadTypes();
                                message.success('Refreshed');
                            }}
                        >
                            Refresh
                        </Button>
                        <Button icon={<SettingOutlined />}>Config</Button>
                    </Space>
                }
                style={{ height: '100%', overflow: 'hidden' }}
                bodyStyle={{ padding: 0 }}
            >
                {dataSource.length === 0 && !loadingData && selectedType ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Empty
                            description="No Data Found"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                            <Button type="primary" onClick={handleCreateRootItem}>
                                Create First Item
                            </Button>
                        </Empty>
                    </div>
                ) : (
                    <>
                        {viewMode === 'table' ? (
                            <EditableProTable<MasterDataItem>
                                actionRef={actionRef}
                                rowKey="id"
                                maxLength={100}
                                scroll={{ y: 'calc(100vh - 260px)' }}
                                cardProps={{ bodyStyle: { padding: 0 }, bordered: false }}
                                recordCreatorProps={false}
                                loading={loadingData}
                                columns={columns}
                                value={dataSource}
                                onChange={(value) => setDataSource(value as MasterDataItem[])}
                                editable={{
                                    type: 'multiple',
                                    editableKeys,
                                    onChange: setEditableRowKeys,
                                    onSave: handleSaveRow as any, // Cast to any to silence strict signature mismatch if needed
                                    actionRender: (row, config, dom) => [dom.save, dom.cancel],
                                }}
                                expandable={{
                                    expandedRowKeys,
                                    onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as React.Key[]),
                                }}
                                toolBarRender={() => [
                                    selectedType?.allowUserCreate && (
                                        <Button
                                            key="add"
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={handleCreateRootItem}
                                        >
                                            Add New Item
                                        </Button>
                                    ),
                                    <Input.Search key="search" placeholder="Search items..." style={{ width: 200 }} />,
                                ]}
                                options={{
                                    density: false,
                                    fullScreen: false,
                                    reload: false,
                                    setting: true,
                                }}
                                search={false}
                                pagination={false}
                            />
                        ) : (
                            <div style={{ padding: 24, overflowY: 'auto', height: 'calc(100vh - 200px)' }}>
                                <ProList<MasterDataItem>
                                    dataSource={dataSource}
                                    metas={{
                                        title: { dataIndex: 'nameEn' },
                                        subTitle: {
                                            render: (_, row) => <Tag>{row.code}</Tag>
                                        },
                                        description: { dataIndex: 'nameKm' },
                                        actions: {
                                            render: (_, row) => [
                                                <Button size="small" type="link" onClick={() => {
                                                    setEditableRowKeys([row.id]);
                                                    setViewMode('table'); // Switch back to table to edit
                                                }}>Edit</Button>
                                            ]
                                        }
                                    }}
                                    rowKey="id"
                                />
                            </div>
                        )}
                    </>
                )}
            </ProCard>

            <ModalForm
                title={<Title level={4}>Create Master Type</Title>}
                open={createTypeModalVisible}
                onOpenChange={setCreateTypeModalVisible}
                onFinish={handleCreateType}
                modalProps={{ destroyOnClose: true, centered: true, width: 440, maskClosable: false }}
                submitter={{
                    searchConfig: {
                        submitText: 'Create Type',
                        resetText: 'Cancel'
                    }
                }}
            >
                <div style={{ marginBottom: 24, padding: '12px 16px', background: '#f5f5f5', borderRadius: 6 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Master Data Types define the category of data you want to manage.
                        Enable <Text strong>Hierarchical</Text> if the items need to be nested (e.g. detailed categorization).
                    </Text>
                </div>

                <ProFormText
                    name="name"
                    label="Type Name"
                    placeholder="e.g. Employee Position"
                    rules={[{ required: true, message: 'Please enter a name' }]}
                />
                <ProFormText
                    name="code"
                    label="System Code"
                    placeholder="e.g. EMP_POSITION"
                    rules={[{ required: true, message: 'Please enter a unique code' }]}
                    transform={(value) => value ? value.toUpperCase().replace(/\s+/g, '_') : ''}
                    help="Code will be automatically uppercase and underscores."
                />

                <Divider style={{ margin: '12px 0' }} />

                <ProFormSwitch
                    name="isHierarchical"
                    label="Hierarchical Structure"
                    tooltip="Allows creating parent-child relationships between items."
                />
            </ModalForm>
        </ProCard >
    );
}