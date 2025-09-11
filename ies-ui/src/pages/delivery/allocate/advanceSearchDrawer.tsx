import { formatDate, formatDateTime } from '@/pages/utils';
import { EditableFormInstance, EditableProTable, ProCard, ProList, ProTable } from '@ant-design/pro-components';
import ProForm, { DrawerForm, DrawerFormProps, ProFormDatePicker, ProFormDateRangePicker, ProFormSelect } from '@ant-design/pro-form';
import { Button, Card, Col, Descriptions, Divider, message, Modal, Progress, Row, Space, Spin, Tag, Typography, UploadFile, Image, Table, DatePicker } from 'antd';
import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AllocateServiceAPI } from './service';
import { simpleRequestActions } from '@/services/model';
import { AllocateSOAdvanceParams, DeliveryDnParams, DeliveryItemList, DeliveryList, DNItemParams, DNParams, LocationList, UpdateRemarkParams } from './data';
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
import { Paging } from '@/services/API';

dayjs.extend(utc);
dayjs.extend(timezone);
interface Props extends DrawerFormProps {
    onReset: () => void;
    onSearch: (params: AllocateSOAdvanceParams) => void;
    type?: string
}

export default ({ onReset, onSearch, type, ...rest }: Props) => {
    const { Text } = Typography;
    const access = useAccess();
    const requestActions = simpleRequestActions();
    const editableFormRef = useRef<EditableFormInstance>();
    const services = AllocateServiceAPI(requestActions);
    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [dn, setDn] = useState<DNParams | DNParams[] | undefined>()
    const [refetch, setRefetch] = useState(false)
    const [loading, setLoading] = useState(false);

    const normalizeLocationList = (
        res: LocationList | Paging<LocationList> | LocationList[]
    ): LocationList[] => {
        if (Array.isArray(res)) return res;
        if ("data" in res && Array.isArray(res.data)) return res.data;
        if (res && !("data" in res)) return [res as LocationList];
        return [];
    };
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
            {type == 'SO' ?
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
                : type == 'DN' ?
                    <ProForm
                        form={form}
                        onReset={() => onReset()}
                        submitter={{
                            onSubmit: async () => {
                                const data = await form.validateFields()
                                const [startDate, endDate] = Array.isArray(data.ordered_date) ? data.ordered_date : []

                                const formatted = {
                                    ...data,
                                    delivery_date: data.delivery_date
                                        ? (data.delivery_date as unknown as dayjs.Dayjs).format("YYYY-MM-DD")
                                        : undefined,
                                };
                                console.log(formatted)
                                onSearch(formatted);
                            },
                        }}
                    >

                        <ProFormSelect
                            label="So Status"
                            name="status"
                            initialValue="Posted"
                            allowClear
                            showSearch
                            options={[
                                {
                                    value: 'ALL',
                                    label: 'ALL',
                                },
                                {
                                    value: 'Pending',
                                    label: 'Pending',
                                },
                                {
                                    value: 'Posted',
                                    label: 'Posted',
                                },
                                {
                                    value: 'Failed',
                                    label: 'Failed',
                                },
                                {
                                    value: 'Canceled',
                                    label: 'Canceled',
                                }
                            ]}
                        />
                        <ProFormDatePicker
                            width={'100%'}
                            name="delivery_date"
                            placeholder="Select Date"
                            label="Delivery Date"
                        />
                        <ProFormSelect
                            label="Province"
                            name="province_id"
                            allowClear
                            showSearch
                            request={async () => {
                                const res = await AllocateServiceAPI(requestActions).list_Location(type = "PROVINCE");
                                const data = normalizeLocationList(res);
                                return data.map((obj) => ({ value: obj.id, label: obj.name }));
                            }}
                        />
                        <ProFormSelect
                            label="District"
                            name="district_id"
                            allowClear
                            showSearch
                            dependencies={["province_id"]} // refresh when province changes
                            request={async () => {
                                const provinceId = form.getFieldValue("province_id"); // or form.province_id
                                if (!provinceId) return [];

                                const res = await AllocateServiceAPI(requestActions).list_Location(type = "DISTRICT", parent = provinceId);
                                const data = normalizeLocationList(res);
                                return data.map((obj) => ({ value: obj.id, label: obj.name }));
                            }}
                        />

                        <ProFormSelect
                            label="Commune"
                            name="commune_id"
                            allowClear
                            showSearch
                            dependencies={["district_id"]} // refresh when province changes
                            request={async () => {
                                const districtId = form.getFieldValue("district_id"); // or form.province_id
                                if (!districtId) return [];

                                const res = await AllocateServiceAPI(requestActions).list_Location(type = "COMMUNE", parent = districtId);
                                const data = normalizeLocationList(res);
                                return data.map((obj) => ({ value: obj.id, label: obj.name }));
                            }}
                        />

                    </ProForm>
                    :
                    type == 'OV' ?
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
                            <ProFormDateRangePicker
                                style={{ width: 165 }}
                                name="ordered_date"
                                placeholder="Select Date"
                                label="From Date - To Date"
                            />
                        </ProForm>
                        :
                        type == 'MT' ?
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

                                        }
                                        onSearch(formatted);
                                    },
                                }}
                            >
                                <ProFormSelect
                                    label="DN Status"
                                    name="status"
                                    initialValue="ALL"
                                    allowClear
                                    showSearch
                                    options={[
                                        {
                                            value: 'ALL',
                                            label: 'ALL',
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
                                        }
                                    ]}
                                />
                                <ProFormDateRangePicker
                                    style={{ width: 165 }}
                                    name="ordered_date"
                                    placeholder="Select Date"
                                    label="From Date - To Date"
                                />
                            </ProForm> : <></>
            }

        </DrawerForm>
    );
};
