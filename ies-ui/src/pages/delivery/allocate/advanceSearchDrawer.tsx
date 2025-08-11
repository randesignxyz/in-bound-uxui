import { formatDate, formatDateTime } from '@/pages/utils';
import { EditableFormInstance, EditableProTable, ProCard, ProList, ProTable } from '@ant-design/pro-components';
import ProForm, { DrawerForm, DrawerFormProps, ProFormDatePicker, ProFormDateRangePicker, ProFormSelect } from '@ant-design/pro-form';
import { Button, Card, Col, Descriptions, Divider, message, Modal, Progress, Row, Space, Spin, Tag, Typography, UploadFile, Image, Table, DatePicker } from 'antd';
import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AllocateServiceAPI } from './service';
import { simpleRequestActions } from '@/services/model';
import { AllocateSOAdvanceParams, DeliveryDnParams, DeliveryItemList, DeliveryList, DNItemParams, DNParams, UpdateRemarkParams } from './data';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { CheckOutlined, EditOutlined, InboxOutlined } from '@ant-design/icons';
import AddRemarkModal from './AddRemarkForm';
import { uploadFileToFirebase } from './uploadImage';
import { FaRegPenToSquare } from 'react-icons/fa6';
import { useAccess } from '@umijs/max';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useForm } from 'antd/es/form/Form';

dayjs.extend(utc);
dayjs.extend(timezone);
interface Props extends DrawerFormProps {
    onReset: () => void;
    onSearch: (params: AllocateSOAdvanceParams) => void;
}

export default ({ onReset, onSearch, ...rest }: Props) => {
    const { Text } = Typography;
    const access = useAccess();
    const requestActions = simpleRequestActions();
    const editableFormRef = useRef<EditableFormInstance>();
    const services = AllocateServiceAPI(requestActions);
    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [dn, setDn] = useState<DNParams | DNParams[] | undefined>()
    const [refetch, setRefetch] = useState(false)
    const [loading, setLoading] = useState(false);


    useEffect(() => {
       
    }, [rest.open])

    const [form] = useForm<AllocateSOAdvanceParams>();

    return (
        <DrawerForm
            title="Advance Search"
            {...rest}
            width={500}
        submitter={false}
        >
            <ProForm
                form={form}
                onReset={() => onReset()}
                submitter={{
                    onSubmit: async () => {
                        const data = await form.validateFields()
                        const [startDate, endDate] = Array.isArray(data.ordered_date) ? data.ordered_date : []

                        const formatted = {
                            ...data,
                            startDate: startDate ? startDate.format("YYYY-MM-DD") : undefined,
                            endDate: endDate ? endDate.format("YYYY-MM-DD") : undefined,
                        };
                        console.log(formatted)
                        onSearch(formatted);
                    },
                }}
            >
                <ProFormSelect
                    label="So Status"
                    name="status"
                    initialValue="posted"
                    allowClear
                    showSearch
                    options={[
                        {
                            value: 'ALL',
                            label: 'ALL',
                        },
                        {
                            value: 'pending',
                            label: 'Pending',
                        },
                        {
                            value: 'posted',
                            label: 'Posted',
                        },
                        {
                            value: 'failed',
                            label: 'Failed',
                        },
                        {
                            value: 'canceled',
                            label: 'Canceled',
                        }
                    ]}
                />
                <ProFormDateRangePicker
                    style={{ width: 165 }}
                    name="ordered_date"
                    placeholder="Select Date"
                    label="Ordered Date Start - Ordered End"
                />
                <ProFormSelect
                    label="DN Status"
                    name="dnStatus"
                    initialValue="pending"
                    allowClear
                    showSearch
                    options={[
                        {
                            value: 'pending',
                            label: 'Pending',
                        },
                        {
                            value: 'open',
                            label: 'Open',
                        },
                        {
                            value: 'in-progress',
                            label: 'In Progress',
                        },
                        {
                            value: 'complete',
                            label: 'Completed',
                        },
                        {
                            value: 'close',
                            label: 'Close',
                        },
                        {
                            value: 'cancel',
                            label: 'Cancel',
                        }
                    ]}
                />
            </ProForm>
        </DrawerForm>
    );
};
