import React, { useState } from 'react';

const SimpleNutriScoreSearch = () => {
  const [productName, setProductName] = useState('');
  const [nutriScore, setNutriScore] = useState(null);
  const [error, setError] = useState(null);

  const searchProduct = async () => {
    if (!productName.trim()) return;
    
    setError(null);
    setNutriScore(null);

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&json=1&page_size=1`
      );
      const data = await response.json();
      console.log(data);

      if (data.products?.length > 0) {
        const product = data.products[0];
        const score = product.nutrition_grades;
        if (score) {
          setNutriScore(score);
        } else {
          setError("No Nutri-score found for this product");
        }
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Failed to fetch data');
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <button
          onClick={searchProduct} 
        >
          {'Search'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

          <div>
            {nutriScore}
          </div>
    </div>
  );
};

export default SimpleNutriScoreSearch;