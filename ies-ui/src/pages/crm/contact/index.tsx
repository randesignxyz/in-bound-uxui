import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { CrmPaths } from ".."
import ContactDetailView from "./components/Detail"
import ContactListView from "./components/List"
import { Model } from "./model"

export default () => {

    const { state, actions } = Model()
    return <CrudWrapper baseURL={CrmPaths.contact} >
        {(view, id, navigate) => {
            switch (view) {
                case 'list':
                    return ( 
                        <ContactListView
                            loading = {state.loading}
                            data={{
                                itemList: state.itemList,
                                lookupDataList: state.initData?.lookupdataList
                            }}
                            actionHandlers={{
                                onSave: actions.save,
                                onSearch: data => actions.list(data),
                                onDetail: data => navigate?.goToDetail?.(data),
                                onInit: actions.initData

                            }}
                            searchable />
                    )
                case 'detail':
                    return (
                        <ContactDetailView
                            data={{
                                detail: state.detail,
                                lookupDataList: state.initData?.lookupdataList
                            }}
                            actionHandlers={{
                                onFetch: () => actions.fetch(id as number || 0),
                                onLoadData: () => id && actions.laodDetail(id as number),
                                onSave: actions.save,
                                onInit: actions.initData
                            }} />
                    )
                default:
                    throw Error('Not compatible view')
            }
        }}

    </CrudWrapper>
}