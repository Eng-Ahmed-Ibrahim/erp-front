import React from 'react';
import { useNavigate } from 'react-router-dom';
import { addRecipe } from '../../../../../../apis/recipes/recipeCategoryParent';
import DynamicForm from '../../../../../../components/shared/form/Form';

const AddRecipe = () => {
    const navigate = useNavigate()
    const handleSubmit = async (formData) => {
        // console.log(formData);
        await addRecipe(formData.name, formData.description, formData.image)
        await navigate('/warehouse/recipes/show-recipes')

    };

    const fields = [
        { type: 'text', name: 'name', placeholder: 'يجب عليك ادخال الاسم', labelName: "الاسم", required: true },
        { type: 'text', name: 'description', placeholder: 'يجب عليك ادخال الوصف', labelName: "الوصف", required: true },
        { type: 'image', name: 'image', placeholder: 'يجب عليك ادخال الصوره' },
    ];

    return (
        <div className='form-container'>
            <h1 className='form-title'>ادخال تصنيف الاقسام</h1>
            <DynamicForm fields={fields} onSubmit={handleSubmit} />
        </div>
    );
};

export default AddRecipe;
