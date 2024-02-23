import { useParams } from "@umijs/max";
import SharedDocumentDetail from "./SharedDocumentDetail";

export default ()=>{
    const params= useParams();
    const id= parseInt(params["id"]||"");
    const view = params["view"];
    
    return (
        <>
            {view=="detail" && (<SharedDocumentDetail id={id}  />)}
        </>
    )
}