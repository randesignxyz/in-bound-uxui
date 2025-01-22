import { Marker, MarkerProps } from "@react-google-maps/api"
import { useEffect, useState } from "react";
import { LocationTracking } from "./data.type";
import Omit from "omit.js";

export default ({ locationTracking, zoomTo, onView, ...props }: Omit<MarkerProps, 'position'> & {
    locationTracking: LocationTracking,
    zoomTo?: LocationTracking;
    onView: (item: LocationTracking) => void
}) => {

    const [animation, setAnimation] = useState<any>(null);
    // const [tooltipOpen, setTooltipOpen] = useState(false);
    const defaultIcon = {
        url: '/icons/location.png',
        scaledSize: new window.google.maps.Size(45, 45), // scaled size
    };

    const hoverIcon = {
        url: '/icons/location.png',
        scaledSize: new window.google.maps.Size(60, 60), // scaled size
    };

    const [currentIcon, setCurrentIcon] = useState(defaultIcon);

    useEffect(() => {
        setAnimation(window.google.maps.Animation.DROP);
        const timer = setTimeout(() => {
            setAnimation(null);
        }, 760); // Adjust this timeout to match the duration of one bounce
        return () => clearTimeout(timer); // Cleanup timeout on component unmount

    }, []);


    useEffect(() => {
        if (locationTracking.deliveryId != zoomTo?.deliveryId) {
            return
        }

        setAnimation(window.google.maps.Animation.BOUNCE);
        const timer = setTimeout(() => {
            setAnimation(null);
        }, 760); // Adjust this timeout to match the duration of one bounce
        return () => clearTimeout(timer); // Cleanup timeout on component unmount
    }, [
        zoomTo
    ])
    const handleMouseOver = () => {
        setCurrentIcon(hoverIcon);
    };

    const handleMouseOut = () => {
        setCurrentIcon(defaultIcon);
    };

    return <Marker{...props}
        position={{
            lat: locationTracking.checkInLat,
            lng: locationTracking.checkInLng
        }}
        animation={animation}
        onClick={() => onView(locationTracking)}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        icon={currentIcon} />
}