import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { LoadingBayListItem, LoadingCapacityListItem, LoadingDock, LoadingDockListItem } from "@/services/delivery/data";
import { SaveLoadingDockParams } from "@/services/delivery/queue-params";
import { ProForm, ProFormCheckbox, ProFormDigit, ProFormRate, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";

import { Card, Col, Row } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useEffect, useState } from "react";

interface Props extends FormModalProps {
    data: {
        loadingBayList: LoadingBayListItem[];
        loadingDockList?: LoadingDockListItem[]
        loadingDock?: LoadingDock;
        loadingCapacityList?: LoadingCapacityListItem[];
    },
    onSave: (data: SaveLoadingDockParams) => void;
}

const LoadingDockEntryModal: React.FC<Props> = ({ onSave, data: { loadingBayList, loadingDockList, loadingDock, loadingCapacityList }, ...props }) => {
    const [form] = useForm<SaveLoadingDockParams>()
    const [selectedLoadingBay, setSelectedLoadingBay] = useState<number>()

    useEffect(() => {

        props.open && initDataForm()

    }, [props.open])

    const initDataForm = () => {
        setSelectedLoadingBay(loadingDock?.loadingBay.id)
        form.setFieldsValue({
            code: loadingDock?.code,
            name: loadingDock?.name,
            loadingBayId: loadingDock?.loadingBay.id,
            autoAssigned: loadingDock?.autoAssigned,
            combinedLoadingDocks: loadingDock?.combinedLoadingDocks?.map(it => it.id),
            status: loadingDock?.status,
            priority: loadingDock?.priority,
            description: loadingDock?.description,
            seq: loadingDock?.seq,
            truckLoadingCapacityIds: loadingDock?.truckLoadingCapacities?.map(it => it.id)
        })
    }

    return (
        <FormModalComp
            title="Loading Dock"

            width={'700px'} {...props}
            onSubmit={async () => {
                const dataForm = await form.validateFields()
                onSave?.({ ...dataForm, id: loadingDock?.id || 0 })
            }}

            onResetForm={() => {
                initDataForm()
            }}>
            <Card>
                <ProForm form={form} submitter={false} onValuesChange={(changedValues) => {
                    if ('loadingBayId' in changedValues) {
                        const { loadingBayId } = changedValues
                        setSelectedLoadingBay(loadingBayId)
                    }
                }} >
                    <Row gutter={50}>
                        <Col flex={"Auto"}>
                            <ProFormText rules={[{ required: true }]} name={'code'} label='Code' help={<span />} />
                            <ProFormText rules={[{ required: true }]} name={'name'} label='Name' help={<span />} />
                            <ProFormSelect disabled={loadingDock?.status === 'LOCKED'} rules={[{ required: true }]} name='loadingBayId' label='Loading Bay' options={loadingBayList.map(it => ({
                                value: it.id,
                                label: it.name
                            }))} />
                            <ProFormRate name={"priority"} label="Priority" />
                        </Col>

                        <Col flex={"Auto"}>
                            <ProFormCheckbox disabled={loadingDock?.status === 'LOCKED'} name={'autoAssigned'} label='Auto Assigned' />
                            <ProFormSelect disabled={loadingDock?.status === 'LOCKED'} rules={[{ required: true }]}
                                name={'status'}
                                label='Status'
                                options={[
                                    { label: 'Active', value: 'ACTIVE' },
                                    { label: 'Closed', value: 'CLOSED' },
                                    { label: 'Inactive', value: 'IN_ACTIVE' },
                                ]}
                                help={<span />}
                            />
                            <ProFormSelect disabled={loadingDock?.status === 'LOCKED'} name={"combinedLoadingDocks"}
                                mode="multiple"
                                label="Combined Loading Docks"
                                options={loadingDockList?.
                                    filter(it => it.loadingBay.id === selectedLoadingBay
                                        && it.id !== loadingDock?.id
                                        && (it.combinedLoadingDocks?.length || 0) == 0
                                        && (it.status == 'ACTIVE' || loadingDock?.combinedLoadingDocks?.some(i => it.id === i.id)))
                                    .map(it => ({
                                        label: it.code,
                                        value: it.id
                                    }))}
                            />
                            <ProFormDigit name={"seq"} label = "Sequence"/>
                        </Col>
                    </Row>
                    <ProFormSelect mode="multiple" allowClear name={'truckLoadingCapacityIds'} label="Truck Loading Capacity" options={loadingCapacityList?.map(it => ({ label: it.name, value: it.id }))} />
                    <ProFormTextArea name={'description'} label='Description' />
                </ProForm>
            </Card>
        </FormModalComp>
    )
}

export default LoadingDockEntryModal