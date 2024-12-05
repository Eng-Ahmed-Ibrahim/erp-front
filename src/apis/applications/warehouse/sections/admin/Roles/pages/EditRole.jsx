import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRoleById, editRoles } from "../../../../../../apis/roles";
import DynamicForm from "../../../../../../components/shared/form/Form";
import { getPermissions } from "../../../../../../apis/permissions";
const EditRole = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeData = await getRoleById(id);
        setData(recipeData?.data);
        // console.log(recipeData.data);
      } catch (error) {
        // console.log("Error fetching data:", error);
      }
    };
    fetchData();
    const fetchPermissions = async () => {
      const res = await getPermissions();
      setPermissions(res.data);
    };
    fetchPermissions();
  }, [id]);

  const handleSubmit = async (formData) => {
    // console.log(formData);
    await editRoles(formData, id);
    navigate(`/warehouse/roles/show-roles`);
  };

  const fields = [
    {
      type: "text",
      name: "name",
      placeholder: "يجب عليك ادخال الاسم",
      labelName: "الاسم",
      required: true,
    },

    {
      type: "multi-select",
      name: "type",
      placeholder: "يجب عليك ادخال الصلاحيات",
      labelName: "الصلاحيات",
      options: permissions?.map((permission) => {
        return { value: permission.id, label: permission.display_name };
      }),
      required: true,
    },
  ];

  return (
    <div className="form-container">
      <h1 className="form-title">تعديل دور</h1>
      {data && (
        <DynamicForm
          fields={fields}
          initialValues={data}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default EditRole;
