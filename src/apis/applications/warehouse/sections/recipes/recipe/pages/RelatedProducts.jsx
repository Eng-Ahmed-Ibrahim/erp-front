import { Link, useParams } from 'react-router-dom';
import Table from '../../../../../../components/shared/table/Table';
import useRelatedProducts, { fetchRelatedProducts } from '../../../../../../lib/services/hooks/useRelatedProducts';
import { useEffect, useState } from 'react';

export const RelatedProducts = () => {
    const { id: recipeId } = useParams();
    const { data, isError, isLoading, isSuccess } = useRelatedProducts({ recipeId });
    const [{ recipe, relatedProducts }, setData] = useState({
        recipe: { id: 0, name: '' },
        relatedProducts: []
    })
    useEffect(() => {
        if (!isLoading && isSuccess) {
            setData({
                recipe: { id: data.id, name: data.name },
                relatedProducts: data.products
            })
        }
        console.log({ data })
    }, [data])
    // console.log({ recipeId });

    return <>
        <div>

            <div className="my-5 ">
                <h1 className="heading text-center p-3"
                >المنتجات المرتبطة بـ <span className="fw-bold">{recipe.name}</span> </h1>
            </div>


            {relatedProducts?.length < 1 ? <div
                style={{ textAlign: `center` }}>
                <h2 style={{ margin: `auto` }}>لا يوجد منتجات مرتبطة</h2>
            </div> : <table
                className="table table table-hover mt-5"
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    color: "var(--text-color-inverted)",
                }}
            >
                <thead>
                    <tr className="fw-bold fs-5 my-3">
                        <th scope="col" style={{ background: '#edede9' }}>الرقم</th>
                        <th scope="col" style={{ background: '#edede9' }}>الإسم</th>
                        <th scope="col" style={{ background: '#edede9' }}>الصوره</th>
                        {/* <th scope="col" style={{ background: '#edede9' }}>سعر التكلفة</th> */}
                        <th scope="col" style={{ background: '#edede9' }}>السعر</th>
                        {/* <th scope="col" style={{ background: '#edede9' }}>الإجراءات</th> */}
                    </tr>
                </thead>
                <tbody>
                    {relatedProducts?.map((item, index) => (
                        <tr key={index} className="content-area-table">
                            <th scope="row">{index + 1}</th>
                            <td
                                className="clickable-cell"
                                style={{
                                    padding: " 14px 12px",
                                    border: "1px solid #E4C59E",
                                    color: "#803D3B",
                                    fontSize: "18px",
                                    fontWeight: "700",
                                }}
                            >
                                {item?.name}
                            </td>
                            <td
                                className="clickable-cell"
                                style={{
                                    padding: " 14px 12px",
                                    border: "1px solid #E4C59E",
                                    color: "#803D3B",
                                    fontSize: "18px",
                                    fontWeight: "700",
                                }}
                            >
                                <img src={item?.image} alt={item?.name} width={'80'} height={"60px"} />
                            </td>
                            {/* <th scope="row">{item?.cost_price.toFixed(2)} جنية</th> */}
                            <th scope="row">{item?.price.toFixed(2)} جنية</th>

                            {/* <td>
                                <Link
                                    to={`/warehouse/returants/show-resturants2/${item?.id}/updated-product`}
                                    state={{ item }}
                                >
                                    <button type="button" className="mx-3 btn btn-primary px-4" style={{ background: '#1677ff' }}>
                                        تعديل
                                    </button>
                                </Link>
                                {user?.id != '01j4qqe8nvyqm1sqawg1rfhnw3' ? (
                                    <button
                                        type="button"
                                        onClick={() => handelDelete(item.id)}
                                        className="mx-3 btn btn-danger px-4"
                                    >
                                        حذف
                                    </button>
                                ) : null}
                            </td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
            }

        </div>
    </>
}

