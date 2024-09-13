import { Space } from 'antd';
import TireVehicleAssignListView from '../../tires/TireListView';
import NormDescription from '@/pages/fleet/specification/normconsumtion/NormDescription';
import BatteryDescription from '../../specification/battery/BatteryDescription';

interface Props {
  id: string;
}

export default ({ id }: Props) => {
  return (
    <>
      <Space direction="vertical" size={15}>
        <NormDescription
          vehicleId={id}
        />
        <BatteryDescription
          vehicleId={id}
        />
        <TireVehicleAssignListView vehicleId={id} />
      </Space>

    </>
  );
};
