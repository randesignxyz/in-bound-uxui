import { ProDescriptions, ProList } from "@ant-design/pro-components"
import { GoogleMap, useGoogleMap, useLoadScript, } from "@react-google-maps/api"
import { Button, DatePicker, Drawer, Flex, FloatButton, Input, Space, Spin } from "antd";
import { useRef, useState } from "react";
import MapComp from "./MapComp";
import { useQuery } from "@umijs/max";
import { fetchDataListService, singleRequest } from "@/services/apiGateway";
import { Moment } from "moment";
import { simpleRequestActions } from "@/services/model";
import { LocationTracking } from "./data.type";
import { ArrowLeftOutlined, ReloadOutlined, } from "@ant-design/icons";
import DeliveryList from "./DeliveryList";
import DeliveryView from "./DeliveryView";
import { InstanceDetail } from "@/services/delivery/instance.types";
import { InstanceSrvParams } from "@/services/delivery/instance-service-params";
import dayjs from "dayjs";

export default () => {

    const [visible, setVisible] = useState(false)
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: 'AIzaSyA0Ifgai8ryDULDIqNOZmX8L7XZlzu4_D8'
    });
    const [criteria, setCriteria] = useState<{ deliveryDate?: dayjs.Dayjs }>()

    const [zoomTo, setZoomto] = useState<LocationTracking>()
    const requestActions = simpleRequestActions()

    const { data, isFetching, refetch } = useQuery([criteria], () => fetchList(criteria?.deliveryDate), {
        refetchOnWindowFocus: false,
        refetchInterval: 60000
    })
    const [selectedItem, setSelectedItem] = useState<LocationTracking>()

    const [instanceData, setInstanceData] = useState<InstanceDetail>();

    const fetchList = (deliveryDate?: dayjs.Dayjs) => fetchDataListService<LocationTracking, { date?: dayjs.Dayjs }>({
        actionName: 'list-location-tracking',
        endpoint: 'DELIVERY',
        payload: { date: deliveryDate }
    }).query(requestActions)

    const loadDetail = async (id: number) => {
        const rs = await singleRequest(InstanceSrvParams.fetch(id))(requestActions) as InstanceDetail;
        setInstanceData(rs);
        return rs
    }

    const onViewHandler = async (item?: LocationTracking) => {
        setSelectedItem(item)
        item?.processInstanceId && await loadDetail(item?.processInstanceId)
        setVisible(true)

    }

    return <Spin spinning={isFetching || requestActions.request?.loading || false}><Flex>
        {isLoaded && <MapComp reload={refetch} onView={onViewHandler} onZoomChanged={() => setZoomto(undefined)}
            zoomTo={zoomTo} data={data || []}
            onOpen={() => {
                setInstanceData(undefined)
                setVisible(true)
            }} >
        </MapComp>}

        <Drawer extra={<Space>
            {instanceData && <Button type="link"
                onClick={() => setInstanceData(undefined)}

                icon={<ArrowLeftOutlined />} />}

            {!instanceData && <Button type="link" onClick={() => refetch()} icon={<ReloadOutlined />} />}
        </Space>

        }
            width={800}
            title={instanceData ? instanceData.truck.licensePlate : 'Location Tracking '} onClose={() => {
                setVisible(false)
                setZoomto(undefined)

            }} open={visible} >

            {!instanceData && <DeliveryList onSelectDate={(date) => setCriteria({ deliveryDate: date })} data={data || []} onZoom={setZoomto} onView={onViewHandler} />}
            {instanceData && <DeliveryView data={instanceData} shipToId={selectedItem?.deliveryItemId || 0} />}
        </Drawer>
    </Flex>
    </Spin >
}