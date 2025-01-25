import { useState } from "react";
import { useLocation } from "react-router-dom";
import { API_ENDPOINT } from "../../../../../../../../config";
import axios from "axios";
import { useAuth } from "../../../../../../../context/AuthContext";

import { message } from "antd";
const UpdateSubProduct2 = () => {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [isPending, setIsPending] = useState(false);
  const item = useLocation()?.state?.item;
  // console.log('item', item);
  const [name, setName] = useState(item?.name);
  const [description, setDescription] = useState(item?.description);
  const [image, setImage] = useState("");
  const [price, setPrice] = useState(item?.price);
  const [priceCost, setPriceCost] = useState(item?.cost_price);
  const [type, setType] = useState(item?.type);
  const { user } = useAuth();

  const checkMenuItemPermission = (requiredPermission) => {
    if (!user?.permissions) return;
    return user
      ? user?.permissions.some(
          (permission) => permission.name === requiredPermission.name
        )
      : false;
  };

  const hanelSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await axios
        .post(
          `${API_ENDPOINT}/api/v1/store/products/update/${item?.id}`,
          {
            name: name,
            category_id: item?.id,
            sub_category_id: "",
            offer: 2,
            image: image,
            description: description,
            price: price,
            type: type,
            _method: "PUT",
          },
          {
            headers: {
              Authorization: `Bearer ${Token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((response) => {
          // console.log("created success", response);
          message.success("تم التعديل بنجاح");
          setIsPending(false);
        });
    } catch (err) {
      setIsPending(false);
      // console.log("response" + err);
    }
  };
  const handelDelete = (id) => {
    axios
      .delete(`${API_ENDPOINT}/api/v1/store/products/delete/price/${id}`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => {
        // console.log(res.data)
        message.success("تم الحذف بنجاح");
      })
      .catch((err) => {
        // console.log(err)
        message.error("حدث خطا ما");
      });
  };
  // const pricesObject = item?.prices.reduce((acc, current, index) => {
  //   acc[index] = current;
  //   return acc;
  // }, {});

  return (
    <div>
      <div className="my-5">
        <h1 className="heading text-center p-3">
          تعديل المنتج <span className="text-warning">({item?.name})</span>
        </h1>
      </div>
      <form onSubmit={hanelSubmit} className="mb-5">
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
            سعر البيع :
          </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            السعر الإسترشادي : (يجب ألا يقل عن)
          </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={item?.estimated_price?.toFixed(2)}
            disabled
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            اجمالى سعر تكلفة المنتج :
          </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={priceCost?.toFixed(2)}
            disabled
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            نوع المنتج:
          </label>
          <select
            className="form-select"
            aria-label="نوع المنتج"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option> </option>
            <option value="department">من المنفذ </option>
            <option value="kitchen">من المطبخ </option>
          </select>
        </div>
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
          <img
            src={item?.image}
            width={"70px"}
            height={"70px"}
            alt={item?.name}
            style={{ marginTop: "1rem" }}
          />
        </div>
        {checkMenuItemPermission({
          id: 103,
          name: "edit product",
        }) && (
          <div className="d-grid gap-2">
            <button className="btn btn-primary" type="submit">
              تعديل المنتج
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default UpdateSubProduct2;
