import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";
import { simpleRequestActions } from "@/services/model";
import { useModel } from "@umijs/max";
import { FleetPaths } from "..";
import BreadCrumbCom from "../components/BreadCrumbCom";
import { AccidentDTO, SearchAccidentParam } from "./data";
import { AccidentServiceAPI } from "./service";
import { message, Spin, Space } from "antd";


interface Props {
    onDetail?: (id: number) => void;
    onAdd?: () => void;
    onEdit?: (id: number) => void
}

export default ({ onDetail, onAdd, onEdit }: Props) => {
    const requestActions = simpleRequestActions();
    const services = AccidentServiceAPI(requestActions);

    const routes = [
        {
            path: FleetPaths.fleet,
            label: 'Fleet',
        },
        {
            path: '',
            label: 'Accident',
        },
    ];

    const cacheList = useModel('dataList');

    const onRequestHandler = async (params: TableViewSearchParams<SearchAccidentParam>) => {
        try {
          return services.page(params).then((it) => {
            return cacheList.cacheDataList({
              type: 'fleet-accident',
              criteria: params,
              data: it,
            });
          }) as Promise<Paging<AccidentDTO>>;
        } catch (error: any) {
          message.error(error.message);
          return Promise.reject();
        }
      };


    return (
        <>
            <Spin spinning ={requestActions.request?.loading}>
                <BreadCrumbCom separator=">" routes={routes} />

                <TableView<AccidentDTO, { searchValue?: string }>

                    columns={[
                        {
                            render: (_, r) => (
                                <Space direction="horizontal">
                                    {/* <Button
                                        type="link"
                                        icon={<Tooltip title="Edit"><EditOutlined /></Tooltip>}
                                        onClick={() => onEdit?.(r.id)}
                                    />
                                    <SplitData
                                        // uuid={}
                                        trigger={

                                            <Button
                                                type="link"
                                                icon={<Tooltip title="Split Data"><SplitCellsOutlined /></Tooltip>}
                                                onClick={() => { setSplitVisible(true) }}
                                            />
                                        }
                                    /> */}

                                </Space>


                            ),
                            width: 10
                        },
                        {
                            title: 'Plate Number',
                            dataIndex: "plateNumber",
                            render: (_, r) => {
                                return (
                                    <></>
                                    // <Button
                                    //     type="link"
                                    //     icon={<Tooltip title="View Data">{r.plateNumber}</Tooltip>}
                                    //     onClick={() => onDetail?.(r.id)}
                                    // />
                                )
                            }
                        },
                        // { title: 'Models', render: (_, r) => r..name },
                        // { title: 'Brands', render: (_, r) => r.brand.name },
                        // { title: 'Year', dataIndex: 'year' },
                        // { title: 'Created By', dataIndex: 'createdBy' },
                        // { title: 'Created By', dataIndex: 'createdBy', render: (_, r) => formatDate(r.createdDate) },

                    ]}
                    // tableProps={{
                    //     actionRef: actionRef,
                    // }}

                    actionHandlers={{
                        onAdd: () => onAdd?.(),
                        onRequest: (criteria, pagination, sort) =>
                            onRequestHandler({
                                criteria,
                                pagination,
                                // sort
                            }),
                    }}

                    extraFilter={
                        <Space size="large">
                            {/* <Radio.Group
                            >
                                <Radio.Button value="ALL">All</Radio.Button>
                            </Radio.Group> */}
                        </Space>
                    }

                />
            </Spin>
        </>
    )
} 