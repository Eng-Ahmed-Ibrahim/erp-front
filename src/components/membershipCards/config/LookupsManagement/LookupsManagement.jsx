import React, { useState } from 'react';
import { RANKS, WEAPON_TYPES, RELATIONSHIP_TYPES, BENEFICIARY_TYPES } from '../../../../apis/membershipCards';
import './LookupsManagement.scss';

const LookupsManagement = () => {
  const [activeTab, setActiveTab] = useState('ranks');

  const tabs = [
    { id: 'ranks', label: 'الرتب', data: RANKS },
    { id: 'weapons', label: 'الأسلحة', data: WEAPON_TYPES },
    { id: 'relationships', label: 'صلات القرابة', data: RELATIONSHIP_TYPES },
    { id: 'beneficiaries', label: 'أنواع المستفيدين', data: BENEFICIARY_TYPES },
  ];

  const getCurrentData = () => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab ? tab.data : [];
  };

  return (
    <div className="lookups-management">
      {/* Header */}
      <div className="config-header">
        <div className="config-header__title">
          <h2>البيانات المرجعية</h2>
          <p>القيم الثابتة المستخدمة في النظام</p>
        </div>
        <div className="config-header__info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>هذه البيانات للقراءة فقط وتُعدّل من خلال الكود</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="lookups-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`lookup-tab ${activeTab === tab.id ? 'lookup-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className="lookup-tab__count">{tab.data.length}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="lookups-content">
        <table className="lookups-table">
          <thead>
            <tr>
              <th>#</th>
              <th>القيمة</th>
              <th>العرض</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentData().map((item, index) => (
              <tr key={item.value}>
                <td className="index-cell">{index + 1}</td>
                <td className="value-cell">
                  <code>{item.value}</code>
                </td>
                <td className="label-cell">{item.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info Section */}
      <div className="lookups-info">
        <h4>معلومات إضافية</h4>
        <div className="info-cards">
          {activeTab === 'ranks' && (
            <div className="info-card">
              <h5>الرتب العسكرية</h5>
              <p>
                تتدرج الرتب من ملازم إلى مشير. يتم استخدام هذه القيم 
                لتحديد رتبة الضابط عند التسجيل.
              </p>
            </div>
          )}
          {activeTab === 'weapons' && (
            <div className="info-card">
              <h5>الأسلحة / التخصصات</h5>
              <p>
                تحديد نوع السلاح أو التخصص للضابط. يُستخدم في 
                تصنيف وتقارير العضويات.
              </p>
            </div>
          )}
          {activeTab === 'relationships' && (
            <div className="info-card">
              <h5>صلات القرابة</h5>
              <p>
                تحديد علاقة المستفيد بالضابط. تؤثر على تحديد 
                خطة الرسوم المناسبة.
              </p>
            </div>
          )}
          {activeTab === 'beneficiaries' && (
            <div className="info-card">
              <h5>أنواع المستفيدين</h5>
              <p>
                التصنيفات المستخدمة في خطط الرسوم لتحديد 
                قيمة الرسوم المطبقة على كل فئة.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LookupsManagement;




