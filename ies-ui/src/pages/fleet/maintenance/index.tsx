import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { FleetPaths } from '..';
import MaintenanceDetailView from './DetailView';
import ListView from './ListView';
export default () => {
  return (
    <CrudWrapper baseURL={FleetPaths.mantenence}>
      {(view, id, navigate) => {
        return (
          (view == 'list' && (
            <ListView
              onAdd={() => navigate?.goToCreate?.()}
              onDetail={(id) => {
                navigate?.goToDetail?.({ id: id });
              }}
              onEdit={(id) => {
                navigate?.gotoEdit?.({ id: id });
              }}
            />
          )) ||
          (view == 'detail' && (
            <MaintenanceDetailView
              id={id as string}
              // eslint-disable-next-line @typescript-eslint/no-shadow
              onEdit={(id) => {
                navigate?.gotoEdit?.({ id: id });
              }}
              onAdd={() => navigate?.goToCreate?.()}
            />
          ))
          // ||
          // (view == "create" && (
          //     <EntityForm/>
          // ))
        );
      }}
    </CrudWrapper>
  );
};
