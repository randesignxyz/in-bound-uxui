import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { formatterQty } from '@/pages/utils';
import { execDataService0, singleRequest } from '@/services/apiGateway';
import { DeliveryNoteDetail, DeliveryNoteItem, DeliveryNoteListItem, Driver, LoadingItem, LoadingItemDetail, ResolvedDNResponse, Truck } from '@/services/delivery/data';
import { DeliveryParams } from '@/services/delivery/delivery-params';
import { InstanceSrvParams } from '@/services/delivery/instance-service-params';
import { InstanceDetail } from '@/services/delivery/instance.types';
import { LoadingParams } from '@/services/delivery/loading-params';
import { SimpleRequestActions } from '@/services/model';
import { ArrowLeftOutlined, EnvironmentOutlined, SearchOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import ProForm, {
    ProFormDatePicker,
    ProFormGroup,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
} from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useAccess } from '@umijs/max';
import { Alert, Button, Checkbox, Col, Divider, message, Modal, Row, Spin, Typography } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import { Moment } from 'moment';
import { useEffect, useState } from 'react';

interface Props extends FormModalProps {
    requestActions: SimpleRequestActions;
    itemDetail?: InstanceDetail
    cb?: () => void
}

export const shiftList = ['Morning', 'Daylignt', 'Evening', 'Night'];
export const timeFrame = [
    { from: 4, to: 10, shift: 'Morning' },
    { from: 11, to: 15, shift: 'Daylignt' },
    { from: 16, to: 21, shift: 'Evening' },
    { from: 22, to: 3, shift: 'Night' },
]

const IssueDNModal: React.FC<Props> = ({ cb, requestActions, itemDetail, ...props }) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: 'AIzaSyA0Ifgai8ryDULDIqNOZmX8L7XZlzu4_D8', // put your key here
    });
    const access = useAccess()
    const [loadingItem, setLoadingItem] = useState<ResolvedDNResponse>();
    const [warehouses, setWarehouses] = useState<string[]>([])
    const [truckChanging, setTruckChanging] = useState(false)
    const [driverList, setDriverList] = useState<Driver[]>()
    const [trucks, setTrucks] = useState<Truck[]>()
    const [autoSearch, setAutoSearch] = useState(0)
    const [openMap, setOpenMap] = useState(false)

    const [form] = useForm<{
        docDate: Moment;
        driverId: number;
        licensePlate: string;
        whsCode?: string;
        shift: string;
        remarks?: string;
    }>();

    useEffect(() => {
        if (!props.open) return;

        const hour = moment().get('hours')
        form.setFieldsValue({
            docDate: moment(),
            shift: timeFrame.find(it => it.from <= hour && it.to >= hour)?.shift || 'Morning'
        });

    }, [props.open]);

    useEffect(() => {
        if (!truckChanging) {
            search()
        }
    }, [autoSearch])

    const search = async (formValues?: any) => {
        try {
            const formData = formValues || await form.validateFields(['driverId', 'licensePlate', 'docDate', 'shift'])
            const { docDate, shift, driverId, licensePlate } = formData
            const rs = (await singleRequest(
                LoadingParams.fetchDN(itemDetail?.loading?.id || 0, docDate, shift, truckChanging ? driverId : null, truckChanging ? licensePlate : null),

            )(requestActions)) as ResolvedDNResponse;
            setLoadingItem(rs)
            // const warehouseList = uniq(rs.deliveryNotes..filter(it => it.whsCode).map(it => it.whsCode || ''))
            // setWarehouses(warehouseList)
            // form.setFieldValue('whsCode', warehouseList.find(it => it === 'OFL-WH02') || warehouseList.find(it => it))

        } catch (error: any) {
            console.log(error);

            message.error(error.message || 'Failed to load data.');
        }
    };

    const changeTruckHandler = async (changed: boolean) => {
        setLoadingItem(undefined)
        setTruckChanging(changed)
        if (changed && (driverList?.length || 0) === 0) {
            const driverList = await DeliveryParams.listActiveDrivers.query(requestActions)
            setDriverList(driverList)
            const driver = driverList.find(it => it.id === itemDetail?.loading?.driver.id)
            setTrucks(driver?.trucks)
            form.setFieldValue('driverId', itemDetail?.loading?.driver.id || driver?.id)
        }
        setAutoSearch(v => v + 1)
    }


    const issueDNHandler = () => {

        Modal.confirm({
            title: 'DN issued comfirmation',
            content: 'Are you sure?',
            onOk: async () => {
                try {
                    if (!itemDetail?.loading?.id) {
                        message.error("Data not found.")
                        return
                    }
                    const formData = await form.validateFields(['driverId', 'licensePlate', 'docDate', 'shift'])
                    const { docDate, shift, driverId, licensePlate } = formData
                    await execDataService0({
                        actionName: 'issue-dn',
                        endpoint: 'DELIVERY',
                        payload: {
                            id: itemDetail?.loading?.id || 0,
                            docDate: docDate,
                            shift,
                            driverId: truckChanging ? driverId : undefined,
                            licensePlate: truckChanging ? licensePlate : undefined
                        }
                    })(requestActions)
                    props.onCancel?.()
                    cb?.()
                } catch (error: any) {


                    message.error(error.message || `Failed to issue db`);
                }
            },
        });
    }


    const expandedRowRender = (item: DeliveryNoteDetail) => {
        return <ProTable
            columns={[
                { title: 'Item Code', dataIndex: 'itemCode' },
                { title: 'Description', dataIndex: 'itemDescription' },
                { title: 'Wherehouse Code', dataIndex: 'whsCode' },
                { title: 'UoM', dataIndex: 'uomCode' },
                { title: 'Shipped Qty', dataIndex: 'qty', align: 'right', render: (_, r) => formatterQty.format(r.qty) },
            ]}
            size="small"
            dataSource={item?.items}
            options={false}
            search={false}
            pagination={false}
            rowKey={(item) => `${item.id}`}
            footer={(data) => (
                <Row>
                    <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                        Total
                    </Col>
                    <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                        {formatterQty.format(data.map((it) => (it.qty || 0))?.reduce((p, c) => p + c, 0))}
                    </Col>
                </Row>
            )}
        />
    }

    useEffect(() => {

        if (trucks?.some(it => it.licensePlate === itemDetail?.loading?.truck.licensePlate)) {
            form.setFieldValue("licensePlate", itemDetail?.loading?.truck.licensePlate)
        } else {
            form.setFieldValue("licensePlate", trucks?.find(it => it)?.licensePlate)
        }
        if (!trucks) {
            form.resetFields(['licensePlate'])
        }
    }, [trucks])

    const defaultCenter = {
        lat: Number(loadingItem?.deliveryNotes[0]?.latitude) || 11.562108,
        lng: Number(loadingItem?.deliveryNotes[0]?.longitude) || 104.888535,
    };


    return (
        <FormModalComp title="Issue DN"
            {...props}
            onSubmit={issueDNHandler}>
            <Spin spinning={requestActions.request?.loading || false}>
                <ProForm
                    onValuesChange={async (valueChanges, values) => {
                        const { driverId } = valueChanges
                        if ('changeTruck' in valueChanges) {
                            return
                        }
                        if ('driverId' in valueChanges) {
                            setTrucks(driverList?.find(it => it.id === driverId)?.trucks)
                        }
                        if ('docDate' in valueChanges || 'shift' in valueChanges || 'driverId' in valueChanges || 'licensePlate' in valueChanges) {
                            setLoadingItem(undefined)
                            setAutoSearch(v => v + 1)
                        }
                    }}
                    form={form}
                    submitter={false}
                >
                    <ProCard boxShadow size="small" title="Searching">
                        <ProFormGroup>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>

                                <Checkbox
                                    disabled={!access.canAccessDeliveryMenuItem}
                                    defaultChecked={false}
                                    onChange={e => changeTruckHandler(e.target.checked)}
                                >
                                    <Typography.Text strong type="warning">Change Truck</Typography.Text>
                                </Checkbox>

                                <Button
                                    type="link"
                                    icon={<EnvironmentOutlined />}
                                    onClick={() => setOpenMap(true)}
                                />

                            </div>
                        </ProFormGroup>
                        <Divider dashed orientationMargin={0} />
                        {truckChanging && <ProFormGroup >
                            <ProFormSelect rules={[{ required: true }]}
                                showSearch allowClear={false} label="Driver" name={'driverId'}
                                width={'sm'} options={driverList?.map(it => ({
                                    label: [it.firstName, it.lastName].join(" "),
                                    value: it.id
                                }))} />
                            <ProFormSelect rules={[{ required: true }]}
                                showSearch label="Truck"
                                allowClear={false}
                                name={'licensePlate'}
                                width={'sm'} options={trucks?.map(it => ({
                                    label: it.licensePlate,
                                    value: it.licensePlate
                                }))} />
                        </ProFormGroup>}
                        {!openMap && (<>
                            <ProFormGroup >
                                <ProFormDatePicker
                                    width={'sm'}
                                    label="Shipping Date"
                                    name={'docDate'}
                                    rules={[{ required: true }]}
                                />
                                <ProFormSelect
                                    allowClear={false}
                                    rules={[{ required: true }]}
                                    label="Shift"
                                    name={'shift'}
                                    width={'sm'}
                                    options={shiftList}
                                />
                                {truckChanging && <ProFormText label=".">
                                    <Button icon={<SearchOutlined />} onClick={async () => {
                                        await search();
                                    }}>
                                        Search
                                    </Button>
                                </ProFormText>}
                            </ProFormGroup>
                            {/* {sameQty() && <Alert type='warning' showIcon message="Plicking items are the same." />} */}
                            {(loadingItem?.deliveryNotes?.length || 0) === 0 && <Alert type='warning' showIcon closable message="No DN available. Please verify with SAP." />}
                        </>)}
                        {openMap && (<>
                            <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
                                <Button
                                    type="link"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => setOpenMap(false)}
                                >
                                    Back
                                </Button>
                            </div>
                            <GoogleMap
                                zoom={12}
                                center={defaultCenter}
                                mapContainerStyle={{ width: "100%", height: "550px" }}
                            >
                                {loadingItem?.deliveryNotes.map((dn) => (
                                    <Marker
                                        key={dn.docEntry}
                                        position={{ lat: Number(dn.latitude), lng: Number(dn.longitude) }}
                                        title={`${dn.cardName} - ${dn.docNum}`}
                                    />
                                ))}


                            </GoogleMap>
                        </>)}

                    </ProCard>
                    {!openMap && (<>
                        {warehouses.length > 1 && <ProCard bordered size='small' title='Warehouse'>
                            <ProFormSelect
                                name={'whsCode'}
                                width={'md'}
                                rules={[{ required: true }]}
                                label="First loading Warehouse"
                                options={warehouses} />
                        </ProCard>}

                        <ProCard bordered title="Delivery Note" size="small" style={{ marginTop: '5px' }}>
                            <ProTable<DeliveryNoteDetail>
                                columns={[
                                    { title: 'Del.Doc Num', dataIndex: 'docNum' },
                                    { title: 'Company', dataIndex: 'company' },
                                    { title: 'Cust. Code', dataIndex: 'cardCode' },
                                    { title: 'Cust. Name', dataIndex: 'cardName' },
                                    { title: 'Shipped To', dataIndex: 'shipToCode' },
                                    { title: 'Quantity', dataIndex: 'qty', align: 'right', render: (_, r) => formatterQty.format(r.qty) },
                                ]}
                                size="small"
                                expandable={{
                                    expandedRowRender,
                                }}
                                dataSource={loadingItem?.deliveryNotes}
                                options={false}
                                search={false}
                                pagination={false}
                                rowKey={'docNum'}
                            />
                        </ProCard>


                        <ProCard bordered size="small" style={{ marginTop: '5px' }}>
                            <ProFormTextArea label="Remarks" name={'remarks'} />
                        </ProCard>
                    </>)}
                </ProForm>
            </Spin>
        </FormModalComp>
    );
};

export default IssueDNModal;
