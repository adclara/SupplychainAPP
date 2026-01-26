-- ============================================================================
-- NEXUS CHAIN WMS - Database Triggers
-- Migration: 003_triggers.sql
-- Description: Automation triggers for business logic
-- ============================================================================

-- ============================================================================
-- AUTOMATIC REPLENISHMENT TRIGGER
-- Creates a problem ticket when PRIME location falls below 30% capacity
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_replenishment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check prime locations that are occupied
  IF NEW.location_type = 'prime' AND NEW.status = 'occupied' THEN
    -- Check if capacity falls below 30%
    IF NEW.capacity_units > 0 AND 
       (NEW.current_units::FLOAT / NEW.capacity_units) < 0.3 THEN
      -- Create a shortage ticket (using system user for automatic creation)
      INSERT INTO problem_tickets (
        warehouse_id, 
        ticket_type, 
        source_table, 
        location_id, 
        status, 
        description,
        created_by
      )
      SELECT 
        NEW.warehouse_id,
        'shortage',
        'locations',
        NEW.id,
        'open',
        'Location ' || NEW.barcode || ' is below 30% capacity (' || 
          NEW.current_units || '/' || NEW.capacity_units || ' units). Replenishment needed.',
        (SELECT id FROM users WHERE role = 'admin' AND warehouse_id = NEW.warehouse_id LIMIT 1)
      WHERE NOT EXISTS (
        -- Don't create duplicate tickets for same location
        SELECT 1 FROM problem_tickets 
        WHERE location_id = NEW.id 
        AND ticket_type = 'shortage'
        AND status IN ('open', 'in_progress')
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER replenishment_check 
AFTER UPDATE ON locations
FOR EACH ROW 
WHEN (OLD.current_units IS DISTINCT FROM NEW.current_units)
EXECUTE FUNCTION trigger_replenishment();

-- ============================================================================
-- INVENTORY TRANSACTION LOGGING
-- Logs all inventory changes for audit trail
-- ============================================================================

CREATE OR REPLACE FUNCTION log_inventory_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO transactions (
      warehouse_id, 
      transaction_type, 
      user_id, 
      product_id, 
      location_id_to, 
      quantity, 
      reference_id,
      notes
    )
    VALUES (
      NEW.warehouse_id,
      'inventory_add',
      COALESCE(NEW.last_moved_by, auth.uid()),
      NEW.product_id,
      NEW.location_id,
      NEW.quantity,
      NEW.lpn,
      'New inventory record created'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if quantity changed
    IF OLD.quantity IS DISTINCT FROM NEW.quantity THEN
      INSERT INTO transactions (
        warehouse_id, 
        transaction_type, 
        user_id, 
        product_id, 
        location_id_from,
        location_id_to, 
        quantity, 
        reference_id,
        notes
      )
      VALUES (
        NEW.warehouse_id,
        CASE 
          WHEN NEW.quantity > OLD.quantity THEN 'inventory_increase'
          ELSE 'inventory_decrease'
        END,
        COALESCE(NEW.last_moved_by, auth.uid()),
        NEW.product_id,
        OLD.location_id,
        NEW.location_id,
        ABS(NEW.quantity - OLD.quantity),
        NEW.lpn,
        'Quantity changed from ' || OLD.quantity || ' to ' || NEW.quantity
      );
    END IF;
    
    -- Log location moves
    IF OLD.location_id IS DISTINCT FROM NEW.location_id THEN
      INSERT INTO transactions (
        warehouse_id, 
        transaction_type, 
        user_id, 
        product_id, 
        location_id_from,
        location_id_to, 
        quantity, 
        reference_id,
        notes
      )
      VALUES (
        NEW.warehouse_id,
        'inventory_move',
        COALESCE(NEW.last_moved_by, auth.uid()),
        NEW.product_id,
        OLD.location_id,
        NEW.location_id,
        NEW.quantity,
        NEW.lpn,
        'Inventory moved to new location'
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO transactions (
      warehouse_id, 
      transaction_type, 
      user_id, 
      product_id, 
      location_id_from, 
      quantity, 
      reference_id,
      notes
    )
    VALUES (
      OLD.warehouse_id,
      'inventory_remove',
      auth.uid(),
      OLD.product_id,
      OLD.location_id,
      OLD.quantity,
      OLD.lpn,
      'Inventory record deleted'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_log 
AFTER INSERT OR UPDATE OR DELETE ON inventory
FOR EACH ROW EXECUTE FUNCTION log_inventory_transaction();

-- ============================================================================
-- WAVE STATUS CHANGE TRIGGER
-- Updates related shipments when wave status changes
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_wave_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When wave is released (pending -> picking)
  IF OLD.status = 'pending' AND NEW.status = 'picking' THEN
    UPDATE shipments 
    SET status = 'picking', updated_at = NOW()
    WHERE wave_id = NEW.id AND status = 'pending';
  END IF;
  
  -- When wave is shipped
  IF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
    NEW.completed_at := NOW();
    
    UPDATE shipments 
    SET status = 'shipped', shipped_at = NOW(), updated_at = NOW()
    WHERE wave_id = NEW.id AND status != 'shipped';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wave_status_sync 
BEFORE UPDATE ON waves
FOR EACH ROW 
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION sync_wave_status();

-- ============================================================================
-- LOCATION STATUS UPDATE
-- Automatically updates location status based on inventory
-- ============================================================================

CREATE OR REPLACE FUNCTION update_location_status()
RETURNS TRIGGER AS $$
DECLARE
  total_units INT;
BEGIN
  -- Calculate total units at location
  SELECT COALESCE(SUM(quantity), 0) INTO total_units
  FROM inventory
  WHERE location_id = COALESCE(NEW.location_id, OLD.location_id);
  
  -- Update location status and current_units
  UPDATE locations
  SET 
    current_units = total_units,
    status = CASE 
      WHEN total_units = 0 THEN 'empty'
      ELSE 'occupied'
    END,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.location_id, OLD.location_id);
  
  -- Also update old location if inventory was moved
  IF TG_OP = 'UPDATE' AND OLD.location_id IS DISTINCT FROM NEW.location_id THEN
    SELECT COALESCE(SUM(quantity), 0) INTO total_units
    FROM inventory
    WHERE location_id = OLD.location_id;
    
    UPDATE locations
    SET 
      current_units = total_units,
      status = CASE 
        WHEN total_units = 0 THEN 'empty'
        ELSE 'occupied'
      END,
      updated_at = NOW()
    WHERE id = OLD.location_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER location_status_update 
AFTER INSERT OR UPDATE OR DELETE ON inventory
FOR EACH ROW EXECUTE FUNCTION update_location_status();

-- ============================================================================
-- ICQA VARIANCE CALCULATION
-- Automatically calculates variance on ICQA count submission
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_icqa_variance()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate variance (physical - system)
  NEW.variance := COALESCE(NEW.physical_quantity, 0) - COALESCE(NEW.system_quantity, 0);
  
  -- If variance is non-zero and significant, create a problem ticket
  IF NEW.variance != 0 THEN
    -- Block the location until resolved
    UPDATE locations 
    SET status = 'blocked', updated_at = NOW()
    WHERE id = NEW.location_id;
    
    -- Create problem ticket for variance
    INSERT INTO problem_tickets (
      warehouse_id,
      ticket_type,
      source_table,
      source_id,
      location_id,
      product_id,
      status,
      description,
      created_by
    )
    VALUES (
      NEW.warehouse_id,
      'shortage',
      'icqa_counts',
      NEW.id,
      NEW.location_id,
      NEW.product_id,
      'open',
      'ICQA Variance detected: System=' || NEW.system_quantity || 
        ', Physical=' || NEW.physical_quantity || 
        ', Variance=' || NEW.variance,
      NEW.counted_by
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER icqa_variance_calc 
BEFORE INSERT ON icqa_counts
FOR EACH ROW EXECUTE FUNCTION calculate_icqa_variance();
