/*
  # Create auto_categories and auto_idea_category views

  1. New Views
    - `auto_categories`: Dynamic view of unique categories from ideas table with usage counts
    - `auto_idea_category`: Relational view mapping ideas to their categories for filtering

  2. Purpose
    - Extract categories from ideas.categories JSON array
    - Provide category counts for UI display
    - Enable efficient filtering of ideas by categories
    - Replace hardcoded categories with dynamic data from database

  3. Security
    - Grant SELECT access to authenticated and anonymous users
    - Views are read-only and safe for public access
*/

-- Create auto_categories view to get unique categories with counts
CREATE OR REPLACE VIEW auto_categories AS
SELECT 
  category_name,
  COUNT(*) as idea_count
FROM (
  SELECT 
    json_array_elements_text(i.categories) as category_name
  FROM ideas i
  WHERE i.categories IS NOT NULL 
    AND json_typeof(i.categories) = 'array'
    AND json_array_length(i.categories) > 0
) AS category_expansion
WHERE category_name IS NOT NULL 
  AND trim(category_name) != ''
GROUP BY category_name
ORDER BY idea_count DESC, category_name ASC;

-- Create auto_idea_category view for relational mapping
CREATE OR REPLACE VIEW auto_idea_category AS
SELECT 
  idea_id,
  category_name
FROM (
  SELECT 
    i.id AS idea_id,
    json_array_elements_text(i.categories) as category_name
  FROM ideas i
  WHERE i.categories IS NOT NULL 
    AND json_typeof(i.categories) = 'array'
    AND json_array_length(i.categories) > 0
) AS category_mapping
WHERE category_name IS NOT NULL 
  AND trim(category_name) != '';

-- Grant access to the views
GRANT SELECT ON auto_categories TO authenticated, anon;
GRANT SELECT ON auto_idea_category TO authenticated, anon;

-- Add comments for documentation
COMMENT ON VIEW auto_categories IS 'Dynamic view of unique categories from ideas table with usage counts';
COMMENT ON VIEW auto_idea_category IS 'Relational view mapping ideas to their categories for filtering';