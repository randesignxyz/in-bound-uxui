import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '@/pages/prod';
import ListView from './ProductionTransferReqListview';
import Detail from './Detail';
export default () => {
  return (
    <>
      <CrudWrapper baseURL={ProdPaths.inventoryInboundRequest}>
      {(view,id) => {
        switch (view){
          case 'list' :return <ListView/>
          case 'detail' : return <Detail id={id as string || ''}/>
          default: throw new Error('Not supported')
        }
      }}
    </CrudWrapper>
    </>
  );
};
