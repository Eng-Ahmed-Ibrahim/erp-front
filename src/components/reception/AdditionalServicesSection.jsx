import React, { useEffect } from 'react';
import {
  Card,
  Typography,
  Spin,
  Row,
  Col,
  Button,
  InputNumber,
  Alert,
  Badge,
  Space,
  Tooltip,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

// Custom button styles
const buttonStyles = {
  add: {
    height: '32px',
    padding: '0 16px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f5f5f5',
    padding: '4px',
    borderRadius: '16px',
  },
};

const AdditionalServicesSection = ({
  additionalServices = [],
  selectedServices = [],
  onServiceSelect,
  onServiceQuantityChange,
  onServiceRemove,
  duration,
  loading = false,
}) => {
  // Debug effect for props
  useEffect(() => {
    console.log('=== ADDITIONAL SERVICES SECTION PROPS ===');
    console.log('Additional Services:', additionalServices);
    console.log('Selected Services:', selectedServices);
    console.log('Duration:', duration);
    console.log('Loading:', loading);
  }, [additionalServices, selectedServices, duration, loading]);

  const isServiceSelected = (serviceId) => {
    return selectedServices.some((s) => s.id === serviceId);
  };

  const getServiceQuantity = (serviceId) => {
    const service = selectedServices.find((s) => s.id === serviceId);
    return service ? service.quantity : 0;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', width: '100%' }}>
        <Spin size="large" />
        <div style={{ marginTop: 8 }}>جاري تحميل الخدمات الإضافية...</div>
      </div>
    );
  }

  if (!Array.isArray(additionalServices) || additionalServices.length === 0) {
    return (
      <div style={{ width: '100%' }}>
        <Alert
          type="info"
          message="لا توجد خدمات إضافية"
          description="لم يتم العثور على خدمات إضافية متاحة حالياً."
          showIcon
        />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]} style={{ width: '100%' }}>
      {additionalServices.map((service) => {
        const isSelected = isServiceSelected(service.id);
        const quantity = getServiceQuantity(service.id);
        const totalPrice = service.is_per_day
          ? service.price * quantity * (duration || 1)
          : service.price * quantity;

        return (
          <Col xs={24} sm={12} md={8} key={service.id}>
            <Card
              size="small"
              bordered
              className="service-card"
              style={{
                height: '100%',
                backgroundColor: isSelected ? '#f0f7ff' : 'white',
                borderColor: isSelected ? '#1890ff' : '#d9d9d9',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'visible',
              }}
              hoverable
            >
              <div style={{ minHeight: '120px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <Title level={5} style={{ margin: 0, marginBottom: '8px' }}>
                      {service.name}
                    </Title>
                    <Tag
                      color={service.is_per_day ? 'processing' : 'success'}
                      icon={
                        service.is_per_day ? (
                          <ClockCircleOutlined />
                        ) : (
                          <CheckCircleOutlined />
                        )
                      }
                      style={{
                        borderRadius: '12px',
                        padding: '0 8px',
                        height: '24px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontSize: '12px',
                      }}
                    >
                      {service.is_per_day ? 'سعر يومي' : 'سعر ثابت'}
                    </Tag>
                  </div>
                  <div>
                    {isSelected ? (
                      <div style={buttonStyles.controls}>
                        <Button
                          type="text"
                          size="small"
                          icon={<MinusOutlined />}
                          onClick={() => onServiceRemove(service.id)}
                          style={{ padding: '0 8px' }}
                          danger
                        />
                        <InputNumber
                          min={1}
                          size="small"
                          value={quantity}
                          onChange={(value) =>
                            onServiceQuantityChange(service.id, value)
                          }
                          style={{
                            width: '50px',
                            borderRadius: '8px',
                          }}
                          controls={false}
                        />
                      </div>
                    ) : (
                      <Tooltip title="إضافة للحجز">
                        <Button
                          type="primary"
                          size="middle"
                          onClick={() => onServiceSelect(service)}
                          style={buttonStyles.add}
                          icon={<ShoppingCartOutlined />}
                        >
                          إضافة
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {service.description && (
                  <Text
                    type="secondary"
                    style={{
                      fontSize: '13px',
                      display: 'block',
                      marginBottom: 8,
                    }}
                  >
                    {service.description}
                  </Text>
                )}

                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    right: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text strong>
                      {service.price} جنيه {service.is_per_day ? '/ يوم' : ''}
                    </Text>

                    {isSelected && (
                      <Text
                        strong
                        style={{
                          color: '#52c41a',
                        }}
                      >
                        الإجمالي: {totalPrice} جنيه
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default AdditionalServicesSection;
