import { API_ENDPOINT } from "../../../../config";

const ItemList = ({ items, onDeleteItem, InvoiceType }) => {
  return (
    <div className="item-list">
      <h2>قائمة العناصر</h2>
      {items.map((item, index) => (
        <div className="item" key={index}>
          <div>{item.name}</div>
          <div>
            <img
              src={`${item.image}`}
              alt={`alt-${item.name}`}
              style={{ width: "50px", height: "40px" }}
            />
          </div>
          <div>الكمية: {item.quantity}</div>
          {InvoiceType === "in_coming" || InvoiceType === "tainted" ? <div>السعر: &nbsp;{item.price} &nbsp;ج.م </div> : <></>}

          {InvoiceType === "in_coming" || InvoiceType === "tainted" ? <div>تاريخ انتهاء الصلاحية: {item.expireDate}</div> : <></>}
          <button className="item-btn" onClick={() => onDeleteItem(index)}>
            حذف
          </button>
        </div>
      ))}
    </div>
  );
};

export default ItemList;
