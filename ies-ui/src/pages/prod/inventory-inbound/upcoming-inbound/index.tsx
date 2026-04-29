import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '@/pages/prod';
import UpcomingInboundListview from './UpcomingInboundListview';

export default () => {
  return (
    <CrudWrapper baseURL={ProdPaths.upcomingInbound}>
      {(view) => {
        if (view === 'list') {
          return <UpcomingInboundListview />;
        }
        throw new Error('Not supported');
      }}
    </CrudWrapper>
  );
};
