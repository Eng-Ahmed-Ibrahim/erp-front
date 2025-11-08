import React, { useState } from 'react';
import { Input, Select, Button, Space, Card, message } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './ModelSearch.scss';

const { Option } = Select;
const { Search } = Input;

const ModelSearch = ({ onSearch, showResults = true, compact = false }) => {
  const [modelType, setModelType] = useState('');
  const [modelId, setModelId] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const modelTypes = [
    { value: 'invoice', label: 'فاتورة', route: '/warehouse/invoices' },
    { value: 'order', label: 'طلب', route: '/warehouse/orders' },
    { value: 'recipe', label: 'مكون', route: '/warehouse/recipes' },
    { value: 'product', label: 'منتج', route: '/warehouse/products' },
    { value: 'supplier', label: 'مورد', route: '/warehouse/suppliers' },
    { value: 'department', label: 'قسم', route: '/warehouse/departments' },
    { value: 'user', label: 'مستخدم', route: '/warehouse/users' },
    { value: 'client', label: 'عميل', route: '/warehouse/clients' }
  ];

  const handleSearch = async () => {
    if (!modelType || !modelId) {
      message.warning('يرجى تحديد نوع النموذج والمعرف');
      return;
    }

    setLoading(true);
    try {
      if (onSearch) {
        const results = await onSearch(modelType, modelId);
        setSearchResults(results);
      } else {
        // Default search behavior
        const selectedModel = modelTypes.find(m => m.value === modelType);
        if (selectedModel) {
          navigate(`${selectedModel.route}/${modelId}`);
        }
      }
    } catch (error) {
      message.error('حدث خطأ أثناء البحث');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModelTypeChange = (value) => {
    setModelType(value);
    setModelId('');
    setSearchResults([]);
  };

  const handleModelIdChange = (e) => {
    setModelId(e.target.value);
    setSearchResults([]);
  };

  const handleQuickSearch = (type) => {
    setModelType(type);
    setModelId('');
    setSearchResults([]);
  };

  const renderCompactView = () => (
    <Space.Compact style={{ width: '100%' }}>
      <Select
        placeholder="نوع النموذج"
        value={modelType}
        onChange={handleModelTypeChange}
        style={{ width: '40%' }}
      >
        {modelTypes.map(type => (
          <Option key={type.value} value={type.value}>{type.label}</Option>
        ))}
      </Select>
      <Input
        placeholder="معرف النموذج"
        value={modelId}
        onChange={handleModelIdChange}
        style={{ width: '40%' }}
      />
      <Button
        type="primary"
        icon={<SearchOutlined />}
        onClick={handleSearch}
        loading={loading}
        style={{ width: '20%' }}
      >
        بحث
      </Button>
    </Space.Compact>
  );

  const renderFullView = () => (
    <Card className="model-search-card" title="البحث السريع">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Quick Model Type Buttons */}
        <div className="quick-model-types">
          <span className="quick-label">أنواع سريعة:</span>
          <Space wrap>
            {modelTypes.map(type => (
              <Button
                key={type.value}
                type={modelType === type.value ? 'primary' : 'default'}
                size="small"
                onClick={() => handleQuickSearch(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </Space>
        </div>

        {/* Search Form */}
        <Space.Compact style={{ width: '100%' }}>
          <Select
            placeholder="نوع النموذج"
            value={modelType}
            onChange={handleModelTypeChange}
            style={{ width: '40%' }}
            size="large"
          >
            {modelTypes.map(type => (
              <Option key={type.value} value={type.value}>{type.label}</Option>
            ))}
          </Select>
          <Input
            placeholder="معرف النموذج"
            value={modelId}
            onChange={handleModelIdChange}
            style={{ width: '40%' }}
            size="large"
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
            size="large"
            style={{ width: '20%' }}
          >
            بحث
          </Button>
        </Space.Compact>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="search-results">
            <h4>نتائج البحث:</h4>
            <div className="results-list">
              {searchResults.map((result, index) => (
                <div key={index} className="result-item">
                  <span className="result-type">{result.type}</span>
                  <span className="result-id">{result.id}</span>
                  <span className="result-name">{result.name}</span>
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(result.route)}
                    size="small"
                  >
                    عرض
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Space>
    </Card>
  );

  return compact ? renderCompactView() : renderFullView();
};

export default ModelSearch;
