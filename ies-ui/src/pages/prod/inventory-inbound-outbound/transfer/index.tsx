import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { ProdPaths } from '@/pages/prod';
import ListView from './Listview';
import ReceiveForm from './ReceiveForm';
export default () => {
  return (
    // <CrudWrapper baseURL={ProdPaths.inventoryOutboundTransfer}>
    //   {(view) => {
    //     return view === 'list' && <ListView />;
    //   }}
    // </CrudWrapper>
    <CrudWrapper baseURL={ProdPaths.inventoryOutboundTransfer}>
    {
      (view,id) => {
        switch (view){
          case 'list' :return <ListView/>
          case 'create' : return <ReceiveForm/>
          default: throw new Error('Not supported')
        }
      // return view === 'list' && <ListView />;
    }}
  </CrudWrapper>
  );
};
