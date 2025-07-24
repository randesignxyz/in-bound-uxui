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

dayjs.extend(customParseFormat)
interface Props extends DrawerFormProps {
    data?: any;
    reload?: (flag: boolean) => void;
    onEdit?: () => void;
    onAdd?: () => void;
    id: string
    status?: string,
    po?: string,
    deliveres?: DeliveryList[],
    reloadTrigger?: number
}

export default ({ data, id, status, po, deliveres, reload, reloadTrigger, ...rest }: Props) => {
    const { Text } = Typography;
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

    const totalQtyByItemCode = useMemo(() => {
        const dnArray = Array.isArray(dn) ? dn : [dn];

        return dnArray
            .flatMap(delivery => delivery?.deliveryItems ?? [])
            .reduce((acc, item) => {
                if (!item.itemCode) return acc;
                acc[item.itemCode] = (acc[item.itemCode] || 0) + (item.qty || 0);
                return acc;
            }, {} as Record<string, number>);
    }, [dn]);

    useEffect(() => {
        setDn([])
    }, [rest.open])
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const da = await services.list_dn([id]);
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


    return (
        <DrawerForm
            title="Delivery Note List"
            {...rest}
            width={1200}
            submitter={false}
            drawerProps={{
                extra: (
                    <Space>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Text strong>{po}</Text>
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
                            <Descriptions>
                                <Descriptions.Item label="Delivery Date " style={{ fontWeight: 'bolder' }}>
                                    {dayjs(group.deliveryDate).isValid() ? dayjs(group.deliveryDate).format('DD-MMM-YYYY') : '-'}
                                </Descriptions.Item>
                                 <Descriptions.Item label="Shipping Address " style={{ fontWeight: 'bolder' }}>
                                    {group.shippingAddress?group.shippingAddress : '-'}
                                </Descriptions.Item>
                            </Descriptions>
                            <ProTable
                                size="small"
                                search={false}
                                rowKey="id"
                                dataSource={group.deliveryItems}
                                options={{
                                    density: false,
                                    fullScreen: false,
                                    reload: false,
                                    setting: false,
                                }}
                                pagination={false}
                                columns={[
                                    {
                                        title: 'Item Name',
                                        dataIndex: 'itemName',
                                        width: 200,
                                    },
                                    {
                                        title: 'Total Qty',
                                        dataIndex: 'qty',
                                        width: 90,
                                        render: (_, record) => {
                                            return (totalQtyByItemCode?.[record.itemCode] ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
                                        },
                                    },
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
                                        width: 300,
                                        render: (_dom, entity) => {
                                            const remark = entity.dn?.[0]?.remark ?? '';
                                            return (
                                                <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                                    {remark}
                                                </div>
                                            );
                                        },
                                    },
                                    {
                                        title: 'Attachment',
                                        dataIndex: 'attachment',
                                        render: (_, record) => (
                                            <Image.PreviewGroup>
                                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                    {record.dn?.[0]?.attachment?.map((att, index) => (
                                                        <Image
                                                            key={index}
                                                            width={50}
                                                            height={50}
                                                            src={att || ''}
                                                            alt={`attachment-${index}`}
                                                            style={{ objectFit: 'cover', borderRadius: 4 }}
                                                            preview={{ mask: <div>Click to preview</div> }}
                                                        />
                                                    ))}
                                                </div>
                                            </Image.PreviewGroup>
                                        ),
                                    },
                                    {
                                        width: 100,
                                        align: 'center',
                                        render: (_, r) => {
                                            if (status != 'Posted') return null;

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
