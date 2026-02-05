-- =============================================================================
-- NEXUS WMS SEED DATA
-- =============================================================================
-- Run this in Supabase SQL Editor after running schema.sql
-- This populates the database with sample data for testing
-- =============================================================================

-- =============================================================================
-- WAREHOUSES
-- =============================================================================
INSERT INTO warehouses (id, name, code, address, city, state, country, timezone) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Los Angeles Distribution Center', 'LA-DC', '1234 Warehouse Blvd', 'Los Angeles', 'CA', 'USA', 'America/Los_Angeles'),
    ('00000000-0000-0000-0000-000000000002', 'Chicago Fulfillment Hub', 'CHI-FH', '5678 Logistics Way', 'Chicago', 'IL', 'USA', 'America/Chicago'),
    ('00000000-0000-0000-0000-000000000003', 'Miami Import Center', 'MIA-IC', '9012 Port Avenue', 'Miami', 'FL', 'USA', 'America/New_York')
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- CATEGORIES
-- =============================================================================
INSERT INTO categories (id, name, description) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Electronics', 'Electronic devices and accessories'),
    ('10000000-0000-0000-0000-000000000002', 'Apparel', 'Clothing and fashion items'),
    ('10000000-0000-0000-0000-000000000003', 'Home & Garden', 'Home improvement and garden supplies'),
    ('10000000-0000-0000-0000-000000000004', 'Food & Beverage', 'Consumable food and drink items'),
    ('10000000-0000-0000-0000-000000000005', 'Health & Beauty', 'Personal care and wellness products'),
    ('10000000-0000-0000-0000-000000000006', 'Sports & Outdoors', 'Athletic and outdoor equipment'),
    ('10000000-0000-0000-0000-000000000007', 'Office Supplies', 'Office and business products'),
    ('10000000-0000-0000-0000-000000000008', 'Automotive', 'Vehicle parts and accessories')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PRODUCTS
-- =============================================================================
INSERT INTO products (id, sku, name, description, category_id, unit_of_measure, weight_kg, dimensions_cm, min_stock_level, reorder_point) VALUES
    -- Electronics
    ('20000000-0000-0000-0000-000000000001', 'ELEC-PHONE-001', 'Smartphone Pro X', '6.5" OLED display, 128GB', '10000000-0000-0000-0000-000000000001', 'EA', 0.189, '{"l": 16, "w": 7.5, "h": 0.8}', 50, 100),
    ('20000000-0000-0000-0000-000000000002', 'ELEC-LAPTOP-001', 'UltraBook 15', '15.6" laptop, 16GB RAM, 512GB SSD', '10000000-0000-0000-0000-000000000001', 'EA', 1.8, '{"l": 36, "w": 25, "h": 2}', 25, 50),
    ('20000000-0000-0000-0000-000000000003', 'ELEC-TABLET-001', 'TabletPad 10', '10.9" tablet, 64GB', '10000000-0000-0000-0000-000000000001', 'EA', 0.46, '{"l": 25, "w": 17.5, "h": 0.6}', 40, 80),
    ('20000000-0000-0000-0000-000000000004', 'ELEC-WATCH-001', 'SmartWatch Fitness', 'GPS, heart rate monitor', '10000000-0000-0000-0000-000000000001', 'EA', 0.045, '{"l": 5, "w": 4.5, "h": 1.2}', 100, 200),
    ('20000000-0000-0000-0000-000000000005', 'ELEC-EARBUDS-001', 'Wireless Earbuds Pro', 'Active noise cancellation', '10000000-0000-0000-0000-000000000001', 'EA', 0.055, '{"l": 6, "w": 5, "h": 3}', 150, 300),

    -- Apparel
    ('20000000-0000-0000-0000-000000000006', 'APRL-TSHIRT-001', 'Premium Cotton T-Shirt', '100% organic cotton, crew neck', '10000000-0000-0000-0000-000000000002', 'EA', 0.2, '{"l": 30, "w": 25, "h": 2}', 200, 400),
    ('20000000-0000-0000-0000-000000000007', 'APRL-JEANS-001', 'Classic Fit Jeans', 'Stretch denim, 5-pocket', '10000000-0000-0000-0000-000000000002', 'EA', 0.65, '{"l": 35, "w": 30, "h": 5}', 100, 200),
    ('20000000-0000-0000-0000-000000000008', 'APRL-JACKET-001', 'All-Weather Jacket', 'Waterproof, insulated', '10000000-0000-0000-0000-000000000002', 'EA', 0.9, '{"l": 45, "w": 35, "h": 8}', 50, 100),
    ('20000000-0000-0000-0000-000000000009', 'APRL-SHOES-001', 'Running Shoes Pro', 'Lightweight, responsive cushion', '10000000-0000-0000-0000-000000000002', 'PAIR', 0.6, '{"l": 32, "w": 12, "h": 12}', 75, 150),
    ('20000000-0000-0000-0000-000000000010', 'APRL-CAP-001', 'Sports Cap', 'Adjustable, moisture-wicking', '10000000-0000-0000-0000-000000000002', 'EA', 0.1, '{"l": 20, "w": 15, "h": 10}', 200, 400),

    -- Home & Garden
    ('20000000-0000-0000-0000-000000000011', 'HOME-LAMP-001', 'LED Desk Lamp', 'Adjustable brightness, USB port', '10000000-0000-0000-0000-000000000003', 'EA', 1.2, '{"l": 40, "w": 15, "h": 45}', 50, 100),
    ('20000000-0000-0000-0000-000000000012', 'HOME-CHAIR-001', 'Ergonomic Office Chair', 'Adjustable lumbar support', '10000000-0000-0000-0000-000000000003', 'EA', 15, '{"l": 70, "w": 65, "h": 120}', 20, 40),
    ('20000000-0000-0000-0000-000000000013', 'HOME-PLANT-001', 'Indoor Plant Pot Set', 'Set of 3 ceramic pots', '10000000-0000-0000-0000-000000000003', 'SET', 2.5, '{"l": 30, "w": 30, "h": 25}', 100, 200),
    ('20000000-0000-0000-0000-000000000014', 'HOME-TOOL-001', 'Home Tool Kit', '120-piece tool set', '10000000-0000-0000-0000-000000000003', 'SET', 5.5, '{"l": 45, "w": 30, "h": 15}', 30, 60),
    ('20000000-0000-0000-0000-000000000015', 'HOME-DECOR-001', 'Wall Art Canvas', 'Modern abstract print', '10000000-0000-0000-0000-000000000003', 'EA', 1.0, '{"l": 60, "w": 5, "h": 40}', 75, 150),

    -- Food & Beverage
    ('20000000-0000-0000-0000-000000000016', 'FOOD-COFFEE-001', 'Premium Coffee Beans', '1kg bag, medium roast', '10000000-0000-0000-0000-000000000004', 'BAG', 1.0, '{"l": 25, "w": 10, "h": 30}', 200, 400),
    ('20000000-0000-0000-0000-000000000017', 'FOOD-TEA-001', 'Green Tea Collection', '50 tea bags, organic', '10000000-0000-0000-0000-000000000004', 'BOX', 0.15, '{"l": 15, "w": 8, "h": 10}', 300, 600),
    ('20000000-0000-0000-0000-000000000018', 'FOOD-SNACK-001', 'Mixed Nuts Pack', '500g premium mix', '10000000-0000-0000-0000-000000000004', 'BAG', 0.5, '{"l": 20, "w": 10, "h": 5}', 250, 500),
    ('20000000-0000-0000-0000-000000000019', 'FOOD-CHOC-001', 'Dark Chocolate Bar', '70% cocoa, 100g', '10000000-0000-0000-0000-000000000004', 'BAR', 0.1, '{"l": 15, "w": 8, "h": 1}', 400, 800),
    ('20000000-0000-0000-0000-000000000020', 'FOOD-WATER-001', 'Spring Water 12-Pack', '500ml bottles', '10000000-0000-0000-0000-000000000004', 'CASE', 6.5, '{"l": 40, "w": 30, "h": 25}', 100, 200)
ON CONFLICT (sku) DO NOTHING;

-- =============================================================================
-- LOCATIONS (for LA Distribution Center)
-- =============================================================================

-- Receiving Dock Locations
INSERT INTO locations (warehouse_id, barcode, location_type, zone, aisle, rack, level, position, max_units)
SELECT
    '00000000-0000-0000-0000-000000000001',
    'DOCK-' || LPAD(i::text, 2, '0'),
    'dock',
    'RECEIVING',
    NULL, NULL, NULL, NULL,
    1000
FROM generate_series(1, 12) AS i
ON CONFLICT (barcode) DO NOTHING;

-- Staging Locations
INSERT INTO locations (warehouse_id, barcode, location_type, zone, aisle, rack, level, position, max_units)
SELECT
    '00000000-0000-0000-0000-000000000001',
    'STG-' || LPAD(i::text, 3, '0'),
    'staging',
    'STAGING',
    NULL, NULL, NULL, NULL,
    500
FROM generate_series(1, 20) AS i
ON CONFLICT (barcode) DO NOTHING;

-- Shipping Locations
INSERT INTO locations (warehouse_id, barcode, location_type, zone, aisle, rack, level, position, max_units)
SELECT
    '00000000-0000-0000-0000-000000000001',
    'SHIP-' || LPAD(i::text, 2, '0'),
    'shipping',
    'SHIPPING',
    NULL, NULL, NULL, NULL,
    200
FROM generate_series(1, 15) AS i
ON CONFLICT (barcode) DO NOTHING;

-- Storage Rack Locations (A zone - Electronics)
INSERT INTO locations (warehouse_id, barcode, location_type, zone, aisle, rack, level, position, max_units)
SELECT
    '00000000-0000-0000-0000-000000000001',
    'A' || LPAD(a::text, 2, '0') || '-' || LPAD(r::text, 2, '0') || '-' || LPAD(l::text, 1, '0'),
    'rack',
    'A-ELECTRONICS',
    'A' || LPAD(a::text, 2, '0'),
    LPAD(r::text, 2, '0'),
    LPAD(l::text, 1, '0'),
    NULL,
    CASE WHEN l = 1 THEN 50 WHEN l = 2 THEN 40 WHEN l = 3 THEN 30 ELSE 20 END
FROM generate_series(1, 5) AS a, generate_series(1, 10) AS r, generate_series(1, 4) AS l
ON CONFLICT (barcode) DO NOTHING;

-- Storage Rack Locations (B zone - Apparel)
INSERT INTO locations (warehouse_id, barcode, location_type, zone, aisle, rack, level, position, max_units)
SELECT
    '00000000-0000-0000-0000-000000000001',
    'B' || LPAD(a::text, 2, '0') || '-' || LPAD(r::text, 2, '0') || '-' || LPAD(l::text, 1, '0'),
    'rack',
    'B-APPAREL',
    'B' || LPAD(a::text, 2, '0'),
    LPAD(r::text, 2, '0'),
    LPAD(l::text, 1, '0'),
    NULL,
    CASE WHEN l = 1 THEN 100 WHEN l = 2 THEN 80 WHEN l = 3 THEN 60 ELSE 40 END
FROM generate_series(1, 4) AS a, generate_series(1, 12) AS r, generate_series(1, 4) AS l
ON CONFLICT (barcode) DO NOTHING;

-- Storage Rack Locations (C zone - Home & Garden)
INSERT INTO locations (warehouse_id, barcode, location_type, zone, aisle, rack, level, position, max_units)
SELECT
    '00000000-0000-0000-0000-000000000001',
    'C' || LPAD(a::text, 2, '0') || '-' || LPAD(r::text, 2, '0') || '-' || LPAD(l::text, 1, '0'),
    'rack',
    'C-HOME',
    'C' || LPAD(a::text, 2, '0'),
    LPAD(r::text, 2, '0'),
    LPAD(l::text, 1, '0'),
    NULL,
    CASE WHEN l = 1 THEN 30 WHEN l = 2 THEN 25 ELSE 20 END
FROM generate_series(1, 3) AS a, generate_series(1, 8) AS r, generate_series(1, 3) AS l
ON CONFLICT (barcode) DO NOTHING;

-- Storage Rack Locations (D zone - Food & Beverage)
INSERT INTO locations (warehouse_id, barcode, location_type, zone, aisle, rack, level, position, max_units)
SELECT
    '00000000-0000-0000-0000-000000000001',
    'D' || LPAD(a::text, 2, '0') || '-' || LPAD(r::text, 2, '0') || '-' || LPAD(l::text, 1, '0'),
    'rack',
    'D-FOOD',
    'D' || LPAD(a::text, 2, '0'),
    LPAD(r::text, 2, '0'),
    LPAD(l::text, 1, '0'),
    NULL,
    CASE WHEN l = 1 THEN 150 WHEN l = 2 THEN 120 WHEN l = 3 THEN 100 ELSE 80 END
FROM generate_series(1, 4) AS a, generate_series(1, 10) AS r, generate_series(1, 4) AS l
ON CONFLICT (barcode) DO NOTHING;

-- QA/Damaged Locations
INSERT INTO locations (warehouse_id, barcode, location_type, zone, max_units) VALUES
    ('00000000-0000-0000-0000-000000000001', 'QA-HOLD-01', 'qa', 'QUALITY', 500),
    ('00000000-0000-0000-0000-000000000001', 'QA-HOLD-02', 'qa', 'QUALITY', 500),
    ('00000000-0000-0000-0000-000000000001', 'DMG-01', 'damaged', 'DAMAGED', 200),
    ('00000000-0000-0000-0000-000000000001', 'DMG-02', 'damaged', 'DAMAGED', 200)
ON CONFLICT (barcode) DO NOTHING;

-- =============================================================================
-- INVENTORY (Sample stock levels)
-- =============================================================================

-- Electronics in A zone
INSERT INTO inventory (warehouse_id, product_id, location_id, quantity, status)
SELECT
    '00000000-0000-0000-0000-000000000001',
    p.id,
    l.id,
    FLOOR(RANDOM() * 40 + 10)::int,
    'available'
FROM products p
CROSS JOIN LATERAL (
    SELECT id FROM locations
    WHERE warehouse_id = '00000000-0000-0000-0000-000000000001'
    AND zone = 'A-ELECTRONICS'
    ORDER BY RANDOM()
    LIMIT 3
) l
WHERE p.category_id = '10000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

-- Apparel in B zone
INSERT INTO inventory (warehouse_id, product_id, location_id, quantity, status)
SELECT
    '00000000-0000-0000-0000-000000000001',
    p.id,
    l.id,
    FLOOR(RANDOM() * 80 + 20)::int,
    'available'
FROM products p
CROSS JOIN LATERAL (
    SELECT id FROM locations
    WHERE warehouse_id = '00000000-0000-0000-0000-000000000001'
    AND zone = 'B-APPAREL'
    ORDER BY RANDOM()
    LIMIT 4
) l
WHERE p.category_id = '10000000-0000-0000-0000-000000000002'
ON CONFLICT DO NOTHING;

-- Home & Garden in C zone
INSERT INTO inventory (warehouse_id, product_id, location_id, quantity, status)
SELECT
    '00000000-0000-0000-0000-000000000001',
    p.id,
    l.id,
    FLOOR(RANDOM() * 30 + 5)::int,
    'available'
FROM products p
CROSS JOIN LATERAL (
    SELECT id FROM locations
    WHERE warehouse_id = '00000000-0000-0000-0000-000000000001'
    AND zone = 'C-HOME'
    ORDER BY RANDOM()
    LIMIT 2
) l
WHERE p.category_id = '10000000-0000-0000-0000-000000000003'
ON CONFLICT DO NOTHING;

-- Food & Beverage in D zone
INSERT INTO inventory (warehouse_id, product_id, location_id, quantity, status)
SELECT
    '00000000-0000-0000-0000-000000000001',
    p.id,
    l.id,
    FLOOR(RANDOM() * 150 + 50)::int,
    'available'
FROM products p
CROSS JOIN LATERAL (
    SELECT id FROM locations
    WHERE warehouse_id = '00000000-0000-0000-0000-000000000001'
    AND zone = 'D-FOOD'
    ORDER BY RANDOM()
    LIMIT 3
) l
WHERE p.category_id = '10000000-0000-0000-0000-000000000004'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- INBOUND SHIPMENTS (Sample ASNs)
-- =============================================================================
INSERT INTO inbound_shipments (id, warehouse_id, po_number, shipment_number, supplier_name, carrier, status, expected_arrival, dock_door) VALUES
    ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'PO-2024-001', 'ASN-20240101-001', 'TechSupplier Inc', 'FedEx Freight', 'scheduled', CURRENT_DATE + INTERVAL '2 days', 'DOCK-01'),
    ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'PO-2024-002', 'ASN-20240101-002', 'Fashion Wholesale Co', 'UPS Freight', 'arrived', CURRENT_DATE, 'DOCK-03'),
    ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'PO-2024-003', 'ASN-20240101-003', 'Home Goods Direct', 'R+L Carriers', 'receiving', CURRENT_DATE - INTERVAL '1 day', 'DOCK-05'),
    ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'PO-2024-004', 'ASN-20240101-004', 'Gourmet Foods LLC', 'Old Dominion', 'completed', CURRENT_DATE - INTERVAL '3 days', 'DOCK-02')
ON CONFLICT (shipment_number) DO NOTHING;

-- Inbound Lines
INSERT INTO inbound_lines (inbound_shipment_id, product_id, expected_quantity, received_quantity, status) VALUES
    -- ASN-001 (scheduled)
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 100, 0, 'pending'),
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 50, 0, 'pending'),
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 75, 0, 'pending'),
    -- ASN-002 (arrived)
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000006', 200, 0, 'pending'),
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000007', 150, 0, 'pending'),
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000008', 80, 0, 'pending'),
    -- ASN-003 (receiving)
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000011', 60, 45, 'partial'),
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000012', 30, 30, 'complete'),
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000013', 100, 0, 'pending'),
    -- ASN-004 (completed)
    ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000016', 250, 250, 'complete'),
    ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000017', 400, 400, 'complete'),
    ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000018', 300, 300, 'complete')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- OUTBOUND SHIPMENTS (Sample orders)
-- =============================================================================
INSERT INTO shipments (id, warehouse_id, order_number, customer_name, customer_address, carrier, service_level, status, ship_by_date) VALUES
    ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'ORD-2024-0001', 'Acme Corporation', '123 Business Park, New York, NY 10001', 'FedEx', 'Ground', 'pending', CURRENT_DATE + INTERVAL '3 days'),
    ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'ORD-2024-0002', 'Smith Electronics', '456 Tech Drive, San Jose, CA 95110', 'UPS', '2-Day', 'pending', CURRENT_DATE + INTERVAL '2 days'),
    ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'ORD-2024-0003', 'Fashion Forward Inc', '789 Style Ave, Miami, FL 33101', 'USPS', 'Priority', 'allocated', CURRENT_DATE + INTERVAL '1 day'),
    ('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'ORD-2024-0004', 'Home Decor Plus', '321 Interior Blvd, Seattle, WA 98101', 'FedEx', 'Express', 'picking', CURRENT_DATE),
    ('40000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'ORD-2024-0005', 'Gourmet Kitchen Co', '654 Culinary Way, Chicago, IL 60601', 'UPS', 'Ground', 'packed', CURRENT_DATE - INTERVAL '1 day')
ON CONFLICT (order_number) DO NOTHING;

-- Shipment Lines
INSERT INTO shipment_lines (shipment_id, product_id, quantity, status) VALUES
    -- ORD-0001
    ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 5, 'pending'),
    ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 10, 'pending'),
    -- ORD-0002
    ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 3, 'pending'),
    ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 5, 'pending'),
    ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005', 8, 'pending'),
    -- ORD-0003
    ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006', 20, 'allocated'),
    ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000007', 15, 'allocated'),
    ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000009', 10, 'allocated'),
    -- ORD-0004
    ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000011', 4, 'picking'),
    ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000013', 6, 'picking'),
    ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000015', 3, 'picked'),
    -- ORD-0005
    ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000016', 12, 'packed'),
    ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000018', 20, 'packed')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- WAVES
-- =============================================================================
INSERT INTO waves (id, warehouse_id, wave_number, status, total_shipments) VALUES
    ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'WAVE-2024-001', 'planning', 2),
    ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'WAVE-2024-002', 'released', 1),
    ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'WAVE-2024-003', 'picking', 1),
    ('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'WAVE-2024-004', 'completed', 1)
ON CONFLICT (wave_number) DO NOTHING;

-- Link shipments to waves
UPDATE shipments SET wave_id = '50000000-0000-0000-0000-000000000001' WHERE id IN ('40000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002');
UPDATE shipments SET wave_id = '50000000-0000-0000-0000-000000000002' WHERE id = '40000000-0000-0000-0000-000000000003';
UPDATE shipments SET wave_id = '50000000-0000-0000-0000-000000000003' WHERE id = '40000000-0000-0000-0000-000000000004';
UPDATE shipments SET wave_id = '50000000-0000-0000-0000-000000000004' WHERE id = '40000000-0000-0000-0000-000000000005';

-- =============================================================================
-- PROBLEM TICKETS
-- =============================================================================
INSERT INTO problem_tickets (warehouse_id, ticket_number, problem_type, status, priority, title, description, product_id) VALUES
    ('00000000-0000-0000-0000-000000000001', 'TKT-2024-001', 'shortage', 'open', 'high', 'Short pick on WAVE-2024-002', 'Expected 20 units, only found 15 at location B01-05-2', '20000000-0000-0000-0000-000000000006'),
    ('00000000-0000-0000-0000-000000000001', 'TKT-2024-002', 'damage', 'investigating', 'medium', 'Damaged electronics received', 'Box was crushed during transit, 3 laptops have visible damage', '20000000-0000-0000-0000-000000000002'),
    ('00000000-0000-0000-0000-000000000001', 'TKT-2024-003', 'mispick', 'resolved', 'low', 'Wrong item picked for ORD-2024-0003', 'Picked SKU APRL-JACKET-001 instead of APRL-JEANS-001', '20000000-0000-0000-0000-000000000007'),
    ('00000000-0000-0000-0000-000000000001', 'TKT-2024-004', 'quality', 'open', 'critical', 'Expired food products in inventory', 'Found expired coffee bags in D02-03-1, need full zone audit', '20000000-0000-0000-0000-000000000016')
ON CONFLICT (ticket_number) DO NOTHING;

-- =============================================================================
-- COUNT TASKS (Cycle counts)
-- =============================================================================
INSERT INTO count_tasks (warehouse_id, location_id, expected_quantity, status, count_type, priority)
SELECT
    '00000000-0000-0000-0000-000000000001',
    l.id,
    NULL,
    'pending',
    'cycle',
    5
FROM locations l
WHERE l.warehouse_id = '00000000-0000-0000-0000-000000000001'
AND l.zone IN ('A-ELECTRONICS', 'B-APPAREL')
ORDER BY RANDOM()
LIMIT 10
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SAMPLE TRANSACTIONS (Recent activity)
-- =============================================================================
INSERT INTO transactions (warehouse_id, transaction_type, product_id, location_id_to, quantity, notes, status, created_at)
SELECT
    '00000000-0000-0000-0000-000000000001',
    'receive',
    p.id,
    (SELECT id FROM locations WHERE barcode = 'STG-001' LIMIT 1),
    FLOOR(RANDOM() * 50 + 10)::int,
    'Received from ASN-20240101-004',
    'completed',
    NOW() - (INTERVAL '1 hour' * FLOOR(RANDOM() * 72))
FROM products p
WHERE p.category_id = '10000000-0000-0000-0000-000000000004'
ON CONFLICT DO NOTHING;

INSERT INTO transactions (warehouse_id, transaction_type, product_id, location_id_from, location_id_to, quantity, notes, status, created_at)
SELECT
    '00000000-0000-0000-0000-000000000001',
    'putaway',
    p.id,
    (SELECT id FROM locations WHERE barcode = 'STG-001' LIMIT 1),
    l.id,
    FLOOR(RANDOM() * 30 + 5)::int,
    'Putaway to storage',
    'completed',
    NOW() - (INTERVAL '1 hour' * FLOOR(RANDOM() * 48))
FROM products p
CROSS JOIN LATERAL (
    SELECT id FROM locations
    WHERE warehouse_id = '00000000-0000-0000-0000-000000000001'
    AND location_type = 'rack'
    ORDER BY RANDOM()
    LIMIT 1
) l
WHERE p.category_id IN ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- UPDATE LOCATION CURRENT UNITS (based on inventory)
-- =============================================================================
UPDATE locations l SET current_units = COALESCE(
    (SELECT SUM(quantity) FROM inventory WHERE location_id = l.id),
    0
);

COMMIT;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these to verify the seed worked:

-- SELECT 'Warehouses' as table_name, COUNT(*) as count FROM warehouses
-- UNION ALL SELECT 'Categories', COUNT(*) FROM categories
-- UNION ALL SELECT 'Products', COUNT(*) FROM products
-- UNION ALL SELECT 'Locations', COUNT(*) FROM locations
-- UNION ALL SELECT 'Inventory', COUNT(*) FROM inventory
-- UNION ALL SELECT 'Inbound Shipments', COUNT(*) FROM inbound_shipments
-- UNION ALL SELECT 'Outbound Shipments', COUNT(*) FROM shipments
-- UNION ALL SELECT 'Waves', COUNT(*) FROM waves
-- UNION ALL SELECT 'Problem Tickets', COUNT(*) FROM problem_tickets
-- UNION ALL SELECT 'Transactions', COUNT(*) FROM transactions;
