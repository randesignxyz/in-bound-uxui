import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { Access, useAccess } from '@umijs/max';
import { SalePaths } from '..';
import VisitDetailView from './VisitDetailView';
import VisitListView from './VisitListView';
// import { RetailerPath } from '..';
// import OrderDetailView from './components/OrderDetailView';
// import OrderListView from './components/OrderListView';

export default () => {
  const access = useAccess();
  return (
    <CrudWrapper baseURL={SalePaths.visit}>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <Access accessible={access.canAccessSaleVisit}>
              <VisitListView
                onDetail={(id) => {
                  navigate?.goToDetail?.({ id: id });
                }}
              />
            </Access>
          )) ||
          (view === 'detail' && (
            <Access accessible={access.canAccessSaleVisit}>
              <VisitDetailView id={id as number} />
            </Access>
          ))
          //   ||(view === 'created' && <Access></></Access>)
        );
      }}
    </CrudWrapper>
  );
};
