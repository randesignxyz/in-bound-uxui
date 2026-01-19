import PageWrapper from "@/components/PageWrapper";
import IPOForm from "./IPOForm";

export default () => {
    return (
        <PageWrapper
            tabRender={(item) => [
                {
                    tabKey: "add",
                    tabLabel: "Add IPO",
                    action: "add",
                    actionLabel: "Add IPO",
                    panel: ({ }) => <IPOForm />
                }
            ]}
            listView={{
                type: "Table",
                props: {
                    columns: [
                        {
                            title: "Ipo Code",
                            dataIndex: "ipoCode"
                        }
                    ]
                }
            }}
        />
    )
};