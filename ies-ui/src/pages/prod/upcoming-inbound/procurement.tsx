import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '@/pages/prod';
import InboundProcurementList from './inboundprocurementlist';

export default () => {
  return (
    <CrudWrapper baseURL={`${ProdPaths.upcomingInbound}/procurement`}>
      {(view) => {
        const procurementView = view === 'list' ? 'list' : 'list';
        if (procurementView === 'list') {
          return <InboundProcurementList />;
        }
        return <InboundProcurementList />;
      }}
    </CrudWrapper>
  );
}
