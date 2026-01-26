-- ============================================================================
-- NEXUS CHAIN WMS - Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- Description: Implements RLS for warehouse isolation
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE po_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE waves ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE icqa_counts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTION: Get current user's warehouse_id
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_warehouse_id()
RETURNS UUID AS $$
  SELECT warehouse_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- WAREHOUSES POLICIES
-- ============================================================================

-- Users can see their assigned warehouse
CREATE POLICY warehouse_select ON warehouses
  FOR SELECT USING (id = get_user_warehouse_id() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Only admins can modify warehouses
CREATE POLICY warehouse_admin ON warehouses
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

-- Users can see other users in their warehouse
CREATE POLICY users_select ON users
  FOR SELECT USING (warehouse_id = get_user_warehouse_id() OR id = auth.uid());

-- Only admins/managers can modify users
CREATE POLICY users_admin ON users
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- ============================================================================
-- CATEGORIES POLICIES
-- ============================================================================

CREATE POLICY categories_select ON categories
  FOR SELECT USING (warehouse_id = get_user_warehouse_id());

CREATE POLICY categories_admin ON categories
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- ============================================================================
-- LOCATIONS POLICIES
-- ============================================================================

CREATE POLICY locations_warehouse ON locations
  FOR ALL USING (warehouse_id = get_user_warehouse_id());

-- ============================================================================
-- PRODUCTS POLICIES (Global - not warehouse specific)
-- ============================================================================

CREATE POLICY products_select ON products
  FOR SELECT USING (true);

CREATE POLICY products_admin ON products
  FOR INSERT UPDATE DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- ============================================================================
-- INVENTORY POLICIES
-- ============================================================================

CREATE POLICY inventory_warehouse ON inventory
  FOR ALL USING (warehouse_id = get_user_warehouse_id());

-- ============================================================================
-- PURCHASE ORDERS POLICIES
-- ============================================================================

CREATE POLICY po_warehouse ON purchase_orders
  FOR ALL USING (warehouse_id = get_user_warehouse_id());

-- ============================================================================
-- PO LINE ITEMS POLICIES
-- ============================================================================

CREATE POLICY po_lines_warehouse ON po_line_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM purchase_orders po 
      WHERE po.id = po_line_items.po_id 
      AND po.warehouse_id = get_user_warehouse_id()
    )
  );

-- ============================================================================
-- WAVES POLICIES
-- ============================================================================

CREATE POLICY waves_warehouse ON waves
  FOR ALL USING (warehouse_id = get_user_warehouse_id());

-- ============================================================================
-- SHIPMENTS POLICIES
-- ============================================================================

CREATE POLICY shipments_warehouse ON shipments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM waves w 
      WHERE w.id = shipments.wave_id 
      AND w.warehouse_id = get_user_warehouse_id()
    )
  );

-- ============================================================================
-- SHIPMENT LINES POLICIES
-- ============================================================================

CREATE POLICY shipment_lines_warehouse ON shipment_lines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shipments s
      JOIN waves w ON w.id = s.wave_id
      WHERE s.id = shipment_lines.shipment_id 
      AND w.warehouse_id = get_user_warehouse_id()
    )
  );

-- ============================================================================
-- PROBLEM TICKETS POLICIES
-- ============================================================================

CREATE POLICY tickets_warehouse ON problem_tickets
  FOR SELECT USING (warehouse_id = get_user_warehouse_id());

-- Associates can create tickets
CREATE POLICY tickets_create ON problem_tickets
  FOR INSERT WITH CHECK (warehouse_id = get_user_warehouse_id());

-- Problem solvers and managers can update tickets
CREATE POLICY tickets_update ON problem_tickets
  FOR UPDATE USING (
    warehouse_id = get_user_warehouse_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager', 'problem_solver'))
  );

-- ============================================================================
-- TRANSACTIONS POLICIES
-- ============================================================================

CREATE POLICY transactions_warehouse ON transactions
  FOR ALL USING (warehouse_id = get_user_warehouse_id());

-- ============================================================================
-- ICQA COUNTS POLICIES
-- ============================================================================

CREATE POLICY icqa_warehouse ON icqa_counts
  FOR ALL USING (warehouse_id = get_user_warehouse_id());
