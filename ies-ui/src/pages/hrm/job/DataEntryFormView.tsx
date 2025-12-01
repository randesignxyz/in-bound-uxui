import React, { useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Card,
  Row,
  Col,
  message, Modal,
} from "antd";
import moment from "moment";
import { ListJob } from "./data";
import { JobServiceAPI } from "./services";

type FormMode = "CREATE" | "EDIT" | "VIEW";

interface DataEntryFormViewProps {
  id?: number | string | undefined ;
  type: FormMode;
  onCloseTab?: () => void;
}
const { Option } = Select;

const DataEntryFormView: React.FC<DataEntryFormViewProps> = ({ id, type, onCloseTab, }) => {
  const [form] = Form.useForm<ListJob>();
  const services = JobServiceAPI();
  const isView = type === "VIEW";
  const currentUser = localStorage.getItem("username") || "Unknown User";
  useEffect(() => {
    if ((type === "EDIT" || type === "VIEW") && id) {
      (async () => {
        try {
          const res = await services.detail(id);
          const job = res?.data?? res;

          form.setFieldsValue({
            jobTitle: job?.jobTitle || "",
            jobNo: job?.jobNo || "",
            jobDescription: job?.jobDescription || "",
            description: job?.description || "",
            status: job?.status?.toUpperCase() || "ACTIVE",
            empSegmentId: job?.empSegmentId || "",
            createdBy: job?.createdBy || currentUser,
            createdDate: job?.createdDate ? moment(job.createdDate) : moment(),
            lastModifiedBy: job?.lastModifiedBy,
            lastModifiedDate: job?.lastModifiedDate ? moment(job.lastModifiedDate): moment(),
          });
        } catch (err: any) {
          message.error("Failed to load job: " + (err.message || err));
        }
      })();
    } else if (type === "CREATE") {
      form.setFieldsValue({
        createdBy: currentUser,
        createdDate: moment(),
        lastModifiedBy: currentUser,
        lastModifiedDate: moment(),
      });
    }
  }, [id, type]);

  const handleSubmit = (values: any) => {
    const payload = {
      ...values,
      createdDate: values.createdDate?.format("YYYY-MM-DD"),
      lastModifiedDate: moment().format("YYYY-MM-DD"),
      createdBy: values.createdBy || currentUser,
      lastModifiedBy: currentUser,
    };
    Modal.confirm({
      title: type === "CREATE" ? "Confirm Create" : "Confirm Update",
      content: type === "CREATE"
        ? "Are you sure you want to create this job?"
        : "Are you sure you want to update this job?",
      okText: type === "CREATE" ? "Create" : "Update",
      cancelText: "Cancel",
      okType: type === "CREATE" ? "primary" : "default",
      onOk: async () => {
        try {
          if (type === "CREATE") {
            await services.createNewJob(payload);
          } else if (type === "EDIT" && id) {
            await services.updateJob({ id, ...payload });
          }
          onCloseTab?.();
        } catch (err: any) {
          Modal.error({ title: "Operation Failed", content: err.message || String(err) });
        }
      },
    });
  };

  return (
    <Card
      title={
        type === "CREATE"
          ? "Create Job"
          : type === "EDIT"
            ? "Edit Job"
            : "View Job"
      }
      bordered
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Job Title"
              name="jobTitle"
              rules={[{ required: true, message: "Please enter Job Title" }]}
            >
              <Input disabled={isView} placeholder="Enter Job Title" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Status" name="status"  rules={[{ required: true, message: "Please select status" }]}>
              <Select disabled={isView}>
                <Option value="ACTIVE">ACTIVE</Option>
                <Option value="INACTIVE">INACTIVE</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Job Description" name="jobDescription" rules={[{ required: true, message: "Please enter Job Description" }]}>
              <Input.TextArea
                disabled={isView}
                placeholder="Enter Job Description"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Description" name="description" >
              <Input.TextArea disabled={isView} placeholder="Enter Description" />
            </Form.Item>
          </Col>

          {/* Always show createdDate and lastModifiedDate */}
          <Col span={12}>
            <Form.Item label="Created Date" name="createdDate">
              <DatePicker style={{ width: "100%" }} disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Last Modified Date" name="lastModifiedDate">
              <DatePicker style={{ width: "100%" }} disabled />
            </Form.Item>
          </Col>
          {type !== "CREATE" && (
            <>
              <Col span={12}>
                <Form.Item label="Created By" name="createdBy">
                  <Input disabled />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Last Modified By" name="lastModifiedBy">
                  <Input disabled />
                </Form.Item>
              </Col>
            </>
          )}
          <Col span={24} style={{ textAlign: "right" }}>
            {!isView ? (
              <>
                <Button type="primary" htmlType="submit">
                  {type === "CREATE" ? "Create" : "Update"}
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={onCloseTab}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={onCloseTab}>Close</Button>
            )}
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default DataEntryFormView;
