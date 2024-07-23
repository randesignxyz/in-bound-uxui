import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { MPUPath } from '..';
import MpuRequestEntryForm from './MpuRequestEntryForm';
import MpuRequestListView from './MpuRequestListView';
import MpuRequestDetail from './MpuRequestDetail';
import MpuRequestMainPage from './MpuMainPage';

export default () => {
  return (
    <CrudWrapper baseURL={MPUPath.rsmRequest} disablePageContainer>
      {(view, id, navigate) => {
        return (
          // (view === 'list' && <MpuRequestListView
          //   onAdd={() => navigate?.goToCreate?.()}
          //   onDetail={(id) => {
          //     navigate?.goToDetail?.({ id: id });
          //   }}
          //   onEdit={(id) => {
          //     navigate?.gotoEdit?.({ id: id });
          //   }}
          // />) ||
          (view ==="list" && <MpuRequestMainPage/>)||

          (view === 'create' && <MpuRequestEntryForm type="new" />) ||
          (view === "detail" && <MpuRequestDetail
            id={id as number}
            onEdit={(id: number) => {
              navigate?.gotoEdit?.({ id: id });
            }}
          />) ||
          (view === 'edit' && <MpuRequestEntryForm type="new" id={id as number} />)
        );
      }}
    </CrudWrapper>
  );
};
