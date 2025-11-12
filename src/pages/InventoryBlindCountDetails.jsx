import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Row,
  Space,
  Spin,
  Typography,
} from "antd";
import { DownloadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import {
  downloadBlindCountPdf,
  getBlindCountById,
  approveBlindCount,
} from "../apis/apis/inventories";
import "./InventoryBlindCountDetails.scss";

const { Title, Text } = Typography;

const InventoryBlindCountDetails = () => {
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [data, setData] = useState(null);

  const fetchDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await getBlindCountById(id);
      setData(response ?? null);
    } catch (error) {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!data?.id) return;
    setIsDownloading(true);
    try {
      const response = await downloadBlindCountPdf(data.id);
      const blob =
        response instanceof Blob ? response : new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inventory-blind-count-${data.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // handled in api helper
    } finally {
      setIsDownloading(false);
    }
  };

  const handleApprove = async () => {
    if (!data?.id) return;
    setIsApproving(true);
    try {
      await approveBlindCount(data.id);
      // Refresh the data to show updated status
      await fetchDetails();
    } catch (error) {
      // handled in api helper
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="blind-count-details-page centered">
        <Spin size="large" tip="جاري التحميل..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="blind-count-details-page centered">
        <Empty description="لا توجد بيانات لعرضها" />
      </div>
    );
  }

  return (
    <div className="blind-count-details-page">
      <div className="page-header">
        <div className="header-content">
          <Title level={2} className="page-title">
            تفاصيل جرد المخزون
          </Title>
          <Text className="page-subtitle">
            مراجعة تفصيلية للنتائج التي تم تسجيلها بواسطة الجرد
          </Text>
        </div>
        <Space size="middle">
          {data?.status === "submitted" && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleApprove}
              loading={isApproving}
              className="approve-button"
              size="large"
            >
              موافقة وتسوية
            </Button>
          )}
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadPdf}
            loading={isDownloading}
            className="download-button"
            size="large"
          >
            تحميل PDF
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]} className="info-cards-row">
        <Col xs={24} md={12}>
          <Card className="info-card">
 
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">القسم</span>
                <span className="info-value">{data?.department?.name ?? "غير متاح"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">الكاشير</span>
                <span className="info-value">{data?.cashier?.name ?? "غير متاح"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">تاريخ الجرد</span>
                <span className="info-value">{data?.submitted_at ?? "غير متاح"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">الحالة</span>
                <span className={`status-badge ${data?.status === "approved" ? "approved" : ""}`}>
                  {data?.status === "approved" ? "تمت الموافقة" : data?.status === "submitted" ? "قيد الانتظار" : "غير متاح"}
                </span>
              </div>
              {data?.approved_by && (
                <>
                  <div className="info-item">
                    <span className="info-label">تمت الموافقة بواسطة</span>
                    <span className="info-value">{data?.approved_by?.name ?? "غير متاح"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">تاريخ الموافقة</span>
                    <span className="info-value">{data?.approved_at ?? "غير متاح"}</span>
                  </div>
                </>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="info-card">
   
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">ويتر الشفت السابق</span>
                <span className="info-value">{data?.waiter_old?.name ?? "غير متاح"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">ويتر الشفت الجديد</span>
                <span className="info-value">{data?.waiter_new?.name ?? "غير متاح"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">ملاحظات</span>
                <span className="info-value notes">{data?.notes ?? "لا توجد ملاحظات"}</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="summary-card">
        <Title level={4} className="section-title">ملخص الجرد</Title>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">إجمالي الأصناف</div>
            <div className="summary-value">{data?.items_count ?? 0}</div>
          </div>
          <div className="summary-item deficit">
            <div className="summary-label">كمية العجز</div>
            <div className="summary-value">{Number(data?.total_under_quantity ?? 0).toFixed(3)}</div>
          </div>
          <div className="summary-item surplus">
            <div className="summary-label">كمية الزيادة</div>
            <div className="summary-value">{Number(data?.total_over_quantity ?? 0).toFixed(3)}</div>
          </div>
          <div className="summary-item fine">
            <div className="summary-label">إجمالي الغرامة</div>
            <div className="summary-value">{Number(data?.total_fine_amount ?? 0).toFixed(2)} ج.م</div>
          </div>
        </div>

        <Divider />

        <Title level={4} className="section-title">تفاصيل الأصناف</Title>

        {data?.items?.length ? (
          <div className="items-table-wrapper">
            <table className="items-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الصنف</th>
                  <th>كمية النظام</th>
                  <th>الكمية الفعلية</th>
                  <th>الفرق</th>
                  <th>الحالة</th>
                  <th>الغرامة</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-center">{index + 1}</td>
                    <td className="item-name">{item.recipe_name}</td>
                    <td className="text-center">{Number(item.system_quantity).toFixed(3)}</td>
                    <td className="text-center">{Number(item.actual_quantity).toFixed(3)}</td>
                    <td className="text-center variance-col">
                      {Math.abs(item.variance_quantity).toFixed(3)}
                    </td>
                    <td className="text-center">
                      <span className={`variance-badge ${item.variance_type}`}>
                        {item.variance_type === "under" ? "عجز" : "زيادة"}
                      </span>
                    </td>
                    <td className="text-center fine-col">
                      {Number(item.fine_amount).toFixed(2)} ج.م
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty description="لا توجد تفاصيل للأصناف" />
        )}
      </Card>
    </div>
  );
};

export default InventoryBlindCountDetails;

