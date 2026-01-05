import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import SubscriptionManagement from './cashier/SubscriptionManagement/SubscriptionManagement';
import QRCheckIn from './cashier/QRCheckIn/QRCheckIn';
import ActivitiesCashier from './cashier/ActivitiesCashier/ActivitiesCashier';
import AcademyManagement from './admin/AcademyManagement/AcademyManagement';
import OfferManagement from './admin/OfferManagement/OfferManagement';
import CoachManagement from './admin/CoachManagement/CoachManagement';
import AttendanceManagement from './admin/AttendanceManagement/AttendanceManagement';
import FinancialReports from './admin/FinancialReports/FinancialReports';
import './ActivitiesSubscriptions.scss';

const ActivitiesSubscriptions = () => {
  const [activeTab, setActiveTab] = useState('academies');
  const { user } = useAuth();

  const tabs = [
    {
      id: 'academies',
      label: ' الأكاديميات',
      component: AcademyManagement,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      role: 'admin',
      description: 'إدارة الأكاديميات والأنشطة',
    },
    {
      id: 'offers',
      label: ' العروض',
      component: OfferManagement,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H8M16 4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4M16 4C16 5.10457 15.1046 6 14 6H10C8.89543 6 8 5.10457 8 4"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
      role: 'admin',
      description: 'إنشاء وإدارة عروض الاشتراكات',
    },
    {
      id: 'coaches',
      label: ' المدربين',
      component: CoachManagement,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M12.5 7C12.5 9.20914 10.7091 11 8.5 11C6.29086 11 4.5 9.20914 4.5 7C4.5 4.79086 6.29086 3 8.5 3C10.7091 3 12.5 4.79086 12.5 7ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      role: 'admin',
      description: 'إدارة المدربين والأكاديميات',
    },
    {
      id: 'subscriptions',
      label: ' الاشتراكات',
      component: SubscriptionManagement,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
      role: 'cashier',
      description: 'إنشاء وإدارة اشتراكات العملاء',
    },
    {
      id: 'attendance',
      label: 'الحضور',
      component: AttendanceManagement,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M12.5 7C12.5 9.20914 10.7091 11 8.5 11C6.29086 11 4.5 9.20914 4.5 7C4.5 4.79086 6.29086 3 8.5 3C10.7091 3 12.5 4.79086 12.5 7ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      role: 'admin',
      description: 'عرض وإدارة الحضور لكل اشتراك',
    },
    {
      id: 'financial-reports',
      label: 'التقارير المالية',
      component: FinancialReports,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 17V7M13 17V7M17 17V7M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      role: 'admin',
      description: 'التقارير المالية لاشتراكات الأنشطة',
    },
    // {
    //   id: 'cashier',
    //   label: 'كاشير الأنشطة',
    //   component: ActivitiesCashier,
    //   icon: (
    //     <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    //       <path d="M3 3H7V7H3V3Z" stroke="currentColor" strokeWidth="2" />
    //       <path d="M17 3H21V7H17V3Z" stroke="currentColor" strokeWidth="2" />
    //       <path d="M3 17H7V21H3V17Z" stroke="currentColor" strokeWidth="2" />
    //       <path d="M17 17H21V21H17V17Z" stroke="currentColor" strokeWidth="2" />
    //       <path d="M7 3H17V7" stroke="currentColor" strokeWidth="2" />
    //       <path d="M7 17H17V21" stroke="currentColor" strokeWidth="2" />
    //       <path d="M3 7V17" stroke="currentColor" strokeWidth="2" />
    //       <path d="M21 7V17" stroke="currentColor" strokeWidth="2" />
    //     </svg>
    //   ),
    //   role: 'cashier',
    //   description: 'تسجيل اشتراكات جديدة للعملاء',
    // },
    {
      id: 'checkin',
      label: 'تسجيل الحضور',
      component: QRCheckIn,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 3H7V7H3V3Z" stroke="currentColor" strokeWidth="2" />
          <path d="M17 3H21V7H17V3Z" stroke="currentColor" strokeWidth="2" />
          <path d="M3 17H7V21H3V17Z" stroke="currentColor" strokeWidth="2" />
          <path d="M17 17H21V21H17V17Z" stroke="currentColor" strokeWidth="2" />
          <path d="M7 3H17V7" stroke="currentColor" strokeWidth="2" />
          <path d="M7 17H17V21" stroke="currentColor" strokeWidth="2" />
          <path d="M3 7V17" stroke="currentColor" strokeWidth="2" />
          <path d="M21 7V17" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      role: 'cashier',
      description: 'مسح رمز QR لتسجيل حضور العملاء',
    },
  ];

  const availableTabs = tabs.filter((tab) => {
    // if (tab.role === 'admin') {
    //   return true;
    // user?.roles?.some((role) => role.name === 'admin')
    // ||
    // user?.permissions?.some(
    //   (permission) => permission.name === 'view activities subscriptions'
    // )
    // }
    return true; // Cashier tabs are available to all users
  });

  const activeTabData = availableTabs.find((tab) => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  useEffect(() => {
    if (!availableTabs.find((tab) => tab.id === activeTab)) {
      setActiveTab(availableTabs[0]?.id || 'cashier');
    }
  }, [availableTabs, activeTab]);

  return (
    <div className="activities-subscriptions">
      <div className="activities-subscriptions__header">
        {/* <div className="activities-subscriptions__header-content"> */}
        <h1 className="activities-subscriptions__title">اشتراكات الأنشطة</h1>
        {/* </div> */}
      </div>

      <div className="activities-subscriptions__navigation">
        <div className="tab-navigation">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${
                activeTab === tab.id ? 'tab-button--active' : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.description}
            >
              <span className="tab-button__icon">{tab.icon}</span>
              <span className="tab-button__label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="activities-subscriptions__content">
        {ActiveComponent ? (
          <ActiveComponent />
        ) : (
          <div className="no-access-message">
            <div className="no-access-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h3>لا يوجد وصول</h3>
            <p>ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesSubscriptions;
