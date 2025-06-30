/*
  # Remove growth and business score data from categories table

  1. Changes Made
    - Set growth_rate to NULL for all categories
    - Set avg_business_score to NULL for all categories
    - Set market_size to NULL for all categories
    - This removes the manually added analytics data as requested

  2. Purpose
    - Remove potentially misleading or inaccurate data
    - Prepare for future data-driven analytics
*/

UPDATE categories
SET 
  growth_rate = NULL,
  avg_business_score = NULL,
  market_size = NULL;