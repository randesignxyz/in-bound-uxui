import PageWrapper from "@/components/PageWrapper"
import { DocumentationAdvanceSearch, DocumentationDTO } from "./data";
import { DocumentServiceAPI } from "./service";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { simpleRequestActions } from "@/services/model";
import { history, useQuery } from "@umijs/max";
import { useState } from "react";
import { formatDate } from "@/pages/utils";
import { ExportOutlined, ShareAltOutlined, EllipsisOutlined } from "@ant-design/icons";
import { Space, Button, Badge, Dropdown } from "antd";
import { DMSPaths } from "..";
import { expriationStatus, StatusColor } from "../core";

interface Props {

}

const DocumentMainPage: React.FC<Props> = () => {
    const requestActions = simpleRequestActions();
    const services = DocumentServiceAPI(requestActions);
    const [filter, setFilter] = useState<TableViewSearchParams<DocumentationAdvanceSearch>>({
        criteria: { advanceSearch: { status: 'ALL' } }
    });
    const { data, isFetching, refetch } = useQuery(['fetch-customer-list', filter], () => services.page(filter), {
        refetchOnWindowFocus: false
    });
    return (<>

        <PageWrapper<DocumentationDTO, DocumentationAdvanceSearch, {}>
            listView={{
                type: "Table",
                title: "Documents",
                onFilter:(params, page, sort) =>{
                    setFilter(f=>({
                        ...f,
                        criteria:{
                            searchValue:params?.searchValue,
                            advanceSearch:{
                                library:0
                            },
                            
                        },
                         pagination:page
                    }))
                },
                props: {
                    dataSource: data?.items,
                    columns: [
                        {
                            title: "#",
                            sorter: "code",
                            width: 180,
                            render: (_, r) => (<Space align="center" >
                                <Button size="small" type="link" icon={<ExportOutlined />} onClick={() => {
                                    window.open(`/external/dms/document/detail/${r.id}`)?.focus();
                                }} />
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => history.push(`${DMSPaths.document}/detail/${r.id}`)}
                                >
                                    {r.documentation.docNumber ? r.documentation.docNumber : "N/A"}
                                </Button>
                            </Space>),
                        },
                        {
                            title: "Name",
                            sorter: "name",
                            width: 400,
                            render: (_, r) => r.documentation?.docName,
                        },
                        {
                            title: "Expiry Date",
                            sorter: "expiryDate",
                            fixed: true,
                            render: (_, r) => <span style={{ color: expriationStatus(r.term?.expiryDate) > 0 ? "red" : "" }}>{formatDate(r.term.expiryDate)}</span>
                        },
                        {
                            title: "Created",
                            sorter: "createdDate",
                            dataIndex: "createdDate",
                            valueType: "date",
                            fixed: true,
                        },
                        {
                            title: "Updated",
                            sorter: "lastModifiedDate",
                            dataIndex: "lastModifiedDate",
                            valueType: "date",
                            fixed: true,
                        },
                        {
                            title: "Type",
                            render: (_, r) => r.division == "CONTRACT" ? "contract" : "document"
                        },
                        {
                            title: "Status",
                            sorter: "status",
                            fixed: true,
                            render: (_, r) => <Badge text={r.status} status={StatusColor.getColorStatus(r.status)} />
                        },
                        {
                            title: "Shared",
                            align: "center",
                            render: (_, r) => {
                                if (r.share > 0) {
                                    // return <Button size="small" icon={<ShareAltOutlined />} type="link" onClick={() => setQuickViewDrawerState({ visible: { name: "DRAWER", docId: r.id } })} />
                                }
                                else {
                                    return ""
                                }
                            }
                        },
                        {
                            title: "Action",
                            render: (_, r) => (<Dropdown
                                menu={{
                                    // items: actionItem(r),
                                    style: {
                                        width: 200
                                    }
                                }}
                            >
                                <a><EllipsisOutlined /></a>
                            </Dropdown>)
                        }
                    ]
                }
            }}
        />
    </>)
}


export default DocumentMainPage