
-- Crear tabla de proveedores
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  payment_terms INTEGER DEFAULT 30, -- días de pago
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de facturas de compra
CREATE TABLE public.purchase_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  invoice_date DATE NOT NULL,
  due_date DATE,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, received, cancelled
  payment_status TEXT NOT NULL DEFAULT 'unpaid', -- unpaid, partial, paid
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de items de factura de compra
CREATE TABLE public.purchase_invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.purchase_invoices(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity NUMERIC NOT NULL,
  unit_cost NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  expiration_date DATE,
  batch_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de pagos a proveedores
CREATE TABLE public.supplier_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.purchase_invoices(id),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  reference TEXT,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Función para generar número de factura de compra
CREATE OR REPLACE FUNCTION public.generate_purchase_invoice_number()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT 'FC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
         LPAD((
           SELECT COALESCE(MAX(CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER)), 0) + 1
           FROM public.purchase_invoices 
           WHERE invoice_number LIKE 'FC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%'
         )::TEXT, 4, '0')
$$;

-- Trigger para actualizar stock cuando se confirma una factura
CREATE OR REPLACE FUNCTION public.handle_purchase_invoice_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si la factura cambia a estado 'received', actualizar stock
  IF NEW.status = 'received' AND OLD.status != 'received' THEN
    -- Insertar en inventario y crear movimiento de stock para cada item
    INSERT INTO public.inventory (product_id, quantity, entry_date, expiration_date, batch_number, supplier, notes)
    SELECT 
      pii.product_id,
      pii.quantity,
      NEW.invoice_date,
      pii.expiration_date,
      pii.batch_number,
      s.name,
      'Compra - Factura: ' || NEW.invoice_number
    FROM public.purchase_invoice_items pii
    JOIN public.suppliers s ON s.id = NEW.supplier_id
    WHERE pii.invoice_id = NEW.id;
    
    -- Crear movimientos de stock
    INSERT INTO public.stock_movements (product_id, movement_type, quantity, reference_id, created_by, notes)
    SELECT 
      pii.product_id,
      'entry',
      pii.quantity,
      NEW.id,
      NEW.created_by,
      'Entrada por compra - Factura: ' || NEW.invoice_number
    FROM public.purchase_invoice_items pii
    WHERE pii.invoice_id = NEW.id;
    
    -- Actualizar costo del producto (promedio ponderado)
    UPDATE public.products 
    SET cost = (
      SELECT 
        SUM(pii.total_cost) / SUM(pii.quantity)
      FROM public.purchase_invoice_items pii 
      WHERE pii.product_id = products.id 
        AND pii.invoice_id = NEW.id
    ),
    updated_at = now()
    WHERE id IN (
      SELECT DISTINCT product_id 
      FROM public.purchase_invoice_items 
      WHERE invoice_id = NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger
CREATE TRIGGER purchase_invoice_stock_trigger
  AFTER UPDATE ON public.purchase_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_purchase_invoice_stock();

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER purchase_invoices_updated_at
  BEFORE UPDATE ON public.purchase_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Función para obtener estadísticas de compras
CREATE OR REPLACE FUNCTION public.get_purchase_stats(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_invoices BIGINT,
  total_amount NUMERIC,
  pending_invoices BIGINT,
  pending_amount NUMERIC,
  top_supplier TEXT,
  avg_invoice_amount NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  WITH stats AS (
    SELECT 
      COUNT(*) as total_invoices,
      COALESCE(SUM(total_amount), 0) as total_amount,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_invoices,
      COALESCE(SUM(total_amount) FILTER (WHERE status = 'pending'), 0) as pending_amount,
      COALESCE(AVG(total_amount), 0) as avg_invoice_amount
    FROM public.purchase_invoices pi
    WHERE pi.invoice_date BETWEEN start_date AND end_date
  ),
  top_supplier_data AS (
    SELECT s.name
    FROM public.purchase_invoices pi
    JOIN public.suppliers s ON s.id = pi.supplier_id
    WHERE pi.invoice_date BETWEEN start_date AND end_date
    GROUP BY s.id, s.name
    ORDER BY SUM(pi.total_amount) DESC
    LIMIT 1
  )
  SELECT 
    s.total_invoices,
    s.total_amount,
    s.pending_invoices,
    s.pending_amount,
    COALESCE(ts.name, 'N/A') as top_supplier,
    s.avg_invoice_amount
  FROM stats s
  CROSS JOIN (SELECT name FROM top_supplier_data UNION SELECT 'N/A' LIMIT 1) ts;
$$;

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir a usuarios autenticados)
CREATE POLICY "Authenticated users can manage suppliers" 
  ON public.suppliers FOR ALL 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can manage purchase invoices" 
  ON public.purchase_invoices FOR ALL 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can manage purchase invoice items" 
  ON public.purchase_invoice_items FOR ALL 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can manage supplier payments" 
  ON public.supplier_payments FOR ALL 
  TO authenticated 
  USING (true);
