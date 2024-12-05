
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eidtUnits, getUnitsById } from '../../../../../apis/unit';
import DynamicForm from '../../../../../components/shared/form/Form';

const EditUnits = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null); // Initialize data as null
    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const recipeData = await getUnitsById(id);
                setData(recipeData.data);
            } catch (error) {
                // console.log("Error fetching data:", error);
            }
        };

        fetchData(); // Call fetchData when component mounts
    }, [id]); // useEffect dependency on id

    const handleSubmit = async (formData) => {
        // console.log(formData);
        await eidtUnits(formData.name, id);
        await navigate('/warehouse/units/show-units');
    };

    const fields = [
        { type: 'text', name: 'name', labelName: "الوحده", placeholder: 'يجب عليك ادخال الاسم', required: true },

    ];

    return (
        <div className='form-container'>
            <h1 className='form-title'>تعديل وحدة </h1>
            {data && <DynamicForm fields={fields} initialValues={data} onSubmit={handleSubmit} />} {/* Pass initial values if data is available */}
        </div>
    );
};

export default EditUnits;