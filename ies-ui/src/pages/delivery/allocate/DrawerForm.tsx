import { formatDate, formatDateTime } from '@/pages/utils';
import { EditableFormInstance, EditableProTable, ProCard, ProList, ProTable } from '@ant-design/pro-components';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import { Button, Card, Col, Descriptions, Divider, message, Modal, Progress, Row, Space, Spin, Tag, Typography, UploadFile, Image } from 'antd';
import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AllocateServiceAPI } from './service';
import { simpleRequestActions } from '@/services/model';
import { DeliveryDnParams, DeliveryItemList, DeliveryList, DNItemParams, DNParams, UpdateRemarkParams } from './data';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { EditOutlined, InboxOutlined } from '@ant-design/icons';
import AddRemarkModal from './AddRemarkForm';
import { uploadFileToFirebase } from './uploadImage';
import { FaRegPenToSquare } from 'react-icons/fa6';
import { useAccess } from '@umijs/max';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
interface Props extends DrawerFormProps {
    data?: any;
    reload?: (flag: boolean) => void;
    onEdit?: () => void;
    onAdd?: () => void;
    id: string
    status?: string,
    po?: string,
    deliveres?: DeliveryList[],
    reloadTrigger?: number,
    so?: string
}

export default ({ data, id, status, po, deliveres, reload, reloadTrigger, so, ...rest }: Props) => {
    const { Text } = Typography;
    const access = useAccess();
    const requestActions = simpleRequestActions();
    const editableFormRef = useRef<EditableFormInstance>();
    const services = AllocateServiceAPI(requestActions);
    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [dn, setDn] = useState<DNParams | DNParams[] | undefined>()
    const [refetch, setRefetch] = useState(false)
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState<{ visible: boolean; id: number, remark?: string, attachment?: any }>({
        visible: false,
        id: 0,
    });

    useEffect(() => {
        setDn([])
    }, [rest.open])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const da = await services.list_dn([id], so);
                if (Array.isArray(da) && da.length > 0) {
                    setDn(da);
                } else if (da && 'planDeliveryDate' in da) {
                    setDn(da);
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        };
        fetchData();
        setRefetch(false);
    }, [id, refetch === true]);

    const handleSaveRemark = async (data: UpdateRemarkParams & { file?: UploadFile[] }) => {
        Modal.confirm({
            title: 'Add Remark',
            content: 'Are you sure?',
            onOk: async () => {
                let fileUrls: string[] = [];

                if (data.file && data.file.length > 0) {
                    try {
                        // Separate existing files (already uploaded) and new files (to upload)
                        const existingFiles = data.file.filter(f => !f.originFileObj);
                        const existingUrls = existingFiles
                            .map(f => f.url)
                            .filter(Boolean) as string[];

                        const newFiles = data.file.filter(f => !!f.originFileObj);

                        // Upload only the new files to Firebase
                        const newFileUrls = await Promise.all(
                            newFiles.map(f => uploadFileToFirebase(f.originFileObj as File))
                        );

                        // Combine old URLs and newly uploaded URLs
                        fileUrls = [...existingUrls, ...newFileUrls];

                    } catch (err) {
                        message.error('File upload failed');
                        return;
                    }
                }

                const payload = {
                    ...data,
                    attachment: fileUrls.length > 0 ? fileUrls.map(url => ({ attachment: url })) : [],
                };
                await services.updateRemark(payload) as {
                    data: string;
                    message: string;
                };
                setModalOpen({ visible: false, id: 0 });
                setRefetch(true)
                reload?.(true);
                message.success('Updated successfully');
            },
        });
    };

    const handleClaim = async (id: number) => {
        Modal.confirm({
            title: 'Claim',
            content: 'Are you sure?',
            onOk: async () => {

                await services.ClaimDn(id, access.currentUser?.login) as {
                    data: string;
                    message: string;
                }
                setRefetch(true)
                reload?.(true);
                message.success('Updated successfully');
            },
        });
    }

    const handleUnClaim = async (id: number) => {
        Modal.confirm({
            title: 'UnClaim',
            content: 'Are you sure?',
            onOk: async () => {

                await services.ClaimDn(id, '') as {
                    data: string;
                    message: string;
                }
                setRefetch(true)
                reload?.(true);
                message.success('Updated successfully');
            },
        });
    }

    const mapUnplannedToDeliveryRow = (item: any) => ({
        id: `unplanned-${item.unplanned.id}`, // use unplanned.id to uniquely identify
        itemCode: item.unplanned.item_code,
        itemName: item.unplanned.item_name,
        qty: Number(item.unplanned.order_qty),
        saleType: item.unplanned.type,
        lineNumber: item.unplanned.line_number,
        isUnplan: 'Unplanned',
        dn: [{
            id: item.unplanned.id,
            dn_qty: item.unplanned.dn_qty,
            dn_date: item.unplanned.dn_date,
            remark: item.unplanned.remark,
            attachment: item.attachments ?? [], // fallback to empty array if not present
        }],
    });

    return (
        <DrawerForm
            title="Delivery Note"
            {...rest}
            width={1200}
            submitter={false}
            drawerProps={{
                extra: (
                    <Space>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Text strong>PO# {po}</Text>
                            <Tag
                                color={
                                    status === 'Pending'
                                        ? 'orange'
                                        : status === 'Posted'
                                            ? 'green'
                                            : status === 'Failed'
                                                ? 'red'
                                                : 'default'
                                }
                                bordered={false}
                            >
                                {status}
                            </Tag>

                            {/* <Progress
                                percent={percentage || 0}
                                size="small"
                                strokeColor={{ from: '#108ee9', to: '#87d068' }}
                                style={{ width: 100 }}
                                format={(percent) => `${Math.round(percent ?? 0)}%`}
                            /> */}
                        </div>
                    </Space>
                )
            }}
        >
            <Spin spinning={loading}>
                {Array.isArray(dn) && dn.length > 0 ? dn.map((group, idx) => (
                    <ProCard key={idx}>
                        <Card>
                            <Descriptions column={5}>
                                <Descriptions.Item label="DO Date" style={{ fontWeight: 'bolder' }}>
                                    {dayjs(group.deliveryDate).isValid() ? dayjs(group.deliveryDate).format('DD-MMM-YYYY') : '-'}
                                </Descriptions.Item>

                                <Descriptions.Item label="Shipping Address" style={{ fontWeight: 'bolder' }} span={2}>
                                    {group.shippingAddress ? group.shippingAddress : '-'}
                                </Descriptions.Item>
                                {/* {access.canAccesAddRemarkAllocate ? */}
                                <Descriptions.Item span={4} style={{}}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                                        {group.claimed_by ? (
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <span>
                                                    Claimed:{' '}
                                                    <strong>
                                                        {group.claimed_by}
                                                    </strong>
                                                    <span style={{ fontSize: 12 }}> {dayjs.utc(group.claimed_date).tz('Asia/Phnom_Penh').format('DD-MMM-YYYY hh:mm a')}</span>

                                                </span>
                                                {access.currentUser?.login == group.claimed_by && access.canAccesAddRemarkAllocate ?
                                                    <Button type="default" danger
                                                        onClick={() => handleUnClaim(group.id)}
                                                    >
                                                        Unclaim
                                                    </Button>
                                                    : <></>}

                                            </div>
                                        ) : access.canAccesAddRemarkAllocate ? (
                                            <Button type="primary"
                                                onClick={() => handleClaim(group.id)}
                                            >
                                                Claim
                                            </Button>
                                        ) : <></>}
                                    </div>
                                </Descriptions.Item>
                                {/* : <></>} */}
                            </Descriptions>
                            <ProTable
                                size="small"
                                search={false}
                                rowKey="id"
                                dataSource={[
                                    ...group.deliveryItems,
                                    ...(group.unplannedItems || []).map(mapUnplannedToDeliveryRow)
                                ]}
                                options={{
                                    density: false,
                                    fullScreen: false,
                                    reload: false,
                                    setting: false,
                                }}
                                pagination={false}
                                columns={[
                                    {
                                        title: 'Item Code',
                                        dataIndex: 'itemCode',
                                        width: 150,
                                    },
                                    {
                                        title: 'Item Name',
                                        dataIndex: 'itemName',
                                        width: 250,
                                    },
                                    // {
                                    //     title: 'Total Qty',
                                    //     dataIndex: 'qty',
                                    //     width: 90,
                                    //     render: (_, record) => {
                                    //         return (totalQtyByItemCode?.[record.itemCode] ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
                                    //     },
                                    // },
                                    {
                                        title: 'Plan',
                                        dataIndex: 'qty',
                                        width: 70,
                                    },
                                    {
                                        title: 'Delivered',
                                        width: 70,
                                        render: (_, record) => {
                                            const firstDnQty = record.dn && record.dn.length > 0
                                                ? Number(record.dn[0].dn_qty) || 0
                                                : 0;

                                            const planQty = Number(record.qty) || 0;

                                            let color = 'black';
                                            if (firstDnQty === planQty) {
                                                color = 'green';
                                            } else if (firstDnQty > planQty) {
                                                color = 'red';
                                            } else if (firstDnQty < planQty && firstDnQty > 0) {
                                                color = 'orange';
                                            }

                                            return (
                                                <div style={{ color }}>
                                                    {firstDnQty.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </div>
                                            );
                                        },
                                    },
                                    {
                                        title: 'Type',
                                        dataIndex: 'saleType',
                                        width: 70,
                                    },
                                    {
                                        title: 'Remark',
                                        dataIndex: 'dn',
                                        width: 250,
                                        render: (_dom, entity) => {
                                            const remark = entity.dn?.[0]?.remark ?? '';
                                            return (
                                                <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                                    {remark ? remark : '-'}
                                                </div>
                                            );
                                        },
                                    },
                                    // {
                                    //     title: 'Attachment',
                                    //     dataIndex: 'attachment',
                                    //     render: (_, record) => (
                                    //         <Image.PreviewGroup>
                                    //             <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    //                 {record.dn?.[0]?.attachment?.map((att, index) => (
                                    //                     <Image
                                    //                         key={index}
                                    //                         width={50}
                                    //                         height={50}
                                    //                         src={att || ''}
                                    //                         alt={`attachment-${index}`}
                                    //                         style={{ objectFit: 'cover', borderRadius: 4 }}
                                    //                         preview={{ mask: <div>Click to preview</div> }}
                                    //                     />
                                    //                 ))}
                                    //             </div>
                                    //         </Image.PreviewGroup>
                                    //     ),
                                    // },
                                    {
                                        title: 'Attachment',
                                        dataIndex: 'attachment',
                                        width: 250,
                                        render: (_, record) => {
                                            const attachments = record.dn?.[0]?.attachment || [];

                                            return (
                                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                    {attachments.map((att, index) => {
                                                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(att);
                                                        const decodedURL = decodeURIComponent(att)
                                                        const fileNameMatch = decodedURL.match(/\/([^\/?]+)\?alt=media/)
                                                        let fileName = fileNameMatch ? fileNameMatch[1] : `File ${index + 1}`;
                                                        const dashIndex = fileName.indexOf('-');
                                                        if (dashIndex !== -1) {
                                                            fileName = fileName.substring(dashIndex + 1);
                                                        }
                                                        return isImage ? (
                                                            <Image
                                                                key={index}
                                                                width={50}
                                                                height={50}
                                                                src={att}
                                                                alt={`attachment-${index}`}
                                                                style={{ objectFit: 'cover', borderRadius: 4 }}
                                                                preview={{ mask: <div>Click to preview</div> }}
                                                            />
                                                        ) : (
                                                            <a
                                                                key={index}
                                                                href={att}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    display: 'inline-block',
                                                                    padding: '4px 8px',
                                                                    border: '1px solid #ccc',
                                                                    borderRadius: 4,
                                                                    backgroundColor: '#f5f5f5',
                                                                    marginRight: 8,
                                                                }}
                                                            >
                                                                {fileName}
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        },
                                    },

                                    {
                                        title: 'DN Date',
                                        width: 190,
                                        render: (_, record) => {
                                            const deliveryDate = dayjs(group.deliveryDate);
                                            const rawDnDate = record.dn?.[0]?.dn_date;
                                            const dnDate = rawDnDate ? dayjs(rawDnDate) : null;

                                            if (dnDate && dnDate.isValid()) {
                                                let color = 'default'
                                                let text = '-'

                                                if (dnDate.isAfter(deliveryDate)) {
                                                    color = 'red'
                                                    text = 'Late'
                                                } else if (dnDate.isBefore(deliveryDate)) {
                                                    color = 'orange'
                                                    text = 'Early'
                                                } else {
                                                    color = 'green'
                                                    text = 'On Time'
                                                }

                                                return (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                        {dnDate.format('DD-MMM-YYYY')}
                                                        <Tag color={color} style={{ marginLeft: 8 }}>{text}</Tag>
                                                    </span>
                                                );
                                            }

                                            return <span>-</span>;
                                        }

                                    },
                                    {
                                        width: 100,
                                        align: 'center',
                                        render: (_, r) => {
                                            if (status != 'Posted') return null;
                                            if (!access.canAccesAddRemarkAllocate) return null
                                            return (
                                                <a
                                                    onClick={() => {
                                                        const dnItem = r.dn?.[0];
                                                        setModalOpen({
                                                            visible: true,
                                                            id: dnItem?.id,
                                                            remark: dnItem?.remark,
                                                            attachment: dnItem?.attachment,
                                                        });
                                                    }}
                                                >
                                                    <FaRegPenToSquare />
                                                </a>
                                            );
                                        },
                                    },
                                    {
                                        dataIndex: 'isUnplan',
                                        width: 100,
                                        align: 'center',
                                        render: (_, record) => (
                                            <Tag color={record.isUnplan === 'Unplanned' ? 'red' : undefined}>
                                                {record.isUnplan}
                                            </Tag>
                                        ),
                                    }

                                ]}
                            />
                        </Card>
                    </ProCard>
                )) : <Card style={{ textAlign: 'center', padding: '40px 0' }}>
                    <InboxOutlined style={{ fontSize: 40, color: '#999' }} />
                    <div style={{ marginTop: 12, fontSize: 16, color: '#666' }}>
                        No Delivery Data Available
                    </div>
                </Card>}
            </Spin>

            <AddRemarkModal
                open={modalOpen.visible}
                onCancel={() => setModalOpen({ visible: false, id: 0, remark: '', attachment: [] })}
                id={modalOpen.id}
                onSave={(e) => { handleSaveRemark(e) }}
                remark={modalOpen.remark}
                attachment={modalOpen.attachment}
            />
        </DrawerForm>
    );
};
