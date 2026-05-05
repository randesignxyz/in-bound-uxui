import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '@/pages/prod';
import UpcomingInboundListview from './UpcomingInboundListview';

export default () => {
  return (
    <CrudWrapper baseURL={ProdPaths.upcomingInbound}>
      {(view) => {
        const inboundView = view as 'list' | 'create' | 'receive-without-po';
        if (inboundView === 'list' || inboundView === 'create' || inboundView === 'receive-without-po') {
          return <UpcomingInboundListview routeView={inboundView} />;
        }
        throw new Error('Not supported');
      }}
    </CrudWrapper>
  );
};
