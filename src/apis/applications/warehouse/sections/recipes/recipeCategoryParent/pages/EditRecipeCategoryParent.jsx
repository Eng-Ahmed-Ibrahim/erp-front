import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eidtRecipe, getRecipeById } from '../../../../../../apis/recipes/recipeCategoryParent';
import DynamicForm from '../../../../../../components/shared/form/Form';

const EditRecipe = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null); // Initialize data as null
    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const recipeData = await getRecipeById(id);
                setData(recipeData);
            } catch (error) {
                // console.log("Error fetching data:", error);
            }
        };

        fetchData(); // Call fetchData when component mounts
    }, [id]); // useEffect dependency on id

    const handleSubmit = async (formData) => {
        // console.log(formData);
        await eidtRecipe(formData.name, formData.description, formData.image, id);
        await navigate('/warehouse/recipes/show-recipes');
    };

    const fields = [
        { type: 'text', name: 'name', placeholder: 'يجب عليك ادخال الاسم', labelName: "الاسم", required: true },
        { type: 'text', name: 'description', placeholder: 'يجب عليك ادخال الوصف', labelName: "الوصف", required: true },
        { type: 'image', name: 'image', placeholder: 'يجب عليك ادخال الصوره' },
    ];

    return (
        <div className='form-container'>
            <h1 className='form-title'>تعديل الاقسام </h1>
            {data && <DynamicForm fields={fields} initialValues={data} onSubmit={handleSubmit} />} {/* Pass initial values if data is available */}
        </div>
    );
};

export default EditRecipe;