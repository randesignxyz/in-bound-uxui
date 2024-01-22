import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { SalePaths } from '..';
import DailyReportList from './DailyReportList';

export default () => {
  // const access = useAccess();
  return (
    <CrudWrapper baseURL={SalePaths.daily}>
      {(view) => {
        return (
          (view === 'list' && (
            <DailyReportList />
            // <LeadListView
            //   onDetail={(id) => {
            //     navigate?.goToDetail?.({ id: id!! });
            //   }}
            // />
          )) ||
          (view === 'detail' && (
            <div>Detail</div>
            // <LeadDetailView
            //   id={id as number}
            //   onEdit={(id) => {
            //     navigate?.gotoEdit?.({ id: id });
            //   }}
            //   // onAdd={() => navigate?.goToCreate?.()}
            // />
          ))
        );
      }}
    </CrudWrapper>
  );
};
