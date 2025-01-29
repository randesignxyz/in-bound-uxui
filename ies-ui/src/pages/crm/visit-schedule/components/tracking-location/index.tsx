import { useLoadScript, } from "@react-google-maps/api"
import { Button, Drawer, Flex, Space, Spin } from "antd";
import { useEffect, useState } from "react";
import { useQuery } from "@umijs/max";
import { simpleRequestActions } from "@/services/model";
import { ArrowLeftOutlined, ReloadOutlined, } from "@ant-design/icons";
import dayjs from "dayjs";
import { VisitScheduleDetail, VisitScheduleItem } from "@/services/crm/data";
import MapComp from "./MapComp";
import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { CrmServiceAPI, InitVisitScheduleParamsType } from "@/services/crm/services";
import TrackingList from "./TrackingList";
import TrackingView from "./TrackingView";
import { SaleServiceAPI } from "@/services/sale/services";
import { ProductItem, SoItemLess } from "@/services/sale/data";

type FilterType = {
    searchValue?: string;
    status?: string;
}
export default () => {
    const crmServices = CrmServiceAPI();
    const saleServices = SaleServiceAPI()
    const [visible, setVisible] = useState(false)
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: 'AIzaSyA0Ifgai8ryDULDIqNOZmX8L7XZlzu4_D8'
    });
    const [zoomTo, setZoomto] = useState<VisitScheduleItem>()
    const requestActions = simpleRequestActions()
    const [filter, setFilter] = useState<FetchPagingParams<FilterType>>()
    // const { data, isFetching, refetch } = useQuery([criteria], () => fetchList(criteria?.deliveryDate), {
    //     refetchOnWindowFocus: false,
    //     refetchInterval: 60000
    // })
    const [selectedItem, setSelectedItem] = useState<VisitScheduleItem>()
    const [criteria, setCriteria] = useState<{ status?: string, dates?: string[], searchValue?: string }>({ status: "PENDING", dates: [dayjs().startOf("day").format("YYYY-MM-DD"), dayjs().startOf("day").format("YYYY-MM-DD")] })
    const [onSearch, setOnSearch] = useState('')
    const [scheduleData, setScheduleData] = useState<VisitScheduleDetail>();
    const [allData, setAllData] = useState<VisitScheduleItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [orderList, setOrderList] = useState<SoItemLess[]>([]);
    const [stockCountList, setStockCountList] = useState<ProductItem[]>([]);
    const { data, refetch, isFetching } = useQuery(
        ['list-visit-schedule', criteria, onSearch],
        () => crmServices.listVisitSchedule({
            criteria: criteria,
            keywords: onSearch
            // advanceSearch: { ...filter?.criteria },
            // sort: filter?.sort,
        }, {
            page: filter?.pagination?.current,
            pageSize: 20
        }), {
        refetchOnWindowFocus: false,
        enabled: !!criteria,
    }
    );

    const loadDetail = async (id: number) => {
        try {
            setLoading(true)
            const rs = await crmServices.getVisitSchedule({ id: id })
            const soList = (rs.visit?.id && (rs.visit?.id || 0) > 0) ? await saleServices.listSoByVisitId(rs.visit?.id) : []
            const items = await saleServices.getItemByIdList({ ids: rs.stockCountList.map(it => it.itemId) })
            setOrderList(soList)
            setStockCountList(items)

            setScheduleData(rs);
            return rs
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }

    const onViewHandler = async (item?: VisitScheduleItem) => {
        setSelectedItem(item)
        item?.id && await loadDetail(item?.id)
        setVisible(true)

    }
    const onSearchSE = (e: string) => {
        // Split the string by commas and trim each name
        const searchArray = e
            .split(',') // Split the string by commas
            .map((name: string) => name.trim()); // Trim spaces from each name

        console.log('searchArray', searchArray); // This is now an array of names

        // Loop through the array and update the state for each name
        searchArray.forEach((name: string) => {
            setOnSearch(name);
            setCriteria((prev) => ({
                ...prev,
                searchValue: name, // Set searchValue to each name
            }));
        });
    };

    useEffect(() => {
        const fetchAllData = async () => {
            if (data && data.items) {
                setLoading(true); // Start loading when the function starts
                try {
                    let allFetchedData = [...data.items]; // Start with the initial fetched data
                    const totalItems = data.total || 0;
                    const pageSize = filter?.pagination?.pageSize || 20;
                    const totalPages = Math.ceil(totalItems / pageSize);
                    let currentPage = filter?.pagination?.current || 1;

                    // Fetch remaining pages if applicable
                    while (currentPage < totalPages) {
                        const nextPageData = await crmServices.listVisitSchedule(
                            { criteria, keywords: onSearch },
                            { page: currentPage + 1, pageSize }
                        );
                        allFetchedData = [...allFetchedData, ...nextPageData.items];
                        currentPage++;
                    }

                    // Filter data after all pages are fetched
                    const filteredData = allFetchedData.filter(item =>
                        item?.visit?.actualLatitude && item?.visit?.actualLongitude && item.status != 'CANCELED'
                    );

                    // Reset and append the data to the state
                    setAllData(filteredData); // Reset the state to new data
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false); // Stop loading after the process is complete (successful or error)
                }
            }
        };

        if (data?.items) {
            fetchAllData();
        }
    }, [data, criteria, onSearch, filter]);

    return <Spin spinning={isFetching || requestActions.request?.loading || loading}><Flex>
        {isLoaded && <MapComp reload={refetch}
            onView={onViewHandler}
            onZoomChanged={() => setZoomto(undefined)}
            zoomTo={zoomTo} data={allData}
            onOpen={() => {
                setScheduleData(undefined)
                setVisible(true)
            }}
        >
        </MapComp>}

        <Drawer extra={<Space>
            {scheduleData && <Button type="link"
                onClick={() => setScheduleData(undefined)}

                icon={<ArrowLeftOutlined />} />}

            {!scheduleData && <Button type="link" onClick={() => refetch()} icon={<ReloadOutlined />} />}
        </Space>

        }
            width={800}
            title={scheduleData ? `${scheduleData.customer.code} - ${scheduleData.customer.name}` : 'Location Tracking '} onClose={() => {
                setVisible(false)
                setZoomto(undefined)

            }} open={visible} >

            {!scheduleData && <TrackingList
                onSelectDate={(selectedDates: dayjs.Dayjs[]) => {
                    setCriteria((prev) => ({
                        ...prev,
                        dates: selectedDates.map((date) => date.format("YYYY-MM-DD")),
                    }));
                }}
                // onSearchSE={(e) => (setOnSearch(e), setCriteria((prev) => ({ ...prev, searchValue: e })))}
                onSearchSE={(e) => {
                    setOnSearch(e);
                    setCriteria((prev) => ({
                        ...prev,
                        searchValue: e,
                    }))
                }}
                onFilterStatus={(e) => (setCriteria((prev) => ({ ...prev, status: e })))}
                data={allData}
                loading={loading}
                onZoom={setZoomto}
                onView={onViewHandler} />}
            {scheduleData && <TrackingView data={scheduleData} orderList={orderList} stockCountList={stockCountList} loading={loading} />}
        </Drawer>
    </Flex>
    </Spin >
}