import { GoogleMap, useLoadScript, OverlayView } from "@react-google-maps/api";
import { DNList, Location } from "../data";
import MarkerComp from "./MarkerComp";
import { useState } from "react";

const containerStyle = { width: "100vw", height: "88vh" };
const center = { lat: 11.58181155360925, lng: 104.91810050044207 };

interface PagedResult<T> {
  items: T[];
  total: number;
  pageSize: number;
}

interface MapCompProps {
  data: PagedResult<DNList>;
  selected?: DNList[];
  zoomTo?: Location;
  onView: (item: DNList) => void;
}

export default function MapComp({ data, selected, onView }: MapCompProps) {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: "AIzaSyA0Ifgai8ryDULDIqNOZmX8L7XZlzu4_D8" });
  const [hoveredMarker, setHoveredMarker] = useState<DNList | null>(null);

  if (!isLoaded) return null;
console.log('data',data)
  const combinedData = (data?.items ?? [])
  // deduplicate by lat/lng
  .filter(
    (dn, index, self) =>
      index ===
      self.findIndex(
        d => d.latitude === dn.latitude && d.longitude === dn.longitude
      )
  )
  .map(d => ({
    ...d,
    // selected if **any DN with same lat/lng** is in `selected`
    isSelected: selected?.some(
      s => s.latitude === d.latitude && s.longitude === d.longitude
    ),
    // optionally, store all DNs at this location
    itemsAtLocation: data.items.filter(
      x => x.latitude === d.latitude && x.longitude === d.longitude
    ),
  }));

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >
      {combinedData.map((item) => (
        <MarkerComp
          key={`${item.latitude}-${item.longitude}`}
          locationTracking={item}
          isSelected={item.isSelected}
          onView={onView}
          onHover={setHoveredMarker}
          onHoverOut={() => setHoveredMarker(null)}
        />
      ))}

      {/* Hover Card using OverlayView */}
      {hoveredMarker && (
        <OverlayView
          position={{
            lat: parseFloat(hoveredMarker.latitude),
            lng: parseFloat(hoveredMarker.longitude),
          }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          getPixelPositionOffset={(width, height) => ({
            x: -width / 2,
            y: 45, // show 45px below the marker
          })}
        >
          <div
            style={{
              background: "#fff",
              padding: 8,
              borderRadius: 4,
              boxShadow: "0 0 8px rgba(0,0,0,0.3)",
              pointerEvents: "none",
              minWidth: 200,
            }}
          >
            <strong>{hoveredMarker.shippingAddress}</strong>
            <p>Delivery Date: {hoveredMarker.deliveryDate?.slice(0, 10)}</p>
            {hoveredMarker.mergeItems?.map((mi) => (
              <div
                key={mi.id}
                style={{
                  fontSize: 12,
                  borderTop: "1px solid #eee",
                  paddingTop: 2,
                }}
              >
                {mi.itemName} - Qty: {mi.qty}
              </div>
            ))}
          </div>
        </OverlayView>
      )}
    </GoogleMap>
  );
}
