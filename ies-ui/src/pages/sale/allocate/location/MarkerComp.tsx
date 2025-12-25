import { Marker, MarkerProps } from "@react-google-maps/api";
import { DNList,Location } from "@/pages/delivery/allocate/data";
import { useEffect, useState } from "react";
import Omit from "omit.js";

interface MarkerCompProps extends Omit<MarkerProps, 'position'> {
    locationTracking: DNList;
    zoomTo?: Location;
    isSelected?: boolean;
    onView: (item: DNList) => void;
    onHover?: (item: DNList) => void;
    onHoverOut?: () => void;
}

export default function MarkerComp({
    locationTracking,
    zoomTo,
    onView,
    isSelected,
    onHover,
    onHoverOut,
    ...props
}: MarkerCompProps) {
    const [animation, setAnimation] = useState<any>(null);

    const defaultIcon = { url: '/icons/shop.png', scaledSize: new window.google.maps.Size(45, 45) };
    const hoverIcon = { url: '/icons/shop.png', scaledSize: new window.google.maps.Size(60, 60) };
    const selectedIcon = { url: '/icons/shop-green.png', scaledSize: new window.google.maps.Size(45, 45) };
    const hoverselectedIcon = { url: '/icons/shop-green.png', scaledSize: new window.google.maps.Size(60, 60) };

    useEffect(() => {
        setAnimation(window.google.maps.Animation.DROP);
        const timer = setTimeout(() => setAnimation(null), 760);
        return () => clearTimeout(timer);
    }, []);

    const icon = isSelected ? selectedIcon : defaultIcon;

    return (
        <Marker
            {...props}
            position={{ lat: parseFloat(locationTracking.latitude), lng: parseFloat(locationTracking.longitude) }}
            icon={icon}
            animation={animation}
            onClick={() => onView(locationTracking)}
            onMouseOver={() => onHover && onHover(locationTracking)}
            onMouseOut={() => onHoverOut && onHoverOut()}
        />
    );
}
