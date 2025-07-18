-- Create function to get ideas without metrics analysis
CREATE OR REPLACE FUNCTION get_ideas_without_metrics(limit_count integer DEFAULT 5)
RETURNS SETOF ideas
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT i.*
  FROM ideas i
  WHERE i.id NOT IN (
    SELECT ar.idea_id
    FROM analysis_results ar
    WHERE ar.analysis_type_id = 8
    AND ar.idea_id IS NOT NULL
  )
  AND i.status = 'pending_metrics'
  ORDER BY i.generated_at DESC
  LIMIT limit_count;
END;
$$;

-- Add function comment for documentation
COMMENT ON FUNCTION get_ideas_without_metrics(integer) IS 'Returns ideas that do not have success metrics analysis (analysis_type_id = 8) with optional result limiting.';