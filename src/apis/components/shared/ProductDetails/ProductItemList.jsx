import { API_ENDPOINT } from "../../../../config";

const ProductItemList = ({ items, onDeleteItem }) => {
  return (
    <div className="item-cashier-list">
      <h2>قائمة اسعار المنتج</h2>
      {items.map((item, index) => (
        <div className="item-cashier" key={index}>
          <div>{item.name}</div>
          {/* <div>
            {" "}
            <img
              src={`${item.image}`}
              alt={`alt-${item.name}`}
              style={{ width: "50px", height: "40px" }}
            />
          </div> */}
          {/* <div>الكمية: {item.quantity}</div> */}
          <div>السعر: &nbsp;{item.price} &nbsp;ج.م </div>
          {/* <div>
            النوع:{" "}
            {item.productType === "department" ? "من المنفذ" : "من المطبخ"}
          </div> */}
          {/* <div>تاريخ انتهاء الصلاحية: {item.expireDate}</div> */}
          <button
            className="item-cashier-btn"
            onClick={() => onDeleteItem(index)}
          >
            حذف
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductItemList;
