import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTableOrderById } from "../../../../../../apis/cashier";
import "./OrderDetails.scss";
import ShowDataModal from "../../../../../../components/ui/ShowDataModal/ShowDataModal";
import {
  updateProductQuantityInOrder,
  deleteProductQuantityInOrder,
} from "../../../../../../apis/orders";
import { message, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINT } from "../../../../../../../config";
import { useAuth } from "../../../../../../context/AuthContext";
import axios from "axios";
import PrintAfterSubmit from "../KitchenRequests/PrintAfterSubmit";
import { Modal } from "antd";

function AddPayablesModal({ show, onHide, orderId }) {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const handleAddPayable = async () => {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/orders/add-payable/${orderId}`,
      {
        amount: amount,
        note: note,
        receipt_number: receiptNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );

    if (res) {
      message.success("تم إضافة المدفوعة بنجاح");
      onHide();
    }
  };

  return (
    <Modal
      title={"إضافة مدفوعة"}
      centered
      open={show}
      onCancel={onHide}
      onOk={onHide}
      width={900}
      footer={null}
    >
      <div className="payable-container">
        <div className="mb-4">
          <label className="form-label">رقم الإيصال </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label">قيمة المدفوعة</label>

          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label"> أضف ملاحظات للمدفوعة </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
        </div>

        <button className="comment-button" onClick={handleAddPayable}>
          حفظ البيانات
        </button>
      </div>
    </Modal>
  );
}

function AddCommentModal({ show, onHide, comments, orderId }) {
  const [newComment, setNewComment] = useState("");
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleAddComment = async () => {
    if (newComment.trim()) {
      const updatedComments = [...comments, newComment.trim()];

      const commentString = updatedComments.join(",");

      await axios
        .post(
          `${API_ENDPOINT}/api/v1/orders/update/comment/${orderId}`,
          {
            comment: commentString,
          },
          {
            headers: {
              Authorization: `Bearer ${Token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          message.success("تم إضافة الملاحظة بنجاح");
          onHide();
        })
        .catch((error) => {
          message.error("حدث خطأ");
          onHide();
        });
    }
  };

  return (
    <Modal
      title={"إضافة ملاحظة"}
      centered
      open={show}
      onCancel={onHide}
      onOk={onHide}
      width={900}
      footer={null}
    >
      <div className="payable-container">
        <div className="mb-4">
          <label className="form-label"> أضف ملاحظات </label>

          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="أضف ملاحظة جديدة"
            className="form-input"
            style={{ height: "100px" }}
          />
        </div>
        <button className="comment-button" onClick={handleAddComment}>
          حفظ البيانات
        </button>
      </div>
    </Modal>
  );
}

const OrderDetails = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const [order, setOrder] = useState({});
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [isModalVisible, setisModalVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [payables, setPayables] = useState([]);
  const navigate = useNavigate();
  const [isExternalorder, SetIsExternalOrder] = useState(false);

  useEffect(() => {
    const getOrderByID = async () => {
      try {
        const res = await getTableOrderById(id);
        setOrder(res.data);

        if (res.data.payables) {
          setPayables(res.data.payables);
        }

        if (res?.data?.client_type_id == "01hzf60qrasrm5x2ytvyrsne1j" || user?.department?.id == '3d1e1d26-91ff-40b8-9b2c-139aa79430e9') {
          SetIsExternalOrder(true);
        }
console.log('ususususususu', user.department)
        if (res.data.comment) {
          setComments(res.data.comment.split(","));
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };
    getOrderByID();
  }, [id]);

  const detailsHeaders = [
    {
      key: "quantity",
      label: "الكمية",
      isInput: true,
    },
  ];

  const { Option } = Select;
  const [clientTypes, setClientTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [errors, setErrors] = useState({});
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [discountReasons, setDiscountReasons] = useState([]);
  const [flag, setFlag] = useState(false);
  const [printData, setPrintData] = useState();
  const [showAddPayablesModal, setShowAddPayablesModal] = useState(false);
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await fetchPaymentMethods();
      // await fetchDiscountReasons();
    };
    fetchData();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/store/payment_method`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setPaymentMethods(data.data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const handlePaymentMethodChange = async (value) => {
    setNewUserValues((prevState) => ({
      ...prevState,
      payment_method_id: value,
    }));
    try {
      const Token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axios.get(
        `${API_ENDPOINT}/api/v1/store/client_type/payment_method/${value}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      setClientTypes(response.data.data);
      //
    } catch (error) {
      console.error("Error fetching client types for payment method:", error);
    }
  };

  const handleClientTypeChange = async (value) => {
    setNewUserValues((prevState) => ({
      ...prevState,
      client_type_id: value,
    }));
    try {
      const Token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axios.get(
        `${API_ENDPOINT}/api/v1/orders/clients/${value}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      setClients(response.data.data);
      fetchClientType(newUserValues["client_type_id"]);
    } catch (error) {
      console.error("Error fetching clients for client type:", error);
    }
  };
  const handlePrintCompletion = () => {
    navigate("/warehouse/cashier/create-order");
  };
  const handelDelete = async (id) => {
    await axios
      .post(
        `${API_ENDPOINT}/api/v1/orders/update/status/${id}`,
        {
          status: "closed",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        message.success("تم الإنهاء بنجاح");
        setFlag(true);
      })
      .catch((error) => {
        message.error("حدث خطأ");
      });
  };

  const handleAddComment = () => {
    setShowAddCommentModal(true);
  };

  const handleAddPayable = () => {
    setShowAddPayablesModal(true);
  };

  const storeComment = async (updatedComments) => {
    const commentString = updatedComments.join(",");
    await axios
      .post(
        `${API_ENDPOINT}/api/v1/orders/update/comment/${id}`,
        {
          comment: commentString,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        message.success("تم إضافة الملاحظة بنجاح");
      })
      .catch((error) => {
        message.error("حدث خطأ");
      });
  };

  return (
    <div>
      {order.code && (
        <div>
          <h1 className="order-title">
            ترابيزه رقم {order?.table_number} - ({order?.discount_name})
          </h1>

          <div className="order-header">
            <div className="order-header-container">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "20px",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <label style={{ textAlign: "center" }} className="form-label">
                  الملاحظات:{" "}
                </label>
                <button className="comment-button" onClick={handleAddComment}>
                  أضف
                </button>
              </div>

              {comments?.length > 0 && (
                <div className="cards-container">
                  {comments.map((comment, index) => (
                    <div className="order-header-card">
                      <div className="payable-content">
                        <label className="comment">{comment}</label>
                      </div>{" "}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* {order.discount !== null && (
              <label
                className="form-label"
                style={{ textAlign: "center", marginTop: "20px" }}
              >
                نوع العميل : {order.discount_name}
              </label>
            )} */}

            {/* {order.total_price_after_discount && (
              <p>
                اجمالى السعر بعد الخصم:{" "}
                {order.total_price_after_discount_and_tax}
              </p>
            )} */}
            {isExternalorder && (
              <div className="order-header-container">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "gap",
                    gap: "30px",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <label style={{ textAlign: "center" }} className="form-label">
                    المدفوعات:{" "}
                  </label>

                  <button className="comment-button" onClick={handleAddPayable}>
                    أضف
                  </button>
                </div>

                {payables?.length > 0 && (
                  <div className="cards-container">
                    {payables.map((payable, index) => (
                      <div className="order-header-card">
                        <div className="created-at">
                          {
                            new Date(payable.created_at)
                              .toISOString()
                              .split("T")[0]
                          }
                        </div>

                        <div className="payable-content">
                          <div className="amount">
                            <label className="card-title">رقم الإيصال : </label>
                            {"  "}
                            {payable?.receipt_number}
                          </div>
                          <div className="amount">
                            <label className="card-title">
                              قيمة المدفوعة:{" "}
                            </label>
                            {"  "}
                            {payable.amount}
                          </div>
                          <div className="note">
                            <label className="card-title">ملاحظات :</label>
                            {"  "}
                            {payable.note}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <h2>المنتجات:</h2>
          <button
            className="add-btn"
            onClick={() => {
              navigate(`/warehouse/cashier/${id}/add-products-to-order`);
            }}
          >
            إضافة منتجات
          </button>
          <ul className="order-details-container">
            {order.products &&
              order.products.map((product, index) => {
                //
                return (
                  <li key={index} className="order">
                    <div className="img-container">
                      <img
                        className="product-image"
                        src={product.image}
                        alt={product.name}
                      />
                    </div>
                    <div className="order-details-txt">
                      <p>إسم المنتج: {product.name}</p>
                      <p>السعر: {product.price} ج م</p>
                      <p>الكمية: {product.quantity}</p>
                    </div>
                    <div className="product-buttons">
                      {user?.department?.type != "reciver" ? (
                        <button
                          className="product-button edit"
                          onClick={async () => {
                            setCurrentProductId(product.id);
                            setCurrentProduct(product);
                            setisModalVisible(true);
                          }}
                        >
                          تعديل
                        </button>
                      ) : null}
                      {/* <button
                        className="product-button delete"
                        onClick={async () => {
                          await deleteProductQuantityInOrder(
                            product.product_id_in_order
                          );
                          window.location.reload();
                        }}
                      >
                        حذف
                      </button> */}
                    </div>
                  </li>
                );
              })}
          </ul>
          <button
            className="btn btn-danger"
            onClick={() => handelDelete(id)}
            hidden={
              user?.permissions.some(
                (permission) =>
                  permission.name === "change order status cashier"
              )
                ? false
                : true
            }
          >
            انهاء الاوردر
          </button>
          {flag && <PrintAfterSubmit id={id} table_no={order?.table_number} />}
        </div>
      )}

      <AddPayablesModal
        show={showAddPayablesModal}
        onHide={() => setShowAddPayablesModal(false)}
        orderId={order.id}
      />
      <AddCommentModal
        show={showAddCommentModal}
        onHide={() => setShowAddCommentModal(false)}
        orderId={order.id}
        comments={comments}
      />
    </div>
  );
};

export default OrderDetails;
