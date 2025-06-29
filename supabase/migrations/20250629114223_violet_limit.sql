-- Create auto_industries view to get unique industries with counts
CREATE OR REPLACE VIEW auto_industries AS
SELECT 
  industry_name,
  COUNT(*) as idea_count
FROM (
  SELECT 
    json_array_elements_text(i.industries) as industry_name
  FROM ideas i
  WHERE i.industries IS NOT NULL 
    AND json_typeof(i.industries) = 'array'
    AND json_array_length(i.industries) > 0
) AS industry_expansion
WHERE industry_name IS NOT NULL 
  AND trim(industry_name) != ''
GROUP BY industry_name
ORDER BY idea_count DESC, industry_name ASC;

-- Create auto_idea_industry view for relational mapping
CREATE OR REPLACE VIEW auto_idea_industry AS
SELECT 
  idea_id,
  industry_name
FROM (
  SELECT 
    i.id AS idea_id,
    json_array_elements_text(i.industries) as industry_name
  FROM ideas i
  WHERE i.industries IS NOT NULL 
    AND json_typeof(i.industries) = 'array'
    AND json_array_length(i.industries) > 0
) AS industry_mapping
WHERE industry_name IS NOT NULL 
  AND trim(industry_name) != '';

-- Grant access to the views
GRANT SELECT ON auto_industries TO authenticated, anon;
GRANT SELECT ON auto_idea_industry TO authenticated, anon;

-- Add comments for documentation
COMMENT ON VIEW auto_industries IS 'Dynamic view of unique industries from ideas table with usage counts';
COMMENT ON VIEW auto_idea_industry IS 'Relational view mapping ideas to their industries for filtering';