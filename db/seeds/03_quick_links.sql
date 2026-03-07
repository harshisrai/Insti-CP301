-- ============================================================
-- 03_quick_links.sql — Seed official portal links
-- Idempotent: uses ON CONFLICT (url) DO NOTHING
-- ============================================================

INSERT INTO quick_links (title, description, url, category, is_featured, display_order) VALUES
-- Featured
('ERP Portal', 'Academic records, course registration, grades', 'https://erp.iitrpr.ac.in', 'academic', true, 1),
('Moodle', 'Course materials, assignments, and quizzes', 'https://moodle.iitrpr.ac.in', 'academic', true, 2),
('CDPC Portal', 'Career Development & Placement Cell', 'https://cdpc.iitrpr.ac.in', 'placement', true, 3),
('IIT Ropar Website', 'Official institute website', 'https://www.iitrpr.ac.in', 'general', true, 4),

-- Academic
('Attendance Portal', 'View and track class attendance', 'https://attendance.iitrpr.ac.in', 'academic', false, 10),

-- Library
('Nalanda Library OPAC', 'Search library catalogue (Koha)', 'https://library.iitrpr.ac.in', 'library', false, 20),
('IEEE Xplore', 'Institute subscription access to IEEE papers', 'https://ieeexplore.ieee.org', 'library', false, 21),
('Shodhganga', 'Indian thesis and dissertation repository', 'https://shodhganga.inflibnet.ac.in', 'library', false, 22),

-- Administrative
('Fee Payment Portal', 'Pay semester fees online', 'https://fees.iitrpr.ac.in', 'administrative', false, 30),

-- Wellness
('Snehita Wellbeing Cell', 'Mental health and counselling support', 'https://snehita.iitrpr.ac.in', 'wellness', false, 40),

-- General
('IRCC', 'Institute Research & Consultancy Centre', 'https://ircc.iitrpr.ac.in', 'general', false, 50),
('IPR Cell', 'Intellectual Property Rights Cell', 'https://ipr.iitrpr.ac.in', 'general', false, 51)

ON CONFLICT (url) DO NOTHING;
