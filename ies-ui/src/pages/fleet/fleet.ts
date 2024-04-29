import { history } from "@umijs/max";



export const ExternalLayout ={
    isExternal:(pathExternal:string) => history.location.pathname.includes(`/external/${pathExternal}`),
    handleBackHandler : ()=>history.back()
}