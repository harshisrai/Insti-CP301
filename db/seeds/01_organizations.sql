-- ============================================================
-- 01_organizations.sql — Seed the Gymkhana hierarchy
-- Idempotent: uses ON CONFLICT DO NOTHING
-- ============================================================

-- Level 0: Students' Gymkhana (root)
INSERT INTO organizations (id, name, slug, type, parent_id, description, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'Students'' Gymkhana', 'students-gymkhana', 'governance_body', NULL, 'Apex student body overseeing all student activities at IIT Ropar.', true)
ON CONFLICT (slug) DO NOTHING;

-- Level 1: Boards
INSERT INTO organizations (id, name, slug, type, parent_id, description, is_active) VALUES
('00000000-0000-0000-0001-000000000001', 'Board of Science and Technology', 'bost', 'board', '00000000-0000-0000-0000-000000000001', 'Governs all technical clubs.', true),
('00000000-0000-0000-0001-000000000002', 'Board of Cultural Activities', 'boca', 'board', '00000000-0000-0000-0000-000000000001', 'Governs all cultural clubs.', true),
('00000000-0000-0000-0001-000000000003', 'Board of Literary Activities', 'bola', 'board', '00000000-0000-0000-0000-000000000001', 'Governs all literary and media clubs.', true),
('00000000-0000-0000-0001-000000000004', 'Board of Sports Affairs', 'bosa', 'board', '00000000-0000-0000-0000-000000000001', 'Governs all sports clubs.', true),
('00000000-0000-0000-0001-000000000005', 'Board of Hostel Affairs', 'boha', 'board', '00000000-0000-0000-0000-000000000001', 'Manages hostel governance, mess committees, and hostel-level events.', true),
('00000000-0000-0000-0001-000000000006', 'Board of Academic Affairs', 'boaa', 'board', '00000000-0000-0000-0000-000000000001', 'Branch representatives per batch. Represents academic issues.', true)
ON CONFLICT (slug) DO NOTHING;

-- Level 2: BOST Clubs
INSERT INTO organizations (name, slug, type, parent_id, description, is_active) VALUES
('Aeromodelling Club',  'aeromodelling-club',  'club', '00000000-0000-0000-0001-000000000001', 'Design and flight of scale models.', true),
('Automotive Club',     'automotive-club',     'club', '00000000-0000-0000-0001-000000000001', 'Vehicle design and engineering.', true),
('CIM',                 'cim',                 'club', '00000000-0000-0000-0001-000000000001', 'Computer Integrated Manufacturing.', true),
('Coding Club',         'coding-club',         'club', '00000000-0000-0000-0001-000000000001', 'Programming, development, and competitive coding.', true),
('Esportz Club',        'esportz-club',        'club', '00000000-0000-0000-0001-000000000001', 'Organised gaming and e-sports.', true),
('FinCOM',              'fincom',              'club', '00000000-0000-0000-0001-000000000001', 'Finance and commerce.', true),
('Iota Cluster',        'iota-cluster',        'club', '00000000-0000-0000-0001-000000000001', 'Technical innovation group.', true),
('Monochrome',          'monochrome',          'club', '00000000-0000-0000-0001-000000000001', 'Technical photography and visuals.', true),
('Robotics Club',       'robotics-club',       'club', '00000000-0000-0000-0001-000000000001', 'Automation and robot building.', true),
('Softcom',             'softcom',             'club', '00000000-0000-0000-0001-000000000001', 'Software and communication.', true),
('Zenith',              'zenith',              'club', '00000000-0000-0000-0001-000000000001', 'Astronomy club.', true)
ON CONFLICT (slug) DO NOTHING;

-- Level 2: BOCA Clubs
INSERT INTO organizations (name, slug, type, parent_id, description, is_active) VALUES
('Dance Club',           'dance-club',          'club', '00000000-0000-0000-0001-000000000002', 'Bhangra and Western dance.', true),
('Dramatics Club (Undekha)', 'undekha',         'club', '00000000-0000-0000-0001-000000000002', 'Theatre and stage performances.', true),
('Epicure',              'epicure',             'club', '00000000-0000-0000-0001-000000000002', 'Culinary and food club.', true),
('Fine Arts Club (Vibgyor)', 'vibgyor',         'club', '00000000-0000-0000-0001-000000000002', 'Sketching, painting, and visual arts.', true),
('Music Club (Alankar)',  'alankar',            'club', '00000000-0000-0000-0001-000000000002', 'Instrumental and vocal music.', true),
('Photography Club (Arturo)', 'arturo',         'club', '00000000-0000-0000-0001-000000000002', 'Photography, event coverage, and technique workshops.', true),
('Dcypher',              'dcypher',             'club', '00000000-0000-0000-0001-000000000002', 'Cultural group.', true),
('Panache',              'panache',             'club', '00000000-0000-0000-0001-000000000002', 'Cultural and fashion group.', true)
ON CONFLICT (slug) DO NOTHING;

-- Level 2: BOLA Clubs
INSERT INTO organizations (name, slug, type, parent_id, description, is_active) VALUES
('Debating Club (Debsoc)', 'debsoc',           'club', '00000000-0000-0000-0001-000000000003', 'Debate and argumentation.', true),
('Enarators',              'enarators',         'club', '00000000-0000-0000-0001-000000000003', 'Public speaking.', true),
('Alpha',                  'alpha',             'club', '00000000-0000-0000-0001-000000000003', 'Movie making and production.', true),
('Filmski',                'filmski',           'club', '00000000-0000-0000-0001-000000000003', 'Movie streaming and screenings.', true),
('Enigma',                 'enigma',            'club', '00000000-0000-0000-0001-000000000003', 'Movie and literature appreciation.', true),
('Alfaaz',                 'alfaaz',            'club', '00000000-0000-0000-0001-000000000003', 'Creative writing.', true),
('MUN Club',               'mun-club',          'club', '00000000-0000-0000-0001-000000000003', 'Model United Nations.', true)
ON CONFLICT (slug) DO NOTHING;

-- Level 2: BOSA Clubs
INSERT INTO organizations (name, slug, type, parent_id, description, is_active) VALUES
('Aquatics',     'aquatics',     'club', '00000000-0000-0000-0001-000000000004', 'Swimming and water sports.', true),
('Athletics',    'athletics',    'club', '00000000-0000-0000-0001-000000000004', 'Track and field.', true),
('Badminton',    'badminton',    'club', '00000000-0000-0000-0001-000000000004', 'Badminton.', true),
('Basketball',   'basketball',   'club', '00000000-0000-0000-0001-000000000004', 'Basketball.', true),
('Chess',        'chess',        'club', '00000000-0000-0000-0001-000000000004', 'Chess.', true),
('Cricket',      'cricket',      'club', '00000000-0000-0000-0001-000000000004', 'Cricket.', true),
('Football',     'football',     'club', '00000000-0000-0000-0001-000000000004', 'Football.', true),
('Hockey',       'hockey',       'club', '00000000-0000-0000-0001-000000000004', 'Hockey.', true),
('Lawn Tennis',  'lawn-tennis',  'club', '00000000-0000-0000-0001-000000000004', 'Lawn tennis.', true),
('Table Tennis', 'table-tennis', 'club', '00000000-0000-0000-0001-000000000004', 'Table tennis.', true),
('Volleyball',   'volleyball',   'club', '00000000-0000-0000-0001-000000000004', 'Volleyball.', true),
('Weightlifting', 'weightlifting','club', '00000000-0000-0000-0001-000000000004', 'Weightlifting and fitness.', true)
ON CONFLICT (slug) DO NOTHING;

-- Independent Societies
INSERT INTO organizations (name, slug, type, parent_id, description, is_active) VALUES
('E-Cell',               'e-cell',          'society', '00000000-0000-0000-0000-000000000001', 'Entrepreneurship Cell.', true),
('ENACTUS',              'enactus',         'society', '00000000-0000-0000-0000-000000000001', 'Social entrepreneurship.', true),
('Pehchaan-Ek Safar',    'pehchaan',        'society', '00000000-0000-0000-0000-000000000001', 'Social welfare society.', true),
('SME',                  'sme',             'society', '00000000-0000-0000-0000-000000000001', 'Society of Mechanical Engineers.', true),
('Women''s Forum / SWE', 'womens-forum',    'society', '00000000-0000-0000-0000-000000000001', 'Women in STEM advocacy.', true),
('ISMP',            'ismp',       'society', '00000000-0000-0000-0000-000000000001', 'Institute Student Mentorship Programme.', true)
ON CONFLICT (slug) DO NOTHING;
