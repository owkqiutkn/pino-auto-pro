-- Seed feature categories and features (bilingual: name_en, name_fr)

-- 1. Insert 7 feature categories
INSERT INTO public.feature_categories (name_en, name_fr, sort_order)
VALUES
    ('Mechanical features', 'Caractéristiques mécaniques', 1),
    ('Safety', 'Sécurité', 2),
    ('Interior', 'Intérieur', 3),
    ('Power options', 'Options de puissance', 4),
    ('Exterior', 'Extérieur', 5),
    ('Seating', 'Sièges', 6),
    ('Additional Features', 'Fonctionnalités supplémentaires', 7);

-- 2. Mechanical features (1)
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, '4-wheel disk brakes', 'Freins à disque 4 roues', 1 FROM public.feature_categories WHERE name_en = 'Mechanical features' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'anti-lock brakes', 'Freins antiblocage (ABS)', 2 FROM public.feature_categories WHERE name_en = 'Mechanical features' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'power steering', 'Direction assistée', 3 FROM public.feature_categories WHERE name_en = 'Mechanical features' LIMIT 1;

-- 3. Safety (2)
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Back-Up Camera', 'Caméra de recul', 1 FROM public.feature_categories WHERE name_en = 'Safety' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Brake Assist', 'Aide au freinage', 2 FROM public.feature_categories WHERE name_en = 'Safety' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Child Safety Locks', 'Verrouillage de sécurité enfant', 3 FROM public.feature_categories WHERE name_en = 'Safety' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Child Seat Anchors', 'Points d''ancrage siège enfant (ISOFIX)', 4 FROM public.feature_categories WHERE name_en = 'Safety' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Driver Air Bag', 'Airbag conducteur', 5 FROM public.feature_categories WHERE name_en = 'Safety' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Front Head Air Bag', 'Airbags frontaux de tête', 6 FROM public.feature_categories WHERE name_en = 'Safety' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Heated Mirrors', 'Rétroviseurs chauffants', 7 FROM public.feature_categories WHERE name_en = 'Safety' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Passenger Air Bag', 'Airbag passager', 8 FROM public.feature_categories WHERE name_en = 'Safety' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Passenger Air Bag On/Off Switch', 'Interrupteur activation/désactivation airbag passager', 9 FROM public.feature_categories WHERE name_en = 'Safety' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Passenger Air Bag Sensor', 'Capteur airbag passager', 10 FROM public.feature_categories WHERE name_en = 'Safety' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Rear Head Air Bag', 'Airbags arrière de tête', 11 FROM public.feature_categories WHERE name_en = 'Safety' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Rear Window Defrost', 'Dégivrage lunette arrière', 12 FROM public.feature_categories WHERE name_en = 'Safety' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Rearview Camera', 'Caméra de recul', 13 FROM public.feature_categories WHERE name_en = 'Safety' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Side Air Bag', 'Airbags latéraux', 14 FROM public.feature_categories WHERE name_en = 'Safety' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Stability Control', 'Contrôle de stabilité (ESC)', 15 FROM public.feature_categories WHERE name_en = 'Safety' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Traction Control', 'Contrôle de traction', 16 FROM public.feature_categories WHERE name_en = 'Safety' LIMIT 1;

-- 4. Interior (3)
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Air Conditioning', 'Climatisation', 1 FROM public.feature_categories WHERE name_en = 'Interior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Anti-Theft System', 'Système anti-vol', 2 FROM public.feature_categories WHERE name_en = 'Interior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Bucket Seats', 'Sièges baquets', 3 FROM public.feature_categories WHERE name_en = 'Interior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Cruise Control', 'Régulateur de vitesse', 4 FROM public.feature_categories WHERE name_en = 'Interior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Driver Vanity Mirror', 'Miroir de courtoisie conducteur', 5 FROM public.feature_categories WHERE name_en = 'Interior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'GPS Navigation', 'Navigation GPS', 6 FROM public.feature_categories WHERE name_en = 'Interior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Keyless Entry', 'Entrée sans clé', 7 FROM public.feature_categories WHERE name_en = 'Interior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Leather Steering Wheel', 'Volant en cuir', 8 FROM public.feature_categories WHERE name_en = 'Interior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Lumbar Support', 'Support lombaire', 9 FROM public.feature_categories WHERE name_en = 'Interior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Passenger Vanity Mirror', 'Miroir de courtoisie passager', 10 FROM public.feature_categories WHERE name_en = 'Interior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Power Door Locks', 'Verrouillage centralisé', 11 FROM public.feature_categories WHERE name_en = 'Interior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Rear Bench Seat', 'Banquette arrière', 12 FROM public.feature_categories WHERE name_en = 'Interior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Remote Trunk Release', 'Ouverture coffre à distance', 13 FROM public.feature_categories WHERE name_en = 'Interior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Security System', 'Système de sécurité', 14 FROM public.feature_categories WHERE name_en = 'Interior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Tilt Steering Wheel', 'Volant réglable en hauteur', 15 FROM public.feature_categories WHERE name_en = 'Interior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Trip Computer', 'Ordinateur de bord', 16 FROM public.feature_categories WHERE name_en = 'Interior' LIMIT 1;

-- 5. Power options (4)
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Power Mirrors', 'Rétroviseurs électriques', 1 FROM public.feature_categories WHERE name_en = 'Power options' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Power Windows', 'Vitres électriques', 2 FROM public.feature_categories WHERE name_en = 'Power options' LIMIT 1;

-- 6. Exterior (5)
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Alloy Wheels', 'Jantes alliage', 1 FROM public.feature_categories WHERE name_en = 'Exterior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Aluminum Wheels', 'Jantes aluminium', 2 FROM public.feature_categories WHERE name_en = 'Exterior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Daytime Running Lights', 'Feux de jour', 3 FROM public.feature_categories WHERE name_en = 'Exterior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Spoiler', 'Spoiler', 4 FROM public.feature_categories WHERE name_en = 'Exterior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Temporary spare tire', 'Roue de secours', 5 FROM public.feature_categories WHERE name_en = 'Exterior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Tinted Glass', 'Vitres teintées', 6 FROM public.feature_categories WHERE name_en = 'Exterior' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Winter Tires', 'Pneus hiver', 7 FROM public.feature_categories WHERE name_en = 'Exterior' LIMIT 1;

-- 7. Seating (6)
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Heated Front Seat(s)', 'Sièges avant chauffants', 1 FROM public.feature_categories WHERE name_en = 'Seating' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Pass-Through Rear Seat', 'Siège arrière rabattable (passage coffre)', 2 FROM public.feature_categories WHERE name_en = 'Seating' LIMIT 1;

-- 8. Additional Features (7)
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Turbocharged', 'Turbocompressé', 1 FROM public.feature_categories WHERE name_en = 'Additional Features' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Integrated Turn Signal Mirrors', 'Rétroviseurs avec clignotants intégrés', 2 FROM public.feature_categories WHERE name_en = 'Additional Features' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Knee Air Bag', 'Airbag genoux', 3 FROM public.feature_categories WHERE name_en = 'Additional Features' LIMIT 1;
INSERT INTO public.features (feature_category_id, name_en, name_fr, sort_order)
SELECT id, 'Bluetooth Connection', 'Connexion Bluetooth', 4 FROM public.feature_categories WHERE name_en = 'Additional Features' LIMIT 1;
