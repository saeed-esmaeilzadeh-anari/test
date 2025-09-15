-- Insert service categories
INSERT INTO public.service_categories (name, name_fa, description, icon) VALUES
('Home Cleaning', 'نظافت منزل', 'Professional home cleaning services', '🏠'),
('Plumbing', 'لوله کشی', 'Plumbing repair and installation services', '🔧'),
('Electrical', 'برق', 'Electrical repair and installation services', '⚡'),
('Appliance Repair', 'تعمیر لوازم خانگی', 'Home appliance repair services', '🔨'),
('Painting', 'نقاشی', 'Interior and exterior painting services', '🎨'),
('Carpentry', 'نجاری', 'Wood work and furniture repair services', '🪚'),
('HVAC', 'تهویه مطبوع', 'Heating, ventilation, and air conditioning services', '❄️'),
('Gardening', 'باغبانی', 'Garden maintenance and landscaping services', '🌱'),
('Moving', 'اسباب کشی', 'Moving and relocation services', '📦'),
('Computer Repair', 'تعمیر کامپیوتر', 'Computer and IT support services', '💻');

-- Insert services for each category
INSERT INTO public.services (category_id, name, name_fa, description, base_price) VALUES
-- Home Cleaning
((SELECT id FROM service_categories WHERE name = 'Home Cleaning'), 'Deep House Cleaning', 'نظافت عمیق خانه', 'Complete deep cleaning of your home', 150.00),
((SELECT id FROM service_categories WHERE name = 'Home Cleaning'), 'Regular House Cleaning', 'نظافت معمولی خانه', 'Regular maintenance cleaning', 80.00),
((SELECT id FROM service_categories WHERE name = 'Home Cleaning'), 'Post-Construction Cleaning', 'نظافت پس از ساخت', 'Cleaning after construction or renovation', 200.00),

-- Plumbing
((SELECT id FROM service_categories WHERE name = 'Plumbing'), 'Pipe Repair', 'تعمیر لوله', 'Fix leaking or broken pipes', 100.00),
((SELECT id FROM service_categories WHERE name = 'Plumbing'), 'Toilet Installation', 'نصب توالت', 'Install new toilet fixtures', 120.00),
((SELECT id FROM service_categories WHERE name = 'Plumbing'), 'Drain Cleaning', 'تمیز کردن فاضلاب', 'Clear blocked drains', 80.00),

-- Electrical
((SELECT id FROM service_categories WHERE name = 'Electrical'), 'Outlet Installation', 'نصب پریز برق', 'Install new electrical outlets', 60.00),
((SELECT id FROM service_categories WHERE name = 'Electrical'), 'Light Fixture Installation', 'نصب چراغ', 'Install ceiling lights and fixtures', 90.00),
((SELECT id FROM service_categories WHERE name = 'Electrical'), 'Electrical Panel Repair', 'تعمیر تابلو برق', 'Repair electrical panels and circuits', 150.00),

-- Appliance Repair
((SELECT id FROM service_categories WHERE name = 'Appliance Repair'), 'Washing Machine Repair', 'تعمیر ماشین لباسشویی', 'Fix washing machine issues', 100.00),
((SELECT id FROM service_categories WHERE name = 'Appliance Repair'), 'Refrigerator Repair', 'تعمیر یخچال', 'Repair refrigerator problems', 120.00),
((SELECT id FROM service_categories WHERE name = 'Appliance Repair'), 'Dishwasher Repair', 'تعمیر ماشین ظرفشویی', 'Fix dishwasher issues', 110.00);
