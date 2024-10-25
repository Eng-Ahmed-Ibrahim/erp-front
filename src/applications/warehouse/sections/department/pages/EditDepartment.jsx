
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DynamicForm from '../../../../../components/shared/form/Form';
import { eidtDeaprtments, getDeaprtmentsById } from '../../../../../apis/department';

const EditDepartment = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null); // Initialize data as null
    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const recipeData = await getDeaprtmentsById(id);
                setData(recipeData.data);
            } catch (error) {
                // console.log("Error fetching data:", error);
            }
        };

        fetchData(); // Call fetchData when component mounts
    }, [id]); // useEffect dependency on id

    const handleSubmit = async (formData) => {
        // console.log(formData);
        await eidtDeaprtments(formData.name, formData.image, formData.code, formData.phone, id);
        await navigate('/warehouse/departments/show-departments');
    };

    const fields = [
        { type: 'text', name: 'name', placeholder: 'يجب عليك ادخال الاسم', labelName: "الاسم", required: true },
        { type: 'number', name: 'code', placeholder: 'يجب عليك ادخال الكود', labelName: "الكود", required: true },
        { type: 'number', name: 'phone', placeholder: 'يجب عليك ادخال رقم التيليفون', labelName: "التيليفون", required: true },
        { type: 'image', name: 'image', placeholder: 'يجب عليك ادخال الصوره', labelName: "الصورة" },
    ];

    return (
        <div className='form-container'>
            <h1 className='form-title'>تعديل الاقسام </h1>
            {data && <DynamicForm fields={fields} initialValues={data} onSubmit={handleSubmit} />} {/* Pass initial values if data is available */}
        </div>
    );
};

export default EditDepartment;