-- ============================================================================
-- NEXUS CHAIN WMS - Database Functions
-- Migration: 004_functions.sql
-- Description: Stored functions for business operations
-- ============================================================================

-- ============================================================================
-- AUTO-RELEASE WAVES
-- Releases pending waves that have been waiting for more than 5 hours
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_release_waves()
RETURNS INTEGER AS $$
DECLARE
  released_count INTEGER := 0;
  wave_rec RECORD;
BEGIN
  FOR wave_rec IN
    SELECT id FROM waves
    WHERE status = 'pending'
    AND created_at <= NOW() - INTERVAL '5 hours'
  LOOP
    UPDATE waves 
    SET status = 'picking', released_at = NOW() 
    WHERE id = wave_rec.id;
    
    released_count := released_count + 1;
  END LOOP;
  
  RETURN released_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SUGGEST PUTAWAY LOCATION
-- Returns the best location for putaway based on product and availability
-- ============================================================================

CREATE OR REPLACE FUNCTION suggest_putaway_location(
  p_warehouse_id UUID,
  p_product_id UUID,
  p_quantity INT DEFAULT 1
)
RETURNS TABLE (
  location_id UUID,
  location_barcode TEXT,
  location_type TEXT,
  available_capacity INT,
  score INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.barcode,
    l.location_type,
    (l.capacity_units - l.current_units) AS available_capacity,
    -- Score calculation: prime locations first, then by available capacity
    CASE 
      WHEN l.location_type = 'prime' AND l.level = 1 THEN 100
      WHEN l.location_type = 'reserve' AND l.level = 2 THEN 80
      WHEN l.location_type = 'reserve' AND l.level = 3 THEN 60
      WHEN l.location_type = 'reserve' AND l.level = 4 THEN 40
      ELSE 20
    END + 
    -- Bonus for locations that already have the same product
    CASE WHEN EXISTS (
      SELECT 1 FROM inventory i 
      WHERE i.location_id = l.id AND i.product_id = p_product_id
    ) THEN 50 ELSE 0 END AS score
  FROM locations l
  WHERE l.warehouse_id = p_warehouse_id
    AND l.status = 'empty'
    AND l.location_type IN ('prime', 'reserve')
    AND (l.capacity_units - l.current_units) >= p_quantity
  ORDER BY score DESC, l.aisle, l.level, l.section, l.position
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET WAVE PICKING LIST
-- Returns optimized picking list for a wave (sorted by aisle/level)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_wave_picking_list(p_wave_id UUID)
RETURNS TABLE (
  shipment_id UUID,
  order_number TEXT,
  line_id UUID,
  product_id UUID,
  product_sku TEXT,
  product_name TEXT,
  location_id UUID,
  location_barcode TEXT,
  quantity INT,
  aisle TEXT,
  level INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS shipment_id,
    s.order_number,
    sl.id AS line_id,
    sl.product_id,
    p.sku AS product_sku,
    p.name AS product_name,
    sl.location_id,
    l.barcode AS location_barcode,
    sl.quantity,
    l.aisle,
    l.level
  FROM shipments s
  JOIN shipment_lines sl ON sl.shipment_id = s.id
  JOIN products p ON p.id = sl.product_id
  JOIN locations l ON l.id = sl.location_id
  WHERE s.wave_id = p_wave_id
    AND sl.picked_at IS NULL
  ORDER BY l.aisle, l.level, l.section, l.position;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE WAVE FROM PENDING SHIPMENTS
-- Groups pending shipments into a new wave
-- ============================================================================

CREATE OR REPLACE FUNCTION create_wave_from_shipments(
  p_warehouse_id UUID,
  p_max_shipments INT DEFAULT 50,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_wave_id UUID;
  v_wave_number TEXT;
  v_sequence INT;
BEGIN
  -- Generate wave number
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(wave_number FROM '[0-9]+$') AS INT)
  ), 0) + 1 INTO v_sequence
  FROM waves
  WHERE warehouse_id = p_warehouse_id
    AND DATE(created_at) = CURRENT_DATE;
  
  v_wave_number := 'WAVE-' || TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') || '-' || LPAD(v_sequence::TEXT, 3, '0');
  
  -- Create wave
  INSERT INTO waves (warehouse_id, wave_number, status, created_by)
  VALUES (p_warehouse_id, v_wave_number, 'pending', p_created_by)
  RETURNING id INTO v_wave_id;
  
  -- Assign pending shipments to wave
  -- Note: In production, this would use a separate pending_shipments table
  -- For now, this is a placeholder for the wave creation logic
  
  RETURN v_wave_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CALCULATE INVENTORY ACCURACY
-- Returns inventory accuracy percentage for a warehouse
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_inventory_accuracy(
  p_warehouse_id UUID,
  p_days INT DEFAULT 30
)
RETURNS NUMERIC AS $$
DECLARE
  total_counts INT;
  accurate_counts INT;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE variance = 0)
  INTO total_counts, accurate_counts
  FROM icqa_counts
  WHERE warehouse_id = p_warehouse_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  IF total_counts = 0 THEN
    RETURN 100.00;
  END IF;
  
  RETURN ROUND((accurate_counts::NUMERIC / total_counts) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET DASHBOARD KPIs
-- Returns real-time KPIs for dashboard
-- ============================================================================

CREATE OR REPLACE FUNCTION get_dashboard_kpis(p_warehouse_id UUID)
RETURNS TABLE (
  waves_in_progress INT,
  pick_rate NUMERIC,
  shipments_today INT,
  open_tickets INT,
  inventory_accuracy NUMERIC,
  units_processed_today INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Waves in progress
    (SELECT COUNT(*)::INT FROM waves 
     WHERE warehouse_id = p_warehouse_id 
     AND status IN ('picking', 'packing'))::INT,
    
    -- Pick rate (units per hour in last 4 hours)
    COALESCE((
      SELECT ROUND(COUNT(*)::NUMERIC / 4, 1)
      FROM transactions
      WHERE warehouse_id = p_warehouse_id
        AND transaction_type = 'pick'
        AND created_at >= NOW() - INTERVAL '4 hours'
    ), 0)::NUMERIC,
    
    -- Shipments today
    (SELECT COUNT(*)::INT FROM shipments s
     JOIN waves w ON w.id = s.wave_id
     WHERE w.warehouse_id = p_warehouse_id
     AND DATE(s.created_at) = CURRENT_DATE)::INT,
    
    -- Open tickets
    (SELECT COUNT(*)::INT FROM problem_tickets
     WHERE warehouse_id = p_warehouse_id
     AND status IN ('open', 'in_progress'))::INT,
    
    -- Inventory accuracy
    calculate_inventory_accuracy(p_warehouse_id, 30),
    
    -- Units processed today
    (SELECT COALESCE(SUM(quantity), 0)::INT FROM transactions
     WHERE warehouse_id = p_warehouse_id
     AND DATE(created_at) = CURRENT_DATE
     AND transaction_type IN ('pick', 'receive', 'putaway'))::INT;
END;
$$ LANGUAGE plpgsql;
