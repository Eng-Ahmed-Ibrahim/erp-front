import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Divider,
  Alert,
  Row,
  Col,
  Typography,
  message,
  Switch,
} from 'antd';
import moment from 'moment';
import { checkoutBooking } from '../../apis/reception/receptionApi';

const { Text } = Typography;

const CheckoutModal = ({ visible, onClose, booking, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [damageAmount, setDamageAmount] = useState(0);
  const [damageDescription, setDamageDescription] = useState('');
  const [finalPaymentAmount, setFinalPaymentAmount] = useState(0);
  const [isEarlyCheckout, setIsEarlyCheckout] = useState(false);
  const [earlyCheckoutReason, setEarlyCheckoutReason] = useState('');
  const [servicesRefundAmount, setServicesRefundAmount] = useState(0);

  useEffect(() => {
    if (visible && booking) {
      form.resetFields();
      setDamageAmount(0);
      setDamageDescription('');
      setIsEarlyCheckout(false);
      setEarlyCheckoutReason('');
      calculateServicesRefund();
    }
  }, [visible, booking]);

  const calculateServicesRefund = () => {
    if (!booking || !isEarlyCheckout) {
      setServicesRefundAmount(0);
      return;
    }

    let refundAmount = 0;
    const now = moment();
    const checkoutDate = moment(booking.checkout_datetime);
    const remainingDays = Math.max(0, checkoutDate.diff(now, 'days'));

    // Calculate refund for each service
    if (
      booking.additional_services &&
      Array.isArray(booking.additional_services)
    ) {
      booking.additional_services.forEach((service) => {
        if (service.is_per_day) {
          // Calculate remaining amount for per-day services
          const remainingAmount =
            service.price * service.quantity * remainingDays;
          // Apply 75% refund on remaining amount
          refundAmount += remainingAmount * 0.75;
        }
      });
    }

    setServicesRefundAmount(refundAmount);
  };

  useEffect(() => {
    calculateServicesRefund();
  }, [isEarlyCheckout]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const checkoutData = {
        damage_cost: damageAmount,
        damage_description: damageDescription.trim(),
        is_early_checkout: isEarlyCheckout,
        early_checkout_reason: isEarlyCheckout
          ? earlyCheckoutReason.trim()
          : null,
        services_refund_amount: servicesRefundAmount,
      };

      await checkoutBooking(booking.id, checkoutData);
      message.success('تم تسجيل الخروج بنجاح');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error during checkout:', error);
      message.error('حدث خطأ أثناء تسجيل الخروج');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateRefundAmount = () => {
    if (!booking) return 0;

    // If there's damage that costs more than insurance
    if (damageAmount >= booking.insurance_amount) {
      return 0;
    }

    // If there's no damage, refund full insurance
    if (damageAmount <= 0) {
      return booking.insurance_amount;
    }

    // If damage cost is less than insurance, refund the difference
    return booking.insurance_amount - damageAmount;
  };

  const calculateRemainingAmount = () => {
    if (!booking) return 0;

    let remaining = booking.remaining_amount || 0;

    // Add extra damage cost if it exceeds insurance amount
    if (damageAmount > booking.insurance_amount) {
      remaining += damageAmount - booking.insurance_amount;
    }

    // Subtract checkout discount if any
    const checkoutDiscount =
      form.getFieldValue('checkout_discount_amount') || 0;
    remaining -= checkoutDiscount;

    return Math.max(0, remaining);
  };

  return (
    <Modal
      title="تسجيل خروج"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="خروج مبكر">
              <Switch
                checked={isEarlyCheckout}
                onChange={(checked) => setIsEarlyCheckout(checked)}
              />
            </Form.Item>
          </Col>

          {isEarlyCheckout && (
            <Col span={24}>
              <Form.Item label="سبب الخروج المبكر" required={isEarlyCheckout}>
                <Input.TextArea
                  rows={2}
                  value={earlyCheckoutReason}
                  onChange={(e) => setEarlyCheckoutReason(e.target.value)}
                  placeholder="اذكر سبب الخروج المبكر..."
                />
              </Form.Item>
            </Col>
          )}

          <Col span={12}>
            <Form.Item label="تكلفة الأضرار">
              <InputNumber
                min={0}
                value={damageAmount}
                onChange={setDamageAmount}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="وصف الأضرار">
              <Input.TextArea
                rows={2}
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                placeholder="وصف الأضرار إن وجدت..."
              />
            </Form.Item>
          </Col>
        </Row>

        {isEarlyCheckout && servicesRefundAmount > 0 && (
          <Alert
            type="info"
            message="استرداد الخدمات الإضافية"
            description={
              <div>
                <p>
                  سيتم استرداد 75% من قيمة الخدمات الإضافية اليومية للأيام
                  المتبقية
                </p>
                <Text strong>
                  قيمة الاسترداد: {servicesRefundAmount.toFixed(2)} جنيه
                </Text>
              </div>
            }
            style={{ marginBottom: 16 }}
          />
        )}

        <Divider />

        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>إلغاء</Button>
            <Button type="primary" onClick={handleSubmit} loading={submitting}>
              تأكيد الخروج
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default CheckoutModal;
