import { EnvironmentOutlined, ReloadOutlined } from "@ant-design/icons"
import { useGoogleMap } from "@react-google-maps/api"
import { Button, Flex, Space } from "antd"
import { Location } from "../data"
import { useEffect } from "react"

export default ({ locationTracking }: {
    locationTracking?: Location
}) => {

    const map = useGoogleMap()

    useEffect(() => {
        if (locationTracking) {
            map?.setCenter({
                lat: parseFloat(locationTracking.latitude),
                lng: parseFloat(locationTracking.longitude),
            })

            map?.setZoom(17)
        }


    }, [locationTracking])

    return <Flex justify="flex-end">
        <Space size={'small'} direction="vertical" style={{ marginTop: 60, marginRight: 10 }}>


        </Space>
    </Flex>
}