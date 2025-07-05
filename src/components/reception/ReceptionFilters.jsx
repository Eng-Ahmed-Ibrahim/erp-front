import React, { useEffect } from 'react';
import {
  Card,
  Select,
  Input,
  Button,
  Space,
  Row,
  Col,
  Badge,
  Statistic,
  Divider,
  DatePicker,
  Tooltip,
  Alert,
  Tag,
  message,
} from 'antd';
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
  PercentageOutlined,
  CloseOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import {
  ROOM_TYPES,
  ROOM_TYPE_LABELS,
} from '../../apis/reception/receptionApi';
import './ReceptionFilters.scss';
import moment from 'moment';

const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

const ReceptionFilters = ({
  buildings = [],
  filters = {},
  onFiltersChange,
  onSearch,
  searchValue = '',
  onClearFilters,
  showStats = false,
  stats = {},
  loading = false,
  // Availability filter props
  availabilityMode = false,
  dateRangeFilter = [],
  onDateRangeChange,
  onClearAvailabilityFilter,
  // Client types props
  clientTypes = [],
  clientTypesLoading = false,
}) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleClearAll = () => {
    onClearFilters();
    // Also clear availability filter
    if (onClearAvailabilityFilter) {
      onClearAvailabilityFilter();
    }
  };

  const activeFiltersCount =
    Object.values(filters).filter(Boolean).length + (availabilityMode ? 1 : 0);

  // Show warning message when availability mode is activated
  useEffect(() => {
    if (availabilityMode && dateRangeFilter.length === 2) {
      message.warning(
        `سيتم عرض الشقق المتاحة فقط للفترة من ${dateRangeFilter[0].format(
          'DD/MM/YYYY'
        )} إلى ${dateRangeFilter[1].format(
          'DD/MM/YYYY'
        )}. يمكنك اختيار الحجز الفوري أو المسبق من داخل نموذج الحجز.`,
        4 // Duration in seconds
      );
    }
  }, [availabilityMode, dateRangeFilter]);

  return (
    <div className="reception-filters-container">
      {/* Main Filters Section */}
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
            style={{
              color: '#ffff',
              backgroundColor: '#803D3B',
              '&:hover': {
                backgroundColor: '#803D3B',
              },
            }}
          >
            مسح الكل
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          {/* Availability Filter - Now as first filter */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <label
                className="filter-label"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 0,
                }}
              >
                <CalendarOutlined style={{ margin: 4 }} />
                فحص التوفر للفترة المحددة
                {availabilityMode && dateRangeFilter.length === 2 && (
                  <div style={{ margin: 4 }}>
                    <Space wrap>
                      <Tag color="blue" size="small">
                        {dateRangeFilter[1].diff(dateRangeFilter[0], 'days')}{' '}
                        أيام
                      </Tag>
                      {/* <Button
                        type="link"
                        size="small"
                        onClick={onClearAvailabilityFilter}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        Y\
                      </Button> */}
                    </Space>
                  </div>
                )}
              </label>
              <RangePicker
                value={dateRangeFilter}
                onChange={onDateRangeChange}
                placeholder={['تاريخ الوصول', 'تاريخ المغادرة']}
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                size="middle"
                disabledDate={(current) =>
                  current && current < moment().startOf('day')
                }
              />
            </div>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <label
                className="filter-label"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <HomeOutlined style={{ margin: 4 }} />
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
                {buildings.map((building) => (
                  <Option key={building.id} value={building.id}>
                    <Space>
                      <div
                        className="building-color-indicator"
                        style={{
                          backgroundColor:
                            building.color || building.color_code || '#1890ff',
                        }}
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
              <label
                className="filter-label"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <AppstoreOutlined style={{ margin: 4 }} />
                نوع الغرفة
              </label>
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

          {/* Client Type Filter */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <label
                className="filter-label"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <UserOutlined style={{ margin: 4 }} />
                نوع العميل
              </label>
              <Select
                style={{ width: '100%' }}
                placeholder="اختر نوع العميل"
                value={filters.client_type_id}
                onChange={(value) =>
                  handleFilterChange('client_type_id', value)
                }
                allowClear
                loading={clientTypesLoading}
              >
                {clientTypes?.map((clientType) => (
                  <Option key={clientType.id} value={clientType.id}>
                    {clientType.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
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
                        <div className="stat-title" style={{color: '#AF8260'}}>
                          <HomeOutlined style={{ margin: 4 }} />
                          إجمالي الشقق
                        </div>
                      }
                      value={stats.total_apartments || 0}
                      valueStyle={{
                        color: '#1890ff',
                        fontSize: '28px',
                        fontWeight: '700',
                      }}
                      prefix={<TeamOutlined />}
                    />
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={6} lg={4}>
                  <Card className="stat-card available-apartments" hoverable>
                    <Statistic
                      title={
                        <div
                          className="stat-title"
                          style={{ color: '#AF8260' }}
                        >
                          <CheckCircleOutlined style={{ margin: 4 }} />
                          شقق متاحة
                        </div>
                      }
                      value={stats.available_apartments || 0}
                      valueStyle={{
                        color: '#52c41a',
                        fontSize: '28px',
                        fontWeight: '700',
                      }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={6} lg={4}>
                  <Card className="stat-card occupied-apartments" hoverable>
                    <Statistic
                      title={
                        <div className="stat-title" style={{color: '#AF8260'}}>
                          <CloseCircleOutlined
                            style={{ color: '#AF8260', margin: 4 }}
                          />
                          شقق مشغولة
                        </div>
                      }
                      value={stats.occupied_apartments || 0}
                      valueStyle={{
                        color: '#ff4d4f',
                        fontSize: '28px',
                        fontWeight: '700',
                      }}
                      prefix={<CloseCircleOutlined />}
                    />
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={6} lg={4}>
                  <Card className="stat-card active-bookings" hoverable>
                    <Statistic
                      title={
                        <div className="stat-title" style={{color: '#AF8260'}}>
                          <CalendarOutlined
                            style={{ margin: 4,}}
                          />
                          حجوزات نشطة
                        </div>
                      }
                      value={stats.active_bookings || 0}
                      valueStyle={{
                        color: '#722ed1',
                        fontSize: '28px',
                        fontWeight: '700',
                      }}
                      prefix={<CalendarOutlined />}
                    />
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={6} lg={4}>
                  <Card className="stat-card occupancy-rate" hoverable>
                    <Statistic
                      title={
                        <div className="stat-title" style={{color: '#AF8260'}}>
                            <PercentageOutlined
                            style={{ margin: 4 }}
                          />
                          معدل الإشغال
                        </div>
                      }
                      value={(
                        (stats.occupied_apartments / stats.total_apartments) *
                          100 || 0
                      ).toFixed(1)}
                      valueStyle={{
                        color: '#faad14',
                        fontSize: '28px',
                        fontWeight: '700',
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
                  <Card
                    className="summary-card"
                    style={{ textAlign: 'center' }}
                  >
                    <Space size="large" wrap>
                      <div className="summary-item">
                        <Badge
                          status="success"
                          text={
                            <span
                              style={{ color: '#52c41a', fontWeight: '600' }}
                            >
                              متاح: {stats.available_apartments || 0}
                            </span>
                          }
                        />
                      </div>
                      <div className="summary-item" >
                        <Badge
                          status="error"
                          text={
                            <span
                              style={{ color: '#AF8260', fontWeight: '600' }}
                            >
                              مشغول: {stats.occupied_apartments || 0}
                            </span>
                          }
                        />
                      </div>
                      <div className="summary-item">
                        <Badge
                          status="processing"
                          text={
                            <span
                              style={{ color: '#1890ff', fontWeight: '600' }}
                            >
                              الإجمالي: {stats.total_apartments || 0}
                            </span>
                          }
                        />
                      </div>
                      {availabilityMode && (
                        <div className="summary-item">
                          <Badge
                            status="warning"
                            text={
                              <span
                                style={{ color: '#faad14', fontWeight: '600' }}
                              >
                                فحص التوفر مفعل
                              </span>
                            }
                          />
                        </div>
                      )}
                    </Space>
                  </Card>
                </Col>
              </Row>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ReceptionFilters;
