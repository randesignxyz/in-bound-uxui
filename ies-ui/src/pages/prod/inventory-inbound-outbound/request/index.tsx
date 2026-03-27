// import CrudWrapper from '@/components/DataCrud/CrudWrapper';
// import { ProdPaths } from '@/pages/prod';
// import ListView from './Listview';
// export default () => {
//   return (
//     <CrudWrapper baseURL={ProdPaths.inventoryInboundRequest}>
//       {(view) => {
//         return view === 'list' && <ListView />;
//       }}
//     </CrudWrapper>
//   );
// };

import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '@/pages/prod';
import ListView from './Listview';
import Detail from './warehouse-transfer-request/Detail';
import PDRDetail from './production-transfer-request/Detail'
export default () => {
  return (
    <CrudWrapper baseURL={ProdPaths.inventoryInboundRequest}>
      {
        (view,id) => {
          switch (view){
            case 'list' :return <ListView/>
            case 'detail' : return <Detail id={id as string || ''}/>
            case 'view' : return <PDRDetail id={id as string || ''}/>
            default: throw new Error('Not supported')
          }
        // return view === 'list' && <ListView />;
      }}
    </CrudWrapper>
  );
};
