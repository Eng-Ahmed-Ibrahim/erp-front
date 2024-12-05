import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRecipeById } from '../../../../../../apis/recipes/recipeCategoryParent';
import { addRecipeSubCategory } from '../../../../../../apis/recipes/recipeSubCategory';
import DynamicForm from '../../../../../../components/shared/form/Form';
import { Spin } from 'antd';

const AddRecipeSubCategory = () => {
    const navigate = useNavigate();

    const handleSubmit = async (formData) => {
        // console.log(formData);
        await addRecipeSubCategory(formData.name, formData.description, formData.image, id);
        await navigate(`/warehouse/recipes/subCategory/show-recipe-subcategory/${id}`);
    };

    const [parentName, setParentName] = useState('');
    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const recipeData = await getRecipeById(id);
                setParentName(recipeData.name);
            } catch (error) {
                // console.log("Error fetching data:", error);
            }
        };

        fetchData();
    }, [id]);



    const fields = [
        { type: 'text', name: 'name', placeholder: 'يجب عليك ادخال الاسم', labelName: "الاسم", required: true, disabled: false },
        { type: 'text', name: 'description', placeholder: 'يجب عليك ادخال الوصف', labelName: "الوصف", required: true, disabled: false },
        { type: 'text', name: 'parentName', value: parentName, placeholder: `${parentName}`, required: false, disabled: true },
        { type: 'image', name: 'image', placeholder: 'يجب عليك ادخال الصوره' },
    ];

    return (
        <div className='form-container'>
            <h1 className='form-title'>ادخال تصنيف الرئيسى</h1>
            <DynamicForm fields={fields} onSubmit={handleSubmit} ButtonType={'اضافة تصنيف فرعى'} />
        </div>
    );
};

export default AddRecipeSubCategory;
