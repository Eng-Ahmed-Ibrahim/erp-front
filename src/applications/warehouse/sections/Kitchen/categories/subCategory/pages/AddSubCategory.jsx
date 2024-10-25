import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategoryById } from '../../../../../../../apis/categories';
import { addSubCategory } from '../../../../../../../apis/subCategory';
import DynamicForm from '../../../../../../../components/shared/form/Form';

const AddSubCategory = () => {
    const navigate = useNavigate();

    const handleSubmit = async (formData) => {
        // console.log(formData);
        await addSubCategory(formData.name, formData.description, formData.image, id);
        await navigate(`/warehouse/returants/show-subCategory/${id}`);
    };

    const [parentName, setParentName] = useState('');
    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const recipeData = await getCategoryById(id);
                setParentName(recipeData.data.name);
            } catch (error) {
                // console.log("Error fetching data:", error);
            }
        };

        fetchData();
    }, [id]);



    const fields = [
        { type: 'text', name: 'name', placeholder: 'يجب عليك ادخال الاسم', labelName: 'الاسم', required: true, disabled: false },
        { type: 'text', name: 'description', placeholder: 'يجب عليك ادخال الوصف', labelName: 'الوصف', required: true, disabled: false },
        { type: 'text', name: 'parentName', value: parentName, placeholder: `${parentName}`, labelName: 'التصنيف الرئيسي', required: false, disabled: true },
        { type: 'image', name: 'image', placeholder: 'يجب عليك ادخال الصوره' },
    ];

    return (
        <div className='form-container'>
            <h1 className='form-title'>ادخال تصنيف فرعى</h1>
            <DynamicForm fields={fields} onSubmit={handleSubmit} ButtonType={'اضافة تصنيف فرعى'} />
        </div>
    );
};

export default AddSubCategory;
