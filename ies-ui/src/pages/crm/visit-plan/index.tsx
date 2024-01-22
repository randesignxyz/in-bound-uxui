import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { CrmPaths } from ".."
import VisitPlanListView from "./components/List"
import { PageContainer } from "@ant-design/pro-components"
import { history } from "@umijs/max"

export default () => {
    return (
        <PageContainer title = "Visit Plan" onBack={()=> history.back()}>
            <CrudWrapper  baseURL={CrmPaths.visitPlan}>
                {
                    (view,) => {
                        switch (view) {
                            case 'list': return (
                                <VisitPlanListView />
                            )
                            case 'detail': <div />
                            default: throw Error('Not compatible view')
                        }
                    }
                }

            </CrudWrapper>

        </PageContainer>
    )
}
