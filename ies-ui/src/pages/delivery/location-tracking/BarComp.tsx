import { EnvironmentOutlined } from "@ant-design/icons"
import { useGoogleMap } from "@react-google-maps/api"
import { Button, Flex } from "antd"
import { LocationTracking } from "./data.type"
import { useEffect } from "react"

export default ({ locationTracking, onOpen }: { locationTracking?: LocationTracking, onOpen: () => void }) => {

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
        <Button style={{ top: 60, marginRight: 10 }} size="large" icon={<EnvironmentOutlined />}
            onClick={onOpen} />
    </Flex>
}