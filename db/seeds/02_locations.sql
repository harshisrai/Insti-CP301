-- ============================================================
-- 02_locations.sql — Seed campus buildings
-- Idempotent: uses ON CONFLICT DO NOTHING
-- ============================================================

INSERT INTO locations (name, code, type, facilities, is_accessible, opening_time, closing_time) VALUES
-- Academic
('Lecture Theatre Complex', 'LTC', 'academic',
 ARRAY['AC', 'Projector', 'WiFi', 'Mic System'], true, '08:00', '21:00'),

('Super Academic Block', 'SAB', 'academic',
 ARRAY['AC', 'Projector', 'WiFi', 'Labs'], true, '08:00', '22:00'),

-- Library
('Nalanda Library', 'LIB', 'academic',
 ARRAY['AC', 'WiFi', 'Printing', 'Reading Room', '24/7 Reference'], true, '08:00', '23:00'),

-- Hostels (Boys)
('Satluj Hostel', 'H-SATLUJ', 'hostel',
 ARRAY['WiFi', 'LAN', 'Gym', 'TV Room', 'RO Water', 'Laundry'], false, NULL, NULL),

('Beas Hostel', 'H-BEAS', 'hostel',
 ARRAY['WiFi', 'LAN', 'TV Room', 'RO Water', 'Laundry'], false, NULL, NULL),

('Chenab Hostel', 'H-CHENAB', 'hostel',
 ARRAY['WiFi', 'LAN', 'TV Room', 'RO Water', 'Laundry'], false, NULL, NULL),

('Brahmaputra Hostel', 'H-BRAHMA', 'hostel',
 ARRAY['WiFi', 'LAN', 'TV Room', 'RO Water', 'Laundry', 'Elevator'], true, NULL, NULL),

-- Hostels (Girls)
('Raavi Hostel', 'H-RAAVI', 'hostel',
 ARRAY['WiFi', 'LAN', 'Gym', 'TV Room', 'RO Water', 'Laundry'], false, NULL, NULL),

-- Medical
('Medical Centre', 'MED', 'medical',
 ARRAY['24/7 Aid', 'Ambulance', 'Allopathic', 'Ayurvedic'], true, NULL, NULL),

-- Student Activity
('Student Activity Centre', 'SAC', 'recreational',
 ARRAY['Club Rooms', 'Alankar Room', 'BOST Room', 'Arturo Room', 'Vibgyor Room'], true, '09:00', '22:00'),

-- Sports
('Sports Complex', 'SPORTS', 'sports',
 ARRAY['Football Ground', 'Cricket Ground', 'Basketball Court', 'Badminton Court', 'Gym', 'Tennis Court'], true, '06:00', '21:00'),

-- Administrative
('Administrative Block', 'ADMIN', 'administrative',
 ARRAY['AC', 'WiFi', 'Dean Offices', 'T&P Cell', 'Main Office'], true, '09:00', '17:00'),

-- Mess
('Main Mess', 'MESS-1', 'mess',
 ARRAY['Veg', 'Non-Veg', 'RO Water'], true, '07:30', '21:30'),

-- Food Court
('Food Court', 'FOOD', 'recreational',
 ARRAY['Kerala Canteen', 'Burger House', 'Juice Corner', 'Cafeteria'], true, '08:00', '22:00'),

-- Utility
('Utility Block', 'UTIL', 'administrative',
 ARRAY['General Store', 'Stationery', 'Salon', 'SBI ATM', 'Post Office'], true, '08:00', '20:00')

ON CONFLICT (code) DO NOTHING;
