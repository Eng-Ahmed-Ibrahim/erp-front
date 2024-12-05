import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_ENDPOINT } from "../../../../../../../../config";
import axios from "axios";
import { message } from "antd";
const CreateNewProduct2 = () => {
  const navigate = useNavigate();
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [isPending, setIsPending] = useState(false);
  const item = useLocation()?.state?.item;
   console.log('item', item);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [offer, setOffer] = useState("");

  const getInitialState = () => {
    const value = "department";
    return value;
  };
  const [value, setValue] = useState(getInitialState);

  const handleChange = (e) => {
    setValue(e.target.value);
  };
  // console.log(value);

  const hanelSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await axios
        .post(
          `${API_ENDPOINT}/api/v1/store/products/create`,
          {
            name: name,
            // category_id: item?.id,
            category_id: item?.category.id,
            sub_category_id: item.id,
            offer: 12,
            image: image,
            description: description,
            price: price,
            type: value,
          },
          {
            headers: {
              Authorization: `Bearer ${Token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((response) => {
          setName("");
          setDescription("");
          setImage("");
          message.success('تم اضافه المنتج بنجاح')
          // // console.log("created success", response);
        });
      setIsPending(false);
    } catch (err) {
      setIsPending(false);
      message.error('حدث خطأ ما')
      // console.log("response" + err);
    }
  };

  return (
    <div>
      <div className="my-5">
        <h1 className="heading text-center p-3"> اضافه منتج داخل القسم </h1>
      </div>
      <form onSubmit={hanelSubmit}>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            القسم:
          </label>
          <input
            type="email"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={item?.name}
            disabled
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            اسم المنتج:
          </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={name}
            onChange={(e) => {
              setName(e?.target?.value);
            }}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            وصف المنتج:
          </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={description}
            onChange={(e) => setDescription(e?.target?.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            سعر التكلفة :
          </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={price}
            onChange={(e) => setPrice(e?.target?.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            نوع المنتج:
          </label>
          <select
            className="form-select"
            aria-label="نوع المنتج"
            value={value}
            onChange={handleChange}
          >
            <option> </option>
            <option value="department">من المنفذ </option>
            <option value="kitchen">من المطبخ </option>
            <option value="pastryKitchen">مطبخ الحلوانى </option>
          </select>
        </div>
        {/* ////////////////// */}
        {/* <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            الربح :
          </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={description}
            onChange={(e) => setDescription(e?.target?.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            اجمالى السعر:
          </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={description}
            onChange={(e) => setDescription(e?.target?.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            الخدمة:
          </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={description}
            onChange={(e) => setDescription(e?.target?.value)}
          />
        </div> */}
        {/* /////// */}
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            اضف صوره للمنتج
          </label>
          <input
            type="file"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            onChange={(e) => setImage(e?.target?.files[0])}
          />
        </div>

        {/* <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            انوع العملاء:
          </label>
          <select className="form-select" aria-label="نوع المنتج">
            <option value="1"> </option>
            <option value="1">من المنفذ </option>
            <option value="2">من المطبخ </option>
            <option value="3">مطبخ الحلوانى </option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            اسماء العملاء :
          </label>
          <select className="form-select" aria-label="نوع المنتج">
            <option value="1"> </option>
            <option value="1">من المنفذ </option>
            <option value="2">من المطبخ </option>
            <option value="3">مطبخ الحلوانى </option>
          </select>
        </div> */}
        <div className="d-grid gap-2">
          <button className="btn btn-primary" type="submit">
            اضافة منتج جديد
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNewProduct2;
