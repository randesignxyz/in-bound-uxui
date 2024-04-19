import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { Access, useAccess } from '@umijs/max';
import { SalePaths } from '..';
import PricingListView from './PricingListView';

// import { RetailerPath } from '..';
// import OrderDetailView from './components/OrderDetailView';
// import OrderListView from './components/OrderListView';

export default () => {
  const access = useAccess();
  return (
    <CrudWrapper baseURL={SalePaths.visit}>
      {(view, id, navigate) => {
        return (
          view === 'list' && (
            <Access accessible={access.canAccessAllMenuDSD}>
              <PricingListView onAdd={() => navigate?.goToCreate?.()} />
            </Access>
          )
          //   ||
          //   (view === 'detail' && (
          //     <Access accessible={access.canAccessAllMenuDSD}>
          //       <VisitDetailView id={id as number} />
          //     </Access>
          //   ))
          //   ||(view === 'created' && <Access></></Access>)
        );
      }}
    </CrudWrapper>
  );
};
