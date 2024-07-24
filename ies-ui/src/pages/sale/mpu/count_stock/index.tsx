import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { MPUPath } from '..';
import MpuCountStockListView from './MpuCountStockListView';
import CountStockMainPage from './MainPage';
// import MpuStockListView from './MpuCountStockListView';

export default () => {
  // const access = useAccess();
  return (
    <CountStockMainPage/>
    // <CrudWrapper baseURL={MPUPath.rsmRequest}>
    //   {(view, id, navigate) => {
    //     return (
    //       view === 'list' && <MpuCountStockListView /> //||
    //       //     <CustomerPricingList
    //       //       onAdd={() => navigate?.goToCreate?.()}
    //       //       // eslint-disable-next-line @typescript-eslint/no-shadow
    //       //       onDetail={(id) => {
    //       //         navigate?.goToDetail?.({ id: id });
    //       //       }}
    //       //       // eslint-disable-next-line @typescript-eslint/no-shadow
    //       //       onEdit={(id) => {
    //       //         navigate?.gotoEdit?.({ id: id });
    //       //       }}
    //       //     />
    //       //   )
    //       //     ||
    //       //   (view === 'detail' && (
    //       //     <CustomerDetailView
    //       //       id={id as string}
    //       //       // eslint-disable-next-line @typescript-eslint/no-shadow
    //       //       onEdit={(id) => {
    //       //         navigate?.gotoEdit?.({ id: id });
    //       //       }}
    //       //     />
    //       //   )) ||
    //       //   (view === 'edit' && <CustomerEntryFormView type="edit" id={id as string} />) ||
    //       //   (view === 'create' && <MpuRequestEntryForm type="new" />)
    //     );
    //     //  ||
    //     //    view === 'create' && <Access accessible = {access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Create/> </Access> ||
    //     //    view === 'edit' && <Access accessible = {access.canCreateEditSo} fallback={<div>Unauthorized</div>}> <Edit id = {id as number}/> </Access>
    //   }}
    // </CrudWrapper>
  );
};
