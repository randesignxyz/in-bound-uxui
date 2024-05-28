import { Button, Card, Flex, Space } from "antd"
import React, { CSSProperties, useEffect, useState } from "react";

interface Props {
    onTireClick: (key?: TireDTO) => void;
    dataSource?: TireDTO[];
    request?: () => Promise<TireDTO[]>
    key: React.Key;
    axisHight?: number;
}
interface TireDTO {
    value?: string;
    label?: string;
    double?: TireDTO[];
    selected?: boolean;
    key?: string;
}

const tireItem1: TireDTO[][] = [
    [
        {
            label: "Front-L",
            value: "F-L",
            key: "FL1"
        },
        {
            label: "Front-R",
            value: "F-R",
            key: "FR1"
        }
        ,
    ],

    [

        {
            double: [
                {
                    label: "Back-L-Out",
                    value: "RL1-OUT",
                    key: "RL1OUT"
                },
                {
                    label: "Back-L-IN",
                    value: "RL1-IN",
                    key: "RL1IN"
                },

            ]
        },
        {
            double: [
                {
                    label: "Back-R-In",
                    value: "RR1-IN",
                    key: "RR1IN"
                },
                {
                    label: "Back-R-Out",
                    value: "RR1-OUT",
                    key: "RR1OUT"
                }
            ]
        },

    ],
    [

        {
            double: [
                {
                    label: "Back-L-Out",
                    value: "RL2-OUT",
                    key: "RL2OUT"
                },
                {
                    label: "Back-L-In",
                    value: "RL2-IN",
                    key: "RL2IN"
                },

            ]
        },
        {
            double: [

                {
                    label: "Back-R-In",
                    value: "RR2-IN",
                    key: "RR2IN"
                },
                {
                    label: "Back-R-Out",
                    value: "RR2-OUT",
                    selected: true,
                    key: "RR2IN"
                },
            ]
        },

    ]

]
const TiresInterface: React.FC<Props> = ({ onTireClick, request, axisHight, key, dataSource }) => {
    const tireStyle: CSSProperties = {
        borderRadius: 50,
        height: "70px",
        zIndex: 10,
        width: "35px",
        position: "relative",
    };
    const tireLabel: CSSProperties = {
        transform: "rotate(-25deg)",
        position: "absolute",
        top: -28,
        left: -1,
        color: "black",
        zIndex: 50,
    }
    const [item, setItem] = useState<TireDTO[]>();
    useEffect(() => {
        dataSource && setItem(dataSource);
    }, [dataSource]);

    return (
        <>
            <Card bodyStyle={{padding:"50px 0"}}>
                <Flex vertical align="center" gap={50}>
                    <div
                        style={{
                            width: "10px",
                            top: "80px",
                            height: axisHight ? `${axisHight}px` : "250px",
                            backgroundColor: "lightgray",
                            position: "absolute"
                        }}
                    />
                    {
                        tireItem1?.map(o => (
                            <>
                                <Flex
                                    justify="space-between"
                                    gap={100}
                                    align="center"
                                    style={{
                                        position: "relative"
                                    }}
                                >
                                    {
                                        o.filter(o => o.double == null).map(p => (<>
                                            <div style={{
                                                backgroundColor: "lightgray",
                                                width: "100%",
                                                height: "10px",
                                                position: "absolute",
                                            }} />
                                            <Button
                                                size="small"
                                                value={p.value}
                                                style={{
                                                    ...tireStyle,
                                                    background: item?.filter(o => p.value == o.value).length ? "linear-gradient(90deg, rgba(27,24,68,1) 0%, rgba(15,117,194,1) 50%, rgba(2,0,36,1) 100%)" : "linear-gradient(90deg, rgba(177,177,179,1) 0%, rgba(232,243,251,1) 50%, rgba(177,177,179,1) 100%"
                                                }}
                                                onClick={() => onTireClick(p)}
                                            >
                                                <span style={tireLabel}>{p.label}</span>
                                            </Button>
                                        </>))
                                    }
                                    {
                                        o.filter(o => o.double != null)?.map(po => (
                                            <>
                                                <div style={{
                                                    backgroundColor: "lightgray",
                                                    width: "100%",
                                                    height: "10px",
                                                    position: "absolute",
                                                }} />
                                                <Space size={4}>
                                                    {
                                                        po.double?.map(pp => (
                                                            <Button
                                                                size="small"
                                                                value={pp.label}
                                                                style={{
                                                                    ...tireStyle,
                                                                    background: item?.filter(o => pp.value == o.value).length ? "linear-gradient(90deg, rgba(27,24,68,1) 0%, rgba(15,117,194,1) 50%, rgba(2,0,36,1) 100%)" : "linear-gradient(90deg, rgba(177,177,179,1) 0%, rgba(232,243,251,1) 50%, rgba(177,177,179,1) 100%"
                                                                }}
                                                                onClick={() => onTireClick(pp)}
                                                            ><span style={tireLabel}>{pp.label}</span></Button>
                                                        ))
                                                    }
                                                </Space>
                                            </>
                                        ))
                                    }
                                </Flex>
                            </>
                        ))
                    }
                </Flex>
            </Card>
        </>
    )
}

export default TiresInterface