// import React, { useEffect, useState } from 'react';
// import { AiFillStar,AiOutlineStar } from 'react-icons/ai';

// const OrderDetails = () => {
//     const [orderDetails, setOrderDetails] = useState([]); // Initialize as an array
//     const [productDetail, setProductDetail] = useState([]);

//     useEffect(() => {
//         const handleDataRequests = async () => {
//             const credential = localStorage.getItem('credentials');

//             try {
//                 const orderResponse = await fetch('http://localhost:5000/order-details', {
//                     headers: { 'Content-Type': 'application/json' },
//                     method: 'POST',
//                     body: JSON.stringify({ credential }),
//                 });

//                 if (orderResponse.ok) {
//                     console.log("Order details fetched successfully!");
//                     const data = await orderResponse.json();
//                     setOrderDetails(data.data); // Use 'data.data' if that's the array in your server response
//                 }

                
//             } catch (error) {
//                 console.log('Error while retrieving order details from server:', error);
//             }

            
//         };

//         handleDataRequests();
//     }, []); // Add dependency to refetch products when `orderDetails` updates

//     // second useEffect for retriving product details \
//     useEffect(()=>{
//         const handleProductDataRetrival = async ()=>{
//             // Extract product IDs
//             const extractedProductIds = orderDetails.map(order => order.product_Id);
//             console.log('Extracted Product IDs:', extractedProductIds);

//             // Fetch product details
//             try {
//                 const productResponse = await fetch('http://localhost:5000/order-products', {
//                     headers: { 'Content-Type': 'application/json' },
//                     method: 'POST',
//                     body: JSON.stringify({ product_Id: extractedProductIds }),
//                 });

//                 if (productResponse.ok) {
//                     const productData = await productResponse.json();
//                     setProductDetail(productData.data); // Update product details
//                     console.log("Product Detail Retrival Completed |!..")
//                 }
//             } catch (error) {
//                 console.log('Error fetching product details:', error);
//             }
//         }
//         handleProductDataRetrival();
//     },[orderDetails]);

//     // Function to render stars
// const renderStars = (stars) => {
//     const maxStars = 5;
//     if(stars > 0){
//       const filledStars = Array(stars).fill(<AiFillStar className="text-yellow-500" style={{display:'inline'}}/>);
//     const emptyStars = Array(maxStars - stars).fill(<AiOutlineStar className="text-gray-400" style={{display:'inline'}}/>);
//     return [...filledStars, ...emptyStars];
//     }
  
//     else if (stars == 0){
//       const emptyStars = Array(5).fill(<AiOutlineStar className="text-gray-400" style={{display:'inline'}}/>);
//     return [...emptyStars];
//     }
//   };

//     return <>
//     {!productDetail ? <h1>No Data</h1> :
//     productDetail.map((product,index)=>{
//         return (
//             <div key={index} style={{border:'1px solid black',width:'98%',display:'flex',alignItems:'center'}} className='m-4' >
//             <img src={product.url} alt={product.name} style={{display:'inline',width:'300px',height:'fit-content'}}/>
//             <div className='side mt-3' style={{display:'inline-block',marginLeft:'20px',width:'65%',marginTop:'0.75rem'}}>
//             <h1 className='tittle new-font font-bold'>{product.name}</h1>
//             <h3 className='money font-extrabold mt-3'>{product.price}</h3>
//             <p className='desc new-font mt-2'>{product.description}</p>
//             <div className='inline'>
//             <button className='text-white p-2 new-font rounded-2xl mt-3' style={{backgroundColor:'#1A4CA6',width:'150px'}}>Buy Now !..</button>
//             </div>
//             <div className='inline-block'>
//               <button className='text-white new-font rounded-2xl mt-3 ml-3 ' style={{backgroundColor:'#1A4CA6',width:'180px',display:'flex',alignContent:'center',padding:'8px 12px'}} >Remove From Cart</button>
//             </div>
//             {/* <div className='inline-block'>li
//               <button className='text-white new-font rounded-2xl mt-3 ml-3 ' style={{backgroundColor:'black',width:'180px',display:'flex',alignContent:'center',padding:'8px 12px'}} onClick={(e)=>{e.preventDefault();handlePassing(product._id);}}>Rate This Product</button>
//             </div> */}
//             </div>
//             <div className='mt-3' style={{display:'inline-block'}}>
//             {renderStars(product.stars)}
//             </div>
            
//           </div>
//         );
//     })
//     }
//     </>;
// };

// export default OrderDetails;

import React, { useEffect, useState } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import addToCart from './addToCart';

const OrderDetails = () => {
    const [orderDetails, setOrderDetails] = useState([]); // Initialize as an array
    const [productDetail, setProductDetail] = useState([]);

    useEffect(() => {
        const handleDataRequests = async () => {
            const credential = localStorage.getItem('credentials');

            try {
                const orderResponse = await fetch('http://localhost:5000/order-details', {
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                    body: JSON.stringify({ credential }),
                });

                if (orderResponse.ok) {
                    console.log("Order details fetched successfully!");
                    const data = await orderResponse.json();
                    setOrderDetails(data.data); // Use 'data.data' if that's the array in your server response
                }
            } catch (error) {
                console.log('Error while retrieving order details from server:', error);
            }
        };

        handleDataRequests();
    }, []); // Add dependency to refetch products when `orderDetails` updates

    useEffect(() => {
        const handleProductDataRetrieval = async () => {
            const extractedProductIds = orderDetails.map(order => order.product_Id);
            console.log('Extracted Product IDs:', extractedProductIds);

            try {
                const productResponse = await fetch('http://localhost:5000/order-products', {
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                    body: JSON.stringify({ product_Id: extractedProductIds }),
                });

                if (productResponse.ok) {
                    const productData = await productResponse.json();
                    setProductDetail(productData.search); // Update product details
                    console.log("Product Detail Retrieval Completed!",productData.search);
                }
            } catch (error) {
                console.log('Error fetching product details:', error);
            }
        };

        if (orderDetails.length > 0) {
            handleProductDataRetrieval();
        }
    }, [orderDetails]);

    const renderStars = (stars) => {
        const maxStars = 5;
        if (stars > 0) {
            const filledStars = Array(stars).fill(<AiFillStar className="text-yellow-500" />);
            const emptyStars = Array(maxStars - stars).fill(<AiOutlineStar className="text-gray-400" />);
            return [...filledStars, ...emptyStars];
        } else {
            return Array(maxStars).fill(<AiOutlineStar className="text-gray-400" />);
        }
    };

    return (
        <>
            {!productDetail.length ? (
                <h1>No Data</h1>
            ) : (
                productDetail.map((product, index) => (
                    <div
                        key={index}
                        style={{ border: '1px solid black', width: '98%', display: 'flex', alignItems: 'center',marginTop:'125px' }}
                        className="m-4 mt-3"
                    >
                        <img
                            src={product.url}
                            alt={product.name}
                            style={{ display: 'inline', width: '300px', height: 'fit-content' }}
                        />
                        <div
                            className="side mt-3"
                            style={{ display: 'inline-block', marginLeft: '20px', width: '65%', marginTop: '0.75rem' }}
                        >
                            <h1 className="tittle new-font font-bold">{product.name}</h1>
                            <h3 className="money font-extrabold mt-3">{product.price}</h3>
                            <p className="desc new-font mt-2">{product.description}</p>
                            <div className="inline">
                                <button
                                    className="text-white p-2 new-font rounded-2xl mt-3 mb-3"
                                    style={{ backgroundColor: '#1A4CA6', width: '150px' }}
                                >
                                    Buy Now !..
                                </button>
                            </div>
                            <div className="inline-block mb-3">
                                <button
                                    className="text-white new-font rounded-2xl mt-3 ml-3"
                                    style={{
                                        backgroundColor: '#1A4CA6',
                                        width: '180px',
                                        display: 'flex',
                                        alignContent: 'center',
                                        padding: '8px 12px',
                                    }}
                                    onClick={()=>addToCart(product)}
                                >
                                    Add To Cart
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 ml-3" style={{ display: 'flex' }}>
                            {renderStars(product.stars)}
                        </div>
                    </div>
                ))
            )}
        </>
    );
};

export default OrderDetails;
