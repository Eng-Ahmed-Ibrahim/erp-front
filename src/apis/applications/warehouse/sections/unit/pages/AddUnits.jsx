import React from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicForm from '../../../../../components/shared/form/Form';
import { addUnits } from '../../../../../apis/unit';

const AddUnits = () => {
    const navigate = useNavigate()
    const handleSubmit = async (formData) => {
        // console.log(formData);
        await addUnits(formData.name)
        await navigate('/warehouse/units/show-units')

    };

    const fields = [
        { type: 'text', name: 'name', labelName: "الوحده", placeholder: 'يجب عليك ادخال الاسم', required: true },

    ];

    return (
        <div className='form-container'>
            <h1 className='form-title'>ادخال وحدة جديدة  </h1>
            <DynamicForm fields={fields} onSubmit={handleSubmit} />
        </div>
    );
};

export default AddUnits;
