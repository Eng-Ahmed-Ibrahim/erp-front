import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_ENDPOINT } from "../../../../../../../../config";
import axios from "axios";
const AddNewProduct2 = () => {
  const navigate = useNavigate();
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [isPending, setIsPending] = useState(false);
  const item = useLocation()?.state?.item;
  // console.log(item);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const hanelSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await axios
        .post(
          `${API_ENDPOINT}/api/v1/store/sub_categories/create`,
          {
            name: name,
            description: description,
            image: image,
            category_id: item?.id,
          },
          {
            headers: {
              Authorization: `Bearer ${Token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((response) => {
          setName('')
          setDescription('')
          setImage('')
          // console.log("created success", response)
        });
      setIsPending(false);
    } catch (err) {
      setIsPending(false);
      // console.log("response" + err);
    }
  };

  return (
    <div>
      <div className="my-5">
        <h1 className="heading text-center p-3">اضافه قسم فرعى</h1>
      </div>
      <form onSubmit={hanelSubmit}>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            التصنيف الرئيسي
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
            الاسم
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
            الوصف
          </label>
          <textarea
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={description}
            onChange={(e) => setDescription(e?.target?.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="file"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            onChange={(e) => setImage(e?.target?.files[0])}
          />
        </div>
        <div className="d-grid gap-2">
          <button className="btn btn-primary" type="submit">
            اضافه جديد
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewProduct2;
