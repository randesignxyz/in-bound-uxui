import ViewFormWrapper from "@/pages/process-flow/components/forms/ViewFormWrapper";
import { DataViewProps } from "@/pages/process-flow/data";

export default (props: DataViewProps) => {
    return <ViewFormWrapper<{ id: number }>
        workflowProp={props}>
        {(data, _) => {
            return <div>Request list</div>
        }}
    </ViewFormWrapper>

}