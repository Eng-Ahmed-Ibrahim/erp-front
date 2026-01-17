import React, { useState, useEffect } from 'react';
import {
  getOfficerCards,
  markCardPrinted,
  markCardEncoded,
  revokeCard,
  writeCardData,
  CARD_STATUSES,
  RELATIONSHIP_TYPES
} from '../../../../apis/membershipCards';
import './CardQueue.scss';

// Card color themes based on member type
const CARD_THEMES = {
  blue: {
    id: 'blue',
    label: 'مشاة',
    primary: '#1e40af',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1e3a8a 100%)',
    stripColor: '#60a5fa',
  },
  red: {
    id: 'red',
    label: 'لواء',
    primary: '#991b1b',
    secondary: '#dc2626',
    accent: '#f87171',
    gradient: 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #7f1d1d 100%)',
    stripColor: '#fca5a5',
  },
  brown: {
    id: 'brown',
    label: 'أبناء (فوق 6 سنوات)',
    primary: '#78350f',
    secondary: '#a16207',
    accent: '#fbbf24',
    gradient: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #451a03 100%)',
    stripColor: '#fbbf24',
  },
  yellow: {
    id: 'yellow',
    label: 'أسلحة أخرى',
    primary: '#854d0e',
    secondary: '#ca8a04',
    accent: '#facc15',
    gradient: 'linear-gradient(135deg, #854d0e 0%, #a16207 50%, #713f12 100%)',
    stripColor: '#fde047',
  },
};

const CardQueue = ({ selectedOfficer }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const filters = [
    {
      id: 'all',
      label: 'الكل',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
          <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
          <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
          <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      color: '#6b7280'
    },
    {
      id: 'active',
      label: 'نشطة',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      color: '#10b981'
    },
    {
      id: 'pending',
      label: 'قيد المعالجة',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      color: '#f59e0b'
    },
    {
      id: 'expired',
      label: 'منتهية',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      color: '#ef4444'
    },
  ];

  useEffect(() => {
    if (selectedOfficer?.id) {
      fetchCards();
    } else {
      setCards([]);
    }
  }, [selectedOfficer?.id, activeFilter]);

  const fetchCards = async () => {
    if (!selectedOfficer?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getOfficerCards(selectedOfficer.id);
      let filteredCards = response.data || [];

      // Apply filter
      if (activeFilter !== 'all') {
        if (activeFilter === 'pending') {
          filteredCards = filteredCards.filter(card => !card.is_printed || !card.is_encoded);
        } else {
          filteredCards = filteredCards.filter(card => card.status === activeFilter);
        }
      }

      setCards(filteredCards);
    } catch (err) {
      setError('حدث خطأ في تحميل البيانات');
      console.error('Error fetching cards:', err);
    } finally {
      setLoading(false);
    }
  };

  // Determine card color theme based on officer/beneficiary data
  const getCardTheme = (card) => {
    // Use card's actual data (officer or beneficiary from subscription)
    const beneficiary = card.beneficiary;
    const officer = card.officer || selectedOfficer; // Use card's officer if available, fallback to selectedOfficer

    // Red: لواء rank
    if (officer?.rank === 'لواء') {
      return CARD_THEMES.red;
    }

    // Brown: Children above age 6
    if (beneficiary?.birth_date) {
      const birthDate = new Date(beneficiary.birth_date);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age > 6) {
        return CARD_THEMES.brown;
      }
    }

    // Blue: Infantry officers
    if (officer?.weapon_type === 'infantry' || officer?.is_infantry) {
      return CARD_THEMES.blue;
    }

    // Yellow: Other weapons (non-infantry)
    if (officer?.weapon_type && officer.weapon_type !== 'infantry') {
      return CARD_THEMES.yellow;
    }

    // Default to blue for infantry
    return CARD_THEMES.blue;
  };

  // Get relationship type label
  const getRelationshipLabel = (relationshipType) => {
    if (!relationshipType) return '';
    if (typeof relationshipType !== 'string') return String(relationshipType || '');
    const found = RELATIONSHIP_TYPES.find(r => r.value === relationshipType);
    return found ? found.label : String(relationshipType);
  };

  // Get card holder info (officer or beneficiary)
  const getCardHolder = (card) => {
    // Priority: Use card's actual data (officer or beneficiary from subscription)
    const cardOfficer = card.officer;
    const cardBeneficiary = card.beneficiary;

    // Use card.photo directly (already set to correct photo: officer or beneficiary)
    const cardPhoto = card.photo || null;

    // If card is for officer and has officer data
    if (card.is_for_officer && cardOfficer) {
      return {
        type: 'officer',
        name: String(cardOfficer.full_name || ''),
        rank: String(cardOfficer.rank || ''),
        membership_number: String(cardOfficer.membership_number || ''),
        seniority_number: String(cardOfficer.seniority_number || ''),
        national_id: String(cardOfficer.national_id || ''),
        photo: cardPhoto,
        label: 'ضابط'
      };
    }

    // If card is for beneficiary and has beneficiary data
    if (cardBeneficiary) {
      const relationshipLabel = getRelationshipLabel(cardBeneficiary.relationship_type);
      return {
        type: 'beneficiary',
        name: String(cardBeneficiary.full_name || ''),
        relationship: String(relationshipLabel || ''),
        relationshipValue: cardBeneficiary.relationship_type,
        national_id: String(cardBeneficiary.national_id || ''),
        photo: cardPhoto,
        label: 'مستفيد'
      };
    }

    // Fallback: Use selected officer if no card data available
    if (selectedOfficer) {
      return {
        type: 'officer',
        name: String(selectedOfficer.full_name || ''),
        rank: String(selectedOfficer.rank || ''),
        membership_number: String(selectedOfficer.membership_number || ''),
        seniority_number: String(selectedOfficer.seniority_number || ''),
        national_id: String(selectedOfficer.national_id || ''),
        photo: selectedOfficer.photo || null,
        label: 'ضابط'
      };
    }

    // Empty fallback
    return {
      type: 'officer',
      name: '-',
      rank: '-',
      membership_number: '-',
      seniority_number: '-',
      national_id: '-',
      photo: null,
      label: 'ضابط'
    };
  };

  // Get the default theme for the officer (for display when no specific card)
  const getOfficerTheme = () => {
    const officer = selectedOfficer;

    if (officer?.rank === 'لواء') {
      return CARD_THEMES.red;
    }

    if (officer?.weapon_type === 'infantry' || officer?.is_infantry) {
      return CARD_THEMES.blue;
    }

    if (officer?.weapon_type && officer.weapon_type !== 'infantry') {
      return CARD_THEMES.yellow;
    }

    return CARD_THEMES.blue;
  };

  const handlePrintCard = (card) => {
    const theme = getCardTheme(card);
    const holder = getCardHolder(card);
    // Get officer theme for photo border (always use officer's theme)
    const cardOfficer = card.officer || selectedOfficer;
    let officerThemeForBorder = CARD_THEMES.blue; // Default
    if (cardOfficer?.rank === 'لواء') {
      officerThemeForBorder = CARD_THEMES.red;
    } else if (cardOfficer?.weapon_type === 'infantry' || cardOfficer?.is_infantry) {
      officerThemeForBorder = CARD_THEMES.blue;
    } else if (cardOfficer?.weapon_type && cardOfficer.weapon_type !== 'infantry') {
      officerThemeForBorder = CARD_THEMES.yellow;
    }
    const origin = window.location.origin;
    const photoUrl = holder.photo
      ? (holder.photo.startsWith('http') ? holder.photo : origin + holder.photo)
      : null;
    const egyptianSymbolsUrl = `${origin}/assets/images/Ancient-Egyptian-Symbols-Egypt-Tours-Portal-removebg-preview.png`;

    // Format dates for display
    const issueDateFormatted = card.created_at
      ? (typeof card.created_at === 'string'
        ? new Date(card.created_at).toLocaleDateString('ar-EG')
        : String(card.created_at))
      : null;
    const expiryDateFormatted = card.expiry_date
      ? (typeof card.expiry_date === 'string'
        ? new Date(card.expiry_date).toLocaleDateString('ar-EG')
        : String(card.expiry_date))
      : null;

    // Create print window - optimized for card printing
    const printWindow = window.open('', '_blank', 'width=400,height=300');

    if (!printWindow) {
      setError('يرجى السماح بالنوافذ المنبثقة لاستخدام ميزة الطباعة');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>طباعة بطاقة عضوية - ${holder.name || 'غير محدد'}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&display=swap" rel="stylesheet">
        <style>
          @page {
            size: 54mm 85mm;
            margin: 0;
            padding: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html {
            width: 54mm;
            height: 85mm;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Cairo', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            width: 54mm;
            height: 85mm;
            background: #ffffff;
            direction: rtl;
            overflow: hidden;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .card-design {
            width: 85mm;
            height: 54mm;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-90deg);
            overflow: hidden;
            border-radius: 0;
            background: #ffffff;
            margin: 0;
            padding: 0;
          }
          .card-design__background {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #ffffff;
            z-index: 0;
          }
          .card-design__top-border {
            position: absolute;
            top: 0;
            left: 50%;
            right: 0;
            height: 10%;
            z-index: 2;
            overflow: hidden;
          }
          .card-design__top-border::before {
            content: '';
            position: absolute;
            inset: 0;
            opacity: 0.35;
            filter: sepia(100%) saturate(250%) hue-rotate(10deg) brightness(0.7);
            pointer-events: none;
          }
          .card-design__top-border::after {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 0 0 0 20px;
            mask-composite: exclude;
            padding: 3px;
            z-index: 1;
          }
          .card-design__bottom-border {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 50%;
            height: 10%;
            z-index: 2;
            overflow: hidden;
          }
          .card-design__bottom-border::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0.35;
            filter: sepia(100%) saturate(250%) hue-rotate(10deg) brightness(0.7);
          }
          .card-design__bottom-border::after {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 0 20px 0 0;
            padding: 3px;
          }
          .card-design__org-name {
            position: absolute;
            top: 1%;
            left: 2%;
            font-size: 0.85rem;
            font-weight: 900;
            color: #0a1a2a;
            font-family: 'Cairo', sans-serif;
            letter-spacing: 0.3px;
            white-space: nowrap;
            z-index: 4;
            text-align: left;
            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
            line-height: 1.2;
          }
          .card-design__photo-container {
            position: absolute;
            top: 28%;
            left: 3%;
            width: 21%;
            aspect-ratio: 1;
            border-radius: 4px;
            border: 2px solid var(--card-photo-border, #0a1a2a);
            overflow: hidden;
            background: #f8f8f8;
            z-index: 4;
          }
          .card-design__photo-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
          .card-design__photo-placeholder {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }
          .card-design__photo-placeholder::before {
            content: '';
            position: absolute;
            width: 60%;
            height: 60%;
            background: linear-gradient(135deg, #d0d0d0 0%, #c0c0c0 100%);
            border-radius: 4px;
            opacity: 0.5;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          .card-design__photo-placeholder::after {
            content: '👤';
            font-size: 1.5rem;
            opacity: 0.3;
            position: relative;
            z-index: 1;
            filter: grayscale(100%);
          }

          .card-design__date-row {
            display: flex;
            flex-direction: row;
            align-items: baseline;
            gap: 0.25rem;
            line-height: 1.1;
            position: absolute;
            bottom: 19%;
            left: 4%;
          }
          .card-design__date-label {
            font-size: 0.45rem;
            font-weight: 700;
            color: #0a1a2a;
            font-family: 'Cairo', sans-serif;
            letter-spacing: 0.03px;
            opacity: 0.85;
            white-space: nowrap;
          }
          .card-design__date-value {
            font-size: 0.42rem;
            font-weight: 600;
            color: #1a1a1a;
            font-family: 'Cairo', sans-serif;
            letter-spacing: 0.02px;
            opacity: 0.9;
            direction: rtl;
            text-align: right;
            white-space: nowrap;
          }
          .card-design__honorary-membership {
            position: absolute;
            top: 62%;
            left: 3%;
            width: 21%;
            text-align: center;
            font-size: 0.45rem;
            font-weight: 900;
            text-stroke: 1px #000;
            color: #991b1b;
            font-family: 'Cairo', sans-serif;
            letter-spacing: 0.05px;
            z-index: 4;
            margin-top: 0.2rem;
          }
          .card-design__logo-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 42%;
            max-width: 115px;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            opacity: 0.3;
          }
          .card-design__logo {
            width: 100%;
            height: auto;
            object-fit: contain;
            filter: grayscale(70%) brightness(0.7);
          }
          .card-design__info-section {
            position: absolute;
            top: 21%;
            right: 3%;
            width: 68%;
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
            z-index: 4;
            padding: 0;
            margin: 0;
          }
          .card-design__signature {
            position: absolute;
            bottom: 18%;
            left: 43%;
            transform: translateX(-50%);
            width: 50%;
            text-align: center;
            z-index: 4;
          }
          .card-design__signature-line {
            width: 45%;
            height: 1.5px;
            background: #0a1a2a;
            margin: 0 auto 0.25rem auto;
            opacity: 0.9;
          }
          .card-design__signature-title {
            font-size: 0.52rem;
            font-weight: 700;
            color: #0a1a2a;
            font-family: 'Cairo', sans-serif;
            letter-spacing: 0.15px;
            opacity: 0.95;
            line-height: 1.2;
            margin-left: -15px;
          }
          .card-info-field {
            display: flex;
            align-items: baseline;
            gap: 0.3rem;
            direction: rtl;
            font-family: 'Cairo', sans-serif;
            line-height: 1.3;
          }
          .card-info-label {
            font-size: 0.7rem;
            font-weight: 900;
            color: #0a1a2a;
            min-width: fit-content;
            white-space: nowrap;
            flex-shrink: 0;
            letter-spacing: 0.09px;
            line-height: 1.3;
          }
          .card-info-value {
            font-size: 0.7rem;
            font-weight: 900;
            color: #1a1a1a;
            flex: 1;
            text-align: right;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            min-width: 0;
            letter-spacing: 0.04px;
            line-height: 1.3;
          }
          .card-info-value--national-id {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            word-break: normal;
          }
          .card-info-value--full-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            word-break: normal;
            flex-shrink: 0;
          }
          @media print {
            @page {
              size: 54mm 85mm;
              margin: 0;
              padding: 0;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 54mm !important;
              height: 85mm !important;
              overflow: hidden !important;
              background: white !important;
            }
            .card-design {
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              width: 85mm !important;
              height: 54mm !important;
              border-radius: 0 !important;
              position: fixed !important;
              top: 50% !important;
              left: 50% !important;
              transform: translate(-50%, -50%) rotate(-90deg) !important;
              overflow: hidden !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            img {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="card-design" style="--card-photo-border: ${officerThemeForBorder.primary};">
          <div class="card-design__background"></div>
          <div class="card-design__top-border"></div>
          <div class="card-design__bottom-border"></div>
          <div class="card-design__org-name"></div>
          <div class="card-design__photo-container" style="border-color: ${officerThemeForBorder.primary};">
            ${photoUrl ? `<img src="${photoUrl}" alt="${holder.name}" class="card-design__photo-img" />` : '<div class="card-design__photo-placeholder"></div>'}
          </div>
          ${card.subscription?.is_honorary_membership ? `
          <div class="card-design__honorary-membership">
            عضويه فخريه
          </div>
          ` : ''}
        
            ${(card.show_expiry_date !== false && expiryDateFormatted) ? `
            <div class="card-design__date-row">
              <span class="card-design__date-label">انتهاء:</span>
              <span class="card-design__date-value">${expiryDateFormatted}</span>
            </div>
            ` : ''}
          
          
          <div class="card-design__info-section">
            <div class="card-info-field">
              <span class="card-info-label">عضوية:</span>
              <span class="card-info-value">${card.subscription_id || '-'}</span>
            </div>
            <div class="card-info-field">
              <span class="card-info-label">الصفه:</span>
              <span class="card-info-value card-info-value--full-text" style="margin-left: 2.8rem;">${holder.type === 'officer' ? 'سيادته' : (holder.relationship || getRelationshipLabel(card.beneficiary?.relationship_type) || '-')}</span>
              <span class="card-info-label" style="margin-right: 1rem;">الرتبه:</span>
              <span class="card-info-value card-info-value--full-text">${holder.type === 'officer' ? (holder.rank || card.officer?.rank || '-') : (card.officer?.rank || '-')}</span>
            </div>
            <div class="card-info-field">
              <span class="card-info-label">إسم:</span>
              <span class="card-info-value">${holder.name || '-'}</span>
            </div>
            <div class="card-info-field">
              <span class="card-info-label">ت ش:</span>
              <span class="card-info-value">${holder.membership_number || card.officer?.membership_number || '-'}</span>
            </div>
            <div class="card-info-field">
              <span class="card-info-label">رقم قومي:</span>
              <span class="card-info-value card-info-value--national-id">${holder.national_id || card.officer?.national_id || card.beneficiary?.national_id || '-'}</span>
            </div>
          </div>
          <div class="card-design__signature">
            <div class="card-design__signature-line"></div>
            <div class="card-design__signature-title">رئيس مجلس الإدارة</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleMarkPrinted = async (cardId) => {
    try {
      setProcessingId(cardId);

      // Find the card to print
      const card = cards.find(c => c.id === cardId);
      if (!card) {
        setError('البطاقة غير موجودة');
        return;
      }

      // Open print dialog
      handlePrintCard(card);

      // Mark as printed after a short delay to allow print dialog to open
      setTimeout(async () => {
        try {
          await markCardPrinted(cardId);
          fetchCards();
        } catch (err) {
          setError('حدث خطأ في تحديث حالة الطباعة');
        } finally {
          setProcessingId(null);
        }
      }, 500);
    } catch (err) {
      setError('حدث خطأ في فتح نافذة الطباعة');
      setProcessingId(null);
    }
  };

  const handleMarkEncoded = async (cardId) => {
    try {
      setProcessingId(cardId);

      // Find the card to get token and UID
      const card = cards.find(c => c.id === cardId);
      if (!card) {
        setError('البطاقة غير موجودة');
        return;
      }

      // Check if card has token hex
      if (!card.card_token_hex) {
        setError('البطاقة لا تحتوي على رمز تشفير. يرجى إعادة إصدار البطاقة.');
        return;
      }

      // Write data to card via Laravel API
      await writeCardData(
        card.card_uid, // Card UID
        card.card_token_hex, // Token hex to write
        4 // Block number
      );

      // Mark as encoded in database
      await markCardEncoded(cardId, []);
      fetchCards();
    } catch (err) {
      console.error('Error encoding card:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'حدث خطأ في كتابة البيانات على البطاقة'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevoke = async (cardId) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذه البطاقة؟')) return;

    try {
      setProcessingId(cardId);
      await revokeCard(cardId);
      fetchCards();
    } catch (err) {
      setError('حدث خطأ في إلغاء البطاقة');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (card) => {
    let status = card.status;
    let label = '';

    if (card.is_revoked) {
      status = 'revoked';
      label = 'ملغية';
    } else if (card.is_expired) {
      status = 'expired';
      label = 'منتهية';
    } else if (!card.is_printed) {
      status = 'pending';
      label = 'تنتظر الطباعة';
    } else if (!card.is_encoded) {
      status = 'pending';
      label = 'تنتظر التشفير';
    } else if (card.is_active) {
      status = 'active';
      label = 'نشطة';
    }

    const statusInfo = CARD_STATUSES.find(s => s.value === status);

    return (
      <span
        className={`card-status card-status--${status}`}
        style={{ '--status-color': statusInfo?.color || '#6b7280' }}
      >
        {label || statusInfo?.label || status}
      </span>
    );
  };

  // No officer selected state
  if (!selectedOfficer) {
    return (
      <div className="card-queue">
        <div className="card-queue__header">
          <h3 className="card-queue__title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
              <circle cx="6" cy="14" r="1" fill="currentColor" />
              <path d="M10 14H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            بطاقات الضابط
          </h3>
        </div>

        <div className="card-queue__empty-officer">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
          </svg>
          <p>اختر ضابطاً لعرض بطاقاته</p>
          <span>انقر على صف في جدول الضباط لعرض بطاقاته هنا</span>
        </div>
      </div>
    );
  }

  const officerTheme = getOfficerTheme();

  return (
    <div className="card-queue">
      {/* Header */}
      <div className="card-queue__header" style={{ background: officerTheme.gradient }}>
        <h3 className="card-queue__title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
            <circle cx="6" cy="14" r="1" fill="currentColor" />
            <path d="M10 14H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          بطاقات {selectedOfficer.full_name}
        </h3>
        <span className="card-queue__theme-badge" style={{ backgroundColor: officerTheme.accent }}>
          {officerTheme.label}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="card-queue__tabs">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`queue-tab ${activeFilter === filter.id ? 'queue-tab--active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
            style={{ '--queue-color': filter.color }}
          >
            <span className="queue-tab__icon">{filter.icon}</span>
            <span className="queue-tab__label">{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && <div className="card-queue__error">{error}</div>}

      {/* Cards List */}
      <div className="card-queue__list">
        {loading ? (
          <div className="card-queue__loading">
            <div className="loading-spinner"></div>
            <span>جاري التحميل...</span>
          </div>
        ) : cards.length === 0 ? (
          <div className="card-queue__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
              <path d="M6 15H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p>لا توجد بطاقات لهذا الضابط</p>
          </div>
        ) : (
          cards.map((card) => {
            const theme = getCardTheme(card);
            const holder = getCardHolder(card);
            // Get officer theme for photo border (always use officer's theme)
            const cardOfficer = card.officer || selectedOfficer;
            let officerThemeForBorder = CARD_THEMES.blue; // Default
            if (cardOfficer?.rank === 'لواء') {
              officerThemeForBorder = CARD_THEMES.red;
            } else if (cardOfficer?.weapon_type === 'infantry' || cardOfficer?.is_infantry) {
              officerThemeForBorder = CARD_THEMES.blue;
            } else if (cardOfficer?.weapon_type && cardOfficer.weapon_type !== 'infantry') {
              officerThemeForBorder = CARD_THEMES.yellow;
            }
            return (
              <div key={card.id} className={`card-item card-item--${theme.id}`}>
                {/* Card Preview */}
                <div
                  className="card-item__preview"
                  style={{
                    '--card-primary': theme.primary,
                    '--card-secondary': theme.secondary,
                    '--card-accent': theme.accent,
                    '--card-gradient': theme.gradient,
                    '--card-strip': theme.stripColor,
                    '--card-photo-border': officerThemeForBorder.primary,
                  }}
                >
                  <div className="card-design">
                    {/* Card Background - White */}
                    <div className="card-design__background"></div>

                    {/* Top Decorative Border */}
                    <div className="card-design__top-border"></div>

                    {/* Bottom Decorative Border */}
                    <div className="card-design__bottom-border"></div>

                    {/* Top Left: Organization Name */}
                    <div className="card-design__org-name">دار ضباط المشاة</div>

                    {/* Left Center: Photo */}
                    <div className="card-design__photo-container">
                      {holder.photo ? (
                        <img
                          src={holder.photo}
                          alt={holder.name}
                          className="card-design__photo-img"
                          onError={(e) => {
                            // If image fails to load, show placeholder
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="card-design__photo-placeholder"></div>';
                          }}
                        />
                      ) : (
                        <div className="card-design__photo-placeholder"></div>
                      )}
                    </div>

                    {/* Honorary Membership Text - Under Photo */}
                    {card.subscription?.is_honorary_membership && (
                      <div className="card-design__honorary-membership">
                        عضويه فخريه
                      </div>
                    )}

                    {/* Left Bottom: Issue and Expiry Dates (same line as signature) */}
                    <div className="card-design__dates">
                      {card.created_at && (
                        <div className="card-design__date-row">
                          <span className="card-design__date-label">إصدار:</span>
                          <span className="card-design__date-value">
                            {typeof card.created_at === 'string'
                              ? new Date(card.created_at).toLocaleDateString('ar-EG')
                              : String(card.created_at)}
                          </span>
                        </div>
                      )}
                      {card.show_expiry_date !== false && card.expiry_date && (
                        <div className="card-design__date-row">
                          <span className="card-design__date-label">انتهاء:</span>
                          <span className="card-design__date-value">
                            {typeof card.expiry_date === 'string'
                              ? new Date(card.expiry_date).toLocaleDateString('ar-EG')
                              : String(card.expiry_date)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Center: Logo */}
                    <div className="card-design__logo-container">
                      <img
                        src="/assets/images/transparent-card-logo.PNG"
                        alt="Infantry House Logo"
                        className="card-design__logo"
                      />
                    </div>

                    {/* Right Side: Information Fields */}
                    <div className="card-design__info-section">
                      <div className="card-info-field">
                        <span className="card-info-label">عضوية:</span>
                        <span className="card-info-value">{String(card.subscription_id || '-')}</span>
                      </div>
                      <div className="card-info-field">
                        <span className="card-info-label">الصفه:</span>
                        <span className="card-info-value card-info-value--full-text" style={{ marginLeft: '2.8rem' }}>
                          {holder.type === 'officer'
                            ? 'سيادته'
                            : String(holder.relationship || getRelationshipLabel(card.beneficiary?.relationship_type) || '-')}
                        </span>
                        <span className="card-info-label" >الرتبه:</span>
                        <span className="card-info-value card-info-value--full-text" >
                          {String(
                            holder.type === 'officer'
                              ? (holder.rank || card.officer?.rank || '-')
                              : (card.officer?.rank || '-')
                          )}
                        </span>
                      </div>
                      <div className="card-info-field">
                        <span className="card-info-label">إسم:</span>
                        <span className="card-info-value">{String(holder.name || '-')}</span>
                      </div>
                      {/* ت ش: Only show for officers */}
                      <div className="card-info-field">
                        <span className="card-info-label">ت ش:</span>
                        <span className="card-info-value">
                          {String(holder.membership_number || card.officer?.membership_number || '-')}
                        </span>
                      </div>

                      <div className="card-info-field">
                        <span className="card-info-label">رقم قومي:</span>
                        <span className="card-info-value card-info-value--national-id">
                          {String(holder.national_id || card.officer?.national_id || card.beneficiary?.national_id || '-')}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Signature Line */}
                    <div className="card-design__signature">
                      <div className="card-design__signature-line"></div>
                      <div className="card-design__signature-title">رئيس مجلس الإدارة</div>
                    </div>
                  </div>
                </div>

                <div className="card-item__header">
                  <div className="card-item__holder-info">
                    <span className="card-item__uid">{String(card.card_uid_formatted || card.card_uid || '-')}</span>
                    <span className="card-item__holder-type">
                      {holder.type === 'officer' ? '👤 ضابط' : '👥 مستفيد'}
                    </span>
                  </div>
                  {getStatusBadge(card)}
                </div>

                <div className="card-item__info">
                  <div className="info-row">
                    <span className="info-label">تاريخ الانتهاء:</span>
                    <span className="info-value">
                      {card.expiry_date
                        ? (typeof card.expiry_date === 'string'
                          ? new Date(card.expiry_date).toLocaleDateString('ar-EG')
                          : String(card.expiry_date))
                        : '-'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">أيام متبقية:</span>
                    <span className="info-value" style={{
                      color: (Number(card.days_until_expiry) || 0) < 30 ? '#ef4444' :
                        (Number(card.days_until_expiry) || 0) < 90 ? '#f59e0b' : '#10b981'
                    }}>
                      {(Number(card.days_until_expiry) || 0) > 0 ? `${Number(card.days_until_expiry) || 0} يوم` : 'منتهية'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">الحالة:</span>
                    <span className="info-value">
                      {card.is_printed ? '✓ مطبوعة' : '○ لم تُطبع'} | {card.is_encoded ? '✓ مشفرة' : '○ لم تُشفر'}
                    </span>
                  </div>
                </div>

                <div className="card-item__actions">
                  {!card.is_printed && !card.is_revoked && (
                    <button
                      className="action-btn action-btn--print"
                      onClick={() => handleMarkPrinted(card.id)}
                      disabled={processingId === card.id}
                    >
                      {processingId === card.id ? (
                        <span className="loading-dots">...</span>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9V2H18V9" stroke="currentColor" strokeWidth="2" />
                            <path d="M6 18H4C2.89543 18 2 17.1046 2 16V11C2 9.89543 2.89543 9 4 9H20C21.1046 9 22 9.89543 22 11V16C22 17.1046 21.1046 18 20 18H18" stroke="currentColor" strokeWidth="2" />
                            <rect x="6" y="14" width="12" height="8" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          طباعة
                        </>
                      )}
                    </button>
                  )}

                  {card.is_printed && !card.is_encoded && !card.is_revoked && (
                    <button
                      className="action-btn action-btn--encode"
                      onClick={() => handleMarkEncoded(card.id)}
                      disabled={processingId === card.id}
                    >
                      {processingId === card.id ? (
                        <span className="loading-dots">...</span>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                            <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          تشفير
                        </>
                      )}
                    </button>
                  )}

                  {!card.is_revoked && (
                    <button
                      className="action-btn action-btn--revoke"
                      onClick={() => handleRevoke(card.id)}
                      disabled={processingId === card.id}
                      title="إلغاء البطاقة"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Stats */}
      <div className="card-queue__footer">
        <span className="stats-text">
          {cards.length} بطاقة
        </span>
        <button className="refresh-btn" onClick={fetchCards} disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={loading ? 'spin' : ''}>
            <path d="M23 4V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M3.51 9C4.01717 7.56678 4.87913 6.2854 6.01547 5.27542C7.1518 4.26543 8.52547 3.55976 10.0083 3.22426C11.4911 2.88875 13.0348 2.93434 14.4952 3.35677C15.9556 3.77921 17.2853 4.56471 18.36 5.64L23 10M1 14L5.64 18.36C6.71475 19.4353 8.04437 20.2208 9.50481 20.6432C10.9652 21.0657 12.5089 21.1112 13.9917 20.7757C15.4745 20.4402 16.8482 19.7346 17.9845 18.7246C19.1209 17.7146 19.9828 16.4332 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CardQueue;
