import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Layout,
  Typography,
  Button,
  Card,
  Row,
  Col,
  Input,
  Select,
  Table,
  InputNumber,
  Space,
  Badge,
  Statistic,
  Divider,
  Tag,
  Modal,
  message,
  Avatar,
  Dropdown,
  Menu,
  Tabs,
  Empty,
  Spin,
  Alert,
  Tooltip,
} from 'antd';
import axios from 'axios';
import { API_ENDPOINT } from '../../../config';
import {
  ShoppingCartOutlined,
  SearchOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  CreditCardOutlined,
  MoneyCollectOutlined,
  UserOutlined,
  PercentageOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  StarOutlined,
  GiftOutlined,
  CoffeeOutlined,
  MobileOutlined,
  ShopOutlined,
  ThunderboltOutlined,
  FireOutlined,
  HeartOutlined,
  TrophyOutlined,
  BulbOutlined,
  RocketOutlined,
  CrownOutlined,
  TabletOutlined,
  DesktopOutlined,
  BookOutlined,
  TagOutlined,
  BankOutlined,
  CarOutlined,
  HomeOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import {
  getDepartments,
  getProductsByDepartment,
  getSubCategoriesForDepartment,
  // getCustomers,
  // getPaymentMethods,
  createOrder,
  getProductCategories,
  getProductsByCategory,
} from '../../apis/pos';
import { changeOrderStatus } from '../../apis/orders';
import PrintAfterSubmit from '../../applications/warehouse/sections/cashier/pages/KitchenRequests/PrintAfterSubmit';
import './POSPage.scss';

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;

// Enhanced ProductCard component for fast cashier experience with quantity controls
const ProductCard = memo(
  ({
    product,
    quantity,
    isSelected,
    onProductClick,
    onQuantityChange,
    onIncrement,
    onDecrement,
  }) => {
    const currentQuantity = quantity || 0;

    // Calculate total for this product
    const productTotal = currentQuantity * product.price;

    return (
      <Card
        key={product.id}
        data-product-id={product.id}
        className={`product-card ${isSelected ? 'selected' : ''} ${
          currentQuantity > 0 ? 'has-quantity' : ''
        }`}
        hoverable={true}
        onClick={() => onProductClick(product)}
        cover={
          <div className="product-image" style={{ height: 60 }}>
            {currentQuantity > 0 && (
              <div className="quantity-badge">{currentQuantity}</div>
            )}
            <div className="selection-indicator" />
          </div>
        }
      >
        <div className="icon-name-row">
          <ShopOutlined className="product-icon" />
          <h4 className="product-name">{product.name}</h4>
        </div>
        <div className="product-price enhanced-price">
          <span className="currency">ج.م</span>
          <span className="amount-number">{product.price.toFixed(2)}</span>
        </div>

        <div className="quantity-section">
          <div className="quantity-label">الكمية</div>
          <div className="quantity-controls touch-friendly">
            <button
              className="qty-btn minus-btn large-touch"
              onClick={(e) => {
                e.stopPropagation();
                onDecrement(product.id);
              }}
              disabled={currentQuantity <= 0}
            >
              <MinusOutlined style={{ fontSize: 24 }} />
            </button>

            <div className="qty-display">
              <span className="qty-number">{currentQuantity}</span>
            </div>

            <button
              className="qty-btn plus-btn large-touch"
              onClick={(e) => {
                e.stopPropagation();
                onIncrement(product.id);
              }}
              disabled={currentQuantity >= (product.stockQuantity || 999)}
            >
              <PlusOutlined style={{ fontSize: 24 }} />
            </button>
          </div>

          {/* Quick quantity buttons */}
          <div className="quick-actions">
            <button
              className="quick-qty-btn"
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange(product.id, 5);
              }}
            >
              5
            </button>
            <button
              className="quick-qty-btn"
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange(product.id, 10);
              }}
            >
              10
            </button>
            <button
              className="quick-qty-btn"
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange(product.id, 0);
              }}
            >
              مسح
            </button>
          </div>
        </div>

        {/* Show total for this product when quantity > 0 */}
        <div
          className={`selection-total ${currentQuantity > 0 ? 'visible' : ''}`}
        >
          <div className="total-label">المجموع</div>
          <div className="total-amount">
            <span className="currency">ج.م</span>
            <span className="amount-number">{productTotal.toFixed(2)}</span>
          </div>
        </div>
      </Card>
    );
  }
);

const POSPage = () => {
  const { user } = useAuth();

  // Core state
  const [cartItems, setCartItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [discountModalVisible, setDiscountModalVisible] = useState(false);
  const [discount, setDiscount] = useState({ type: 'percentage', value: 0 });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState(0);

  // Data state
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [selectedProductCategory, setSelectedProductCategory] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch products by category
  const fetchProductsByCategory = useCallback(async (categoryId) => {
    setProductsLoading(true);
    try {
      const response = await getProductsByCategory(categoryId);
      const productsData = response || [];
      // Transform API data to match component structure
      const transformedProducts = productsData.map((product) => ({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price || 0),
        category: product.sub_category?.name || 'other',
        image: product.image || '/images/placeholder.jpg',
        description: product.description || product.name,
        stockQuantity: product.quantity || 0,
        barcode: product.barcode || '',
        unit: product.unit?.name || 'وحدة',
      }));
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // Fetch product categories (parent categories)
  const fetchProductCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const response = await getProductCategories();
      const categoriesData = response || [];
      setProductCategories(categoriesData);

      // Auto-select first category if available
      if (categoriesData.length > 0) {
        const firstCategory = categoriesData[0];
        setSelectedProductCategory(firstCategory);
        await fetchProductsByCategory(firstCategory.id);
      }
    } catch (error) {
      console.error('Error fetching product categories:', error);
      setProductCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, [fetchProductsByCategory]);

  // Handle category selection
  const handleCategorySelect = useCallback(
    async (category) => {
      setSelectedProductCategory(category);
      setSelectedCategory('all'); // Reset sub-category selection
      await fetchProductsByCategory(category.id);
    },
    [fetchProductsByCategory]
  );

  // Initialize data
  useEffect(() => {
    initializeData();
  }, []);

  // Set user's default department
  useEffect(() => {
    if (user?.department?.id && departments.length > 0) {
      const userDept = departments.find(
        (dept) => dept.id === user.department.id
      );
      if (userDept) {
        setSelectedDepartment(userDept);
      } else if (departments.length > 0) {
        setSelectedDepartment(departments[0]);
      }
    }
  }, [user, departments]);

  // Fetch products when department changes
  useEffect(() => {
    if (selectedDepartment) {
      fetchProductsByDept(selectedDepartment.id);
      fetchCategoriesForDept(selectedDepartment.id);
      fetchProductCategories();
    }
  }, [selectedDepartment, fetchProductCategories]);

  // Initialize all necessary data
  const initializeData = async () => {
    setInitialLoading(true);
    try {
      await Promise.all([
        fetchDepartments(),
        fetchCustomers(),
        fetchPaymentMethods(),
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Fetch products for a department
  const fetchProductsByDept = useCallback(
    async (departmentId) => {
      setProductsLoading(true);
      try {
        const response = await getProductsByDepartment(departmentId, {
          name: searchTerm,
          page: 1,
        });
        const productsData = response.data || [];
        // Transform API data to match component structure
        const transformedProducts = productsData.map((product) => ({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price || 0),
          category: product.sub_category?.name || 'other',
          image: product.image || '/images/placeholder.jpg',
          description: product.description || product.name,
          stockQuantity: product.quantity || 0,
          barcode: product.barcode || '',
          unit: product.unit?.name || 'وحدة',
        }));
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    },
    [searchTerm]
  );

  // Fetch categories for department
  const fetchCategoriesForDept = async (departmentId) => {
    try {
      const response = await getSubCategoriesForDepartment(departmentId);
      const categoriesData = response.data || [];
      const transformedCategories = [
        { id: 'all', name: 'الكل', icon: <AppstoreOutlined /> },
        ...categoriesData.map((category) => ({
          id: category.id,
          name: category.name,
          icon: <CoffeeOutlined />,
        })),
      ];
      setCategories(transformedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([{ id: 'all', name: 'الكل', icon: <AppstoreOutlined /> }]);
    }
  };

  // // Fetch customers
  // const fetchCustomers = async () => {
  //   try {
  //     const response = await getCustomers();
  //     const customersData = response.data || [];
  //     const transformedCustomers = customersData.map((customer) => ({
  //       id: customer.id,
  //       name: customer.name,
  //       phone: customer.phone || '',
  //       email: customer.email || '',
  //       type: customer?.type || 'regular',
  //       points: customer.points || 0,
  //       discount: customer.discount || 0,
  //     }));
  //     setCustomers(transformedCustomers);
  //   } catch (error) {
  //     console.error('Error fetching customers:', error);
  //     setCustomers([]);
  //   }
  // };

  // // Fetch payment methods
  // const fetchPaymentMethods = async () => {
  //   try {
  //     const response = await getPaymentMethods();
  //     const paymentMethodsData = response.data || [];
  //     setPaymentMethods(paymentMethodsData);
  //   } catch (error) {
  //     console.error('Error fetching payment methods:', error);
  //     setPaymentMethods([]);
  //   }
  // };

  // Memoized filtered products to prevent flickering
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }

    return products.filter((product) => {
      // If we have a selected product category, show all products from that category
      // Otherwise, use the sub-category filtering system
      let matchesCategory = true;

      if (selectedProductCategory) {
        // When viewing products by parent category, show all products (they're already filtered by API)
        matchesCategory = true;
      } else {
        // Use sub-category filtering when browsing by department
        matchesCategory =
          selectedCategory === 'all' ||
          (product.category && selectedCategory === 'all') ||
          (categories.length > 0 &&
            categories.find((cat) => cat.id === selectedCategory)?.name ===
              product.category);
      }

      const matchesSearch =
        !searchTerm ||
        (product.name &&
          product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.barcode && product.barcode.includes(searchTerm));

      return matchesCategory && matchesSearch;
    });
  }, [
    products,
    selectedCategory,
    searchTerm,
    categories,
    selectedProductCategory,
  ]);

  // Optimized cart functions with useCallback to prevent re-renders
  const addToCart = useCallback((product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
    message.success(`تمت إضافة ${product.name} إلى السلة`);
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((id, quantity) => {
    if (quantity <= 0) {
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Handle department change
  const handleDepartmentChange = useCallback(
    (departmentId) => {
      const department = departments.find((dept) => dept.id === departmentId);
      if (department) {
        setSelectedDepartment(department);
        setSelectedCategory('all'); // Reset category when changing department
      }
    },
    [departments]
  );

  // Handle search with debounce
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    // Don't refetch immediately, let the filtering handle it
    // Only refetch if we need server-side search
  }, []);

  // Debounced search effect for server-side search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedDepartment && searchTerm) {
        fetchProductsByDept(selectedDepartment.id);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedDepartment, fetchProductsByDept]);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount =
    discount?.type === 'percentage'
      ? (subtotal * discount.value) / 100
      : discount.value;
  const tax = (subtotal - discountAmount) * 0.14; // 14% tax
  const total = subtotal - discountAmount + tax;

  // Handle payment
  const handlePayment = () => {
    if (cartItems.length === 0) {
      message.error('السلة فارغة!');
      return;
    }
    setPaymentModalVisible(true);
  };

  // Process payment
  const processPayment = () => {
    if (amountPaid < total) {
      message.error('المبلغ المدفوع أقل من المطلوب!');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPaymentModalVisible(false);
      clearCart();
      setDiscount({ type: 'percentage', value: 0 });
      setSelectedCustomer(null);
      setAmountPaid(0);
      message.success('تم الدفع بنجاح!');
    }, 2000);
  };

  // Fast cashier functions for gate tickets

  // Product quantity management
  const [productQuantities, setProductQuantities] = useState({});
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  // Print management
  const [printOrderId, setPrintOrderId] = useState(null);
  const [printTableNo, setPrintTableNo] = useState(null);
  const [showPrintComponent, setShowPrintComponent] = useState(false);

  // Update product quantity
  const updateProductQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity < 0) return;

    setProductQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, newQuantity),
    }));

    // Add visual feedback
    const element = document.querySelector(
      `[data-product-id="${productId}"] .qty-display`
    );
    if (element) {
      element.classList.add('quantity-changed');
      setTimeout(() => element.classList.remove('quantity-changed'), 400);
    }
  }, []);

  // Increment product quantity
  const incrementQuantity = useCallback(
    (productId) => {
      const currentQty = productQuantities[productId] || 0;
      updateProductQuantity(productId, currentQty + 1);
    },
    [productQuantities, updateProductQuantity]
  );

  // Decrement product quantity
  const decrementQuantity = useCallback(
    (productId) => {
      const currentQty = productQuantities[productId] || 0;
      if (currentQty > 0) {
        updateProductQuantity(productId, currentQty - 1);
      }
    },
    [productQuantities, updateProductQuantity]
  );

  // Quick quantity set functions
  const setQuickQuantity = useCallback(
    (productId, quantity) => {
      updateProductQuantity(productId, quantity);
    },
    [updateProductQuantity]
  );

  // Store order function - implements actual order creation
  const storeOrder = useCallback(
    async (product, quantity) => {
      if (quantity <= 0) return;

      try {
        // Show loading state
        message.loading('جاري إنشاء الطلب...', 0.5);

        // Create FormData similar to AddCashierOrder logic
        const formData = new FormData();

        // Add product data
        formData.append(`products[0][product_id]`, product.id);
        formData.append(`products[0][product_type]`, 'recipe'); // Assuming recipe type
        formData.append(`products[0][quantity]`, quantity);

        // Add order metadata
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        formData.append('order_date', formattedDate);
        formData.append('discount', 0);
        formData.append('table_number', Math.floor(Math.random() * 1000) + 1); // Random table for tickets
        formData.append('comment', `Gate ticket - ${product.name}`);
        formData.append('deleviery_type', 'room'); // Special delivery type for tickets
        formData.append('is_quick_order', 'true');
        formData.append(
          'payment_method_id',
          'dc2a3eb5-0efd-4bed-a297-8f5b43e8dc13'
        ); // Default cash payment
        formData.append('client_id', ''); // Guest client
        formData.append('client_type_id', '01j49hpdjbqher813xrp68ejz1'); // Default guest type
        formData.append('military_number', '');
        formData.append(
          'department_id',
          selectedDepartment?.id || user?.department?.id
        );

        // Get auth token
        const token =
          localStorage.getItem('token') || sessionStorage.getItem('token');

        // Create order via API
        const response = await axios.post(
          `${API_ENDPOINT}/api/v1/orders/create`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Order created successfully
        const orderData = response.data.data;

        if (!orderData || !orderData.id) {
          throw new Error('Invalid order data received from server');
        }

        console.log('🎫 ORDER CREATED:', {
          orderId: orderData.id,
          productName: product.name,
          quantity: quantity,
          totalPrice: product.price * quantity,
          timestamp: new Date().toISOString(),
          cashier: user?.name || 'Unknown',
          department: selectedDepartment?.name || 'General',
        });

        // Step 2: Close the order immediately after creation
        try {
          console.log(
            '🔒 Closing order immediately after creation:',
            orderData.id
          );
          const closeResult = await changeOrderStatus(orderData.id, 'closed');

          if (!closeResult) {
            throw new Error('Failed to close order - no response from server');
          }

          console.log('✅ Order closed successfully, now triggering print');

          // Visual feedback for success
          message.success(
            `تم إنشاء وإغلاق طلب ${quantity} × ${product.name} - جاري الطباعة...`,
            2
          );

          // Step 3: Trigger print AFTER successful order closure
          console.log('🖨️ Triggering print for closed order:', {
            orderId: orderData.id,
            tableNumber:
              orderData.table_number || Math.floor(Math.random() * 1000) + 1,
            status: 'closed',
          });

          setPrintOrderId(orderData.id);
          setPrintTableNo(
            orderData.table_number || Math.floor(Math.random() * 1000) + 1
          );
          setShowPrintComponent(true);

          // Fallback timeout in case print component doesn't respond
          const timeoutId = setTimeout(async () => {
            console.log('Print timeout - auto-completing');
            await handlePrintCompleteWithoutClosing();
          }, 15000); // 15 second timeout to give more time for printing

          // Store timeout ID for cleanup if needed
          window.printTimeoutId = timeoutId;
        } catch (closeError) {
          console.error('❌ Error closing order:', closeError);
          message.error(
            `تم إنشاء الطلب ولكن فشل في إغلاقه: ${
              closeError.message || 'خطأ غير معروف'
            }`
          );

          // Don't proceed with printing if we couldn't close the order
          // Reset product selection since order creation succeeded but flow failed
          setSelectedProducts(new Set());
          setProductQuantities({});
          return;
        }
      } catch (error) {
        console.error('Error creating order:', error);
        message.error(
          error.response?.data?.error?.message ||
            `خطأ في إنشاء طلب ${product.name}`
        );
      }
    },
    [user, selectedDepartment]
  );

  // Handle print completion when order is already closed
  const handlePrintCompleteWithoutClosing = useCallback(async () => {
    console.log('🖨️ Print completed for closed order - cleaning up');

    // Clear any pending timeout
    if (window.printTimeoutId) {
      clearTimeout(window.printTimeoutId);
      window.printTimeoutId = null;
    }

    // Order is already closed, just show success message
    message.success('تم طباعة التذكرة بنجاح');

    // Reset print state
    setShowPrintComponent(false);
    setPrintOrderId(null);
    setPrintTableNo(null);

    // Clear product selections after successful print
    setSelectedProducts(new Set());
    setProductQuantities({});
  }, []);

  // Handle print completion (legacy - for cases where order needs to be closed after print)
  const handlePrintComplete = useCallback(async () => {
    console.log('🖨️ Print completed - cleaning up');

    // Clear any pending timeout
    if (window.printTimeoutId) {
      clearTimeout(window.printTimeoutId);
      window.printTimeoutId = null;
    }

    // Automatically close the order after successful printing
    if (printOrderId) {
      try {
        console.log('🔒 Closing order after print:', printOrderId);
        await changeOrderStatus(printOrderId, 'closed');
        console.log('✅ Order closed successfully');
        message.success('تم طباعة التذكرة وإغلاق الطلب بنجاح');
      } catch (error) {
        console.error('❌ Error closing order:', error);
        message.warning('تم طباعة التذكرة ولكن فشل في إغلاق الطلب');
      }
    } else {
      message.success('تم طباعة التذكرة بنجاح');
    }

    // Reset print state
    setShowPrintComponent(false);
    setPrintOrderId(null);
    setPrintTableNo(null);

    // Clear product selections after successful print
    setSelectedProducts(new Set());
    setProductQuantities({});
  }, [printOrderId]);

  // Handle product card click for selection/highlight
  const handleProductClick = useCallback(
    async (product) => {
      const productId = product.id;
      const currentQty = productQuantities[productId] || 0;

      // If no quantity selected, set to 1 and highlight
      if (currentQty === 0) {
        updateProductQuantity(productId, 1);
        setSelectedProducts((prev) => new Set([...prev, productId]));

        // Auto-create order with quantity 1
        await storeOrder(product, 1);
      } else {
        // If already has quantity, toggle selection
        setSelectedProducts((prev) => {
          const newSelected = new Set(prev);
          if (newSelected.has(productId)) {
            newSelected.delete(productId);
          } else {
            newSelected.add(productId);
            // Create order when adding to selection
            storeOrder(product, currentQty);
          }
          return newSelected;
        });
      }
    },
    [productQuantities, updateProductQuantity, storeOrder]
  );

  // Bulk process selected products (for multiple ticket types)
  const processBulkOrder = useCallback(async () => {
    const selectedItems = products.filter(
      (product) =>
        selectedProducts.has(product.id) &&
        (productQuantities[product.id] || 0) > 0
    );

    if (selectedItems.length === 0) {
      message.warning('لم يتم تحديد أي منتجات');
      return;
    }

    try {
      message.loading('جاري معالجة الطلبات...', 2);

      // Process each selected item - each will be created, closed, and printed individually
      for (const product of selectedItems) {
        const quantity = productQuantities[product.id] || 0;
        if (quantity > 0) {
          try {
            console.log(
              `🛒 Processing bulk item: ${product.name} x ${quantity}`
            );
            await storeOrder(product, quantity);
            console.log(`✅ Successfully processed: ${product.name}`);

            // Longer delay between orders to allow create→close→print cycle to complete
            await new Promise((resolve) => setTimeout(resolve, 3000));
          } catch (itemError) {
            console.error(`❌ Error processing ${product.name}:`, itemError);
            message.error(
              `فشل في معالجة ${product.name}: ${
                itemError.message || 'خطأ غير معروف'
              }`
            );
            // Continue with other items even if one fails
          }
        }
      }

      // Clear selections after bulk processing
      setSelectedProducts(new Set());
      setProductQuantities({});

      message.success(
        `تم إنشاء وإغلاق وطباعة ${selectedItems.length} طلبات بنجاح`
      );
    } catch (error) {
      console.error('Error in bulk processing:', error);
      message.error('خطأ في معالجة بعض الطلبات - راجع وحدة التحكم للتفاصيل');
    }
  }, [products, selectedProducts, productQuantities, storeOrder]);

  // Clear all selections and quantities
  const clearAllSelections = useCallback(() => {
    setSelectedProducts(new Set());
    setProductQuantities({});
    message.info('تم مسح جميع التحديدات');
  }, []);

  // Cart table columns
  const cartColumns = [
    {
      title: 'المنتج',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="cart-item-info">
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="item-price">
            {record.price.toFixed(2)} ج.م
          </Text>
        </div>
      ),
    },
    {
      title: 'الكمية',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (quantity, record) => (
        <div className="quantity-controls">
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => updateQuantity(record.id, quantity - 1)}
          />
          <InputNumber
            min={1}
            max={record.stockQuantity}
            value={quantity}
            onChange={(value) => updateQuantity(record.id, value)}
            size="small"
            style={{ width: 60, margin: '0 4px' }}
          />
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => updateQuantity(record.id, quantity + 1)}
          />
        </div>
      ),
    },
    {
      title: 'الإجمالي',
      key: 'total',
      width: 100,
      render: (_, record) => (
        <Text strong>{(record.price * record.quantity).toFixed(2)} ج.م</Text>
      ),
    },
    {
      title: 'إجراءات',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeFromCart(record.id)}
        />
      ),
    },
  ];

  return (
    <div className="pos-page">
      <Layout>
        <Content className="pos-content">
          <div className="pos-header">
            <Title level={2} className="pos-title">
              <ShoppingCartOutlined /> نظام نقاط البيع
            </Title>

            <div className="pos-actions">
              <Space size="middle">
                {/* Fast cashier controls */}
                {/* <Button
                  type="primary"
                  icon={<CreditCardOutlined />}
                  onClick={processBulkOrder}
                  disabled={selectedProducts.size === 0}
                  size="large"
                >
                  طباعة التذاكر ({selectedProducts.size}) */}
                {/* </Button>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={clearAllSelections}
                  disabled={
                    selectedProducts.size === 0 &&
                    Object.keys(productQuantities).length === 0
                  }
                >
                  مسح التحديدات
                </Button>
                <Button
                  icon={<UserOutlined />}
                  onClick={() => setCustomerModalVisible(true)}
                >
                  {selectedCustomer ? selectedCustomer.name : 'اختر عميل'}
                </Button>
                <Button
                  icon={<PercentageOutlined />}
                  onClick={() => setDiscountModalVisible(true)}
                >
                  خصم
                </Button> */}
                <Button icon={<ReloadOutlined />} onClick={clearCart}>
                  مسح السلة
                </Button>
              </Space>
            </div>
          </div>

          {/* Fast Cashier Summary Bar */}
          {(selectedProducts.size > 0 ||
            Object.keys(productQuantities).filter(
              (id) => productQuantities[id] > 0
            ).length > 0) && (
            <div className="cashier-summary-bar">
              <Row gutter={24} align="middle">
                <Col flex="auto">
                  <Space size="large">
                    <Statistic
                      title="منتجات محددة"
                      value={selectedProducts.size}
                      suffix="منتج"
                    />
                    <Statistic
                      title="إجمالي الكمية"
                      value={Object.values(productQuantities).reduce(
                        (sum, qty) => sum + qty,
                        0
                      )}
                      suffix="وحدة"
                    />
                    <Statistic
                      title="إجمالي المبلغ"
                      value={products.reduce((total, product) => {
                        const qty = productQuantities[product.id] || 0;
                        return total + qty * product.price;
                      }, 0)}
                      precision={2}
                      suffix="ج.م"
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button
                      type="primary"
                      size="large"
                      icon={<CreditCardOutlined />}
                      onClick={processBulkOrder}
                    >
                      طباعة جميع التذاكر
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>
          )}

          <div className="pos-main">
            {/* Products Section */}
            <div className="products-section">
              {/* Unified Search and Filter Header */}
              <div className="products-search-section">
                <div className="search-controls">
                  <Search
                    placeholder="البحث عن المنتج أو الباركود..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={handleSearch}
                    loading={productsLoading}
                    className="main-search"
                  />

                  <Select
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    size="large"
                    style={{ width: 200 }}
                    disabled={!selectedDepartment}
                    placeholder="فلتر الفئات"
                  >
                    {categories.map((category) => (
                      <Option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </Option>
                    ))}
                  </Select>
                </div>

                {/* Product Categories Bar - Integrated */}
                {selectedDepartment && productCategories.length > 0 && (
                  <div className="categories-section">
                    <div className="categories-label">
                      <Text strong>فئات المنتجات:</Text>
                    </div>
                    <div className="categories-wrapper">
                      {categoriesLoading ? (
                        <div className="categories-list">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Button
                              key={index}
                              loading
                              className="category-btn"
                            >
                              جاري التحميل...
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="categories-list">
                          {productCategories.map((category) => (
                            <Button
                              key={category.id}
                              type={
                                selectedProductCategory?.id === category.id
                                  ? 'primary'
                                  : 'default'
                              }
                              className={`category-btn ${
                                selectedProductCategory?.id === category.id
                                  ? 'active'
                                  : ''
                              }`}
                              onClick={() => handleCategorySelect(category)}
                              size="large"
                            >
                              <CoffeeOutlined />
                              {category.name}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="products-content">
                {initialLoading ? (
                  <div
                    className="loading-container"
                    style={{ textAlign: 'center', padding: '40px' }}
                  >
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>
                      <Text>جارٍ تحميل البيانات...</Text>
                    </div>
                  </div>
                ) : !selectedDepartment ? (
                  <div className="custom-empty-state"></div>
                ) : (
                  <>
                    <div className="products-grid">
                      {productsLoading
                        ? // Show skeleton loading for products
                          Array.from({ length: 8 }).map((_, index) => (
                            <Card
                              key={index}
                              className="product-card loading-card"
                              cover={
                                <div className="product-image loading-image">
                                  <div className="product-icon-container loading-container">
                                    <div className="loading-pulse">
                                      <Spin size="large" />
                                    </div>
                                    <div className="loading-shimmer"></div>
                                  </div>
                                </div>
                              }
                            >
                              <div className="product-header">
                                <div className="loading-title">
                                  <div className="shimmer-line long"></div>
                                </div>
                                <div className="product-price">
                                  <div className="shimmer-line short"></div>
                                </div>
                              </div>
                              <div className="quantity-section">
                                <div className="shimmer-line medium"></div>
                                <div className="loading-controls">
                                  <div className="shimmer-circle"></div>
                                  <div className="shimmer-circle"></div>
                                  <div className="shimmer-circle"></div>
                                </div>
                              </div>
                            </Card>
                          ))
                        : filteredProducts.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              quantity={productQuantities[product.id] || 0}
                              isSelected={selectedProducts.has(product.id)}
                              onProductClick={handleProductClick}
                              onQuantityChange={updateProductQuantity}
                              onIncrement={incrementQuantity}
                              onDecrement={decrementQuantity}
                            />
                          ))}
                    </div>

                    {!productsLoading && filteredProducts.length === 0 && (
                      <div className="custom-empty-state no-products">
                        <div className="empty-icon-container">
                          <SearchOutlined className="empty-main-icon" />
                          <div className="search-particles">
                            <div className="particle"></div>
                            <div className="particle"></div>
                            <div className="particle"></div>
                          </div>
                        </div>
                        <Title level={3} className="empty-title">
                          {searchTerm ? 'لا توجد نتائج' : 'لا توجد منتجات'}
                        </Title>
                        <Text className="empty-description">
                          {searchTerm
                            ? `لم نجد منتجات تحتوي على "${searchTerm}"`
                            : 'لا توجد منتجات متاحة في هذا القسم حالياً'}
                        </Text>
                        <div className="empty-actions">
                          {searchTerm ? (
                            <Button
                              type="primary"
                              size="large"
                              icon={<ReloadOutlined />}
                              onClick={() => setSearchTerm('')}
                            >
                              مسح البحث
                            </Button>
                          ) : (
                            <Button
                              type="primary"
                              size="large"
                              icon={<AppstoreOutlined />}
                            >
                              تصفح الأقسام الأخرى
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Cart Section */}
            <div className="cart-section">
              <div className="cart-header">
                <Title level={4}>
                  <ShoppingCartOutlined /> السلة ({cartItems.length})
                </Title>
                {cartItems.length > 0 && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={clearCart}
                    size="small"
                  >
                    مسح الكل
                  </Button>
                )}
              </div>

              <div className="cart-content">
                {cartItems.length > 0 ? (
                  <>
                    <Table
                      columns={cartColumns}
                      dataSource={cartItems}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      className="cart-table"
                      scroll={{ y: 300 }}
                    />

                    <Divider />

                    <div className="cart-summary">
                      <div className="summary-row">
                        <Text>المجموع الفرعي:</Text>
                        <Text strong>{subtotal.toFixed(2)} ج.م</Text>
                      </div>
                      {discountAmount > 0 && (
                        <div className="summary-row discount">
                          <Text>الخصم:</Text>
                          <Text type="success">
                            -{discountAmount.toFixed(2)} ج.م
                          </Text>
                        </div>
                      )}
                      <div className="summary-row">
                        <Text>الضريبة (14%):</Text>
                        <Text>{tax.toFixed(2)} ج.م</Text>
                      </div>
                      <Divider />
                      <div className="summary-row total">
                        <Text strong size="large">
                          الإجمالي:
                        </Text>
                        <Text strong size="large" type="success">
                          {total.toFixed(2)} ج.م
                        </Text>
                      </div>
                    </div>

                    {selectedCustomer && (
                      <div className="customer-info">
                        <Text type="secondary">
                          العميل: {selectedCustomer.name}
                        </Text>
                        {selectedCustomer.discount > 0 && (
                          <Tag color="gold">
                            خصم {selectedCustomer.discount}%
                          </Tag>
                        )}
                      </div>
                    )}

                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<CreditCardOutlined />}
                      onClick={handlePayment}
                      className="checkout-button"
                    >
                      الدفع
                    </Button>
                  </>
                ) : (
                  <div className="custom-empty-cart">
                    <div className="empty-cart-container">
                      <div className="cart-icon-display">
                        <ShoppingCartOutlined className="cart-main-icon" />
                        <div className="floating-items">
                          <CoffeeOutlined className="float-item" />
                          <GiftOutlined className="float-item" />
                          <StarOutlined className="float-item" />
                        </div>
                      </div>
                      <Title level={4} className="empty-cart-title">
                        السلة فارغة
                      </Title>
                      <Text className="empty-cart-description">
                        ابدأ بإضافة المنتجات إلى السلة
                      </Text>
                      <div className="cart-tips">
                        <div className="tip-item">
                          <PlusOutlined /> انقر على المنتج لإضافته
                        </div>
                        <div className="tip-item">
                          <ThunderboltOutlined /> استخدم البحث السريع
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Content>
      </Layout>

      {/* Payment Modal */}
      <Modal
        title={
          <Title level={4}>
            <MoneyCollectOutlined /> الدفع
          </Title>
        }
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPaymentModalVisible(false)}>
            إلغاء
          </Button>,
          <Button
            key="pay"
            type="primary"
            loading={loading}
            onClick={processPayment}
            disabled={amountPaid < total}
          >
            تأكيد الدفع
          </Button>,
        ]}
        width={500}
      >
        <div className="payment-modal">
          <div className="payment-summary">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="المبلغ المطلوب"
                  value={total.toFixed(2)}
                  suffix="ج.م"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="المبلغ المدفوع"
                  value={amountPaid.toFixed(2)}
                  suffix="ج.م"
                  valueStyle={{
                    color: amountPaid >= total ? '#3f8600' : '#cf1322',
                  }}
                />
              </Col>
            </Row>
            {amountPaid > total && (
              <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Statistic
                    title="المبلغ المتبقي"
                    value={(amountPaid - total).toFixed(2)}
                    suffix="ج.م"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
              </Row>
            )}
          </div>

          <Divider />

          <div className="payment-method">
            <Title level={5}>طريقة الدفع</Title>
            <Select
              value={paymentMethod}
              onChange={setPaymentMethod}
              style={{ width: '100%', marginBottom: 16 }}
            >
              <Option value="cash">
                <MoneyCollectOutlined /> نقداً
              </Option>
              <Option value="card">
                <CreditCardOutlined /> بطاقة
              </Option>
              <Option value="digital">
                <MobileOutlined /> محفظة رقمية
              </Option>
            </Select>

            <div className="amount-input">
              <Title level={5}>المبلغ المدفوع</Title>
              <InputNumber
                value={amountPaid}
                onChange={setAmountPaid}
                min={0}
                precision={2}
                size="large"
                style={{ width: '100%' }}
                placeholder="أدخل المبلغ المدفوع"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Customer Modal */}
      <Modal
        title={
          <Title level={4}>
            <UserOutlined /> اختيار العميل
          </Title>
        }
        open={customerModalVisible}
        onCancel={() => setCustomerModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="customer-modal">
          <Search
            placeholder="البحث عن العميل..."
            style={{ marginBottom: 16 }}
          />
          <div className="customers-list">
            {customers.map((customer) => (
              <Card
                key={customer.id}
                className={`customer-card ${
                  selectedCustomer?.id === customer.id ? 'selected' : ''
                }`}
                onClick={() => {
                  setSelectedCustomer(customer);
                  setCustomerModalVisible(false);
                }}
                hoverable
              >
                <Card.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={customer.name}
                  description={
                    <div>
                      <Text type="secondary">{customer.phone}</Text>
                      <br />
                      <Text type="secondary">{customer.email}</Text>
                      <div style={{ marginTop: 8 }}>
                        <Tag color={customer?.type === 'vip' ? 'gold' : 'blue'}>
                          {customer?.type === 'vip' ? 'VIP' : 'عادي'}
                        </Tag>
                        {customer.discount > 0 && (
                          <Tag color="green">خصم {customer.discount}%</Tag>
                        )}
                        <Badge
                          count={customer.points}
                          style={{ marginLeft: 8 }}
                        />
                      </div>
                    </div>
                  }
                />
              </Card>
            ))}
          </div>
        </div>
      </Modal>

      {/* Discount Modal */}
      <Modal
        title={
          <Title level={4}>
            <PercentageOutlined /> إضافة خصم
          </Title>
        }
        open={discountModalVisible}
        onCancel={() => setDiscountModalVisible(false)}
        onOk={() => setDiscountModalVisible(false)}
        width={400}
      >
        <div className="discount-modal">
          <div className="discount-type">
            <Title level={5}>نوع الخصم</Title>
            <Select
              value={discount?.type}
              onChange={(value) => setDiscount({ ...discount, type: value })}
              style={{ width: '100%', marginBottom: 16 }}
            >
              <Option value="percentage">نسبة مئوية</Option>
              <Option value="fixed">مبلغ ثابت</Option>
            </Select>
          </div>

          <div className="discount-value">
            <Title level={5}>
              {discount?.type === 'percentage' ? 'النسبة المئوية' : 'المبلغ'}
            </Title>
            <InputNumber
              value={discount.value}
              onChange={(value) => setDiscount({ ...discount, value })}
              min={0}
              max={discount?.type === 'percentage' ? 100 : subtotal}
              precision={2}
              size="large"
              style={{ width: '100%' }}
              placeholder={
                discount?.type === 'percentage' ? 'أدخل النسبة' : 'أدخل المبلغ'
              }
              suffix={discount?.type === 'percentage' ? '%' : 'ج.م'}
            />
          </div>

          {discount.value > 0 && (
            <div className="discount-preview">
              <Divider />
              <div className="summary-row">
                <Text>المجموع الفرعي:</Text>
                <Text>{subtotal.toFixed(2)} ج.م</Text>
              </div>
              <div className="summary-row">
                <Text>الخصم:</Text>
                <Text type="success">
                  -
                  {(discount?.type === 'percentage'
                    ? (subtotal * discount.value) / 100
                    : discount.value
                  ).toFixed(2)}{' '}
                  ر.س
                </Text>
              </div>
              <div className="summary-row">
                <Text strong>المجموع بعد الخصم:</Text>
                <Text strong type="success">
                  {(
                    subtotal -
                    (discount?.type === 'percentage'
                      ? (subtotal * discount.value) / 100
                      : discount.value)
                  ).toFixed(2)}{' '}
                  ر.س
                </Text>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Print Component - Only render when we have valid order data */}
      {showPrintComponent &&
        printOrderId &&
        printTableNo &&
        typeof printOrderId === 'string' &&
        printOrderId.length > 0 && (
          <div
            style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
          >
            {console.log('🖨️ Rendering PrintAfterSubmit for closed order:', {
              id: printOrderId,
              tableNO: printTableNo,
              onPrintComplete: 'handlePrintCompleteWithoutClosing provided',
              status: 'order already closed',
            })}
            <PrintAfterSubmit
              id={printOrderId}
              tableNO={printTableNo}
              onPrintComplete={handlePrintCompleteWithoutClosing}
              isQuickPrint={true}
            />
          </div>
        )}
    </div>
  );
};

export default POSPage;
