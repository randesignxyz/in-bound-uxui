import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { SalePaths } from '..';
import StockControlDetail from './Detail';
import StockListView from './List';

export default () => {
  return (
    <CrudWrapper baseURL={SalePaths.stock} disablePageContainer>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <StockListView
              actionHandlers={{
                onAdd: navigate?.goToCreate,
                onDetail: navigate?.goToDetail,
              }}
            />
          )) ||
          (view === 'detail' && (
            <StockControlDetail
              id={id as number}
              actionHandlers={{
                onBack: navigate?.gotToListHandler,
              }}
            />
          ))
        );

      }}
    </CrudWrapper>
  );
};
