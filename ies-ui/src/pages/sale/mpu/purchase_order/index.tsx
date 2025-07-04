import POMainPage from './POMainPage';

export default () => {
  return (
    <POMainPage />
    // <CrudWrapper baseURL={MPUPath.mpuPurchaseOrder} disablePageContainer>
    //   {(view, id, navigate) => {
    //     return (
    //       view === 'list' && <POMainPage />
    //       // view === 'list' && <MpuPurchaseOrderListView
    //       //   onDetail={(id) => {
    //       //     navigate?.goToDetail?.({ id: id });
    //       //   }}
    //       // /> ||
    //       // view == "detail" && <MpuPurchaseOrderDetail id={id as number} />
    //     );
    //   }}
    // </CrudWrapper>
  );
};
