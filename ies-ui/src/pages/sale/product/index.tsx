import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import '@/pages/index.less';
import { SalePaths } from '..';
import ProductItemListView from './ProductItemListView';

export default () => {
  //   const access = useAccess();

  return (
    <CrudWrapper baseURL={SalePaths.so}>
      {(view) => {
        return (
          view === 'list' && (
            <ProductItemListView
            //   onDetail={(id) => {
            //     navigate?.goToDetail?.({ id: id });
            //   }}
            />
          )
          //   ||
          //   (view === 'detail' && (
          //     <SoDetailView
          //       id={id as number}
          //       actionHandlers={{
          //         onBack: navigate?.gotToListHandler,
          //       }}
          //     />
          //   )) ||
          //   (view === 'create' && (
          //     <Access accessible={access.canCreateEditSo} fallback={<div>Unauthorized</div>}>
          //       {' '}
          //       <Create />{' '}
          //     </Access>
          //   )) ||
          //   (view === 'edit' && (
          //     <Access accessible={access.canCreateEditSo} fallback={<div>Unauthorized</div>}>
          //       {' '}
          //       <Edit id={id as number} />{' '}
          //     </Access>
          //   ))
        );
      }}
    </CrudWrapper>
  );
};
