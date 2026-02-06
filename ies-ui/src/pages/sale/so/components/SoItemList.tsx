import { ProductItemLess } from "@/services/sale/data"
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons"
import ProTable from "@ant-design/pro-table"
import { Button, Select, Space, Switch } from "antd"
import { useState } from "react"
import { SoItemEntry } from "../reducer"
import styles from './style.less';
import numeral from 'numeral';


interface Props {

    data: {
        lineItemList?: SoItemEntry[];
        itemList?: ProductItemLess[];
        disabled?: boolean;
    }
    actionHandlers?: {
        onEdit?: (data: SoItemEntry, auto: boolean) => void;
        onRemove?: (data: SoItemEntry) => void;
        onSelectedItem?: (item?: ProductItemLess, isManual?: boolean) => void;
    }
}

const ItemList: React.FC<Props> = ({ data, actionHandlers }) => {

    const [selectedItem, setSelectedItem] = useState<ProductItemLess>()

    const [auto, setAuto] = useState<boolean>(true)

    return (
        <ProTable<SoItemEntry>
            columns={[
                // { title: '#', render: (_, row) => !row.parentKey ? (row.seq || 0) / 1000 : '-' },
                {
                    title: '#',
                    render: (_, __, index) => index + 1,
                },

                { title: 'Item No', dataIndex: 'itemCode' },
                { title: 'Item Description', dataIndex: 'description' },
                { title: 'Budget Code', dataIndex: 'budgetCode' },
                // { title: 'Type', dataIndex: 'type' },
                // { title: 'Qty', dataIndex: 'qty', align: 'right' },
                { title: 'Type', dataIndex: 'type' },
                // { title: 'STD', dataIndex: 'STD', align: 'right' },
                // { title: 'TDO', dataIndex: 'TDO', align: 'right' },
                // { title: 'TDP', dataIndex: 'TDP', align: 'right' },
                { title: 'Qty', dataIndex: 'qty', align: 'right' },
                {
                    title: 'Unit Price', align: 'right', dataIndex: 'price',
                    render: (_, r) => {
                        return numeral(r.price).format('$ 0,0.00000')
                    },
                },
                {
                    title: 'Discount', align: 'right', dataIndex: 'discountPercent',
                    render: (_, r) => {
                        return numeral(((r.discountPercent || 0) / 100)).format('0 %')
                        // return "sddsasdfds"
                    }
                },
                {
                    title: 'Total Amount', align: 'right', dataIndex: 'totalAmount',
                    render: (_, r) => {
                        return numeral(r.totalAmount).format('$ 0,0.00000')
                    },
                },
                // { title: 'Remarks', dataIndex: 'remarks' },
                {
                    render: (_, data) => {
                        //Only main item allowed
                        // && data.type !== 'TRA' = remove tra allowing edit
                        return (!data.parentKey || !auto) && <Space size={0}>
                            <Button size='small' type='link' icon={<EditOutlined />} onClick={() => actionHandlers?.onEdit?.(data, auto)} />
                            <Button size='small' type='link' icon={<DeleteOutlined />} onClick={() => actionHandlers?.onRemove?.(data)} />
                        </Space>
                    }
                }
            ]}

            search={false}
            rowClassName={(r) => r.parentKey && styles.subLineItem}
            dataSource={data.lineItemList || []}
            // dataSource={(() => {
            //     const rows: SoItemEntry[] = []
            //     const map = new Map<string, SoItemEntry>()

            //         ; (data.lineItemList || []).forEach((i) => {
            //             const isSTD = i.type === 'STD'
            //             const isTDO = i.type === 'TDO'
            //             const isTDP = i.type === 'TDP'
            //             const isMainType = isSTD || isTDO || isTDP

            //             const key = i.itemCode || ''

            //             if (isMainType) {
            //                 if (!map.has(key)) {
            //                     map.set(key, {
            //                         ...i,
            //                         type: '',
            //                         STD: null,
            //                         TDO: null,
            //                         TDP: null,
            //                         qty: 0,
            //                     })
            //                 }

            //                 const row = map.get(key)!

            //                 if (isSTD) row.STD = (row.STD || 0) + i.qty
            //                 if (isTDO) row.TDO = (row.TDO || 0) + i.qty
            //                 if (isTDP) row.TDP = (row.TDP || 0) + i.qty

            //                 row.qty =
            //                     (row.STD || 0) +
            //                     (row.TDO || 0) +
            //                     (row.TDP || 0)
            //             } else {
            //                 // FOC / TDL / others
            //                 rows.push({
            //                     ...i,
            //                     type: i.type,
            //                     STD: null,
            //                     TDO: null,
            //                     TDP: null,
            //                     qty: i.qty,
            //                 })
            //             }
            //         })

            //     rows.push(...map.values())

            //     // sort by seq ascending
            //     rows.sort((a, b) => {
            //         const aSeq = a.seq || 0
            //         const bSeq = b.seq || 0

            //         if (aSeq !== bSeq) return aSeq - bSeq

            //         // same item → main row first
            //         if (!a.type && b.type) return -1
            //         if (a.type && !b.type) return 1

            //         return 0
            //     })

            //     return rows
            // })()}


            style={{ marginTop: 10 }}
            pagination={false}
            // size = 'small'
            headerTitle='Line Items'

            options={{
                density: false,
                reload: false,
                setting: false,
                search: <Space align='baseline' >
                    <Switch checkedChildren="Auto" onChange={(checked) => setAuto(checked)} unCheckedChildren="Manual" defaultChecked />
                    <Select
                        onSelect={(value: number) => {
                            const item = data.itemList?.find(it => it.id === value)
                            actionHandlers?.onSelectedItem?.(item, auto)
                            setSelectedItem(item)
                        }}
                        disabled={data.disabled}
                        style={{ width: 400 }}
                        // [it.code, it.name].join('-')
                        options={(data.itemList || []).map(it => ({ value: it.id, label: it.name }))} showSearch />
                    <Button type='primary' disabled={!selectedItem || data.disabled} onClick={() => actionHandlers?.onSelectedItem?.(selectedItem, auto)} icon={<PlusOutlined />} />
                </Space>
            }}>

        </ProTable>
    )
}

export default ItemList