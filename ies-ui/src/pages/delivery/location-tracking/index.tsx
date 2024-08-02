import { EnvironmentOutlined } from "@ant-design/icons";
import { PageContainer, ProList } from "@ant-design/pro-components"
import { GoogleMap, LoadScript } from "@react-google-maps/api"
import truckIcon from '@/assets/truck.png';
import { Button, Drawer, Flex, Input } from "antd";
import { useState } from "react";

const containerStyle = {
    width: '100vw',
    height: '88vh'
};

const center = {
    lat: 11.58181155360925,
    lng: 104.91810050044207
};


export default () => {

    const [visible, setVisible] = useState(false)
    return <Flex>
        <LoadScript googleMapsApiKey={"AIzaSyA0Ifgai8ryDULDIqNOZmX8L7XZlzu4_D8"}>
            <GoogleMap mapContainerStyle={containerStyle}
                center={center}
                zoom={14}   >
                <Flex justify="flex-end"> <Button style={{ top: 60, marginRight: 10 }} size="large" icon={<EnvironmentOutlined />} onClick={() => setVisible(true)} /></Flex>

            </GoogleMap>
        </LoadScript>
        <Drawer title="Trucks" onClose={() => setVisible(false)} open={visible} >
            <Flex><Input.Search /></Flex>
            <ProList />
        </Drawer>
    </Flex>

}