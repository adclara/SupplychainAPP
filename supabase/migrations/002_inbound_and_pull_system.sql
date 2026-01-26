-- =============================================================================
-- NEXUS WMS - Additional Tables for Inbound & Pull System
-- Migration: 002_inbound_and_pull_system.sql
-- Description: Adds missing tables for complete WMS functionality
-- =============================================================================

-- =============================================================================
-- INBOUND SHIPMENTS (Additional fields)
-- =============================================================================

CREATE TABLE IF NOT EXISTS inbound_shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asn_number TEXT UNIQUE NOT NULL,
    warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
    supplier_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'receiving', 'received', 'putaway')) DEFAULT 'scheduled',
    expected_date TIMESTAMPTZ NOT NULL,
    dock_door TEXT,
    carrier TEXT,
    scheduled_arrival TIMESTAMPTZ,
    receiving_started_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    total_items INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inbound_shipments_warehouse ON inbound_shipments(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inbound_shipments_status ON inbound_shipments(status);

-- =============================================================================
-- INBOUND LINES
-- =============================================================================

CREATE TABLE IF NOT EXISTS inbound_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inbound_shipment_id UUID REFERENCES inbound_shipments(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    expected_quantity INTEGER NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('pending', 'receiving', 'received')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inbound_lines_shipment ON inbound_lines(inbound_shipment_id);
CREATE INDEX IF NOT EXISTS idx_inbound_lines_product ON inbound_lines(product_id);

-- =============================================================================
-- PUTAWAY TASKS (Pull System)
-- =============================================================================

CREATE TABLE IF NOT EXISTS putaway_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inbound_line_id UUID REFERENCES inbound_lines(id),
    product_id UUID REFERENCES products(id) NOT NULL,
    from_location_id UUID REFERENCES locations(id) NOT NULL,
    to_location_id UUID REFERENCES locations(id),
    quantity INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    assigned_to UUID REFERENCES users(id),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_putaway_tasks_status ON putaway_tasks(status);
CREATE INDEX IF NOT EXISTS idx_putaway_tasks_assigned ON putaway_tasks(assigned_to);

-- =============================================================================
-- PICKING TASKS (Pull System)
-- =============================================================================

CREATE TABLE IF NOT EXISTS picking_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_line_id UUID REFERENCES shipment_lines(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    quantity INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    assigned_to UUID REFERENCES users(id),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_picking_tasks_status ON picking_tasks(status);
CREATE INDEX IF NOT EXISTS idx_picking_tasks_assigned ON picking_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_picking_tasks_shipment_line ON picking_tasks(shipment_line_id);

-- =============================================================================
-- COUNT TASKS (ICQA Pull System)
-- =============================================================================

CREATE TABLE IF NOT EXISTS count_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) NOT NULL,
    product_id UUID REFERENCES products(id),
    type TEXT NOT NULL CHECK (type IN ('blind', 'full')) DEFAULT 'blind',
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    system_quantity INTEGER,
    counted_quantity INTEGER,
    variance INTEGER,
    counted_by UUID REFERENCES users(id),
    counted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_count_tasks_location ON count_tasks(location_id);
CREATE INDEX IF NOT EXISTS idx_count_tasks_status ON count_tasks(status);
CREATE INDEX IF NOT EXISTS idx_count_tasks_assigned ON count_tasks(counted_by);

-- =============================================================================
-- UPDATE PROBLEM TICKETS (Add fields)
-- =============================================================================

-- Add priority and ticket_type updates if not exists
DO $$
BEGIN
    -- Add ticket types if needed
    ALTER TABLE problem_tickets DROP CONSTRAINT IF EXISTS problem_tickets_ticket_type_check;
    ALTER TABLE problem_tickets ADD CONSTRAINT problem_tickets_ticket_type_check 
        CHECK (ticket_type IN ('count_variance', 'damage', 'missing', 'quality', 'system_error', 'other', 'shortage', 'mislabel', 'wrong_location'));
    
    -- Add priority column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='problem_tickets' AND column_name='priority') THEN
        ALTER TABLE problem_tickets ADD COLUMN priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium';
    END IF;
END $$;

-- =============================================================================
-- UPDATE WAVES TABLE (Add fields)
-- =============================================================================

DO $$
BEGIN
    -- Add shipment_count if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='waves' AND column_name='shipment_count') THEN
        ALTER TABLE waves ADD COLUMN shipment_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add total_lines if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='waves' AND column_name='total_lines') THEN
        ALTER TABLE waves ADD COLUMN total_lines INTEGER DEFAULT 0;
    END IF;
    
    -- Update status check to include 'draft'
    ALTER TABLE waves DROP CONSTRAINT IF EXISTS waves_status_check;
    ALTER TABLE waves ADD CONSTRAINT waves_status_check 
        CHECK (status IN ('draft', 'released', 'picking', 'packing', 'shipped', 'completed', 'pending'));
END $$;

-- =============================================================================
-- UPDATE SHIPMENTS TABLE (Add fields)
-- =============================================================================

DO $$
BEGIN
    -- Add total_items if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shipments' AND column_name='total_items') THEN
        ALTER TABLE shipments ADD COLUMN total_items INTEGER DEFAULT 0;
    END IF;
    
    -- Add label_generated_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shipments' AND column_name='label_generated_at') THEN
        ALTER TABLE shipments ADD COLUMN label_generated_at TIMESTAMPTZ;
    END IF;

    -- Add carrier if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shipments' AND column_name='carrier') THEN
        ALTER TABLE shipments ADD COLUMN carrier TEXT;
    END IF;

    -- Make wave_id nullable for shipments not in waves
    ALTER TABLE shipments ALTER COLUMN wave_id DROP NOT NULL;
END $$;

-- =============================================================================
-- UPDATE SHIPMENT_LINES TABLE (Add fields)
-- =============================================================================

DO $$
BEGIN
    -- Add status if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shipment_lines' AND column_name='status') THEN
        ALTER TABLE shipment_lines ADD COLUMN status TEXT CHECK (status IN ('pending', 'in_progress', 'picked', 'packed')) DEFAULT 'pending';
    END IF;
    
    -- Add picked_quantity if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shipment_lines' AND column_name='picked_quantity') THEN
        ALTER TABLE shipment_lines ADD COLUMN picked_quantity INTEGER DEFAULT 0;
    END IF;

    -- Make location_id nullable
    ALTER TABLE shipment_lines ALTER COLUMN location_id DROP NOT NULL;
END $$;

-- =============================================================================
-- UPDATE PRODUCTS TABLE (Add barcode field)
-- =============================================================================

DO $$
BEGIN
    -- Add barcode as alias for upc if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='barcode') THEN
        ALTER TABLE products ADD COLUMN barcode TEXT;
        -- Copy upc to barcode
        UPDATE products SET barcode = upc WHERE barcode IS NULL;
        -- Create index
        CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
    END IF;
END $$;

-- =============================================================================
-- UPDATE LOCATIONS TABLE (Add zone field)
-- =============================================================================

DO $$
BEGIN
    -- Add zone as alias for location_type if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='locations' AND column_name='zone') THEN
        ALTER TABLE locations ADD COLUMN zone TEXT;
        -- Copy location_type to zone
        UPDATE locations SET zone = location_type WHERE zone IS NULL;
    END IF;
END $$;

-- =============================================================================
-- TRIGGERS FOR NEW TABLES
-- =============================================================================

CREATE TRIGGER update_inbound_shipments_updated_at BEFORE UPDATE ON inbound_shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inbound_lines_updated_at BEFORE UPDATE ON inbound_lines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_putaway_tasks_updated_at BEFORE UPDATE ON putaway_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_picking_tasks_updated_at BEFORE UPDATE ON picking_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_count_tasks_updated_at BEFORE UPDATE ON count_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEED DATA FOR DEMO
-- =============================================================================

-- Update products with barcodes
UPDATE products SET barcode = upc WHERE barcode IS NULL;

-- Insert demo locations if not exist
INSERT INTO locations (warehouse_id, barcode, zone, aisle, level, section, position)
SELECT 
    (SELECT id FROM warehouses LIMIT 1),
    'RECEIVING-01',
    'receiving',
    'RECV',
    1,
    1,
    1
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE barcode = 'RECEIVING-01');

INSERT INTO locations (warehouse_id, barcode, zone, aisle, level, section, position)
SELECT 
    (SELECT id FROM warehouses LIMIT 1),
    'STAGING-01',
    'prime',
    'STAGE',
    1,
    1,
    1
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE barcode = 'STAGING-01');
