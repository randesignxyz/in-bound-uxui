import { formatDate } from "@/pages/utils"
import { LoadedItemInfo } from "@/services/delivery/data"
import { InstanceDetail } from "@/services/delivery/instance.types"
import { ProCard, ProDescriptions, ProTable } from "@ant-design/pro-components"
import { Card, Checkbox, Col, Divider, Row, } from "antd"
import moment from "moment"
import FreighDetail from "../board/detail/FreighDetail"

export default ({ data, shipToId }: { data?: InstanceDetail, shipToId: number }) => {
    const shopTo = data?.deliveryInfo?.freights.find(it => it.id == shipToId)
    return <div>
        <Card title="General" size="small">
            <ProDescriptions>
                <ProDescriptions.Item label="Delivered Date">{data?.delivery?.deliveryDate ? formatDate(moment(data?.delivery.deliveryDate)) : 'N/A'}</ProDescriptions.Item>
                <ProDescriptions.Item label="Shift">{data?.delivery?.shift || 'N/A'}</ProDescriptions.Item>
                <ProDescriptions.Item label="Truck">{data?.truck.licensePlate}</ProDescriptions.Item>
                <ProDescriptions.Item label="Driver">
                    {[data?.driver.firstName, data?.driver.lastName].filter((it) => it).join(' ')}
                </ProDescriptions.Item>
                <ProDescriptions.Item label="Loading Dock">{data?.loading?.loadingDock}</ProDescriptions.Item>
                <ProDescriptions.Item label="Claimed By">{data?.claimedBy}</ProDescriptions.Item>
                <ProDescriptions.Item label="Owned Truck Loading"><Checkbox checked={!!data?.loading.ownedTruckLoading} /></ProDescriptions.Item>
            </ProDescriptions>
        </Card>
        {(data?.loadingInfo?.items.length || 0) > 0 && (
            <Card title="Loading" size="small" style={{ marginTop: 5 }}>
                <ProTable<LoadedItemInfo>
                    dataSource={data?.loadingInfo?.items || []}
                    size="small"
                    rowKey="id"
                    search={false}
                    options={{
                        density: false,
                        fullScreen: false,
                        setting: false,
                        reload: false,
                    }}
                    pagination={false}
                    columns={[
                        { title: 'Item Code', dataIndex: 'itemCode' },
                        { title: 'Item Description', dataIndex: 'itemDescription' },
                        { title: 'Batch', dataIndex: 'batchNum' },
                        { title: 'Warehouse', dataIndex: 'whsCode' },
                        { title: 'UoM', dataIndex: 'uom' },
                        { title: 'Quantity', dataIndex: 'qty', align: 'right' },
                        { title: 'Loaded Qty', dataIndex: 'loadedQty', align: 'right', width: '120px' },
                    ]}
                    footer={(data) => (
                        <Row>
                            <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                                Total
                            </Col>
                            <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                                {' '}
                                {data.map((it) => it.qty || 0).reduce((p, c) => p + c, 0)}{' '}
                            </Col>
                            <Col flex={'120px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                                {' '}
                                {data.map((it) => it.loadedQty || 0).reduce((p, c) => p + c, 0)}{' '}
                            </Col>
                        </Row>
                    )}
                />
            </Card>
        )}
        {(data?.loadingInfo?.newItems.length || 0) > 0 && (
            <Card title="Loading changed Request"
                headStyle={{ color: 'red' }} size="small" style={{ marginTop: 5 }}>

                <ProTable<LoadedItemInfo>
                    headerTitle={
                        data?.loadingInfo?.truckTransfer &&
                        <ProDescriptions size='small'>
                            <ProDescriptions.Item label="Driver">{data?.loadingInfo?.truckTransfer.driverName}</ProDescriptions.Item>
                            <ProDescriptions.Item label="License Plate">{data?.loadingInfo?.truckTransfer.licensePlate}</ProDescriptions.Item>
                        </ProDescriptions>
                    }

                    dataSource={data?.loadingInfo?.newItems || []}
                    size="small"
                    rowKey="id"
                    search={false}
                    options={{
                        density: false,
                        fullScreen: false,
                        setting: false,
                        reload: false,
                    }}
                    pagination={false}
                    columns={[
                        { title: 'Item Code', dataIndex: 'itemCode' },
                        { title: 'Item Description', dataIndex: 'itemDescription' },
                        { title: 'Batch', dataIndex: 'batchNum' },
                        { title: 'Warehouse', dataIndex: 'whsCode' },
                        { title: 'UoM', dataIndex: 'uom' },
                        { title: 'Quantity', dataIndex: 'qty', align: 'right' },
                    ]}

                    footer={(data) => (
                        <Row>
                            <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                                Total
                            </Col>
                            <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                                {' '}
                                {data.map((it) => it.qty || 0).reduce((p, c) => p + c, 0)}{' '}
                            </Col>
                        </Row>
                    )}
                />
            </Card>
        )}
        <Divider />
        {shopTo && <ProCard ghost size="small" title={`Shipped To: ${shopTo.shippingAddress.shipToCode}`} > <FreighDetail fromMap data={shopTo} /></ProCard>}
    </div>
}