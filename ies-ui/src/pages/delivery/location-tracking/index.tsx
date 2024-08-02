import { ProDescriptions, ProList } from "@ant-design/pro-components"
import { GoogleMap, useGoogleMap, useLoadScript, } from "@react-google-maps/api"
import { Button, DatePicker, Drawer, Flex, FloatButton, Input, Space } from "antd";
import { useRef, useState } from "react";
import MapComp from "./MapComp";
import { useQuery } from "@umijs/max";
import { fetchDataListService } from "@/services/apiGateway";
import { Moment } from "moment";
import { simpleRequestActions } from "@/services/model";
import dayjs from "dayjs";


import { LocationTracking } from "./data.type";
import Icon from "@ant-design/icons/lib/components/Icon";
import { formatDateTime } from "@/pages/utils";
import { AimOutlined, ArrowLeftOutlined, RightCircleOutlined, TruckOutlined } from "@ant-design/icons";
import DeliveryList from "./DeliveryList";
import DeliveryView from "./DeliveryView";
const dateFormat = 'YYYY/MM/DD';

export default () => {

    const [visible, setVisible] = useState(false)
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: 'AIzaSyA0Ifgai8ryDULDIqNOZmX8L7XZlzu4_D8'
    });
    const [criteria, setCriteria] = useState<{ deliveryDate?: Moment }>()
    const [selectItem, setSelectItem] = useState<LocationTracking>()
    const [zoomTo, setZoomto] = useState<LocationTracking>()
    const requestActions = simpleRequestActions()
    const { data, refetch } = useQuery([criteria], () => fetchList(), {
        refetchOnWindowFocus: false
    })

    const fetchList = (deliveryDate?: Moment) => fetchDataListService<LocationTracking, { deliveryDate?: Moment }>({
        actionName: 'list-location-tracking',
        endpoint: 'DELIVERY',
        payload: { deliveryDate }
    }).query(requestActions)


    return <Flex>

        {isLoaded && <MapComp onView={(item) => {
            setSelectItem(item)
            setVisible(true)
        }} onZoomChanged={() => setZoomto(undefined)} zoomTo={zoomTo} data={data || []} onFilter={data => setCriteria({ deliveryDate: data })} onOpen={() => setVisible(true)} >

        </MapComp>}

        <Drawer extra={selectItem && <Button type="link" onClick={() => setSelectItem(undefined)} icon={<ArrowLeftOutlined />} />} width={600}
            title={selectItem ? selectItem.licensePlane : 'Location Tracking '} onClose={() => {
                setVisible(false)
                setZoomto(undefined)

            }} open={visible} >

            {!selectItem && <DeliveryList data={data || []} onZoom={setZoomto} onView={setSelectItem} />}
            {selectItem && <DeliveryView />}
        </Drawer>
    </Flex>

}