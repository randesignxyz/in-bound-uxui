import CrudWrapper from '@/components/DataCrud/CrudWrapper';

import { RetailerPath } from '..';
import IngredientDetailView from './IngredientDetailView';
import IngredientListView from './IngredientListView';

export default () => {
  // const access = useAccess();
  return (
    <CrudWrapper baseURL={RetailerPath.ingredient}>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <IngredientListView
              onAdd={() => navigate?.goToCreate?.()}
              // eslint-disable-next-line @typescript-eslint/no-shadow
              onDetail={(id) => {
                navigate?.goToDetail?.({ id: id });
              }}
              // eslint-disable-next-line @typescript-eslint/no-shadow
              onEdit={(id) => {
                navigate?.gotoEdit?.({ id: id });
              }}
            />
          )) ||
          (view == 'detail' && (
            <IngredientDetailView
              id={id as string}
              // eslint-disable-next-line @typescript-eslint/no-shadow
              onEdit={(id) => {
                navigate?.gotoEdit?.({ id: id });
              }}
              onAdd={() => navigate?.goToCreate?.()}
            />
          ))
        );
      }}
    </CrudWrapper>
  );
};
