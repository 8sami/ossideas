/*
  # Create categorized_ideas_summary view

  1. New View
    - `categorized_ideas_summary`: Joins auto_categories with categories table
    - Combines dynamic idea counts with static category metadata
    - Provides a complete dataset for the categories page

  2. Purpose
    - Enriches auto-generated categories with official category descriptions
    - Enables filtering and sorting by various category attributes
    - Supports the categories page UI with comprehensive data
*/

CREATE OR REPLACE VIEW categorized_ideas_summary AS
SELECT 
  ac.category_name,
  ac.idea_count,
  c.id as category_id,
  c.description,
  c.slug,
  c.market_size,
  c.growth_rate,
  c.avg_business_score,
  c.top_repository_id
FROM 
  auto_categories ac
LEFT JOIN 
  categories c ON LOWER(ac.category_name) = LOWER(c.name)
ORDER BY 
  ac.idea_count DESC, 
  ac.category_name ASC;

-- Grant access to the view
GRANT SELECT ON categorized_ideas_summary TO authenticated, anon;

-- Add comment for documentation
COMMENT ON VIEW categorized_ideas_summary IS 'Combines auto-generated categories with official category metadata for UI display';