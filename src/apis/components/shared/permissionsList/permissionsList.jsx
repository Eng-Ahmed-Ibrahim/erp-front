const permissionsList = ({ items, onDeleteItem }) => {
  return (
    <div className="item-list">
      <h2>قائمة الأدوار</h2>
      {items.map((item, index) => (
        <div className="item" key={index}>
          <div>{item.label}</div>
          <button className="item-btn" onClick={() => onDeleteItem(index)}>
            حذف
          </button>
        </div>
      ))}
    </div>
  );
};

export default permissionsList;
