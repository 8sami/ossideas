/*
  # Create auto_categories and auto_idea_category views

  1. New Views
    - `auto_categories`: Extracts unique categories from ideas table with counts
    - `auto_idea_category`: Relational view linking ideas to their categories

  2. Purpose
    - Enable dynamic category filtering based on actual idea categories
    - Provide category counts for UI display
    - Support many-to-many relationship between ideas and categories
*/

-- Create auto_categories view to get unique categories with counts
CREATE OR REPLACE VIEW auto_categories AS
SELECT 
  category_name,
  COUNT(*) as idea_count,
  MIN(i.id) as sample_idea_id -- For potential future use
FROM (
  SELECT 
    i.id,
    jsonb_array_elements_text(i.categories) as category_name
  FROM ideas i
  WHERE i.categories IS NOT NULL 
    AND jsonb_typeof(i.categories) = 'array'
    AND jsonb_array_length(i.categories) > 0
) AS category_expansion
JOIN ideas i ON i.id = category_expansion.id
WHERE category_expansion.category_name IS NOT NULL 
  AND trim(category_expansion.category_name) != ''
GROUP BY category_name
ORDER BY idea_count DESC, category_name ASC;

-- Create auto_idea_category view for relational mapping
CREATE OR REPLACE VIEW auto_idea_category AS
SELECT 
  i.id AS idea_id,
  category_name
FROM (
  SELECT 
    i.id,
    jsonb_array_elements_text(i.categories) as category_name
  FROM ideas i
  WHERE i.categories IS NOT NULL 
    AND jsonb_typeof(i.categories) = 'array'
    AND jsonb_array_length(i.categories) > 0
) AS category_expansion
JOIN ideas i ON i.id = category_expansion.id
WHERE category_expansion.category_name IS NOT NULL 
  AND trim(category_expansion.category_name) != '';

-- Grant access to the views
GRANT SELECT ON auto_categories TO authenticated, anon;
GRANT SELECT ON auto_idea_category TO authenticated, anon;

-- Add comments for documentation
COMMENT ON VIEW auto_categories IS 'Dynamic view of unique categories from ideas table with usage counts';
COMMENT ON VIEW auto_idea_category IS 'Relational view mapping ideas to their categories for filtering';