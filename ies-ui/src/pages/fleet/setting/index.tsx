
import AccessoriesListView from '../accessory/AccessoriesListView';
import ListView from '../driver/ListView';
import VendorListView from '../vendor/VendorListView';
import { PageContainer } from '@ant-design/pro-components';
import TaskListView from '../serviceTask/TaskListView';
import { history, useParams } from '@umijs/max';
export default () => {
    const param = useParams();
    const view = param["view"];
    return (
        <>
            <PageContainer
                breadcrumbRender={false}
                onBack={() => history.back()}
                title={"Setting"}
                fixedHeader
                tabProps={{
                    activeKey: view,
                    size:"small",
                    onTabClick: (e) => {
                        history.push(`/fleet/setting/${e}`)
                    }
                }}
                tabList={[
                    {
                        key: "driver",
                        tab: "Driver (Operator) ",
                    },
                    {
                        key: "servicetask",
                        tab: "Service Task",
                    },
                    {
                        key: "vendors",
                        tab: "Vendors",
                    },
                    {
                        key: "accessories",
                        tab: "Accessories",
                    },
                ]}
            >
                {
                    view =="driver"      && (<ListView />)||
                    view =="servicetask" && (<TaskListView />)||
                    view =="vendors"     && (<VendorListView />)||
                    view =="accessories" && (<AccessoriesListView />)
                }
            </PageContainer>
        </>
    );
};
