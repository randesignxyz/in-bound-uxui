import ViewFormWrapper from '@/pages/process-flow/components/forms/ViewFormWrapper';
import { DataViewProps } from '@/pages/process-flow/data';
import { Spin } from 'antd';
import DataView from './data-view';

export default (props: DataViewProps) => {
   return <ViewFormWrapper<{ id: number }>
      workflowProp={props}
      hideExport
      actionHandlers={{
         onRefresh: () => { }
      }}
   >
      {(data) => {
         if (!data?.processInstance?.procInstId) return <Spin spinning={true} />

         return <DataView processInstaceId={data?.processInstance?.procInstId} />
      }}
   </ViewFormWrapper>
}