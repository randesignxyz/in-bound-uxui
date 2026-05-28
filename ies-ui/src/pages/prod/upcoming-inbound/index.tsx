import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '@/pages/prod';
import UpcomingInboundListview from './UpcomingInboundListview';

export default () => {
  return (
    <CrudWrapper baseURL={ProdPaths.upcomingInbound}>
      {(view) => {
        const supportedViews = new Set(['list', 'create', 'receive-without-po']);
        const inboundView =
          typeof view === 'string' && supportedViews.has(view)
            ? (view as 'list' | 'create' | 'receive-without-po')
            : 'list';
        if (inboundView === 'list' || inboundView === 'create' || inboundView === 'receive-without-po') {
          return <UpcomingInboundListview routeView={inboundView} />;
        }
        return <UpcomingInboundListview routeView="list" />;
      }}
    </CrudWrapper>
  );
};
