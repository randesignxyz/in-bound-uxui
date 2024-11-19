import { EnvironmentOutlined, ReloadOutlined } from "@ant-design/icons"
import { useGoogleMap } from "@react-google-maps/api"
import { Button, Flex, Space } from "antd"
import { LocationTracking } from "./data.type"
import { useEffect } from "react"

export default ({ locationTracking, onOpen, reload }: {
    locationTracking?: LocationTracking
    onOpen: () => void
    reload: () => void
}) => {

    const map = useGoogleMap()

    useEffect(() => {
        if (locationTracking) {
            map?.setCenter({
                lat: locationTracking.checkInLat,
                lng: locationTracking.checkInLng
            })

            map?.setZoom(17)
        }


    }, [locationTracking])

    return <Flex justify="flex-end">
        <Space size={'small'} direction="vertical" style={{ marginTop: 60, marginRight: 10 }}>
            <Button type="primary" size="large" icon={<EnvironmentOutlined />}
                onClick={onOpen} />
            <Button type="primary" size="large" icon={<ReloadOutlined />}
                onClick={reload} />

        </Space>
    </Flex>
}