import CrudWrapper from "@/components/DataCrud/CrudWrapper";
import { ProPaths } from "..";
import ListView from "./ListView";
import DataEntryView from "./DataEntryView";
import DataDetailView from "./DataDetailView";

export default () => {

    return <CrudWrapper baseURL={ProPaths.quotation} >
        {(view, id, navigate) => {
            switch (view) {
                case 'list':
                    return <ListView onAdd={id => navigate?.goToCreate?.({ id })} onEdit={id => navigate?.gotoEdit?.({ id })} />
                case 'create':
                    return <DataEntryView onBack={() => navigate?.gotToListHandler?.()} type="CREATE" id={id as number} />
                case 'edit':
                    return <DataEntryView onBack={() => navigate?.gotToListHandler?.()} type='EDIT' id={id as number} />
                case 'detail':
                    return <DataDetailView onAdd={id => navigate?.goToCreate?.({ id })} onEdit={id => navigate?.gotoEdit?.({ id })} id={id as number} onBack={() => navigate?.gotToListHandler?.()} />
                default:
                    throw Error('Not supported')
            }
        }}


    </CrudWrapper>
}