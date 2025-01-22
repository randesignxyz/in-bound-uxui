import DescriptionDisplay from "@/components/Descriptions"
import ImagePreview from "@/components/ImagePreview"
import { formatDateTime } from "@/pages/utils"
import { PosmReview, StockCount, VisitScheduleDetail } from "@/services/crm/data"
import { ProductItem, SoItemLess } from "@/services/sale/data"
import { ProCard, ProDescriptions, ProTable } from "@ant-design/pro-components"
import { Checkbox, Descriptions, Space, Table, Tabs, Tag, Image, Spin } from "antd"
import moment from "moment"
import { colLink } from '@/components/DataCrud/TableView';
import { history } from "@umijs/max";
import { SalePaths } from "@/pages/sale"

const customerColors = [
    'gold',
    'orange',
    'volcano',
    'magenta',
    'lime',
    'green',
    'cyan',
    'geekblue',
    'purple',
    'blue',
];


export default ({ data, stockCountList, orderList, loading }: { data?: VisitScheduleDetail, stockCountList?: ProductItem[], orderList?: SoItemLess[], loading: Boolean }) => {
    console.log('data?.stockCountList', data?.stockCountList)
    const tabs = () => {
        return [
            data?.status == 'COMPLETED' && { label: "Visit Info", disabled: data?.status !== 'COMPLETED', key: "visitInfo", children: visitView },
            { label: "Schedule Info", key: "scheduleInfo", children: scheduleInfoView },
        ].filter(it => it) as any
    }

    const scheduleInfoView = <ProCard bordered>
        {loading ? <Spin /> :(<DescriptionDisplay
            column={2}
            data={[
                {
                    label: 'Customer',
                    value: [data?.customer.code, data?.customer.name].filter((it) => it).join(' - '),
                },
                { label: 'Address', value: data?.address.name },
                {
                    label: 'Salesperson',
                    value: [data?.salesperson.code, data?.salesperson.name]
                        .filter((it) => it)
                        .join(' - '),
                },
                { label: 'Created By', value: data?.createdBy },
                { label: 'Created Date', value: formatDateTime(data?.createdDate) },
                { label: 'Schedule Type', value: data?.scheduleType },
                { label: 'Status', value: data?.status },
                { label: 'Completed Date', value: formatDateTime(data?.completedDate) },
                { label: 'Completed By', value: data?.completedBy },
                { label: 'Remarks', value: data?.remarks },
            ]}
        />)}
    </ProCard>

    const visitView = <Space direction='vertical' style={{ width: '100%' }}>
        {data?.status == 'COMPLETED' && (
            <ProCard bordered size="small" title="Visit Info" style={{ marginTop: 5 }}>
                <Descriptions column={2} contentStyle={{ fontWeight: 'bold' }}>
                    <Descriptions.Item label="Visited By">{data?.createdBy} </Descriptions.Item>

                    <Descriptions.Item label="Actual Location">{data.visit?.actualLatitude}, {data.visit?.actualLongitude}
                        {/* {data?.visit?.actualLatitude  data?.visit.actualLongitude && (
                            {data}
                        )} */}
                    </Descriptions.Item>
                </Descriptions>
                <DescriptionDisplay
                    column={2}
                    data={[
                        {
                            label: 'Checkin Date',
                            value: formatDateTime(data?.visit?.checkInDate),
                        },
                        {
                            label: 'Checkout Date',
                            value: formatDateTime(data?.visit?.checkoutDate),
                        },
                    ]}
                />
                <DescriptionDisplay
                    column={2}
                    data={[
                        {
                            label: 'Check In Remarks',
                            value: data?.visit?.checkInRemarks || '',
                        },
                        {
                            label: 'Check Out Remarks',
                            value: data?.visit?.checkoutRemarks || '',
                        },
                    ]}
                />
                <ProDescriptions>
                    <ProDescriptions.Item label="Shop Closed" valueType={'checkbox'} >
                        <Checkbox
                            disabled
                            defaultChecked={data?.visit?.shopIsClosed}
                        /></ProDescriptions.Item>
                </ProDescriptions>
                {data.visit?.checkInImage && (
                    <ImagePreview
                        version={1}
                        width={'100px'}
                        key={data?.visit?.checkInImage}
                        fileId={data.visit?.checkInImage}
                        fileName={'Check In image'}
                    />
                )}
            </ProCard>
        )}

        {(orderList || []).length > 0 && (
            <ProTable<SoItemLess>
                size="small"
                bordered
                style={{ marginTop: 5 }}
                rowKey="id"
                dataSource={orderList}
                search={false}
                options={{
                    density: false,
                    setting: false,
                    reload: false,
                }}
                columns={[
                    {
                        title: 'PO #',
                        width: '100px',
                        render: colLink(
                            (d) => {
                                history.push(SalePaths.so + `/data/${d.id}`);
                            },
                            (d) => d.poNo || 'Not Assigned',
                        ),
                    },
                    { title: 'SO #', width: '70px', render: (_, r) => r.soNo },
                    { title: 'Ship To', render: (_, r) => r.shippingAddress },
                    {
                        title: 'Orderd Date',
                        align: 'right',
                        width: '150px',
                        render: (_, r) => formatDateTime(r.orderedDate),
                    },
                    {
                        title: 'Quantity',
                        align: 'right',
                        width: 100,
                        render: (_, r) => r.qty || 0,
                    },
                    {
                        title: 'Status',
                        width: 40,
                        render: (_, r) => {
                            const color =
                                r.status == 'Pending'
                                    ? 'processing'
                                    : r.status == 'Posted'
                                        ? 'success'
                                        : r.status == 'Failed'
                                            ? 'error'
                                            : r.status == 'Canceled'
                                                ? 'default'
                                                : 'warning';
                            return <Tag color={color}>{r.status}</Tag>;
                        },
                    },
                ]}
            />
        )}

        {(stockCountList?.filter((it) => !it.isCompetitor) || []).length > 0 && (
            <ProCard size="small" title="Current Stock" bordered>
                <Table<ProductItem>
                    rowKey="id"
                    size='small'
                    pagination={false}
                    dataSource={stockCountList?.filter((it) => it.isCompetitor === false)}
                    columns={[
                        { title: 'Item Name', width: '300px', render: (_, r) => r.name },
                        {
                            title: 'Quantity',
                            dataIndex: 'quantity',
                            render: (_, r) => {
                                const matchedItem = data?.stockCountList?.find((item) => item.itemId === r.id);
                                return matchedItem?.quantity || '';
                            },
                            width: '100px',
                            align: 'right',
                        }, {
                            title: 'Remarks',
                            // dataIndex: 'remarks',
                            render: (_, r) => {
                                return (
                                    <>
                                        {data?.remarks ? (
                                            <>
                                                {data?.remarks}
                                                <br />
                                            </>
                                        ) : (
                                            <></>
                                        )}
                                        {data?.stockCountList?.map((item, index) => (
                                            <Tag color={customerColors[index]}>
                                                Qty: {item.quantity}, Exp: {
                                                    item?.stockExpired?.[0]?.expiredDate
                                                        ? moment(item?.stockExpired?.[0]?.expiredDate).format('DD-MM-YYYY')
                                                        : 'N/A'
                                                }
                                            </Tag>
                                        ))}
                                    </>
                                );
                            },
                        },
                    ]}
                />
            </ProCard>
        )}

        {(data?.stockCountList.filter((it) => it.item?.isCompetitor) || []).length > 0 && (
            <ProCard size="small" title="Current Stock" bordered>
                <Table<StockCount>
                    size="small"
                    pagination={false}
                    rowKey="id"
                    dataSource={data?.stockCountList.filter((it) => it.item?.isCompetitor === true)}
                    columns={[
                        { title: 'Item Name', width: '300px', render: (_, r) => r.item?.name },
                        { title: 'Quantity', dataIndex: 'quantity', width: '100px', align: 'right' },
                        { title: 'Remarks', dataIndex: 'remarks' },
                    ]}
                />
            </ProCard>
        )}

        {(data?.posmReviewList || []).length > 0 && (
            <ProCard size="small" title="POSM Checked" bordered>
                <Table<PosmReview> size='small'
                    columns={[
                        { title: "Name", render: (_, r) => r.posm.name },
                        { title: "Quantity", dataIndex: 'quantity' },
                        {
                            title: "Images", render: (_, r) => (
                                <Image.PreviewGroup>
                                    <Space>
                                        {data?.posmReviewList?.filter(it => it.id == r.id)
                                            .flatMap((it) =>
                                                (it.attachments || [])?.map((it1, index) => ({
                                                    fileId: it1.imageId,
                                                    fileName: `${it.posm.name} (${index + 1})`,
                                                })),
                                            )?.map(it => (<ImagePreview
                                                version={1}
                                                width={'50px'}
                                                key={it.fileId}
                                                fileId={it.fileId}
                                            />))}
                                    </Space>
                                </Image.PreviewGroup>
                            )
                        },
                        { title: "Remarks", dataIndex: 'remarks' },

                    ]}
                    dataSource={data?.posmReviewList || []}
                    pagination={false}
                />
            </ProCard>

        )}

        {(data?.attachments || []).length > 0 && (
            <ProCard size="small" title="Attachment Photos" bordered>
                <Image.PreviewGroup>
                    <Space>
                        {data?.attachments.map((it1, index) => ({
                            fileId: it1.imageId,
                            fileName: `Attachment (${index + 1})`,
                        }))?.map(it => <ImagePreview
                            version={1}
                            width={'100px'}
                            key={it.fileId}
                            fileId={it.fileId}
                            fileName={it.fileName}
                        />)}
                    </Space>
                </Image.PreviewGroup>
            </ProCard>
        )}
    </Space>
    return <div>
        <Tabs

            defaultActiveKey={data?.status == 'COMPLETED' ? 'visitInfo' : 'visitInfo'}
            items={tabs()}
        />
    </div>
}