import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AiFillStar,AiOutlineStar } from 'react-icons/ai';
import addToCart from './addToCart';
import SmartSearchFilter from './SmartSearchFilter';
import "./static/output.css"

const Cat = () => {
  // catagory data from hero section 
  const {cat} = useParams();
  const [data,setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const navigate = useNavigate();

  const handleDataRetrival = async ()  =>{
    setLoading(true);
    try {
      const retrival  = await fetch('http://localhost:5000/catagory',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({cat:cat})
      });

      // execution after data retrival 
      if(retrival.ok){
        const data = await retrival.json();
        console.log("Cat data : ",data.data);
        setData(data.data);
      }

      else{
        alert('Data retrival process is failed in frontend !..');
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply filters for this fixed category
  const handleFiltersApply = async (filters) => {
    setAppliedFilters(filters);
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/filters/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
          categories: [cat]
        }),
      });

      const data = await response.json();

      if (data.success) {
        setData(data.products || []);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Filter search error:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersClear = async () => {
    setAppliedFilters(null);
    await handleDataRetrival();
  };

  useEffect(()=>{
    setAppliedFilters(null);
    handleDataRetrival();
  },[cat]);
  

// Function to render stars
const renderStars = (stars) => {
  const maxStars = 5;
  if(stars > 0){
    const filledStars = Array(stars).fill(<AiFillStar className="text-yellow-500" style={{display:'inline'}}/>);
  const emptyStars = Array(maxStars - stars).fill(<AiOutlineStar className="text-gray-400" style={{display:'inline'}}/>);
  return [...filledStars, ...emptyStars];
  }

  else if (stars == 0){
    const emptyStars = Array(5).fill(<AiOutlineStar className="text-gray-400" style={{display:'inline'}}/>);
  return [...emptyStars];
  }
};

  return data ? (
    <>
    <h1 className='text-2xl new-font font-extrabold mt-[150px] mb-6 ml-2' >{cat} ({data.length}) : </h1>

    <div className='ml-2' style={{ marginBottom: '12px' }}>
      <button
        onClick={() => setShowFilters(!showFilters)}
        style={{
          backgroundColor: '#1A4CA6',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>
    </div>

    {showFilters && (
      <div className='m-2'>
        <SmartSearchFilter
          fixedCategories={[cat]}
          hideCategory={true}
          compact={true}
          onFiltersApply={handleFiltersApply}
          onFiltersClear={handleFiltersClear}
        />
      </div>
    )}

    {appliedFilters && (
      <div className='m-2' style={{
        backgroundColor: '#fff7e6',
        border: '1px solid #1A4CA6',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <p style={{ margin: '4px 0', fontSize: '14px', color: '#333' }}>
          <strong>🧰 Filters Applied:</strong>
          {' '}Brands: <span style={{ color: '#1A4CA6', fontWeight: 'bold' }}>{appliedFilters.brands?.length ? appliedFilters.brands.join(', ') : 'All'}</span>
          {' | '}Colors: <span style={{ color: '#1A4CA6', fontWeight: 'bold' }}>{appliedFilters.colors?.length ? appliedFilters.colors.join(', ') : 'All'}</span>
          {' | '}Price: ₹{(appliedFilters.minPrice ?? 0).toLocaleString()}-₹{(appliedFilters.maxPrice ?? 0).toLocaleString()}
          {' | '}Rating: <span style={{ color: '#1A4CA6', fontWeight: 'bold' }}>{appliedFilters.minRating ? `${appliedFilters.minRating}+` : 'All'}</span>
          {' | '}Sort: <span style={{ color: '#1A4CA6', fontWeight: 'bold' }}>{appliedFilters.sortBy}</span>
        </p>
      </div>
    )}

    {loading && (
      <div className='m-2'>
        <p>Loading...</p>
      </div>
    )}
    {data.map((mdata, index) => (
  <div
    key={index} // Use a unique key for each item
    style={{ border: '1px solid black', width: '98%', display: 'flex', alignItems: 'center' }}
    className='m-4'
  >
    <img
      src={mdata.url}
      alt={mdata.name}
      style={{ display: 'inline', width: '300px', height: 'fit-content' }}
    />
    <div
      className='side mt-3'
      style={{ display: 'inline-block', marginLeft: '20px', width: '65%', marginTop: '0.75rem' }}
    >
      <h1 className='tittle new-font font-bold text-[#1A4CA6] text-2xl' onClick={()=>navigate(`/details/${mdata._id}`)}>{mdata.name}</h1>
      <h3 className='money font-extrabold mt-3' style={{color:'#1A4CA6'}}>&#8377; 
      {mdata.price}/-</h3>
      <p className='desc new-font mt-2'>{mdata.description}</p>
      <div className='inline'>
        <button
          className='text-white p-2 new-font rounded-2xl mt-3'
          style={{ backgroundColor: '#1A4CA6', width: '150px',marginRight:'10px', marginBottom:'15px'}}
        >
          Buy Now !..
        </button> 
        <button className='text-white bg-white p-2 new-font rounded-2xl mt-3' style={{ backgroundColor: '#1A4CA6', width: '150px',marginBottom:'15px' }} onClick={()=> addToCart(mdata)}>Add to cart</button>
                <br />
      </div>
    </div>
    
  </div> 
))}

    </>
  ) : <p>Loading !..</p>
}

export default Cat