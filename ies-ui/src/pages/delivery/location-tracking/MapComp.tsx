import { EnvironmentOutlined } from "@ant-design/icons";
import { GoogleMap, GoogleMapProps, Marker, MarkerClusterer, useGoogleMap } from "@react-google-maps/api"
import { Flex } from "antd"
import { Button } from "antd/lib";
import { Moment } from "moment";
import { useEffect } from "react";
import { LocationTracking } from "./data.type";
import MarkerComp from "./MarkerComp";
import BarComp from "./BarComp";
import locationTracking from ".";
const containerStyle = {
    width: '100vw',
    height: '88vh'
};

const center = {
    lat: 11.58181155360925,
    lng: 104.91810050044207
};

export default ({ data, onFilter, onOpen, onView, zoomTo, ...rest }: GoogleMapProps & {
    zoomTo?: LocationTracking;
    data: LocationTracking[];
    onFilter: (deliveryDate?: Moment) => void;
    onOpen: () => void;
    onView: (item?: LocationTracking) => void;
}) => {
    useEffect(() => { }, [zoomTo])

    return <GoogleMap mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        options={{
            styles: [
                // {
                //     featureType: 'poi.business',
                //     stylers: [{ visibility: 'off' }],
                // },
                {
                    featureType: 'poi.attraction',
                    stylers: [{ visibility: 'off' }],
                },
                {
                    featureType: 'poi.school',
                    stylers: [{ visibility: 'off' }],
                },
                {
                    featureType: 'poi.sports_complex',
                    stylers: [{ visibility: 'off' }],
                },
                {
                    featureType: 'poi.medical',
                    stylers: [{ visibility: 'off' }],
                },
                {
                    featureType: 'poi.place_of_worship',
                    stylers: [{ visibility: 'off' }],
                },
                {
                    featureType: 'poi.sports_complex',
                    stylers: [{ visibility: 'off' }],
                },
                {
                    featureType: 'poi.government',
                    stylers: [{ visibility: 'off' }],
                },
                // {
                //     featureType: 'poi.business',
                //     stylers: [{ visibility: 'off' }],
                // },
                {
                    featureType: 'transit.station',
                    stylers: [{ visibility: 'off' }],
                },
                {
                    featureType: 'transit.station.bus',
                    stylers: [{ visibility: 'off' }],
                }
            ]
        }}

    >
        <BarComp locationTracking={zoomTo} onOpen={onOpen} />

        <MarkerClusterer imageSizes={[50, 50, 50, 50]}>
            {(clusterer) => <div>
                {data.map(it => <MarkerComp onView={onView} onClick={() => onView(it)} locationTracking={it} zoomTo={zoomTo} clusterer={clusterer} />)}
            </div>}
        </MarkerClusterer>


    </GoogleMap>
}