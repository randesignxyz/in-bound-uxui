import { Tabs, TabsProps } from "antd"
import { DMSPaths } from "..";
import { history, useParams } from "@umijs/max";
import CategoryListView from "./components/category/CategoryListView";
import DepartmentListView from "./components/department/DepartmentListView";
import LibraryViewList from "./components/library/LibraryViewList";
import UserGroupList from "./teams/TeamsViewList";
import DocumentTypeView from "./components/documentType/DocumentTypeView";
import { PageContainer } from "@ant-design/pro-components";
import OtherView from "./other/OtherView";

interface Props {
}

export default ({ }: Props) => {
  const params = useParams();
  const view = params['view'];
  const items: TabsProps['items'] = [
    {
      key: "department",
      label: "Department",
      children: <DepartmentListView actionKey={view} />
    },
    {
      key: "usergroup",
      label: "User Group",
      children: <UserGroupList actionKey={view} />
    },
    {
      key: "category",
      label: "Categories",
      children: <CategoryListView actionKey={view} />
    },
    {
      key: "document-type",
      label: "Document Type",
      children: <DocumentTypeView actionKey={view} />
    },
    {
      key: "library",
      label: "Libraries",
      children: <LibraryViewList actionKey={view} />
    },
    {
      key: "other",
      label: "Others",
      children: <OtherView actionKey={view} />
    }
  ];

  return (
    <>

      <PageContainer
        onBack={() => history.push(`${DMSPaths.dms}`)}
        title="Setting"
      >
        <Tabs
          onChange={(e) => {
            history.push(`${DMSPaths.setting}/${e}`)
          }}
          items={items}
          key={"tab"}
          itemRef="tab"
          activeKey={view}
        />
      </PageContainer>
    </>
  )
}