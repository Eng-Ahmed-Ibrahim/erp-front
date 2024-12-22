import Table from "../../../../../components/shared/table/Table";
import { useParams } from "react-router-dom";
import { getRcipeReports } from "../../../../../apis/reports";
import { getRecipeCategoryParent } from "../../../../../apis/recipes/recipeCategoryParent";
import React, { useEffect, useState } from "react";
import TotalAmount from "../../../../../components/shared/totalAmount/TotalAmount";
import { API_ENDPOINT } from "../../../../../../config";

const ShowRecipeReports = () => {
    const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [RecipeCategoryParent, setRecipeCategoryParent] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState("");
  const [mainCat, setMainCat] = useState("");
  const [recipeCategoryParents, setRecipeCategoryParents] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Control visibility of the dropdown


  useEffect(() => {
    const fetchRecipeCategoryParents = async () => {
        try {
          const response = await fetch(
            `${API_ENDPOINT}/api/v1/store/recipe_category_parent/all`,
            {
              headers: {
                Authorization: `Bearer ${Token}`,
              },
            }
          );
          const data = await response.json();
          setRecipeCategoryParents(data.data);
        } catch (error) {
          console.error("Error fetching recipe category parents:", error);
        }
      };
    const fetchRecipeCategoryParent = async () => {
      const res = await getRecipeCategoryParent({}, "", setIsLoading);
      setRecipeCategoryParent(res.data);
    };

    // fetchRecipeCategoryParents();
    fetchRecipeCategoryParent();
    fetchRecipeCategoryParents();
  }, []);
  const tableHeaders = [
    { key: "name", value: "الإسم" },
    { key: "out_going", value: "اجمالي المصروف للقسم " },
    { key: "returned_to", value: "مرتجع اليه" },
    { key: "returned_from", value: "مرتجع منه" },
    { key: "total_quantity", value: "اجمالي الكميه بعد المرتجع والهالك" },
    { key: "total_price", value: "اجمالي السعر " },
  ];

  const { id } = useParams();
  const filters = [
    { key: "from_date", type: "date", id: "من تاريخ" },
    { key: "to_date", type: "date", id: "إلى تاريخ" },
    { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
    {
      key: "category_id",
      type: "selection",
      id: "نوع القسم",
      placeholder: "إختار قسم لإظهار نتائج",
      options: RecipeCategoryParent.map((category) => {
        return { value: category.id, label: category.name };
      }),
    //   multi: true,
    },
    // {
    //     key: "department_ids",
    //     type: "multi-selection",
    //     id: "الأقسام",
    //     placeholder: "إختر الأقسام",
    //     options: recipeCategoryParents.map((parent) => {
    //       return { value: parent.id, label: parent.name };
    //     }),
    //   }

  ];
 

//   const handleCheckboxChange = (event) => {
//     const { value, checked } = event.target;
//     setSelectedDepartments((prevSelected) => {
//       if (checked) {
//         return [...prevSelected, value];
//       } else {
//         return prevSelected.filter((id) => id !== value);
//       }
//     });

//     console.log(selectedDepartments)
//   };

//   const handleSubmit = () => {
//     console.log("Filtering with selected department IDs:", selectedDepartments);
//     fetchData(selectedDepartments);
//   };

  
//   const fetchData = (parentId) => {
//     axios
//       .get(`${API_ENDPOINT}/api/v1/search`, {
//         headers: {
//           Authorization: `Bearer ${Token}`,
//         },
//         params: {
//           data: {
//             parent_id: parentId,
//             department_id: item?.id,
//           },
//         },
//       })
//       .then((res) => {
//         setData(res?.data?.data);
//         setIsDataFetched(true);
//         const modal = Modal.success({
//           title: "success",
//           content: (
//             <div style={{ fontSize: "24px", textAlign: "center" }}>
//               تم عرض المواد الخام بنجاح
//             </div>
//           ),
//           centered: true,
//           width: 400,
//         });

//         setTimeout(() => {
//           modal.destroy();
//         }, 2000);
//       })
//       .catch((err) => {
//         setError("Failed to load data");
//         const modal = Modal.error({
//           title: "success",
//           content: (
//             <div style={{ fontSize: "24px", textAlign: "center" }}>
//               {" "}
//               حدث خطا ما
//             </div>
//           ),
//           centered: true,
//           width: 400,
//         });

//         setTimeout(() => {
//           modal.destroy();
//         }, 4000);
//         console.log(err);
//       });
//   };
  return (
    <div>


      {/* <div className="mb-3">
        <label htmlFor="exampleInputEmail1" className="form-label">
          القسم :
        </label>
        <select
          className="form-select"
          aria-label="المنفذ"
          value={value}
          onChange={(e) => {
            const selectedText = e.target.selectedOptions[0].text;
            setValue(e.target.value);
            setMainCat(selectedText);
          }}
        >
          <option value=""> من فضلك اختر القسم</option>
          {recipeCategoryParents.map((parent, index) => (
            <option key={parent.id} value={parent.id}>
              {parent.name}
            </option>
          ))}
        </select>
        <button onClick={handleSubmit} className="pdf-button">
          {" "}
          فلتره
        </button>
      </div> */}
      
      {/* <div className="table-title">
        <h3>تقارير المكونات</h3>
      </div> */}
     {/* <div className="department-selection">
        <button
          className="dropdown-toggle"
          onClick={() => setIsDropdownVisible(!isDropdownVisible)}
        >
          اختيار الأقسام
        </button>

        {isDropdownVisible && (
          <div className="checkbox-dropdown">
            {recipeCategoryParents.map((parent) => (
              <div key={parent.id} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`department-${parent.id}`}
                  value={parent.id}
                  checked={selectedDepartments.includes(parent.id)}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor={`department-${parent.id}`}>
                  {parent.name}
                </label>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleSubmit} className="pdf-button">
          فلتره
        </button>
      </div> */}

      <Table
        headers={tableHeaders}
        filters={filters}
        title="تقارير المكونات"
        id={id}
        fetchData={(filters, id, setIsLoading) =>
          getRcipeReports(filters, id, setIsLoading)
        }
        getTotalPrice={async (filters, id, setIsLoading) => {
          const data = await getRcipeReports(filters, id, setIsLoading);
          return data.total_price;
        }}
      />

      {/* Styles directly embedded */}
      <style jsx="true">{`
        /* Add your custom styles here */
        .table-title {
          margin-bottom: 20px;
        }

        .department-selection {
          margin-bottom: 20px;
          position: relative;
        }

        .dropdown-toggle {
          background-color: #Af8260 ;
          color: white;
          padding: 10px;
          border: none;
          cursor: pointer;
          border-radius: 5px;
          font-size: 16px;
          width: 60%;
          transition: background-color 0.3s ease;
          margin-left: 50px;
        }

        .dropdown-toggle:hover {
          background-color: #Af8260;
        }

        .checkbox-dropdown {
          display: flex;
          flex-direction: column;
          margin-top: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: white;
          position: absolute;
          z-index: 1000;
          width: 60%;
        font-size: 16px;
          padding: 10px;
        }

        .form-check {
          margin-bottom: 10px;
        }

        .form-check-input {
          margin-right: 10px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .form-check-input:hover {
          transform: scale(1.1);
        }

        .form-check-label {
          font-size: 16px;
          cursor: pointer;
        }

        .pdf-button:hover {
          background-color: #218838;
        }
      `}</style>
    </div>
  );
};

export default ShowRecipeReports;


