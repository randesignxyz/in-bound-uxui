import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { Paging } from "@/services/API"
import { simpleRequestActions } from "@/services/model"
import type { ActionType } from "@ant-design/pro-table"
import { useModel } from "@umijs/max"
import { Badge, Button, Dropdown, Modal, message } from "antd"
import { useRef, useState } from "react"
import { MeterHistoryDTO, MeterSearchParam } from "../data"
import { VehicleServiceAPI } from "../service"
import { BlockOutlined, ClockCircleOutlined, DeleteOutlined } from "@ant-design/icons"
import Tooltip from "antd/lib/tooltip"
import { Radio } from "antd/lib"
import Omit from "omit.js"


interface Props {
  id: string;
  onAdd?: () => void;
  onEdit?: (id: string) => void;
}

export default ({ id }: Props) => {
  const requestActions = simpleRequestActions();
  const services = VehicleServiceAPI(requestActions);
  const [advanceSearchParams, setAdvanceSearchParams] = useState<MeterSearchParam>({
    status: 'ALL',
  });
  const actionRef = useRef<ActionType>()
  const cacheList = useModel('dataList');

  const onRequestHandler = async (params: TableViewSearchParams<MeterSearchParam>) => {


    try {
      return services.pageMeterHistory(
        { criteria: { 
       
          sort: { ...params.criteria?.sort },
          searchValue:id,
          advanceSearch:{
            status:params.criteria?.advanceSearch?.status
          }
        }, 
        pagination: params.pagination }
        ).then((it) => {
        return cacheList.cacheDataList({
          type: 'fleet-meter-history',
          criteria: params,
          data: it,

        });
      }) as Promise<Paging<MeterHistoryDTO>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };




  return (
    <>
      <TableView<MeterHistoryDTO, { searchValue?: string }>
        // disableSearch
        hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
        displayOnly
        extraFilter={<Radio.Group
          defaultValue={advanceSearchParams.status}
          onChange={(e) => {
            setAdvanceSearchParams((v) => ({ 
              ...v, 
              status: e.target.value 
            }))
            actionRef.current?.reloadAndRest?.();
          }
          }
          optionType="button"
          options={[
            {
              label: "ALL",
              value: "ALL"
            },
            {
              label: "Fuel",
              value: "fuel"
            },
            {
              label: "Maintenance",
              value: "maintenance"
            },
            {
              label: "Inspection",
              value: "inspection"
            },
          ]}
        />}
        columns={[
          {
            key: "createdate",
            title: "Recorded Date",
            dataIndex: "createdDate",
            valueType: "date",
            sorter: "createdDate"
          },
          {
            key: "odometer",
            title: "Odometer",
            dataIndex: "meterType",
            sorter: "odometer",
            render: (_, r) => (
              <>
                <span style={{ color: r.void ? "red" : "" }} >{r.meterValue.toFixed(2)} km </span>
                {r.void && <Tooltip
                  title={`This meter entry is marked as void because it was invalid or out of sequence. Voided meter entries are saved, but are ignored by ${r.updatedBy}`} >
                  <ClockCircleOutlined style={{ color: r.void ? "red" : "" }} />
                </Tooltip>}
              </>

            )
          },

          {
            key: "source",
            title: "Source",
            dataIndex: "source",
            sorter: "source"
          },
          {
            key: "status",
            title: "Status",
            dataIndex: "void",
            render: (_, r) => <Badge color={r.void ? "red" : "blue"} text={r.void ? "void" : "used"} />,
            sorter: "void"
          },
          {
            key: "reson",
            title: "Reason",
            dataIndex: "voidStatus",

          },
          {
            width: 100,
            render: (_, r) => (<>
              <Tooltip title={r.void ? "make unvoid" : "make void"}><Button type="link" icon={<BlockOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: `${r.void ? "make unvoid" : "make void"}  meter record`,
                    content: "are you sure?",
                    onOk: async () => {
                      await services.updateMeterHistory({
                        ...r,
                        void: !r.void
                      });
                      actionRef.current?.reloadAndRest?.();
                      message.success("success!");
                    }
                  })
                }}
              /></Tooltip>
              {/* <Tooltip title="Delete"><Button style={{ color: "red" }} type="link" icon={<DeleteOutlined />} /></Tooltip> */}
            </>)
          }

        ]}

        tableProps={{
          actionRef: actionRef,
        }}
        actionHandlers={{
          // onAdd: () => onAddHandler(),
          onRequest: (criteria, pagination, sort) =>
            onRequestHandler({
              criteria: {
                ...criteria,
                advanceSearch: advanceSearchParams,
                sort,
              },
              pagination,
            }),
          onFirstLoad: () =>
            cacheList.fetchDataList('fleet-maintenance-plan').then((v: any) => {
              if (v) {
                setAdvanceSearchParams({
                  ...v.creteria?.criteria,
                  status: v.creteria?.criteria?.advanceSearch?.status ?? 'ALL',
                });
                return v.dataList;
              } else {
                return onRequestHandler({
                  criteria: {
                    advanceSearch: advanceSearchParams,
                  },
                });
              }
            }) as Promise<Paging<MeterHistoryDTO>>,
        }}



      />

    </>
  )
}