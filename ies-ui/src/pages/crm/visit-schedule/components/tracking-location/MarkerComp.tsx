import { Marker, MarkerProps } from "@react-google-maps/api"
import { useEffect, useState } from "react";
import Omit from "omit.js";
import { VisitScheduleItem } from "@/services/crm/data";

export default ({ locationTracking, zoomTo, onView, ...props }: Omit<MarkerProps, 'position'> & {
    locationTracking: VisitScheduleItem,
    zoomTo?: VisitScheduleItem;
    onView: (item: VisitScheduleItem) => void
}) => {
    const [animation, setAnimation] = useState<any>(null);
    // const [tooltipOpen, setTooltipOpen] = useState(false);
    const defaultIcon = {
        url: locationTracking.status === 'PENDING'
            ? '/icons/orange-marker.png'
            : locationTracking.status === 'COMPLETED'
                ? '/icons/green-marker.png'
                : '',
        scaledSize: new window.google.maps.Size(45, 45), // scaled size
    };

    const hoverIcon = {
        url: locationTracking.status === 'PENDING'
            ? '/icons/orange-marker.png'
            : locationTracking.status === 'COMPLETED'
                ? '/icons/green-marker.png'
                : '',
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
        setCurrentIcon(defaultIcon);
    }, [locationTracking.status]);

    useEffect(() => {
        if (locationTracking.id != zoomTo?.id) {
            return
        }

        setAnimation(window.google.maps.Animation.BOUNCE);
        const timer = setTimeout(() => {
            setAnimation(null);
        }, 760); // Adjust this timeout to match the duration of one bounce
        return () => clearTimeout(timer); // Cleanup timeout on component unmount
    }, [zoomTo])

    const handleMouseOver = () => {
        setCurrentIcon(hoverIcon);
    };

    const handleMouseOut = () => {
        setCurrentIcon(defaultIcon);
    };

    return <Marker{...props}
        position={{
            lat: Number(locationTracking?.visit?.actualLatitude),
            lng: Number(locationTracking?.visit?.actualLongitude)
        }}
        animation={animation}
        onClick={() => onView(locationTracking)}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        icon={currentIcon} />
}