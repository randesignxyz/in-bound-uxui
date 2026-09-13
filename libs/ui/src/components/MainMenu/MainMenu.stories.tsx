import { Meta, StoryFn } from "@storybook/react";
import MainMenu from "./MainMenu";
import React from "react";
import { HistoryOutlined } from "@ant-design/icons";

export default {
    title: "Truths-ui/Menu",
    component: MainMenu,
} satisfies Meta<typeof MainMenu>;


const Template: StoryFn<typeof MainMenu> = (args) => <MainMenu {...args} />;

export const Menu1 = Template.bind({});

Menu1.args = {
    items: [
        {
            menu: {
                key: 'ticket',
                devider: { label: "Ticket"},
                items: [{
                    id: 'ticketBoard',
                    name: "Ticket Board",
                    description: "Ticket List",
                    menu: {
                        items: [
                            {
                                label: 'View History',
                                icon: <HistoryOutlined />,
                                key: 'ticket-history',
                            }
                        ]
                    }
                }, {
                    id: 'loadingBoard',
                    name: 'Loading Board',
                    description: 'Manage Loading',
                }, {
                    id: 'queueBoard',
                    name: "Queue Board",
                    description: "Display Board"
                }]
            }
        },
        {
            menu: {
                key: 'delivery',
                devider: { label: "Delivery"},
                items: [{
                    id: 'deliveryBoard',
                    name: 'Delivery Board',
                    description: 'List of delivery'
                }]
            }
        }
    ]
}

export const Menu2 = Template.bind({});

Menu2.args = {
    items: [
        {
            menu: {
                key: 'ticket',
                //devider: { label: "Ticket"},
                items: [{
                    id: 'ticketBoard',
                    name: "Ticket Board",
                    description: "Ticket List",
                    menu: {
                        items: [
                            {
                                label: 'View History',
                                icon: <HistoryOutlined />,
                                key: 'ticket-history',
                            }
                        ]
                    }
                }, {
                    id: 'loadingBoard',
                    name: 'Loading Board',
                    description: 'Manage Loading',
                }, {
                    id: 'queueBoard',
                    name: "Queue Board",
                    description: "Display Board"
                },
                {
                    id: 'queueBoard1',
                    name: "Queue Board1",
                    description: "Display Board"
                },
                {
                    id: 'queueBoard2',
                    name: "Queue Board2",
                    description: "Display Board"
                }
            ]
            }
        },
        {
            menu: {
                key: 'delivery',
                devider: {},
                items: [{
                    id: 'deliveryBoard',
                    name: 'Delivery Board',
                    description: 'List of delivery'
                }]
            }
        }
    ]
}

