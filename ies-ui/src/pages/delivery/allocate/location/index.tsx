import { ProDescriptions, ProList } from "@ant-design/pro-components"
import { GoogleMap, useGoogleMap, useLoadScript, } from "@react-google-maps/api"
import { Button, DatePicker, Drawer, Flex, FloatButton, Input, message, Modal, Space, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import MapComp from "./MapComp";
import { useAccess, useQuery } from "@umijs/max";
import { fetchDataListService, singleRequest } from "@/services/apiGateway";
import { Moment } from "moment";
import { simpleRequestActions } from "@/services/model";
import { Location } from "../data";
import { ArrowLeftOutlined, ReloadOutlined, } from "@ant-design/icons";
import DeliveryList from "./DeliveryList";
import DeliveryView from "./DeliveryView";
import { InstanceDetail } from "@/services/delivery/instance.types";
import { InstanceSrvParams } from "@/services/delivery/instance-service-params";
import dayjs from "dayjs";
import { DNList, ListDnDetailParams } from "../data";
import { useLocation, useNavigate } from "react-router-dom";
import { FloatingCard } from "../displayCard";
import { AllocateServiceAPI } from "../service";

interface DNListState {
    list: DNList[];
    selected?: DNList[]
    selectedRows?: DNList[]
}

export default () => {
    const navigate = useNavigate();
    const requestActions = simpleRequestActions()
    const services = AllocateServiceAPI(requestActions);
    const { state } = useLocation() as { state: DNListState };
    const [visible, setVisible] = useState(false)
    const [select, setSelect] = useState<DNList[]>([])
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [drawerItems, setDrawerItems] = useState<DNList[]>([]);
    const access = useAccess();
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: 'AIzaSyA0Ifgai8ryDULDIqNOZmX8L7XZlzu4_D8'
    });
    const [cardOpen, setCardOpen] = useState<{ visible: boolean }>({
        visible: false
    });

    const [zoomTo, setZoomto] = useState<Location>()

    // const { data, isFetching, refetch } = useQuery(
    //     ['dn-detail', criteria], // include unique key name + criteria
    //     () => fetchList(criteria),
    //     {
    //         refetchOnWindowFocus: false,
    //         refetchInterval: 60000, // refresh every 60s
    //         enabled: !!criteria, // only run if criteria is defined
    //     }
    // );

    const [instanceData, setInstanceData] = useState<InstanceDetail>();

    // const onViewHandler = (item: DNList) => {
    //     setSelect(prev => {
    //         const exists = prev.some(i => i.id === item.id); // check if item already selected
    //         if (exists) {
    //             // remove it
    //             return prev.filter(i => i.id !== item.id);
    //         } else {
    //             // add it
    //             return [...prev, item];
    //         }
    //     })
    // };

    const onViewHandler = (item: DNList) => {
        if (!state?.list) return;

        // find all DNs with the same shippingAddress + lat + lng
        const sameGroup = state.list.filter(
            dn =>
                dn.shippingAddress === item.shippingAddress &&
                dn.latitude === item.latitude &&
                dn.longitude === item.longitude
        );

        if (sameGroup.length === 1) {
            // only one -> directly add to select
            setSelect(prev => {
                const exists = prev.some(i => i.id === item.id);
                if (exists) return prev.filter(i => i.id !== item.id);
                return [...prev, item];
            });
        } else {
            // multiple -> open drawer
            setDrawerItems(sameGroup);
            setDrawerVisible(true);
        }
    };


    const handleClaim = async (ids: number | number[]) => {
        const idArray = Array.isArray(ids) ? ids : [ids];

        Modal.confirm({
            title: 'Pick',
            content: 'Are you sure?',
            onOk: async () => {
                try {
                    // Loop through each id
                    await services.ClaimDn(idArray, access.currentUser?.login, 'Pick', 'Pick DN') as {
                        data: string;
                        message: string;
                    }
                    navigate("/delivery/allocate/list")
                    setSelect([])
                    setCardOpen({ visible: false })
                } catch (error) {
                    message.error('Failed to update');
                    console.error(error);
                }
            },
        });
    };

    useEffect(() => {
        setSelect(state?.selectedRows ?? [])
        if (state?.selectedRows && state.selectedRows.length > 0) {
            setCardOpen({ visible: true })
        }
    }, [state?.selectedRows])
    useEffect(() => {
        setCardOpen({ visible: true })
    }, [select])

    return <Spin spinning={requestActions.request?.loading || false}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() =>
                    navigate("/delivery/allocate/list", { state: { selectedRows: select } })
                }
            >
                Back
            </Button>

            <Button
                type="primary"
                onClick={() => {
                    // your claim logic here
                    handleClaim(select.map(k => Number(k.id)))
                    console.log("Claimed items:", select);
                }}
            >
                Pick
            </Button>
        </div>
        <Flex>

            {isLoaded && <MapComp
                data={state?.list || []}
                selected={select}
                zoomTo={zoomTo}
                onView={onViewHandler}
            />}
            <FloatingCard
                selectedRows={select}
                cardOpen={cardOpen}
            />
            <Drawer
                title="Select Shipping Address Items"
                open={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                width={400}
            >
                {drawerItems.map(dn => (
                    <div key={dn.id} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                        <div>
                            <input
                                type="checkbox"
                                checked={select.some(i => i.id === dn.id)}
                                onChange={() => {
                                    setSelect(prev => {
                                        const exists = prev.some(i => i.id === dn.id);
                                        if (exists) return prev.filter(i => i.id !== dn.id);
                                        return [...prev, dn];
                                    });
                                }}
                            />{" "}
                            <div style={{ display: "inline-flex", alignItems: "center", marginLeft: 8, gap: 8 }}>
                                <b>{dayjs(dn.deliveryDate).format("DD-MMM-YYYY")}</b>
                                <span style={{ color: "#888" }}>{dn.shippingAddress}</span>

                            </div>
                        </div>

                        {/* show mergeItems */}
                        <ul
                            style={{
                                marginTop: 8,
                                listStyle: "none",
                                padding: 0,
                            }}
                        >
                            {dn.mergeItems?.map((mi) => (
                                <li
                                    key={mi.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        padding: "4px 8px",
                                        // background: "#fafafa",
                                        borderRadius: 6,
                                        marginBottom: 4,
                                        fontSize: 14,
                                    }}
                                >
                                    <span>{mi.itemName}</span>
                                    <span style={{ color: "#555" }}>x{mi.qty}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </Drawer>

        </Flex>
    </Spin >
}