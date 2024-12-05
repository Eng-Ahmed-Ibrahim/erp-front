import { API_ENDPOINT } from "../../../../config";

const ItemCashierWearhouseForProduct = ({ items, onDeleteItem }) => {
    console.log("inside", items);
  
    const flattenedItems = items.flat().filter(item => item); 
    console.log(`dji`, flattenedItems);
  
    return (
      <div className="item-list">
        <h2>قائمة العناصر</h2>
        {flattenedItems.length === 0 ? (
          <p>لا توجد عناصر لعرضها.</p> 
        ) : (
          flattenedItems.map((item, index) => (
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
              <div>السعر: &nbsp;{item.price} &nbsp;ج.م</div>
              <button className="item-btn" onClick={() => onDeleteItem(index)}>
                حذف
              </button>
            </div>
          ))
        )}
      </div>
    );
  };
  

export default ItemCashierWearhouseForProduct;
