import { ProForm, ProFormText, ProFormSelect, ProFormDatePicker, ProTable } from "@ant-design/pro-components"
import { Card, Row, Col } from "antd"


export default  () =>{
    return (
        <ProTable
        showHeader={false}
        searchFormRender={(props, defualtDom) => {
          return (
            <Card
              bodyStyle={{ padding: "3px 10px", margin: 0 }}
            >
              <ProForm
                submitter={false}
              >
                <Row gutter={6}>
                  <Col span={4}>
                    <ProFormText
                      name={"searchValue"}
                      label={"Search"}
                    />
                  </Col>
                  <Col span={4}>
                    <ProFormSelect
                      label="Driver"
                    />
                  </Col>
                  <Col span={4}>
                    <ProFormDatePicker
                      label="Date"
                    />
                  </Col>

                </Row>

              </ProForm>
            </Card>
          )
        }}
        columns={[
          {
            title:""
          }
        ]}

      />
    )
}