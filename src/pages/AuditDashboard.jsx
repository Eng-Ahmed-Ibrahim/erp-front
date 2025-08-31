import React, { useState, useEffect, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { SidebarContext } from "../context/SidebarContext";
import {
  message,
  Modal,
  Select,
  Input,
  Button,
  Card,
  Table,
  Tag,
  Row,
  Col,
  DatePicker,
  Form,
  Divider,
  Badge,
  Typography,
  Space,
  Avatar,
  Tooltip,
  Statistic,
  Progress,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
  SearchOutlined,
  ClearOutlined,
  DatabaseOutlined,
  UserOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "./AuditDashboard.scss";
import { API_ENDPOINT } from "../../config";
import {
  getAuditLogs,
  getAuditLogDetails,
  getModelTypes,
  getActions,
  getAuditStatistics,
} from "../apis/audit";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text, Paragraph } = Typography;

function AuditDashboard() {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const { user } = useAuth();
  const { wrapperMargin } = useContext(SidebarContext);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    user_id: "",
    model_type: "",
    auditable_id: "",
    action: "",
    date_range: [],
    search: "",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [modelTypes, setModelTypes] = useState([]);
  const [actions, setActions] = useState([]);
  const [advancedFiltersVisible, setAdvancedFiltersVisible] = useState(false);
  const [statistics, setStatistics] = useState({
    total_logs: 0,
    today_logs: 0,
    critical_changes: 0,
    active_users: 0,
  });

  useEffect(() => {
    fetchAuditLogs();
    fetchUsers();
    fetchModelTypes();
    fetchActions();
    fetchStatistics();
  }, [filters, pagination.current]);

  useEffect(() => {
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      if (!loading) {
        fetchAuditLogs();
        fetchStatistics();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [filters, pagination.current, loading]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.current,
        per_page: pagination.pageSize,
        date_from: filters.date_range?.[0]?.format("YYYY-MM-DD") || "",
        date_to: filters.date_range?.[1]?.format("YYYY-MM-DD") || "",
      };

      // Remove date_range from params as we've extracted the dates
      delete params.date_range;

      const response = await getAuditLogs(params);
      setAuditLogs(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
      }));
    } catch (error) {
      message.error("حدث خطأ أثناء جلب سجلات التدقيق");
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await getAuditStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      } else {
        // Set default statistics if API returns unexpected format
        setStatistics({
          total_logs: auditLogs.length,
          today_logs: 0,
          critical_changes: 0,
          active_users: users.length,
        });
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      // Set default statistics if API fails
      setStatistics({
        total_logs: auditLogs.length,
        today_logs: 0,
        critical_changes: 0,
        active_users: users.length,
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${API_ENDPOINT}/api/v1/store/user/all/users`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchModelTypes = async () => {
    try {
      const response = await getModelTypes();
      setModelTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching model types:", error);
    }
  };

  const fetchActions = async () => {
    try {
      const response = await getActions();
      setActions(response.data || []);
    } catch (error) {
      console.error("Error fetching actions:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleDateRangeChange = (dates) => {
    setFilters((prev) => ({ ...prev, date_range: dates }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const clearAllFilters = () => {
    setFilters({
      user_id: "",
      model_type: "",
      auditable_id: "",
      action: "",
      date_range: [],
      search: "",
    });
    setPagination({ current: 1, pageSize: 50, total: 0 });
  };

  const handleTableChange = (paginationInfo) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    }));
  };

  const showLogDetails = async (id) => {
    try {
      const response = await getAuditLogDetails(id);
      setSelectedLog(response.data);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("حدث خطأ أثناء جلب تفاصيل السجل");
    }
  };

  const getActionColor = (action) => {
    const colors = {
      created: "green",
      updated: "blue",
      deleted: "red",
      quantity_changed: "orange",
      price_changed: "purple",
      status_changed: "cyan",
      recipe_added: "lime",
      recipe_removed: "volcano",
      operation_failed: "red",
      exception_occurred: "red",
    };
    return colors[action] || "default";
  };

  const getActionLabel = (action) => {
    const labels = {
      created: "إنشاء",
      updated: "تحديث",
      deleted: "حذف",
      quantity_changed: "تغيير الكمية",
      price_changed: "تغيير السعر",
      status_changed: "تغيير الحالة",
      recipe_added: "إضافة مكون",
      recipe_removed: "حذف مكون",
      operation_failed: "فشل العملية",
      exception_occurred: "خطأ",
    };
    return labels[action] || action;
  };

  const getActionIcon = (action) => {
    const icons = {
      created: <CheckCircleOutlined />,
      deleted: <CloseCircleOutlined />,
      quantity_changed: <DatabaseOutlined />,
      price_changed: <SettingOutlined />,
      status_changed: <InfoCircleOutlined />,
      recipe_added: <FileTextOutlined />,
      operation_failed: <CloseCircleOutlined />,
    };
    return icons[action] || <InfoCircleOutlined />;
  };

  const getActionSeverity = (action) => {
    const severities = {
      created: "success",
      updated: "info",
      deleted: "error",
      quantity_changed: "warning",
      price_changed: "warning",
      status_changed: "info",
      recipe_added: "success",
      recipe_removed: "warning",
      operation_failed: "error",
      exception_occurred: "error",
    };
    return severities[action] || "default";
  };

  const columns = [
    {
      title: "الإجراء",
      dataIndex: "action",
      key: "action",
      width: 180,
      fixed: "left",
      render: (action, record) => (
        <Space>
          <Avatar
            size="small"
            icon={getActionIcon(action)}
            style={{
              backgroundColor: getActionColor(action),
            }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{getActionLabel(action)}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>#{record.id}</div>
          </div>
        </Space>
      ),
      filters: actions.map((action) => ({
        text: getActionLabel(action),
        value: action,
      })),
      onFilter: (value, record) => record.action === value,
    },
    {
      title: "النموذج",
      dataIndex: "model_type",
      key: "model_type",
      width: 150,
      render: (modelType, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--brown-color)" }}>
            {modelType || "-"}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            ID: {record.auditable_id || "-"}
          </div>
        </div>
      ),
      filters: modelTypes.map((type) => ({
        text: type,
        value: type,
      })),
      onFilter: (value, record) => record.model_type === value,
    },
    {
      title: "المستخدم",
      dataIndex: ["user", "name"],
      key: "user",
      width: 150,
      render: (userName, record) => (
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            style={{ backgroundColor: "var(--beige-color)" }}
          />
          <div>
            <div>{userName || "غير محدد"}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.ip_address || "-"}
            </div>
          </div>
        </Space>
      ),
      filters: users.map((user) => ({
        text: user.name,
        value: user.id,
      })),
      onFilter: (value, record) => record.user?.id === value,
    },
    {
      title: "النموذج المُعدل",
      dataIndex: "auditable_type",
      key: "auditable_type",
      width: 150,
      render: (fieldName) => (
        <Tag color="blue" style={{ fontFamily: "monospace" }}>
          {fieldName || "-"}
        </Tag>
      ),
    },
    {
      title: "القيمة القديمة",
      dataIndex: "old_values",
      key: "old_values",
      width: 200,
      render: (oldValue) => (
        <div
          style={{
            maxHeight: "60px",
            overflow: "hidden",
            background: "#fff5f5",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ff6b6b",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          {oldValue
            ? typeof oldValue === "object"
              ? JSON.stringify(oldValue, null, 2).substring(0, 100) + "..."
              : String(oldValue).substring(0, 100) +
                (String(oldValue).length > 100 ? "..." : "")
            : "-"}
        </div>
      ),
    },
    {
      title: "القيمة الجديدة",
      dataIndex: "new_values",
      key: "new_values",
      width: 200,
      render: (newValue) => (
        <div
          style={{
            maxHeight: "60px",
            overflow: "hidden",
            background: "#f0fff4",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #51cf66",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          {newValue
            ? typeof newValue === "object"
              ? JSON.stringify(newValue, null, 2).substring(0, 100) + "..."
              : String(newValue).substring(0, 100) +
                (String(newValue).length > 100 ? "..." : "")
            : "-"}
        </div>
      ),
    },
    {
      title: "التاريخ والوقت",
      dataIndex: "created_at",
      key: "created_at",
      width: 100,
      fixed: "right",
      render: (date) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontWeight: 600 }}>
            {new Date(date).toISOString().split('T')[0]}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            <ClockCircleOutlined /> {new Date(date).toISOString().split('T')[0]}
          </div>
        </Space>
      ),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: "العمليات",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title="عرض التفاصيل الكاملة">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showLogDetails(record.id)}
          >
            تفاصيل
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="advanced-audit-dashboard">
      {/* Header Section */}
      <div className="">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={12}>
            <Title level={2} className="dashboard-title">
              <DatabaseOutlined style={{ marginRight: 12 }} />
              لوحة تحكم سجلات التدقيق المتقدمة
            </Title>
            <Paragraph className="dashboard-description">
              مراقبة شاملة ومتقدمة لجميع التغييرات والعمليات في النظام مع
            </Paragraph>
          </Col>
          <Col xs={24} lg={12}>
            <div className="header-actions">
              <Space wrap>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    fetchAuditLogs();
                    fetchStatistics();
                  }}
                  loading={loading}
                >
                  تحديث البيانات
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearAllFilters}
                  danger
                >
                  مسح جميع الفلاتر
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <div className="statistics-section">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="statistic-card">
              <Statistic
                title="إجمالي السجلات"
                value={statistics.total_logs}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: "var(--brown-color)" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="statistic-card">
              <Statistic
                title="سجلات اليوم"
                value={statistics.today_logs}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="statistic-card">
              <Statistic
                title="تغييرات حرجة"
                value={statistics.critical_changes}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="statistic-card">
              <Statistic
                title="مستخدمين نشطين"
                value={statistics.active_users}
                prefix={<UserOutlined />}
                valueStyle={{ color: "var(--beige-color)" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Advanced Filters Section */}
      <Card
        className="advanced-filters-card"
        title={
          <Space>
            <FilterOutlined />
            مرشحات البحث المتقدمة
            <Button
              type="text"
              onClick={() => setAdvancedFiltersVisible(!advancedFiltersVisible)}
              size="small"
            />
          </Space>
        }
      >
        {advancedFiltersVisible && (
          <div className="filters-content">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <div className="filter-item">
                  <Text strong>المستخدم:</Text>
                  <Select
                    placeholder="اختر المستخدم"
                    allowClear
                    style={{ width: "100%", marginTop: 8 }}
                    value={filters.user_id}
                    onChange={(value) => handleFilterChange("user_id", value)}
                  >
                    {users.map((user) => (
                      <Option key={user.id} value={user.id}>
                        <Space>
                          <Avatar size="small" icon={<UserOutlined />} />
                          {user.name}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <div className="filter-item">
                  <Text strong>نوع النموذج:</Text>
                  <Select
                    placeholder="اختر نوع النموذج"
                    allowClear
                    style={{ width: "100%", marginTop: 8 }}
                    value={filters.model_type}
                    onChange={(value) =>
                      handleFilterChange("model_type", value)
                    }
                  >
                    {modelTypes.map((type) => (
                      <Option key={type} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <div className="filter-item">
                  <Text strong>معرف النموذج:</Text>
                  <Input
                    placeholder="أدخل معرف النموذج"
                    allowClear
                    style={{ marginTop: 8 }}
                    value={filters.auditable_id}
                    onChange={(e) =>
                      handleFilterChange("auditable_id", e.target.value)
                    }
                  />
                </div>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <div className="filter-item">
                  <Text strong>نوع الإجراء:</Text>
                  <Select
                    placeholder="اختر نوع الإجراء"
                    allowClear
                    style={{ width: "100%", marginTop: 8 }}
                    value={filters.action}
                    onChange={(value) => handleFilterChange("action", value)}
                  >
                    {actions.map((action) => (
                      <Option key={action} value={action}>
                        <Space>
                          {getActionIcon(action)}
                          {getActionLabel(action)}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>

              <Col xs={24} sm={12} lg={12}>
                <div className="filter-item">
                  <Text strong>نطاق التاريخ:</Text>
                  <RangePicker
                    style={{ width: "100%", marginTop: 8 }}
                    value={filters.date_range}
                    onChange={handleDateRangeChange}
                    placeholder={["تاريخ البداية", "تاريخ النهاية"]}
                  />
                </div>
              </Col>

              <Col xs={24} sm={12} lg={12}>
                <div className="filter-item">
                  <Text strong>البحث العام:</Text>
                  <Input
                    placeholder="البحث في جميع الحقول..."
                    allowClear
                    prefix={<SearchOutlined />}
                    style={{ marginTop: 8 }}
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                  />
                </div>
              </Col>
            </Row>

            <Divider />

            <div className="filter-summary">
              <Space wrap>
                <Badge count={filters.user_id ? 1 : 0} size="small">
                  <Tag color="blue">مستخدم</Tag>
                </Badge>
                <Badge count={filters.model_type ? 1 : 0} size="small">
                  <Tag color="green">نموذج</Tag>
                </Badge>
                <Badge count={filters.action ? 1 : 0} size="small">
                  <Tag color="orange">إجراء</Tag>
                </Badge>
                <Badge count={filters.date_range?.length ? 1 : 0} size="small">
                  <Tag color="purple">تاريخ</Tag>
                </Badge>
                <Badge count={filters.search ? 1 : 0} size="small">
                  <Tag color="red">بحث</Tag>
                </Badge>
              </Space>
            </div>
          </div>
        )}
      </Card>

      {/* Data Table Section */}
      <Card
        className="data-table-card"
        title={
          <Space>
            <FileTextOutlined />
            سجلات التدقيق
            <Badge count={pagination.total} showZero />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={auditLogs}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `عرض ${range[0]}-${range[1]} من ${total} سجل`,
            pageSizeOptions: ["25", "50", "100"],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="middle"
          bordered
          rowClassName={(record) =>
            `audit-row-${getActionSeverity(record.action)}`
          }
        />
      </Card>

      {/* Advanced Detail Modal */}
      <Modal
        title={
          <div className="advanced-modal-header">
            <Space align="center">
              <Avatar
                size="large"
                icon={
                  selectedLog ? (
                    getActionIcon(selectedLog.action)
                  ) : (
                    <InfoCircleOutlined />
                  )
                }
                style={{
                  backgroundColor: selectedLog
                    ? getActionColor(selectedLog.action)
                    : "#666",
                }}
              />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  تفاصيل سجل التدقيق المتقدم
                </Title>
                <Text type="secondary">
                  {selectedLog &&
                    `#${selectedLog.id} • ${getActionLabel(
                      selectedLog.action
                    )}`}
                </Text>
              </div>
            </Space>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={1200}
        className="advanced-detail-modal"
        centered
      >
        {selectedLog && (
          <div className="advanced-modal-content">
            {/* Header Information Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card size="small" className="info-summary-card">
                  <Statistic
                    title="الإجراء"
                    value={getActionLabel(selectedLog.action)}
                    prefix={getActionIcon(selectedLog.action)}
                    valueStyle={{
                      color: getActionColor(selectedLog.action),
                      fontSize: "14px",
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card size="small" className="info-summary-card">
                  <Statistic
                    title="المستخدم"
                    value={selectedLog.user?.name || "غير محدد"}
                    prefix={<UserOutlined />}
                    valueStyle={{
                      color: "var(--brown-color)",
                      fontSize: "14px",
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card size="small" className="info-summary-card">
                  <Statistic
                    title="النموذج"
                    value={`${selectedLog.auditable_id} (${selectedLog.auditable_id})`}
                    prefix={<DatabaseOutlined />}
                    valueStyle={{
                      color: "var(--beige-color)",
                      fontSize: "14px",
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card size="small" className="info-summary-card">
                  <Statistic
                    title="التاريخ والوقت"
                    value={new Date(selectedLog.created_at).toISOString().split('T')[0]}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: "#666", fontSize: "12px" }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Changes Table */}
            <Card
              title={
                <Space>
                  <FileTextOutlined />
                  جدول التغييرات التفصيلي
                </Space>
              }
              className="changes-table-card"
            >
              <Table
                dataSource={[
                  {
                    key: "main_change",
                    field: selectedLog.field_name || "السجل كاملاً",
                    old_values: selectedLog.old_values,
                    new_values: selectedLog.new_values,
                    change_type: selectedLog.action,
                    change_time: selectedLog.created_at,
                  },
                  ...(selectedLog.details &&
                  typeof selectedLog.details === "object"
                    ? Object.entries(selectedLog.details).map(
                        ([key, value]) => ({
                          key: key,
                          field: key,
                          old_values: null,
                          new_values: value,
                          change_type: "detail",
                          change_time: selectedLog.created_at,
                        })
                      )
                    : []),
                ]}
                columns={[
                             {
                    title: "النموذج",
                    dataIndex: "auditable_type",
                    key: "auditable_type",
                    width: 200,
                    render: (auditable_type) => (
                      <Tag
                        color="blue"
                        style={{ fontFamily: "monospace", fontWeight: 600 }}
                      >
                        {auditable_type}
                      </Tag>
                    ),
                  },
                  {
                    title: "القيمة القديمة",
                    dataIndex: "old_values",
                    key: "old_values",
                    width: 300,
                    render: (oldValue) => (
                      <div
                        style={{
                          background: "#fff5f5",
                          padding: "12px",
                          borderRadius: "6px",
                          border: "2px solid #ff6b6b",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          maxHeight: "100px",
                          overflow: "auto",
                          color: "#c92a2a",
                        }}
                      >
                        {oldValue ? (
                          typeof oldValue === "object" ? (
                            JSON.stringify(oldValue, null, 2)
                          ) : (
                            String(oldValue)
                          )
                        ) : (
                          <Text type="secondary">-</Text>
                        )}
                      </div>
                    ),
                  },
                  {
                    title: "القيمة الجديدة",
                    dataIndex: "new_values",
                    key: "new_values",
                    width: 300,
                    render: (newValue) => (
                      <div
                        style={{
                          background: "#f0fff4",
                          padding: "12px",
                          borderRadius: "6px",
                          border: "2px solid #51cf66",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          maxHeight: "100px",
                          overflow: "auto",
                          color: "#2b8a3e",
                        }}
                      >
                        {newValue ? (
                          typeof newValue === "object" ? (
                            JSON.stringify(newValue, null, 2)
                          ) : (
                            String(newValue)
                          )
                        ) : (
                          <Text type="secondary">-</Text>
                        )}
                      </div>
                    ),
                  },
                  {
                    title: "نوع التغيير",
                    dataIndex: "change_type",
                    key: "change_type",
                    width: 150,
                    render: (changeType) => {
                      const labels = {
                        created: "إنشاء",
                        updated: "تحديث",
                        deleted: "حذف",
                        quantity_changed: "تغيير كمية",
                        price_changed: "تغيير سعر",
                        status_changed: "تغيير حالة",
                        recipe_added: "إضافة مكون",
                        recipe_removed: "حذف مكون",
                        operation_failed: "فشل عملية",
                        exception_occurred: "خطأ",
                        detail: "تفاصيل إضافية",
                      };
                      return (
                        <Tag color={getActionColor(changeType) || "default"}>
                          {labels[changeType] || changeType}
                        </Tag>
                      );
                    },
                  },
                  {
                    title: "وقت التغيير",
                    dataIndex: "change_time",
                    key: "change_time",
                    width: 180,
                    render: (time) => (
                      <Space direction="vertical" size={0}>
                        <div style={{ fontWeight: 600, fontSize: "12px" }}>
                          {new Date(time).toISOString().split('T')[0]}
                        </div>
                        <div style={{ fontSize: "11px", color: "#666" }}>
                          {new Date(time).toISOString().split('T')[0]}
                        </div>
                      </Space>
                    ),
                  },
                ]}
                pagination={false}
                size="small"
                scroll={{ x: 800 }}
                bordered
              />
            </Card>

            {/* System Information */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <SettingOutlined />
                      معلومات النظام
                    </Space>
                  }
                  size="small"
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <Text strong>عنوان IP: </Text>
                      <Tag style={{ fontFamily: "monospace" }}>
                        {selectedLog.ip_address || "-"}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>المتصفح: </Text>
                      <Text
                        style={{
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: "#666",
                          wordBreak: "break-all",
                        }}
                      >
                        {selectedLog.user_agent
                          ? selectedLog.user_agent.substring(0, 100) +
                            (selectedLog.user_agent.length > 100 ? "..." : "")
                          : "-"}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <ClockCircleOutlined />
                      الجدول الزمني
                    </Space>
                  }
                  size="small"
                >
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div
                          className="timeline-title"
                          style={{ fontWeight: 600 }}
                        >
                          تم إنشاء سجل التدقيق
                        </div>
                        <div
                          className="timeline-time"
                          style={{ fontSize: "12px", color: "#666" }}
                        >
                          {new Date(selectedLog.created_at).toLocaleString(
                            "ar-SA"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Raw Details (if any additional info) */}
            {selectedLog.details && typeof selectedLog.details === "string" && (
              <Card
                title="تفاصيل إضافية"
                size="small"
                style={{ marginTop: 16 }}
              >
                <pre
                  style={{
                    background: "#f6f8fa",
                    padding: "12px",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    overflow: "auto",
                    maxHeight: "200px",
                  }}
                >
                  {selectedLog.details}
                </pre>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AuditDashboard;
