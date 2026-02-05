import { useState, useCallback } from 'react';

/**
 * Custom hook for natural language search
 * Handles both traditional and intelligent search queries
 */
export const useNaturalSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);

  const performSearch = useCallback(async (searchText) => {
    if (!searchText || !searchText.trim()) {
      setResults([]);
      setParsed(null);
      setError('Search text is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/search/natural', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchText: searchText.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResults(data.products || []);
        setParsed(data.parsed);
        console.log(`✓ Found ${data.totalProducts} products`);
        console.log('Parsed:', data.parsed);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      setResults([]);
      setParsed(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const batchSearch = useCallback(async (searchTexts) => {
    if (!Array.isArray(searchTexts) || searchTexts.length === 0) {
      setError('Search texts array is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/search/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTexts }),
      });

      if (!response.ok) {
        throw new Error(`Batch search failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Batch search error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    performSearch,
    batchSearch,
    results,
    parsed,
    loading,
    error,
    setResults,
    setParsed,
  };
};
