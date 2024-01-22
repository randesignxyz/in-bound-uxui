import { MultiRequest, execDataService0 } from "@/services/apiGateway"
import { LoadingCapacityListItem, LoadingDock, TransportSource } from "@/services/delivery/data"
import { DeliveryParams } from "@/services/delivery/delivery-params"
import { LoadingServiceParams } from "@/services/delivery/loading-bay-service-params"
import { simpleRequestActions } from "@/services/model"
import { ModalForm, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components"
import { Modal, Spin, message } from "antd"
import { useEffect, useState } from "react"

type DataFormType = {
    transportSources: number[],
    loadingCapacities: number[],
    loadingDocks: number[],
    remarks?: string
}

export default ({ trigger, type, onRefresh }: { trigger?: JSX.Element, type: 'WAREHOUSE' | 'DELIVERY' , onRefresh?: ()=> void} ) => {

    const requestActions = simpleRequestActions()
    const [open, setOpen] = useState(false)
    const [data, setData] = useState<{
        transportSourceList: TransportSource[];
        loadingCapacityList: LoadingCapacityListItem[];
        loadingDockList: LoadingDock[];
    }>()

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        const rs = await MultiRequest<{
            transportSourceList: TransportSource[];
            loadingCapacityList: LoadingCapacityListItem[];
            loadingDockList: LoadingDock[];

        }>([DeliveryParams.listAllTranSource(),
        LoadingServiceParams.listLoadingCapacity(),
        LoadingServiceParams.listAllLoadingDock(),
        ])(
            requestActions,
        );

        setData({
            transportSourceList: rs.transportSourceList,
            loadingCapacityList: rs.loadingCapacityList,
            loadingDockList: rs.loadingDockList,
        })
    }

    return <ModalForm<DataFormType>
        modalProps={{ destroyOnClose: true }}
        title="Check In"
        open = {open}
        onOpenChange={setOpen }
        onFinish={async (dataForm) => {
            Modal.confirm({
                title: 'Check in',
                content: "Are you sure?",
                onOk: async () => {
                    try {
                        await execDataService0<DataFormType & { type: string }>({
                            actionName: 'operator-check-in',
                            endpoint: 'DELIVERY',
                            payload: { ...dataForm, type: type }
                        })(requestActions)
                        onRefresh?.()
                    } catch (error: any) {
                        message.error(error.message || 'Failed to check in.')
                      
                    }
                }
            }) 

        }}
        trigger={trigger}>
        <Spin spinning={requestActions.request?.loading || false}>
            {type == 'DELIVERY' && <ProFormSelect allowClear mode="multiple" name={'transportSources'} label="Transport Source" options={data?.transportSourceList.map(it => ({ label: it.name, value: it.id }))} />}
            {type == 'DELIVERY' && <ProFormSelect allowClear mode="multiple" name={'loadingCapacities'} label="Loading Capacity" options={data?.loadingCapacityList.map(it => ({ label: it.name, value: it.id }))} />}
            {type == 'WAREHOUSE' && <ProFormSelect allowClear mode="multiple" name={'loadingDocks'} label="Loading Dock" options={data?.loadingDockList.map(it => ({ label: it.name, value: it.id }))} />}
            <ProFormTextArea name={"remarks"} label="Remarks" />
        </Spin>
    </ModalForm>
}