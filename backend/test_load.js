try {
  const smartSearch = require('./routes/smartSearch');
  console.log('✓ smartSearch.js loaded successfully');
  console.log('✓ Router exports:', typeof smartSearch);
} catch (err) {
  console.error('✗ Error loading smartSearch.js:', err.message);
  console.error('Stack:', err.stack);
}
