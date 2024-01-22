import React, { useState, useEffect, useRef } from 'react'
import { Select, Table, Card, Button, Space, Checkbox } from 'antd'
import moment from 'moment';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAccess } from 'umi';
import { domain } from '@/services/del-expense/data';
import { LookupData } from '@/components/core/comp';
import PopconfirmMe from '../../components/PopconfirmMe';

const Outsource: React.FC<{
    loading: boolean;
    dataSource?: domain.delivery.OutsourcePrice[];
    productTypes: LookupData[];
    onAddItem: (item: domain.delivery.OutsourcePrice) => void;
    onDeleteItem: (item: domain.delivery.OutsourcePriceItem) => void;
    onAdd: () => void;
    onDelete: (item: domain.delivery.OutsourcePrice) => void;
}> = ({ loading, dataSource, productTypes, onAdd, onDelete, onAddItem, onDeleteItem }) => {

    const access = useAccess()

    const cols: ProColumns<domain.delivery.OutsourcePrice>[] = [
        {
            title: 'Province',
            dataIndex: 'province',
            hideInSearch: true,
            width: '250px',
        },
        {
            title: 'Place',
            dataIndex: 'place',
            hideInSearch: true,
            width: '150px',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            hideInSearch: true,
        },
        {
            title: 'Product Type',
            dataIndex: 'productTypeName',
            hideInSearch: true,
        },
        {
            title: 'UoM',
            dataIndex: 'uom',
            width: '50px',
            hideInSearch: true,
        },
        {
            title: 'Currency',
            dataIndex: 'currency',
            width: '50px',
            hideInSearch: true,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            width: '70px',
            hideInSearch: true,
        },
        {
            title: 'Effective Date',
            width: '110px',
            dataIndex: 'effectiveDate',
            align: 'right',
            hideInSearch: true,
            render: (_, record) => moment(record.effectiveDate).format('YYYY-MM-DD')
        }, {
            title: 'Expiry Date',
            width: '100px',
            dataIndex: 'expiryDate',
            align: 'right',
            hideInSearch: true,
            render: (_, record) => record.expiryDate && moment(record.expiryDate).format('YYYY-MM-DD')
        }, {
            title: '',
            width: '10px',
            hideInSearch: true,
            render: (_, record) => {
                return access.canConfigureDeliveryPrice && <Space>
                    <Button type='primary' icon={<PlusOutlined />} shape="circle" size="small" onClick={_ => {
                        onAddItem(record)
                    }} />
                    <PopconfirmMe placement="leftBottom" title='Deleting Price' description='Are you sure to delete?' onConfirm={()=> { onDelete(record)}} >
                        <Button danger icon={<DeleteOutlined />} shape="circle" size="small" /*onClick={_ => {onDelete(record)}}*/ />
                    </PopconfirmMe>
                </Space>
            }
        }
    ]

    const itemCols: ColumnsType<domain.delivery.OutsourcePriceItem> = [
        {
            title: 'Item Code',
            dataIndex: 'itemCode',
            width: '200px'
        },
        {
            title: 'Name',
            dataIndex: 'shortName',
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            align: 'right',
            width: '200px'
        },
        {
            title: 'Price',
            dataIndex: 'price',
            align: 'right',
            width: '200px'
        },
        {
            title: '',
            align: 'right',
            width: '10px',
            render: (_, record) => {
                return access.canConfigureDeliveryPrice && 
                <PopconfirmMe placement="leftBottom" title='Deleting Price Item' description='Are you sure to delete item?' onConfirm={()=> { onDeleteItem(record)}} >
                <Button danger icon={<DeleteOutlined />} shape="circle" size="small" /*onClick={_ => {onDeleteItem(record)}}*/ />
                </PopconfirmMe>
            }
        }
    ]

    const priceList = (item: domain.delivery.OutsourcePrice) => {
        return <Card>
            <Table<domain.delivery.OutsourcePriceItem>
                columns={itemCols}
                rowKey="id"
                dataSource={item.priceItems}
                pagination={false}
                size="small"
            />
        </Card>
    }

    const [localPriceList, setLocalPriceList] = useState<domain.delivery.OutsourcePrice[]>([])
    const actionRef = useRef<ActionType>();
    const provinces = _.uniq(dataSource?.map(item => item.province))
    const [selectedProvince, setSelectedProvince] = useState<string>()
    const [selectedProductType, setSelectedProductType] = useState<number>()
    const [includeExpiry, setIncludeExpiry] = useState<boolean>(false)

    useEffect(() => {
        setLocalPriceList(dataSource || [])
    }, [dataSource])

    useEffect(() => {
        // actionRef.current?.reloadAndRest()
        actionRef.current?.reload()
    }, [selectedProductType, selectedProvince, localPriceList,includeExpiry])

    const request = (): Promise<{
        data: domain.delivery.OutsourcePrice[],
        success: true
    }> => new Promise(resolve => {
        resolve({
            data: localPriceList.filter(item => {
               return (!selectedProvince || item.province === selectedProvince) && (!selectedProductType || item.productTypeId === selectedProductType ) && (includeExpiry || item.expiryDate === null )
            }) ,
            success: true
        })
    })

    return <ProTable<domain.delivery.OutsourcePrice>
        toolBarRender={(action, { selectedRows }) => [
            <Checkbox  disabled={!dataSource} style={{  width:'120px'}} name='includeExpiry' onChange={(v)=> {setIncludeExpiry(v.target.checked)}}>Include Expiry</Checkbox>,
            <Select 
            showSearch placeholder={'Product Type'} 
            disabled={!dataSource}
            style={{ width: '200px' }}
            loading = {loading}
            allowClear
            onChange = {value => {
                setSelectedProductType(value?parseInt(value.toString()): undefined)
            }}
            options={productTypes.map(item => {
                return {
                    value: item.value,
                    key: item.value,
                    label: item.display
                }
            })}/>
            
            ,
            <Select
                showSearch
                allowClear
                placeholder={'Select Province'}
                disabled={!dataSource}
                style={{ width: '200px' }}
                onChange={value => {
                    setSelectedProvince(value ? value.toString() : undefined)
                }}
                options={provinces.map(item => {
                    return {
                        value: item,
                        key: item
                    }
                })} />,
            access.canConfigureDeliveryPrice && <Button type='primary' disabled={!dataSource} icon={<PlusOutlined />} onClick={onAdd} />
        ]}

        search={false}
        actionRef={actionRef}
        columns={cols}
        size={'small'}
        rowKey={'id'}
        request={_ => request()}
        // loading={loading}
        expandable={{
            expandedRowRender: priceList,
            rowExpandable: record => true,
        }}
        pagination={false}
    />
}

export default Outsource