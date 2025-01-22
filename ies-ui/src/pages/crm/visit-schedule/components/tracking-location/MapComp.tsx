import { EnvironmentOutlined } from "@ant-design/icons";
import { GoogleMap, GoogleMapProps, Marker, MarkerClusterer, useGoogleMap } from "@react-google-maps/api"
import { Flex } from "antd"
import { Button } from "antd/lib";
import { Moment } from "moment";
import { useEffect, useState } from "react";
import { VisitScheduleItem } from "@/services/crm/data";
import BarComp from "./BarComp";
import MarkerComp from "./MarkerComp";
// import MarkerComp from "./MarkerComp";
// import BarComp from "./BarComp";
const containerStyle = {
    width: '100vw',
    height: '88vh'
};

const center = {
    lat: 11.58181155360925,
    lng: 104.91810050044207
};

export default ({ data, onOpen, reload, onView, zoomTo, ...rest }: GoogleMapProps & {
    zoomTo?: VisitScheduleItem;
    data: VisitScheduleItem[];
    reload: () => void
    onOpen: () => void;
    onView: (item?: VisitScheduleItem) => void;
}) => {
    useEffect(() => { }, [zoomTo])

    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

    useEffect(() => {
        data.map(it => {
            if (mapInstance && it?.visit?.actualLatitude && it?.visit?.actualLongitude) {
                mapInstance.setCenter({
                    lat: Number(it.visit.actualLatitude),
                    lng: Number(it.visit.actualLongitude),
                });
                mapInstance.setZoom(13)
            }
        })
    }, [data, mapInstance]);

    return <GoogleMap mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={(map) => setMapInstance(map)}
        options={{
            styles: [
                {
                    featureType: 'poi.business',
                    stylers: [{ visibility: 'off' }],
                },
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
                {
                    featureType: 'poi.park',
                    stylers: [{ visibility: 'off' }],
                },
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
        <BarComp locationTracking={zoomTo} onOpen={onOpen} reload={reload} />

        <MarkerClusterer imageSizes={[50, 50, 50, 50]}>
            {(clusterer) => <div>
                {data.map(it => <MarkerComp
                    onView={onView} onClick={() => onView(it)}
                    locationTracking={it}
                    zoomTo={zoomTo}
                // clusterer={clusterer} 
                />)}
            </div>}
        </MarkerClusterer>


    </GoogleMap>
}