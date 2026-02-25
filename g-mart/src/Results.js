import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import './results.css'
import { faCartShopping ,faLocationArrow, faUser,faCirclePlus,faStar} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaStar } from 'react-icons/fa';
import {AiFillStar,AiOutlineStar} from 'react-icons/ai';
import { useNaturalSearch } from './hooks/useNaturalSearch';
import SmartSearchFilter from './SmartSearchFilter';

const Results = () => {

  const navigate = useNavigate();
  const { performSearch } = useNaturalSearch();
  const [searchResults, setSearchResults] = useState([]);
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [showFilters, setShowFilters] = useState(true); // Show filters by default on desktop
  const { searchterm } = useParams();
  const stars = 3;

  const handlePassing = (product_Id) => {
    navigate(`/rate-page/${product_Id}`);
  }

  const handleDetails = (product_Id) => {
    navigate(`/details/${product_Id}`);
  }

    // function to handle add cart event to database 
    const addtoCart = async (product)=>{
      const userdata = localStorage.getItem('token')
      const username = userdata;
      console.log('User Token derrived data is : ',username);
      const response = await fetch('http://localhost:5000/api/addcart',{
        method:'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization : `Bearer  ${localStorage.getItem('token')}`,
        },
        body:JSON.stringify({
          pid:product._id,
          usertoken:userdata,
          name:product.name,
          price:product.price,
          description:product.description,
          url:product.url,
          stars:0
        })
      });

      if (response.ok){
        const data = await response.json();
        alert(data.message);
      }

      else{
        alert('Error:While trying to connect to Server')
      }
    }

// Function to render stars
const renderStars = (stars,count) => {
  const avg = Math.floor(stars /count);
  console.log('Search result stars and count',stars,count);
  const maxStars = 5;
  if(avg > 0){
    const filledStars = Array(avg).fill(<AiFillStar className="text-yellow-500" style={{display:'inline'}}/>);
  const emptyStars = Array(maxStars - avg).fill(<AiOutlineStar className="text-gray-400" style={{display:'inline'}}/>);
  return [...filledStars, ...emptyStars];
  }

  else if (stars === 0){
    const emptyStars = Array(5).fill(<AiOutlineStar className="text-gray-400" style={{display:'inline'}}/>);
  return [...emptyStars];
  }
};

// Handle filters apply
const handleFiltersApply = async (filters) => {
  setAppliedFilters(filters);
  setLoading(true);
  try {
    const response = await fetch('http://localhost:5000/api/filters/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });

    const data = await response.json();

    if (data.success) {
      console.log('✓ Filter search successful');
      setSearchResults(data.products || []);
      setParsed(null); // Clear parsed info when using filters
    } else {
      console.log('Filter search failed');
      setSearchResults([]);
    }
  } catch (error) {
    console.error('Filter search error:', error);
    setSearchResults([]);
  } finally {
    setLoading(false);
  }
};

// Handle clear filters
const handleFiltersClear = async () => {
  setAppliedFilters(null);
  // Search again with original searchterm
  if (searchterm) {
    handleSearch(searchterm);
  }
};

// Original search function
const handleSearch = async (term) => {
  setLoading(true);
  try {
    // Try intelligent natural language search first
    const response = await fetch('http://localhost:5000/api/search/natural', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchText: term }),
    });

    const data = await response.json();

    if (data.success) {
      console.log('✓ Intelligent search successful');
      console.log('Parsed:', data.parsed);
      setSearchResults(data.products || []);
      setParsed(data.parsed);
      setAppliedFilters(null);
    } else {
      throw new Error('Intelligent search failed');
    }
  } catch (error) {
    console.log('Intelligent search failed, using fallback:', error);
    // Fallback to traditional search
    try {
      const response = await fetch(`http://localhost:5000/api/product/search?name=${term}`);
      const data = await response.json();
      const resultsArray = Array.isArray(data) ? data : [data];
      if (response.ok) {
        console.log('✓ Fallback search successful');
        setSearchResults(resultsArray);
      } else {
        setSearchResults([]);
      }
    } catch (fallbackError) {
      console.error('Both searches failed:', fallbackError);
      setSearchResults([]);
    }
  } finally {
    setLoading(false);
  }
};

    useEffect(() => {
      if (searchterm) {
        handleSearch(searchterm);
      }
    }, [searchterm]);
  return (
    <>
      <div>
        <h1 className='new-font pt-32 font-bold text-2xl'>Search Results for "{searchterm}":</h1>

        {/* Filter Toggle */}
        <div style={{ marginTop: '16px', marginBottom: '12px' }}>
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

        {/* Smart Search Filters */}
        {showFilters && (
          <div style={{ marginTop: '12px' }}>
            <SmartSearchFilter
              onFiltersApply={handleFiltersApply}
              onFiltersClear={handleFiltersClear}
              compact={true}
            />
          </div>
        )}

        {/* Show applied filters info */}
        {appliedFilters && (
          <div style={{
            backgroundColor: '#fff7e6',
            border: '1px solid #1A4CA6',
            padding: '12px',
            marginTop: '12px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#333' }}>
              <strong>🧰 Filters Applied:</strong>
              {' '}Categories: <span style={{ color: '#1A4CA6', fontWeight: 'bold' }}>{appliedFilters.categories?.length ? appliedFilters.categories.join(', ') : 'All'}</span>
              {' | '}Brands: <span style={{ color: '#1A4CA6', fontWeight: 'bold' }}>{appliedFilters.brands?.length ? appliedFilters.brands.join(', ') : 'All'}</span>
              {' | '}Colors: <span style={{ color: '#1A4CA6', fontWeight: 'bold' }}>{appliedFilters.colors?.length ? appliedFilters.colors.join(', ') : 'All'}</span>
              {' | '}Price: ₹{(appliedFilters.minPrice ?? 0).toLocaleString()}-₹{(appliedFilters.maxPrice ?? 0).toLocaleString()}
              {' | '}Rating: <span style={{ color: '#1A4CA6', fontWeight: 'bold' }}>{appliedFilters.minRating ? `${appliedFilters.minRating}+` : 'All'}</span>
              {' | '}Sort: <span style={{ color: '#1A4CA6', fontWeight: 'bold' }}>{appliedFilters.sortBy}</span>
            </p>
          </div>
        )}
        
        {/* Display parsed search info */}
        {parsed && (
          <div style={{
            backgroundColor: '#f0f4ff',
            border: '1px solid #1A4CA6',
            padding: '12px',
            marginTop: '16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#333' }}>
              <strong>🔍 Smart Search:</strong> Category: <span style={{ color: '#1A4CA6', fontWeight: 'bold' }}>{parsed.query}</span>
              {' | '} Budget: ₹{parsed.budgetMin.toLocaleString()}-₹{parsed.budgetMax.toLocaleString()}
              {' | '} Sorted by: <span style={{ color: '#1A4CA6', fontWeight: 'bold' }}>{parsed.sortBy}</span>
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Searching...</p>
          </div>
        )}

        <div className="search-results pt-4">
          {searchResults.length > 0 ? (
            searchResults.map(product => (
              <div key={product._id} className="product-card pt-12">
                <img src={product.url} alt={product.name} />
                <h1 className='text-2xl text-black font-bold new-font' style={{marginTop:'0.25rem'}} onClick={(e)=>{e.preventDefault();handleDetails(product._id)}}>{product.name}</h1>
                <p><FontAwesomeIcon icon={faStar} /></p>
                <div className='flex items-center mt-2'>
                  {renderStars(product.stars,product.count)}
                </div>
                <p className='text-gray-600 mt-1'>Price: <p className='text-blue-500 inline mt-1 font-extrabold'>${product.price}</p></p>
                <p className='text-gray-600 line-clamp-2 mt-1'>{product.description}</p>
                <button className='rounded-xl new-font w-full mt-2' style={{backgroundColor:'#1A4CA6',color:'white'}} onClick={()=> addtoCart(product)}>Add to cart</button>
                <br />
                <button className='rounded-xl new-font w-full mt-2' style={{backgroundColor:'#1A4CA6',color:'white'}}>Buy Now</button>
                <br />
                {/* <button className='rounded-xl new-font w-full mt-2' style={{backgroundColor:'#1A4CA6',color:'white'}} onClick={(e)=>{e.preventDefault();handlePassing(product._id)}}>Rate this product</button> */}
              </div>
            ))
            
          ) : (
            <p>No products found.</p>
          )}
        </div>
      
    </div>
    </>
  )
}

export default Results