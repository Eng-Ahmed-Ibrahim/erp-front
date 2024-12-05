
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

const UpdateWiter = () => {
  const item = useLocation()?.state?.item
  const [isPending, setIsPending] = useState(false)
  const [name, setName] = useState(item?.name)
  const [places, setPlaces] = useState(item?.places)


  const handelSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true)
    try {
      await axios
        .put(
          `/invest/`,
          {
            name: name,
            places: places,
          },
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            }
          }
        )
        .then((response) => {
          // // console.log('created success', response.data);
        });
      setIsPending(false);
    } catch (err) {
      setIsPending(false);
      // // console.log('response', err.response);

    }
  }
  return (
    <div>
      <div className="shadow-lg p-3 mb-5 rounded text-center fs-2 fw-bold shifts text-light" > تعديل   </div>
      {isPending && <div className='loading'></div>}
      <form onSubmit={handelSubmit}>
        <div className="mb-3">
          <label htmlFor="exampleInputName" className="form-label">اسم الويتر</label>
          <input
            type="text"
            className="form-control"
            id="exampleInputName"
            aria-describedby="textHelp"
            placeholder='ادخل اسم الويتر'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputPlace" className="form-label">المنفذ</label>
          <input
            type="text"
            className="form-control"
            id="exampleInputPlace"
            aria-describedby="placeHelp"
            placeholder='ادخل اسم المنفذ'
            value={places}
            onChange={(e) => setPlaces(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary">تعديل</button>
      </form>
    </div>
  )
}

export default UpdateWiter

