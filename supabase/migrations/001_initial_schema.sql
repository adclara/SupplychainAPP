-- ============================================================================
-- NEXUS CHAIN WMS - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Creates all core tables for the WMS application
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- WAREHOUSES
-- ============================================================================

CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  country_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CATEGORIES
-- ============================================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USERS
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'associate', 'qa', 'problem_solver')),
  warehouse_id UUID REFERENCES warehouses(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_warehouse ON users(warehouse_id);

-- ============================================================================
-- LOCATIONS
-- ============================================================================

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  barcode TEXT UNIQUE NOT NULL,
  aisle TEXT NOT NULL,
  level INT NOT NULL,
  section INT NOT NULL,
  position INT NOT NULL,
  location_type TEXT CHECK (location_type IN ('prime', 'reserve', 'dock', 'problem')),
  status TEXT DEFAULT 'empty' CHECK (status IN ('empty', 'occupied', 'blocked')),
  capacity_units INT,
  current_units INT DEFAULT 0,
  last_counted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(warehouse_id, aisle, level, section, position)
);

CREATE INDEX idx_locations_warehouse ON locations(warehouse_id);
CREATE INDEX idx_locations_barcode ON locations(barcode);
CREATE INDEX idx_locations_type ON locations(location_type);

-- ============================================================================
-- PRODUCTS
-- ============================================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT NOT NULL,
  upc TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  dimensions_cm JSONB,
  weight_kg NUMERIC,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sku, upc)
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_upc ON products(upc);

-- ============================================================================
-- INVENTORY
-- ============================================================================

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  lpn TEXT UNIQUE,
  quantity INT NOT NULL DEFAULT 1,
  last_moved_at TIMESTAMP WITH TIME ZONE,
  last_moved_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(warehouse_id, product_id, location_id, lpn)
);

CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_lpn ON inventory(lpn);

-- ============================================================================
-- PURCHASE ORDERS
-- ============================================================================

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  po_number TEXT NOT NULL,
  supplier TEXT,
  expected_arrival TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'completed')),
  received_at TIMESTAMP WITH TIME ZONE,
  received_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(warehouse_id, po_number)
);

CREATE INDEX idx_po_warehouse ON purchase_orders(warehouse_id);
CREATE INDEX idx_po_status ON purchase_orders(status);

-- ============================================================================
-- PO LINE ITEMS
-- ============================================================================

CREATE TABLE po_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity_ordered INT NOT NULL,
  quantity_received INT DEFAULT 0,
  unit_cost NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_po_lines_po ON po_line_items(po_id);

-- ============================================================================
-- WAVES
-- ============================================================================

CREATE TABLE waves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  wave_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'picking', 'packing', 'shipped')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  released_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  UNIQUE(warehouse_id, wave_number)
);

CREATE INDEX idx_waves_warehouse ON waves(warehouse_id);
CREATE INDEX idx_waves_status ON waves(status);

-- ============================================================================
-- SHIPMENTS
-- ============================================================================

CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wave_id UUID NOT NULL REFERENCES waves(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_name TEXT,
  shipping_address TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'picking', 'packed', 'shipped')),
  shipping_label_url TEXT,
  tracking_number TEXT,
  picked_at TIMESTAMP WITH TIME ZONE,
  picked_by UUID REFERENCES users(id),
  packed_at TIMESTAMP WITH TIME ZONE,
  packed_by UUID REFERENCES users(id),
  shipped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shipments_wave ON shipments(wave_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_order ON shipments(order_number);

-- ============================================================================
-- SHIPMENT LINES
-- ============================================================================

CREATE TABLE shipment_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  quantity INT NOT NULL,
  picked_at TIMESTAMP WITH TIME ZONE,
  picked_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shipment_lines_shipment ON shipment_lines(shipment_id);

-- ============================================================================
-- PROBLEM TICKETS
-- ============================================================================

CREATE TABLE problem_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('shortage', 'damage', 'mislabel', 'wrong_location', 'other')),
  source_table TEXT,
  source_id UUID,
  location_id UUID REFERENCES locations(id),
  product_id UUID REFERENCES products(id),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  description TEXT,
  image_url TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_problem_tickets_warehouse ON problem_tickets(warehouse_id);
CREATE INDEX idx_problem_tickets_status ON problem_tickets(status);
CREATE INDEX idx_problem_tickets_assigned ON problem_tickets(assigned_to);

-- ============================================================================
-- TRANSACTIONS (Audit Log)
-- ============================================================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  location_id_from UUID REFERENCES locations(id),
  location_id_to UUID REFERENCES locations(id),
  quantity INT,
  reference_id TEXT,
  notes TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_warehouse ON transactions(warehouse_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);

-- ============================================================================
-- ICQA COUNTS
-- ============================================================================

CREATE TABLE icqa_counts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id),
  product_id UUID NOT NULL REFERENCES products(id),
  system_quantity INT,
  physical_quantity INT,
  variance INT,
  counted_by UUID NOT NULL REFERENCES users(id),
  count_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_blind_count BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_icqa_location ON icqa_counts(location_id);
CREATE INDEX idx_icqa_variance ON icqa_counts(variance) WHERE variance != 0;

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problem_tickets_updated_at BEFORE UPDATE ON problem_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
