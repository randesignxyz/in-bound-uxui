import FormModalComp, { FormModalProps } from '@/components/FormModal';

import React from 'react';
import OrderGoogleMap from './OrderGoogleMap';

interface Props extends FormModalProps {
  centerPoint: {
    id: string;
    lat: number;
    lng: number;
    name: string;
    internalName: string;
    phone: string;
  };
  onSubmit: () => void;
}

const GoogleMapModal: React.FC<Props> = ({ ...props }) => {
  return (
    <FormModalComp {...props} okText="OK" onSubmit={props.onSubmit}>
      <OrderGoogleMap
        googleMapApiKey="AIzaSyACftO4Dtfn7BQETFuT4YQZ_wOrO3hgszc"
        zoomNumber={12}
        center={props.centerPoint}
        positions={[]}
      />
    </FormModalComp>
  );
};

export default GoogleMapModal;
