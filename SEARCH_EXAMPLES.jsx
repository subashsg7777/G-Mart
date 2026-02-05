/**
 * Quick Start Example - How to Use Intelligent Search
 * Copy & paste these examples into your React components
 */

// ============ EXAMPLE 1: Simple Search ============
import { useNaturalSearch } from './hooks/useNaturalSearch';

function SimpleSearch() {
  const { performSearch, results, loading } = useNaturalSearch();

  return (
    <div>
      <button onClick={() => performSearch('best shoe under 1500')}>
        Find Best Shoe
      </button>
      
      {loading && <p>Searching...</p>}
      
      {results.length > 0 && (
        <div>
          <h2>Found {results.length} products</h2>
          {results.map(product => (
            <div key={product._id}>
              <h3>{product.name}</h3>
              <p>Price: ₹{product.price}</p>
              <p>Rating: {product.rating}⭐</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ EXAMPLE 2: Custom Search Input ============
import { useNaturalSearch } from './hooks/useNaturalSearch';
import { useState } from 'react';

function CustomSearch() {
  const [query, setQuery] = useState('');
  const { performSearch, results, parsed, loading, error } = useNaturalSearch();

  const handleSearch = async () => {
    await performSearch(query);
  };

  return (
    <div>
      <input 
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g., best shoe under 1500"
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button onClick={handleSearch}>Search</button>

      {error && <p style={{color: 'red'}}>Error: {error}</p>}
      
      {parsed && (
        <div style={{backgroundColor: '#f0f4ff', padding: '10px', margin: '10px 0'}}>
          <p><strong>Category:</strong> {parsed.query}</p>
          <p><strong>Budget:</strong> ₹{parsed.budgetMin} - ₹{parsed.budgetMax}</p>
          <p><strong>Intent:</strong> {parsed.intent}</p>
          <p><strong>Sorted by:</strong> {parsed.sortBy}</p>
        </div>
      )}

      {loading && <p>🔍 Searching...</p>}
      
      {results.length > 0 && (
        <div>
          <h3>Results ({results.length} found)</h3>
          {results.slice(0, 5).map(product => (
            <div key={product._id} style={{border: '1px solid #ccc', padding: '10px', margin: '10px 0'}}>
              <h4>{product.name}</h4>
              <p>₹{product.price} | {product.rating}⭐ ({product.reviews} reviews)</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ EXAMPLE 3: Search with Filters ============
import { useNaturalSearch } from './hooks/useNaturalSearch';
import { useState } from 'react';

function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(5000);
  const { performSearch, results, parsed } = useNaturalSearch();

  const handleSearch = async () => {
    await performSearch(query);
  };

  // Filter results by max price slider
  const filteredResults = results.filter(p => p.price <= maxPrice);

  return (
    <div>
      <div style={{marginBottom: '20px'}}>
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          style={{width: '100%', padding: '8px'}}
        />
        <button onClick={handleSearch} style={{width: '100%', padding: '8px', marginTop: '10px'}}>
          Search
        </button>
      </div>

      {parsed && (
        <div style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f0f4ff'}}>
          <p><strong>Smart Search Info:</strong></p>
          <p>Category: <strong>{parsed.query}</strong></p>
          <p>Budget: ₹{parsed.budgetMin} - ₹{parsed.budgetMax}</p>
          <p>Sorted by: <strong>{parsed.sortBy}</strong></p>
        </div>
      )}

      <div style={{marginBottom: '20px'}}>
        <label>
          Max Price: ₹{maxPrice}
          <input 
            type="range"
            min="0"
            max="10000"
            step="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            style={{width: '100%'}}
          />
        </label>
      </div>

      <div>
        <h3>Results ({filteredResults.length})</h3>
        {filteredResults.length > 0 ? (
          filteredResults.map(product => (
            <div key={product._id} style={{border: '1px solid #ddd', padding: '12px', marginBottom: '10px'}}>
              <h4 style={{margin: '0 0 8px 0'}}>{product.name}</h4>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <p style={{margin: '4px 0', color: '#1A4CA6', fontWeight: 'bold'}}>
                    ₹{product.price}
                  </p>
                  <p style={{margin: '4px 0', color: '#666'}}>
                    {product.rating}⭐ ({product.reviews} reviews)
                  </p>
                </div>
                <button style={{
                  backgroundColor: '#1A4CA6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No products found</p>
        )}
      </div>
    </div>
  );
}

// ============ EXAMPLE 4: Search Suggestions ============
import { useNaturalSearch } from './hooks/useNaturalSearch';
import { useState } from 'react';

function SearchWithSuggestions() {
  const [query, setQuery] = useState('');
  const [suggestions] = useState([
    'best shoe under 1500',
    'affordable phone with good reviews',
    'top-rated laptop between 50k-100k',
    'value for money headphones under 5k',
    'shoe starting from 1200-2000',
  ]);
  
  const { performSearch, results } = useNaturalSearch();

  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{position: 'relative', width: '100%'}}>
      <input 
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g., best shoe under 1500"
        style={{width: '100%', padding: '10px'}}
      />

      {query && filteredSuggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          zIndex: 100
        }}>
          {filteredSuggestions.map((suggestion, idx) => (
            <div
              key={idx}
              onClick={() => {
                setQuery(suggestion);
                performSearch(suggestion);
              }}
              style={{
                padding: '10px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                ':hover': {backgroundColor: '#f5f5f5'}
              }}
            >
              🔍 {suggestion}
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div style={{marginTop: '20px'}}>
          <h3>Found {results.length} products</h3>
          {/* Display results here */}
        </div>
      )}
    </div>
  );
}

// ============ EXAMPLE 5: Batch Search ============
import { useNaturalSearch } from './hooks/useNaturalSearch';

function BatchSearch() {
  const { batchSearch } = useNaturalSearch();

  const handleBatchSearch = async () => {
    const queries = [
      'best shoe under 1500',
      'laptop between 50k-100k',
      'affordable phone under 30k'
    ];

    const results = await batchSearch(queries);
    console.log('Batch results:', results);
  };

  return (
    <button onClick={handleBatchSearch}>
      Perform Batch Search
    </button>
  );
}

export { SimpleSearch, CustomSearch, AdvancedSearch, SearchWithSuggestions, BatchSearch };
