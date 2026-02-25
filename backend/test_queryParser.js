const queryParser = require('./utils/queryParser');

// Test queries
const testQueries = [
  "i need an best shoe in 1200-2000 budget and look for best offers from big brands",
  "i need an shoe from starting from 1200-2000 and review all of them sort them based on their customer review",
  "pick an best shoe for me by yourself starting from 1200-2000",
  "i need an shoe starting from 1000-1200 with best value for money",
  "which shoe do you think best Asian or puma ?",
  "Find me the best shoe between ₹1200 and ₹2000",
  "I want the best value-for-money shoe under ₹1500",
  "Suggest the best shoes in the ₹1000–₹2000 range",
  "Pick the best shoe for me under ₹1800",
  "Which shoe gives the most value under ₹2000?",
  "Best branded shoe under ₹1500",
  "Recommend a good quality shoe between ₹1200 and ₹2000",
  "I want a durable shoe under ₹2000",
  "Show me the top-rated shoes under ₹1700",
  "What is the best affordable shoe right now?",
  "Show shoes sorted by customer reviews",
  "List shoes under ₹2000 with the best ratings",
  "I want shoes with the highest customer satisfaction",
];

console.log("=== QUERY PARSER TEST RESULTS ===\n");

testQueries.forEach((query, index) => {
  const result = queryParser.parse(query);
  console.log(`[${index + 1}] Input: "${query}"`);
  console.log(`    Output: ${JSON.stringify(result)}\n`);
});

console.log("\n=== BATCH PARSING ===\n");
const batchResults = queryParser.parseBatch(testQueries);
console.log(`Total queries parsed: ${batchResults.length}`);
console.log(`\nSample batch output (first 3):`);
batchResults.slice(0, 3).forEach((result, i) => {
  console.log(`${i + 1}. ${JSON.stringify(result)}`);
});
