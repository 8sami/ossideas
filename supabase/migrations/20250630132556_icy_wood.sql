/*
  # Add sample data to categories table

  1. Changes Made
    - Insert sample data into categories table
    - Add descriptions, growth rates, and business scores
    - This provides meaningful data for the categories page

  2. Benefits
    - Categories page will show real data instead of N/A values
    - Improves user experience with meaningful metrics
    - Demonstrates the full capabilities of the categories page
*/

-- Insert sample data into categories table
INSERT INTO categories (name, description, slug, growth_rate, avg_business_score, market_size)
VALUES
  ('AI/ML', 'Artificial Intelligence and Machine Learning solutions for businesses and consumers', 'ai-ml', 28.5, 85.2, '$150B - $200B'),
  ('DevTools', 'Developer tools and productivity solutions for software engineers', 'dev-tools', 15.3, 78.6, '$25B - $40B'),
  ('SaaS', 'Software as a Service platforms for various business needs', 'saas', 18.7, 82.1, '$200B - $300B'),
  ('Data Analytics', 'Tools and platforms for data processing, visualization, and insights', 'data-analytics', 22.4, 79.8, '$70B - $100B'),
  ('Security', 'Cybersecurity solutions for businesses and individuals', 'security', 16.8, 81.3, '$150B - $200B'),
  ('Mobile', 'Mobile application development and solutions', 'mobile', 12.5, 76.9, '$180B - $250B'),
  ('Web Dev', 'Web development frameworks, libraries, and tools', 'web-dev', 14.2, 75.4, '$40B - $60B'),
  ('IoT', 'Internet of Things devices, platforms, and solutions', 'iot', 26.7, 77.2, '$250B - $350B'),
  ('Blockchain', 'Blockchain technology and decentralized applications', 'blockchain', 19.3, 72.8, '$10B - $20B'),
  ('FinTech', 'Financial technology solutions and services', 'fintech', 23.6, 83.5, '$120B - $180B'),
  ('HealthTech', 'Healthcare technology and digital health solutions', 'healthtech', 25.1, 84.7, '$90B - $130B'),
  ('EdTech', 'Educational technology platforms and tools', 'edtech', 21.8, 80.2, '$30B - $50B'),
  ('Gaming', 'Game development tools, engines, and platforms', 'gaming', 13.5, 74.6, '$160B - $220B'),
  ('Productivity', 'Productivity tools and workflow optimization solutions', 'productivity', 17.2, 79.3, '$40B - $70B'),
  ('E-commerce', 'E-commerce platforms, tools, and solutions', 'e-commerce', 15.9, 81.7, '$4T - $5T'),
  ('AR/VR', 'Augmented and Virtual Reality technologies', 'ar-vr', 31.4, 76.5, '$30B - $50B'),
  ('Cloud', 'Cloud computing platforms and services', 'cloud', 20.3, 84.1, '$350B - $500B'),
  ('API', 'API development, management, and integration tools', 'api', 18.9, 80.8, '$15B - $25B'),
  ('Low-Code', 'Low-code and no-code development platforms', 'low-code', 29.7, 78.4, '$20B - $40B'),
  ('Design', 'Design tools and platforms for creators', 'design', 16.4, 77.1, '$25B - $45B')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  slug = EXCLUDED.slug,
  growth_rate = EXCLUDED.growth_rate,
  avg_business_score = EXCLUDED.avg_business_score,
  market_size = EXCLUDED.market_size;