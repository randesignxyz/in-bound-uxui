import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { FleetPaths } from '..';
import FuelListview from './FuelListview';
export default () => {
  return (
    <CrudWrapper baseURL={FleetPaths.inspection}>
      {(view, id, navigate) => {
        return (
          view == 'list' && (
            <FuelListview
              onAdd={() => navigate?.goToCreate?.()}
              onDetail={(id) => {
                navigate?.goToDetail?.({ id: id });
              }}
              onEdit={(id) => {
                navigate?.gotoEdit?.({ id: id });
              }}
            />
          )
        );
      }}
    </CrudWrapper>
  );
};
