import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import './results.css'
const Results = () => {

    // necessary use states 
    const [searchResults,setSearchResults] =useState([]);
    const {searchterm} = useParams();
    useEffect(()=>{
        // funnction to handle the search eevents 
    const handleSearch = async (e)=>{
        // creating the fetch request 
        try{
          const response = await fetch(`http://localhost:5000/api/product/search?name=${searchterm}`);
        const data = await response.json();
        const resultsArray = Array.isArray(data) ? data : [data];
        // checking if the data is sucessfully searched or not 
        if(response.ok){
          alert('Search Sucessfull !..');
          console.log(resultsArray);
          setSearchResults(resultsArray);
          
          console.log(searchResults.name)
        }
  
        else{
          alert('No Items Found')
          setSearchResults(resultsArray); 
          console.log(searchResults.name)
        }
        }
  
        catch(error){
          console.log('Error while Search Fetch : '+error);
        }
      }

      handleSearch();
    },[searchterm   ])
  return (
    <div>
      <h1>Search Results for "{searchterm}"</h1>
        <div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map(product => (
              <div key={product._id} className="product-card">
                <img src={product.imageUrl} alt={product.name} />
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>Price: ${product.price}</p>
              </div>
            ))
            
          ) : (
            <p>No products found.</p>
          )}
        </div>
      
    </div>
  )
}

export default Results