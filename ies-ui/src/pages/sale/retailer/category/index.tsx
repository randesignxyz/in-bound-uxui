import CrudWrapper from '@/components/DataCrud/CrudWrapper';

import { RetailerPath } from '..';
import CategoryDetailView from './CategoryDetailView';
import CategoryListView from './CategoryListView';

export default () => {
  // const access = useAccess();
  return (
    <CrudWrapper baseURL={RetailerPath.category}>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <CategoryListView
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
          (view === 'detail' && (
            <CategoryDetailView
              id={id as string}
              // eslint-disable-next-line @typescript-eslint/no-shadow
              // onEdit={(id) => {
              //   navigate?.gotoEdit?.({ id: id });
              // }}
              // onAdd={() => navigate?.goToCreate?.()}
            />
          ))
        );
      }}
    </CrudWrapper>
  );
};
