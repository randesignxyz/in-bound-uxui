import { domain } from "@/services/del-expense/data"
import { BulbOutlined, CheckOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined, ExclamationOutlined, EyeOutlined, MoreOutlined, SplitCellsOutlined, WarningOutlined } from "@ant-design/icons"
import { ActionType, ProColumns } from "@ant-design/pro-table"
import { Button, Dropdown, Menu, Popconfirm, Space, Tooltip } from "antd"
import DropdownButton from "antd/es/dropdown/dropdown-button"
import { TooltipPlacement } from "antd/es/tooltip"
import moment from "moment"
import { Children, MutableRefObject } from "react"
import PopconfirmMe from "../../components/PopconfirmMe"


type action = "priceRate" | "changeLocation" | "splitDelivery" | "showHistory"

const actionMenu = (record: domain.delivery.DeliveryCost, onClick: (key: action) => void) => (
    <Menu onClick={(e) => onClick(e.key.toString() as action)}>
        <Menu.Item key="priceRate">Preview Price Rate</Menu.Item>
        {!record.invoiceNo && <Menu.Divider/>}
        { !record.invoiceNo && <Menu.Item key="changeLocation">Change Location</Menu.Item>}
        { !record.invoiceNo && record.itemList.length > 1 && <Menu.Item key="splitDelivery">Split Delivery</Menu.Item>}
        { record.modifiedBy && <Menu.Item key="showHistory">Show History</Menu.Item>}
        { !record.invoiceNo && <Menu.Divider/>}
        { !record.invoiceNo && <Menu.Item key={'fix'}>Fix</Menu.Item>}

    </Menu>
)

const actionCol = (
    delivery: domain.delivery.DeliveryItem,
    completed: boolean,
    addedList: number[],
    search: boolean,
    record: domain.delivery.DeliveryCost,
    actionRef: MutableRefObject<ActionType | undefined>,
    onRemoveItem: (docEntry: number, cb?: () => void) => void,
    onClaimedItemHandler: (item: domain.delivery.DeliveryCost) => void,
    onChangeLocation?: (item: domain.delivery.DeliveryCost) => void,
    onShowHistory?: (docEntry: domain.delivery.DeliveryCost) => void,
    onShowPriceLIstDetailHandler?: (record: domain.delivery.DeliveryCost) => void,
    onShowSplitDelivery?: (docEntry: domain.delivery.DeliveryCost) => void,
    onFix?: (docEntry: number) => void,

) => {
    if (completed) return ''
    if (record.settledCode && record.settledCode !== delivery.settledCode) return <div>
        <Space>
            <Tooltip overlay={<div style={{ zIndex: 100000, width: '500px' }} >{`Claimed by settlement on ${record.settledCode}`}</div>} title=''>
                <Button danger type='default' shape="circle" size="small" icon={<WarningOutlined />} />
            </Tooltip>
            <Dropdown trigger = {['click']} overlay={actionMenu(record, (key) => {
                if (key == 'priceRate') {
                    onShowPriceLIstDetailHandler?.(record)
                } else if (key == 'changeLocation') {
                    onChangeLocation?.(record)
                } else if (key == 'splitDelivery') {
                    onShowSplitDelivery?.(record)
                } else if (key == 'showHistory') {
                    onShowHistory?.(record)
                } else if( key == 'fix') {
                    onFix?.(record.docEntry)
                }
            })}>
                <MoreOutlined />
            </Dropdown>
        </Space>
    </div>

    return <Space>
        {record.baseCurrAmount && ((!addedList.some(item => item === record.docEntry) && !record.invoiceNo) ? (<div>
            <Tooltip title="Claim">
                <Button type='primary' icon={<CheckOutlined />} shape="circle" size="small" onClick={_ => {
                    !search && onClaimedItemHandler(record)
                }} />
            </Tooltip>

        </div>) : <div>
                <Tooltip title="Unclaim">
                    <Button type='default' danger icon={<DeleteOutlined />} shape="circle" size="small" onClick={_ => {
                        onRemoveItem(record.docEntry, () => {
                            actionRef.current?.reloadAndRest?.()
                        })
                    }} />
                </Tooltip>
            </div>)
        }
        <Dropdown trigger = {['click']} overlay={actionMenu(record, (key) => {
            if (key == 'priceRate') {
                onShowPriceLIstDetailHandler && onShowPriceLIstDetailHandler(record)
            } else if (key == 'changeLocation') {
                onChangeLocation && onChangeLocation(record)
            } else if (key == 'splitDelivery') {
                onShowSplitDelivery && onShowSplitDelivery(record)
            } else if (key == 'showHistory') {
                onShowHistory && onShowHistory(record)
            } else if( key == 'fix') {
                onFix?.(record.docEntry)
            }
        })}>
            <MoreOutlined />
        </Dropdown>
    </Space>
}
// const  PopconfirmMe: React.FC<{title: string, description?: string,placement?: TooltipPlacement, onConfirm:()=>void , children?: React.ReactNode}> =({title, description,placement, onConfirm,children})=> {
//  return (
//     <Popconfirm 
//         title={title}
//         placement={placement}
//         description={description}
//         onConfirm={onConfirm}
//         icon ={<ExclamationCircleOutlined style={{ color: 'red' }}/>}
//     >
//     {children}</Popconfirm>
//     )
// };


export const deliveryCostCols = (
    delivery: domain.delivery.DeliveryItem,
    completed: boolean,
    addedList: number[],
    search: boolean,
    actionRef: MutableRefObject<ActionType | undefined>,
    onRemoveItem: (docEntry: number) => void,
    onClaimedItemHandler: (item: domain.delivery.DeliveryCost) => void,
    onShowPriceLIstDetail?: (record: domain.delivery.DeliveryCost) => void,
    addSingleItem?: (item: domain.delivery.DeliveryCost, invoiceId?: number, comment?: string, cb?: () => void) => void,
    onChangeLocation?: (item: domain.delivery.DeliveryCost) => void,
    onShowHistory?: (docEntry: domain.delivery.DeliveryCost) => void,
    onShowSplitDelivery?: (item: domain.delivery.DeliveryCost) => void,
    onFix?: (docEntry: number) => void,

) => {
    
    return [
        {
            title: 'Date',
            dataIndex: 'docDate',
            width: '100px',
            hideInSearch: true,
            render: (_, record) => moment(record.docDate).format('YYYY-MM-DD')
        },
        {
            title: 'Shipping No',
            dataIndex: 'docNo',
            width: '100px',
            hideInSearch: true,

        },
        {
            title: 'License Plate #',
            dataIndex: 'licenseFlat',
            width: '120px',
            hideInSearch: true,
        },
        {
            title: 'Customer No',
            dataIndex: 'customerNo',
            width: '110px',
            hideInSearch: true,
        },
        {
            title: 'Customer Name',
            dataIndex: 'customerName',
            hideInSearch: true,
        },
        {
            title: 'Ship to',
            dataIndex: 'shipTo',
            // width: '200px',
            hideInSearch: true,
            render: (_, record) => `${record.province}/${record.district}`
        },
        {
            title: 'Price Place',
            dataIndex: 'place',
            // width: '210px',
            hideInSearch: true,
            render: (_, record) => {
                return <span style={{ color: record.baseCurrAmount ? 'black' : 'red' }}>
                    {record.place}
                </span>
            }
        },
        {
            title: 'Qty',
            dataIndex: 'qty',
            width: '50px',
            align: 'right',
            hideInSearch: true,
        },
        {
            title: 'Amount',
            dataIndex: 'baseCurrAmount',
            align: 'right',
            width: '70px',
            hideInSearch: true,
            render: (_, record) => record.baseCurrAmount && record.baseCurrAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
        },
        // SkH-20230530: BACKUP
        // {
        //     title: '',
        //     width: '50px',
        //     hideInSearch: true,
        //     align: 'right',
        // render: (_: any, record: domain.delivery.DeliveryCost) => actionCol(
        //         delivery,
        //         completed,
        //         addedList,
        //         search,
        //         record,
        //         actionRef,
        //         onRemoveItem,
        //         onClaimedItemHandler,
        //         onChangeLocation,
        //         onShowHistory,
        //         onShowPriceLIstDetail,
        //         onShowSplitDelivery,
        //         onFix
        //     )
        // }
        //SkH-20230530: Request change -> action(remove, 'View Price Rate','Split DN','Fix Pricing','Edit')
        {
            title: 'Action',
            width: 30,
            render: (_: any, record: domain.delivery.DeliveryCost) =>  !completed&&
            <PopconfirmMe placement="leftBottom" title='Confirmation' description="Are you sure to Remove?"
            onConfirm={()=>{
                onRemoveItem?.(record.docEntry);
            }}
            >
            <DropdownButton menu={{
                items: [
                    { label: "View Price Rate", key: 'view_price_rate', icon: <EyeOutlined />, onClick: () => onShowPriceLIstDetail?.(record) },
                    { label: "Split DN", key: 'split-dn', icon: <SplitCellsOutlined />, onClick: () => onShowSplitDelivery?.(record) },
                    { label: "Fix Pricing", key: 'fix-pricing', icon: <BulbOutlined />, onClick: () => onFix?.(record.docEntry) },
                    { label: "Edit", key: 'edit-dn', icon: <EditOutlined />, onClick: () => onChangeLocation?.(record) },
                ]
            }} /*onClick={() => {onRemoveItem?.(record.docEntry) }}*/ >
                <Tooltip title="">                     
                    <DeleteOutlined style={{color:"red"}}/>
                </Tooltip>
            </DropdownButton>
            </PopconfirmMe>
        }
       
    ] as ProColumns<domain.delivery.DeliveryCost>[]
}