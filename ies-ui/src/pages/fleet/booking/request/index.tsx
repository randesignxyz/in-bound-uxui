import PageWrapper from "@/components/PageWrapper"
import RequestForm from "./Form"


export default ()=>{

    return (
        <PageWrapper

            tabRender={(it)=>[
                {
                    tabLabel:"New",
                    action:"add",
                    tabKey:"add",
                    panel:()=><RequestForm
                        id={it?.id}
                    />
                }
            ]}
            listView={{
                title:"Request List",
                type:"Table",
                props:{
                    columns:[

                    ]
                }
            }}

        />
    )
}