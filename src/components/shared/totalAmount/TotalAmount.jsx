// components/TotalAmount.js
import React from 'react';

const TotalAmount = ({ total }) => {
    // Check if total is a valid number
    if (typeof total !== 'number' || isNaN(total)) {
        return <div className="total">Invalid total amount</div>;
    }

    return (
        <div className="total">
            <h3>
                الناتج الاجمالي:&nbsp;
                {total.toFixed(2)}&nbsp;
                ج.م
            </h3>
        </div>
    );
};


export default TotalAmount;
