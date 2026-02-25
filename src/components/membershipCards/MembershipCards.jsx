import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import OfficersTable from './operations/OfficersTable/OfficersTable';
import BeneficiariesTable from './operations/BeneficiariesTable/BeneficiariesTable';
import SubscriptionsTable from './operations/SubscriptionsTable/SubscriptionsTable';
import CardQueue from './operations/CardQueue/CardQueue';
import MembershipReports from './reports/MembershipReports/MembershipReports';
import FinancialReports from './reports/FinancialReports/FinancialReports';
import OperationalReports from './reports/OperationalReports/OperationalReports';
import SubscriptionsReport from './reports/SubscriptionsReport/SubscriptionsReport';
import FeePlansManagement from './config/FeePlansManagement/FeePlansManagement';
import LookupsManagement from './config/LookupsManagement/LookupsManagement';
import './MembershipCards.scss';

const STORAGE_KEY_SECTION = 'mc_activeSection';
const STORAGE_KEY_TAB = 'mc_activeTab';
const STORAGE_KEY_OFFICER = 'mc_selectedOfficer';

const MembershipCards = () => {
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_SECTION) || 'operations';
  });
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_TAB) || 'officers';
  });
  const [selectedOfficer, setSelectedOfficer] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OFFICER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [cardQueueRefreshToken, setCardQueueRefreshToken] = useState(0);
  const { user } = useAuth();

  const handleCardIssued = () => {
    setCardQueueRefreshToken((prev) => prev + 1);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SECTION, activeSection);
  }, [activeSection]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TAB, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedOfficer) {
      localStorage.setItem(STORAGE_KEY_OFFICER, JSON.stringify(selectedOfficer));
    } else {
      localStorage.removeItem(STORAGE_KEY_OFFICER);
    }
  }, [selectedOfficer]);

  const sections = [
    {
      id: 'operations',
      label: 'العمليات',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M9 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      description: 'إدارة الضباط والمستفيدين والاشتراكات',
    },
    {
      id: 'reports',
      label: 'التقارير',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 14L11 10L15 14L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 8H21V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'تقارير العضويات والمالية والتشغيل',
    },
    {
      id: 'config',
      label: 'الإعدادات',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      description: 'خطط الرسوم والإعدادات',
    },
  ];

  const operationsTabs = [
    { 
      id: 'officers', 
      label: 'الضباط',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'إدارة بيانات الضباط'
    },
    { 
      id: 'beneficiaries', 
      label: 'المستفيدين',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'أفراد العائلة والمستفيدين'
    },
    { 
      id: 'subscriptions', 
      label: 'الاشتراكات',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 14H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 14H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 14H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 18H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      description: 'إدارة الاشتراكات والتجديدات'
    },
  ];

  const reportsTabs = [
    { 
      id: 'membership', 
      label: 'تقارير العضوية',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'إحصائيات العضويات'
    },
    { 
      id: 'financial', 
      label: 'التقارير المالية',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'الإيرادات والمصروفات'
    },
    { 
      id: 'subscriptions', 
      label: 'تقرير الاشتراكات',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      description: 'تقرير الاشتراكات المالية'
    },
    { 
      id: 'operational', 
      label: 'التقارير التشغيلية',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'تقارير العمليات والأداء'
    },
  ];

  const configTabs = [
    { 
      id: 'feePlans', 
      label: 'خطط الرسوم',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M1 10H23" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 16H6.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M10 16H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      description: 'إدارة خطط الاشتراك والرسوم'
    },
    { 
      id: 'lookups', 
      label: 'البيانات المرجعية',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'الرتب والتصنيفات'
    },
  ];

  const getCurrentTabs = () => {
    switch (activeSection) {
      case 'operations':
        return operationsTabs;
      case 'reports':
        return reportsTabs;
      case 'config':
        return configTabs;
      default:
        return [];
    }
  };

  useEffect(() => {
    // Reset tab only when section actually changes, not on every render
    const currentTabs = getCurrentTabs();
    const isValidTab = currentTabs.some(tab => tab.id === activeTab);

    // Only reset if current tab is not valid for current section
    if (!isValidTab) {
      if (activeSection === 'operations') {
        setActiveTab('officers');
      } else if (activeSection === 'reports') {
        setActiveTab('membership');
      } else if (activeSection === 'config') {
        setActiveTab('feePlans');
      }
    }
  }, [activeSection, activeTab]);

  const renderOperationsContent = () => {
    switch (activeTab) {
      case 'officers':
        return (
          <OfficersTable 
            onSelectOfficer={setSelectedOfficer}
            selectedOfficer={selectedOfficer}
          />
        );
      case 'beneficiaries':
        return (
          <BeneficiariesTable 
            selectedOfficer={selectedOfficer}
            onSelectOfficer={setSelectedOfficer}
          />
        );
      case 'subscriptions':
        return (
          <SubscriptionsTable 
            selectedOfficer={selectedOfficer}
            onCardIssued={handleCardIssued}
          />
        );
      default:
        return null;
    }
  };

  const renderReportsContent = () => {
    switch (activeTab) {
      case 'membership':
        return <MembershipReports />;
      case 'financial':
        return <FinancialReports />;
      case 'operational':
        return <OperationalReports />;
      case 'subscriptions':
        return <SubscriptionsReport />;
      default:
        return null;
    }
  };

  const renderConfigContent = () => {
    switch (activeTab) {
      case 'feePlans':
        return <FeePlansManagement />;
      case 'lookups':
        return <LookupsManagement />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'operations':
        return (
          <div className="membership-cards__operations-layout">
            <div className="membership-cards__main-panel">
              {renderOperationsContent()}
            </div>
            {selectedOfficer && (
            <div className="membership-cards__side-panel">
                <div className="membership-cards__card-queue-container">
              <CardQueue
                selectedOfficer={selectedOfficer}
                refreshTrigger={cardQueueRefreshToken}
              />
            </div>
              </div>
            )}
          </div>
        );
      case 'reports':
        return <div className="membership-cards__full-panel">{renderReportsContent()}</div>;
      case 'config':
        return <div className="membership-cards__full-panel">{renderConfigContent()}</div>;
      default:
        return null;
    }
  };

  return (
    <div className="membership-cards">
      {/* Header */}
      <div className="membership-cards__header">
        <div className="membership-cards__header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
            <circle cx="7" cy="14" r="1.5" fill="currentColor"/>
            <path d="M11 14H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="membership-cards__header-text">
          <h1 className="membership-cards__title">منظومة بطاقات العضوية</h1>
          <p className="membership-cards__subtitle">إدارة عضويات ضباط المشاة وأسرهم</p>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="membership-cards__sections">
        <div className="section-navigation">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`section-button ${activeSection === section.id ? 'section-button--active' : ''}`}
              onClick={() => setActiveSection(section.id)}
              title={section.description}
            >
              <span className="section-button__icon">{section.icon}</span>
              <span className="section-button__label">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="membership-cards__navigation">
        <div className="tab-navigation">
          {getCurrentTabs().map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'tab-button--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.description}
            >
              <span className="tab-button__icon">{tab.icon}</span>
              <span className="tab-button__label">{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Selected Officer Indicator */}
        {activeSection === 'operations' && selectedOfficer && (
          <div className="membership-cards__selected-indicator">
            <span className="selected-label">الضابط المحدد:</span>
            <span className="selected-value">{selectedOfficer.full_name}</span>
            <button 
              className="clear-selection"
              onClick={() => setSelectedOfficer(null)}
              title="إلغاء التحديد"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="membership-cards__content">
        {renderContent()}
      </div>
    </div>
  );
};

export default MembershipCards;
