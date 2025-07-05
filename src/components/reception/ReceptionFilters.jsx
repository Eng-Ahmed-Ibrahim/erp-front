import React from 'react';
import { Card, Select, Input, Button, Space, Row, Col, Badge, Statistic, Divider } from 'antd';
import { 
  SearchOutlined, 
  ClearOutlined, 
  FilterOutlined,
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  PercentageOutlined
} from '@ant-design/icons';
import { 
  VISITOR_TYPES, 
  VISITOR_TYPE_LABELS, 
  VISITOR_TYPE_COLORS,
  ROOM_TYPES, 
  ROOM_TYPE_LABELS 
} from '../../apis/reception/receptionApi';
import './ReceptionFilters.scss';

const { Option } = Select;
const { Search } = Input;

const ReceptionFilters = ({
  buildings = [],
  filters = {},
  onFiltersChange,
  onSearch,
  searchValue = '',
  onClearFilters,
  showStats = false,
  stats = {},
  loading = false
}) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleClearAll = () => {
    onClearFilters();
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card 
      className="reception-filters" 
      title={
        <Space>
          <FilterOutlined />
          <span>الفلاتر</span>
          {activeFiltersCount > 0 && (
            <Badge count={activeFiltersCount} size="small" />
          )}
        </Space>
      }
      extra={
        <Button 
          type="link" 
          icon={<ClearOutlined />} 
          onClick={handleClearAll}
          disabled={activeFiltersCount === 0}
        >
          مسح الكل
        </Button>
      }
    >
      <Row gutter={[16, 16]}>

        <Col xs={24} sm={12} md={8} lg={6}>
          <div className="filter-item">
            <label className="filter-label">
              <HomeOutlined style={{ marginRight: 4 }} />
              المبنى
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر المبنى"
              value={filters.building_id}
              onChange={(value) => handleFilterChange('building_id', value)}
              allowClear
              loading={loading}
            >
              {buildings.map(building => (
                <Option key={building.id} value={building.id}>
                  <Space>
                    <div 
                      className="building-color-indicator"
                      style={{ backgroundColor: building.color || building.color_code || '#1890ff' }}
                    />
                    {building.name}
                  </Space>
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* Room Type Filter */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <div className="filter-item">
            <label className="filter-label">نوع الغرفة </label>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر نوع الغرفة"
              value={filters.room_type}
              onChange={(value) => handleFilterChange('room_type', value)}
              allowClear
            >
              {Object.entries(ROOM_TYPES).map(([key, value]) => (
                <Option key={key} value={value}>
                  {ROOM_TYPE_LABELS[value]}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* Visitor Type Filter */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <div className="filter-item">
            <label className="filter-label">
              <UserOutlined style={{ marginRight: 4 }} />
             نوع العميل
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر نوع الزائر"
              value={filters.visitor_type}
              onChange={(value) => handleFilterChange('visitor_type', value)}
              allowClear
            >
              {Object.entries(VISITOR_TYPES).map(([key, value]) => (
                <Option key={key} value={value}>
                  <Space>
                    <div 
                      className="visitor-type-indicator"
                      style={{ 
                        backgroundColor: VISITOR_TYPE_COLORS[value]
                      }}
                    />
                    {VISITOR_TYPE_LABELS[value]}
                  </Space>
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* Occupancy Status Filter */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <div className="filter-item">
            <label className="filter-label">Status</label>
            <Select
              style={{ width: '100%' }}
              placeholder="Select status"
              value={filters.is_occupied}
              onChange={(value) => handleFilterChange('is_occupied', value)}
              allowClear
            >
              <Option value={true}>
                <Badge status="error" text="Occupied" />
              </Option>
              <Option value={false}>
                <Badge status="success" text="Available" />
              </Option>
            </Select>
          </div>
        </Col>

        {/* Date Range Filter for Bookings */}
        {/* <Col xs={24} sm={12} md={8} lg={6}>
          <div className="filter-item">
            <label className="filter-label">مدة الحجز </label>
            <Select
              style={{ width: '100%' }}
              placeholder="إختر مدة الحجز "
              value={filters.date_filter}
              onChange={(value) => handleFilterChange('date_filter', value)}
              allowClear
            >
              <Option value="today">اليوم</Option>
              <Option value="tomorrow">الغد</Option>
              <Option value="this_week">الأسبوع الجاري </Option>
              <Option value="this_month">الشهر الجاري</Option>
              <Option value="overdue">المغادرة المتأخرة</Option>
            </Select>
          </div>
        </Col> */}
      </Row>

      {/* Enhanced Statistics Section */}
      {showStats && (
        <>
          <Divider style={{ margin: '24px 0' }} />
          <div className="enhanced-stats-section">
            <Row justify="center" gutter={[24, 16]}>
              <Col xs={24} sm={12} md={6} lg={4}>
                <Card className="stat-card total-apartments" hoverable>
                  <Statistic
                    title={
                      <div className="stat-title">
                        <HomeOutlined style={{ marginLeft: 6 }} />
                        إجمالي الشقق
                      </div>
                    }
                    value={stats.total_apartments || 0}
                    valueStyle={{ 
                      color: '#1890ff',
                      fontSize: '28px',
                      fontWeight: '700'
                    }}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <Card className="stat-card available-apartments" hoverable>
                  <Statistic
                    title={
                      <div className="stat-title">
                        <CheckCircleOutlined style={{ marginLeft: 6 }} />
                        شقق متاحة
                      </div>
                    }
                    value={stats.available_apartments || 0}
                    valueStyle={{ 
                      color: '#52c41a',
                      fontSize: '28px',
                      fontWeight: '700'
                    }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <Card className="stat-card occupied-apartments" hoverable>
                  <Statistic
                    title={
                      <div className="stat-title">
                        <CloseCircleOutlined style={{ marginLeft: 6 }} />
                        شقق مشغولة
                      </div>
                    }
                    value={stats.occupied_apartments || 0}
                    valueStyle={{ 
                      color: '#ff4d4f',
                      fontSize: '28px',
                      fontWeight: '700'
                    }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <Card className="stat-card active-bookings" hoverable>
                  <Statistic
                    title={
                      <div className="stat-title">
                        <CalendarOutlined style={{ marginLeft: 6 }} />
                        حجوزات نشطة
                      </div>
                    }
                    value={stats.active_bookings || 0}
                    valueStyle={{ 
                      color: '#722ed1',
                      fontSize: '28px',
                      fontWeight: '700'
                    }}
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <Card className="stat-card occupancy-rate" hoverable>
                  <Statistic
                    title={
                      <div className="stat-title">
                        <PercentageOutlined style={{ marginLeft: 6 }} />
                        معدل الإشغال
                      </div>
                    }
                    value={((stats.occupied_apartments / stats.total_apartments) * 100 || 0).toFixed(1)}
                    valueStyle={{ 
                      color: '#faad14',
                      fontSize: '28px',
                      fontWeight: '700'
                    }}
                    suffix="%"
                    prefix={<PercentageOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Summary Row */}
            <Row justify="center" style={{ marginTop: 16 }}>
              <Col xs={24} md={16} lg={12}>
                <Card className="summary-card" style={{ textAlign: 'center' }}>
                  <Space size="large" wrap>
                    <div className="summary-item">
                      <Badge 
                        status="success" 
                        text={
                          <span style={{ color: '#52c41a', fontWeight: '600' }}>
                            متاح: {stats.available_apartments || 0}
                          </span>
                        } 
                      />
                    </div>
                    <div className="summary-item">
                      <Badge 
                        status="error" 
                        text={
                          <span style={{ color: '#ff4d4f', fontWeight: '600' }}>
                            مشغول: {stats.occupied_apartments || 0}
                          </span>
                        } 
                      />
                    </div>
                    <div className="summary-item">
                      <Badge 
                        status="processing" 
                        text={
                          <span style={{ color: '#1890ff', fontWeight: '600' }}>
                            الإجمالي: {stats.total_apartments || 0}
                          </span>
                        } 
                      />
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        </>
      )}
    </Card>
  );
};

export default ReceptionFilters; 