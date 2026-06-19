import React from 'react';
import CrudWrapper from '@/components/DataCrud/CrudWrapper';

import { ProdPaths } from '@/pages/prod';
import ProcurementWorkspace from './workspaces/ProcurementWorkspace';
import { InboundProvider } from './state';

export default () => {
  return (
    <InboundProvider>
      <CrudWrapper baseURL={`${ProdPaths.upcomingInbound}/procurement`}>
        {(view) => {
          const procurementView = view === 'list' ? 'list' : 'list';
          if (procurementView === 'list') {
            return <ProcurementWorkspace />;
          }
          return <ProcurementWorkspace />;
        }}
      </CrudWrapper>
    </InboundProvider>
  );
}

