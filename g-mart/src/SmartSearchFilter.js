import React, { useState, useEffect } from 'react';
import './SmartSearchFilter.css';

const SmartSearchFilter = ({
  onFiltersApply,
  onFiltersClear,
  fixedCategories = null,
  hideCategory = false,
  initialSearchText = '',
  compact = false
}) => {
  const [filters, setFilters] = useState({
    categories: Array.isArray(fixedCategories) ? fixedCategories : [],
    brands: [],
    colors: [],
    minPrice: 0,
    maxPrice: 100000,
    minRating: 0,
    searchText: initialSearchText,
    sortBy: 'relevance'
  });

  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    brands: [],
    colors: [],
    ratings: [5, 4, 3, 2, 1],
    priceRange: { min: 0, max: 100000 },
    sortOptions: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    color: true,
    price: true,
    rating: true,
    sort: true,
    search: true
  });

  // Fetch available filter values on component mount
  useEffect(() => {
    const fetchFilterValues = async () => {
      try {
        setLoading(true);
        let url = 'http://localhost:5000/api/filters/values';
        if (Array.isArray(fixedCategories) && fixedCategories.length === 1 && fixedCategories[0]) {
          url += `?category=${encodeURIComponent(fixedCategories[0])}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          setAvailableFilters(data.filters);
          // Initialize maxPrice with the actual max from database
          setFilters(prev => ({
            ...prev,
            maxPrice: data.filters.priceRange.max
          }));
        } else {
          setError('Failed to load filter options');
        }
      } catch (err) {
        console.error('Error fetching filter values:', err);
        setError('Error loading filters');
      } finally {
        setLoading(false);
      }
    };

    fetchFilterValues();
  }, [fixedCategories]);

  const handleCategoryChange = (category) => {
    if (Array.isArray(fixedCategories)) return;
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleCategorySelect = (category) => {
    if (Array.isArray(fixedCategories)) return;
    setFilters(prev => ({
      ...prev,
      categories: category ? [category] : []
    }));
  };

  const handleBrandChange = (brand) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  };

  const handleBrandSelect = (brand) => {
    setFilters(prev => ({
      ...prev,
      brands: brand ? [brand] : []
    }));
  };

  const handleColorChange = (color) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleColorSelect = (color) => {
    setFilters(prev => ({
      ...prev,
      colors: color ? [color] : []
    }));
  };

  const handlePriceChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const handleRatingSelect = (rating) => {
    setFilters(prev => ({
      ...prev,
      minRating: rating
    }));
  };

  const handleSearchChange = (text) => {
    setFilters(prev => ({
      ...prev,
      searchText: text
    }));
  };

  const handleSortChange = (sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy
    }));
  };

  const handleApplyFilters = () => {
    const payload = {
      ...filters,
      categories: Array.isArray(fixedCategories) ? fixedCategories : filters.categories
    };
    onFiltersApply(payload);
  };

  const handleClearFilters = () => {
    setFilters({
      categories: Array.isArray(fixedCategories) ? fixedCategories : [],
      brands: [],
      colors: [],
      minPrice: 0,
      maxPrice: availableFilters.priceRange.max,
      minRating: 0,
      searchText: '',
      sortBy: 'relevance'
    });
    onFiltersClear();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return <div className="smart-filter-container"><p>Loading filters...</p></div>;
  }

  if (error) {
    return <div className="smart-filter-container"><p className="error">{error}</p></div>;
  }

  // Compact / landscape toolbar layout (intended for category page)
  if (compact) {
    const selectedBrand = filters.brands?.[0] || '';
    const selectedColor = filters.colors?.[0] || '';
    const selectedCategory = filters.categories?.[0] || '';

    return (
      <div className="smart-filter-container smart-filter-compact">
        <div className="compact-row">
          <div className="compact-item compact-search">
            <input
              type="text"
              placeholder="Search in this category..."
              className="search-input"
              value={filters.searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {!hideCategory && !Array.isArray(fixedCategories) && (
            <div className="compact-item">
              <select
                className="compact-select"
                value={selectedCategory}
                onChange={(e) => handleCategorySelect(e.target.value)}
              >
                <option value="">All Categories</option>
                {availableFilters.categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <div className="compact-item">
            <select
              className="compact-select"
              value={selectedBrand}
              onChange={(e) => handleBrandSelect(e.target.value)}
            >
              <option value="">All Brands</option>
              {availableFilters.brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="compact-item">
            <select
              className="compact-select"
              value={selectedColor}
              onChange={(e) => handleColorSelect(e.target.value)}
            >
              <option value="">All Colors</option>
              {availableFilters.colors.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="compact-item compact-price">
            <input
              type="number"
              className="compact-number"
              value={filters.minPrice}
              onChange={(e) => handlePriceChange('minPrice', e.target.value)}
              min="0"
              max={availableFilters.priceRange.max}
              placeholder="Min ₹"
            />
            <span className="compact-sep">-</span>
            <input
              type="number"
              className="compact-number"
              value={filters.maxPrice}
              onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
              min="0"
              max={availableFilters.priceRange.max}
              placeholder="Max ₹"
            />
          </div>

          <div className="compact-item">
            <select
              className="compact-select"
              value={filters.minRating}
              onChange={(e) => handleRatingSelect(parseInt(e.target.value, 10) || 0)}
            >
              <option value={0}>All Ratings</option>
              {availableFilters.ratings.map(r => (
                <option key={r} value={r}>{r}+ ⭐</option>
              ))}
            </select>
          </div>

          <div className="compact-item">
            <select
              className="compact-select"
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              {availableFilters.sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="compact-item compact-actions">
            <button className="apply-btn" onClick={handleApplyFilters}>Apply</button>
            <button className="clear-btn" onClick={handleClearFilters}>Clear</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-filter-container">
      <div className="filter-header">
        <h2 className="filter-title">🔍 Smart Filters</h2>
        {(filters.categories.length > 0 || filters.brands.length > 0 || 
          filters.colors.length > 0 || filters.minRating > 0 || 
          filters.searchText) && (
          <button className="clear-btn" onClick={handleClearFilters}>
            Clear All
          </button>
        )}
      </div>

      {/* Search Box */}
      <div className="filter-section">
        <div className="section-header" onClick={() => toggleSection('search')}>
          <h3>🔎 Search Products</h3>
        </div>
        {expandedSections.search !== false && (
          <div className="section-content">
            <input
              type="text"
              placeholder="Search by name, brand, color..."
              className="search-input"
              value={filters.searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Category Filter */}
      {!hideCategory && !Array.isArray(fixedCategories) && (
        <div className="filter-section">
          <div className="section-header" onClick={() => toggleSection('category')}>
            <h3>📦 Category</h3>
            <span className="toggle-icon">{expandedSections.category ? '▼' : '▶'}</span>
          </div>
          {expandedSections.category && (
            <div className="section-content">
              <select
                className="search-input"
                value={filters.categories?.[0] || ''}
                onChange={(e) => handleCategorySelect(e.target.value)}
              >
                <option value="">All Categories</option>
                {availableFilters.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Brand Filter */}
      {availableFilters.brands.length > 0 && (
        <div className="filter-section">
          <div className="section-header" onClick={() => toggleSection('brand')}>
            <h3>🏢 Brand</h3>
            <span className="toggle-icon">{expandedSections.brand ? '▼' : '▶'}</span>
          </div>
          {expandedSections.brand && (
            <div className="section-content">
              <select
                className="search-input"
                value={filters.brands?.[0] || ''}
                onChange={(e) => handleBrandSelect(e.target.value)}
              >
                <option value="">All Brands</option>
                {availableFilters.brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Color Filter */}
      {availableFilters.colors.length > 0 && (
        <div className="filter-section">
          <div className="section-header" onClick={() => toggleSection('color')}>
            <h3>🎨 Color</h3>
            <span className="toggle-icon">{expandedSections.color ? '▼' : '▶'}</span>
          </div>
          {expandedSections.color && (
            <div className="section-content">
              <select
                className="search-input"
                value={filters.colors?.[0] || ''}
                onChange={(e) => handleColorSelect(e.target.value)}
              >
                <option value="">All Colors</option>
                {availableFilters.colors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Price Filter */}
      <div className="filter-section">
        <div className="section-header" onClick={() => toggleSection('price')}>
          <h3>💰 Price</h3>
          <span className="toggle-icon">{expandedSections.price ? '▼' : '▶'}</span>
        </div>
        {expandedSections.price && (
          <div className="section-content">
            <div className="price-inputs">
              <div className="price-input-group">
                <label>Min: ₹</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                  min="0"
                  max={availableFilters.priceRange.max}
                  className="price-input"
                />
              </div>
              <div className="price-input-group">
                <label>Max: ₹</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                  min="0"
                  max={availableFilters.priceRange.max}
                  className="price-input"
                />
              </div>
            </div>
            <div className="price-range-display">
              ₹{filters.minPrice.toLocaleString()} - ₹{filters.maxPrice.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="filter-section">
        <div className="section-header" onClick={() => toggleSection('rating')}>
          <h3>⭐ Rating</h3>
          <span className="toggle-icon">{expandedSections.rating ? '▼' : '▶'}</span>
        </div>
        {expandedSections.rating && (
          <div className="section-content">
            <select
              className="search-input"
              value={filters.minRating}
              onChange={(e) => handleRatingSelect(parseInt(e.target.value, 10) || 0)}
            >
              <option value={0}>All Ratings</option>
              {availableFilters.ratings.map(rating => (
                <option key={rating} value={rating}>{rating}+ ⭐</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sort Filter */}
      <div className="filter-section">
        <div className="section-header" onClick={() => toggleSection('sort')}>
          <h3>↕️ Sort By</h3>
          <span className="toggle-icon">{expandedSections.sort ? '▼' : '▶'}</span>
        </div>
        {expandedSections.sort && (
          <div className="section-content">
            <select
              className="search-input"
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              {availableFilters.sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="filter-actions">
        <button className="apply-btn" onClick={handleApplyFilters}>
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default SmartSearchFilter;
