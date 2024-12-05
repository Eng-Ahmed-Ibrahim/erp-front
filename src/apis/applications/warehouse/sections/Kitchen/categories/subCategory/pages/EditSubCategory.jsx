import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eidtSubCategory, getSubCategoryById } from '../../../../../../../apis/subCategory';
import DynamicForm from '../../../../../../../components/shared/form/Form';

const EditSubCategory = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null); // Initialize data as null
  const { id } = useParams();
  const [categories, setCategories] = useState([]); // Initialize categories state

  const [parent, setParent] = useState(null);
  const [parentId, setParentId] = useState(null);




  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeData = await getSubCategoryById(id);
        setData(recipeData.data);
        setParent(recipeData.data.category.name)
        setParentId(recipeData.data.category.id)
        // console.log(recipeData.data.parent)
      } catch (error) {
        // console.log("Error fetching data:", error);
      }
    };

    fetchData(); // Call fetchData when component mounts
  }, [id]); // useEffect dependency on id

  const handleSubmit = async (formData) => {
    // console.log(formData);
    await eidtSubCategory(formData.name, formData.description, formData.image, parentId, id);
    await navigate(`/warehouse/returants/show-subCategory/${parentId}`);
  };
  const fields = [
    { type: 'text', name: 'name', placeholder: 'يجب عليك ادخال الاسم', labelName: 'الاسم', required: true, disabled: false },
    { type: 'text', name: 'description', placeholder: 'يجب عليك ادخال الوصف', labelName: 'الوصف', required: true, disabled: false },
    { type: 'text', name: 'parentName', placeholder: `${parent}`, labelName: 'التصنيف الرئيسي', required: false, disabled: true },
    { type: 'image', name: 'image', placeholder: 'يجب عليك ادخال الصوره' },
  ];

  return (
    <div className='form-container'>
      <h1 className='form-title'>تعديل التصنيف فرعي</h1>
      {data && <DynamicForm fields={fields} initialValues={data} onSubmit={handleSubmit} />} {/* Pass initial values if data is available */}
    </div>
  );
};

export default EditSubCategory;