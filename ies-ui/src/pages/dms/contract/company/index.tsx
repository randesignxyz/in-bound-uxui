import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { DMSPaths } from "../..";
import CompanyDetail from "./CompanyDetail";

export default () => {
    
    return (
        <CrudWrapper baseURL={DMSPaths.company}>
            {(view, id, navigate) => {
                return (
                    view == 'detail' && (
                        <CompanyDetail 
                        onClose={()=>{}}
                        // comId={parseInt(`${id}`)} 
                        />
                    )
                );
            }}
        </CrudWrapper>
    )
}