
-- Crear tabla de categorías
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de subcategorías
CREATE TABLE public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de productos
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  subcategory_id UUID REFERENCES public.subcategories(id),
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  sell_by_weight BOOLEAN DEFAULT FALSE, -- Para productos que se venden por peso/decimales
  stock_unit TEXT DEFAULT 'unit', -- 'unit', 'kg', 'liter', etc.
  min_stock DECIMAL(10,3) DEFAULT 0,
  max_stock DECIMAL(10,3),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de stock/inventario
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
  expiration_date DATE,
  batch_number TEXT,
  supplier TEXT,
  entry_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Crear tabla de combos
CREATE TABLE public.product_combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  combo_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de items de combos
CREATE TABLE public.combo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id UUID REFERENCES public.product_combos(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  UNIQUE(combo_id, product_id)
);

-- Crear tabla de alertas de vencimiento
CREATE TABLE public.expiration_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('category', 'subcategory', 'product')),
  reference_id UUID NOT NULL, -- ID de category, subcategory o product
  days_before_expiration INTEGER NOT NULL DEFAULT 7,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de movimientos de stock
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entry', 'exit', 'adjustment', 'sale', 'waste')),
  quantity DECIMAL(10,3) NOT NULL,
  reference_id UUID, -- ID de venta, ajuste, etc.
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expiration_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (usuarios autenticados pueden leer, admin/manager/inventory pueden modificar)
CREATE POLICY "Authenticated users can view categories"
  ON public.categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Inventory roles can manage categories"
  ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'inventory'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'inventory'));

CREATE POLICY "Authenticated users can view subcategories"
  ON public.subcategories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Inventory roles can manage subcategories"
  ON public.subcategories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'inventory'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'inventory'));

CREATE POLICY "Authenticated users can view products"
  ON public.products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Inventory roles can manage products"
  ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'inventory'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'inventory'));

CREATE POLICY "Authenticated users can view inventory"
  ON public.inventory FOR SELECT TO authenticated USING (true);

CREATE POLICY "Inventory roles can manage inventory"
  ON public.inventory FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'inventory'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'inventory'));

CREATE POLICY "Authenticated users can view combos"
  ON public.product_combos FOR SELECT TO authenticated USING (true);

CREATE POLICY "Manager roles can manage combos"
  ON public.product_combos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Authenticated users can view combo items"
  ON public.combo_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Manager roles can manage combo items"
  ON public.combo_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Authenticated users can view expiration alerts"
  ON public.expiration_alerts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Inventory roles can manage expiration alerts"
  ON public.expiration_alerts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'inventory'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'inventory'));

CREATE POLICY "Authenticated users can view stock movements"
  ON public.stock_movements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Inventory roles can create stock movements"
  ON public.stock_movements FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'inventory') OR public.has_role(auth.uid(), 'cashier'));

-- Función para calcular stock disponible de un producto
CREATE OR REPLACE FUNCTION public.get_product_stock(product_id UUID)
RETURNS DECIMAL(10,3)
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(SUM(quantity), 0)
  FROM public.inventory
  WHERE product_id = $1
    AND (expiration_date IS NULL OR expiration_date > CURRENT_DATE);
$$;

-- Función para verificar si un combo tiene stock disponible
CREATE OR REPLACE FUNCTION public.combo_has_stock(combo_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.combo_items ci
    WHERE ci.combo_id = $1
      AND ci.quantity > public.get_product_stock(ci.product_id)
  );
$$;

-- Función para obtener productos próximos a vencer
CREATE OR REPLACE FUNCTION public.get_expiring_products(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  quantity DECIMAL(10,3),
  expiration_date DATE,
  days_until_expiry INTEGER
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    i.product_id,
    p.name,
    i.quantity,
    i.expiration_date,
    (i.expiration_date - CURRENT_DATE)::INTEGER
  FROM public.inventory i
  JOIN public.products p ON i.product_id = p.id
  WHERE i.expiration_date IS NOT NULL
    AND i.expiration_date <= CURRENT_DATE + INTERVAL '1 day' * days_ahead
    AND i.expiration_date > CURRENT_DATE
    AND i.quantity > 0
  ORDER BY i.expiration_date ASC;
$$;

-- Trigger para actualizar stock automáticamente en movimientos
CREATE OR REPLACE FUNCTION public.handle_stock_movement()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.movement_type IN ('entry', 'adjustment') AND NEW.quantity > 0 THEN
    -- Agregar al inventario
    INSERT INTO public.inventory (product_id, quantity, entry_date, notes)
    VALUES (NEW.product_id, NEW.quantity, NEW.created_at, NEW.notes);
  ELSIF NEW.movement_type IN ('exit', 'sale', 'waste') AND NEW.quantity > 0 THEN
    -- Reducir del inventario (FIFO - First In, First Out)
    WITH available_stock AS (
      SELECT id, quantity, 
             SUM(quantity) OVER (ORDER BY entry_date, id) as running_total
      FROM public.inventory
      WHERE product_id = NEW.product_id
        AND quantity > 0
        AND (expiration_date IS NULL OR expiration_date > CURRENT_DATE)
      ORDER BY entry_date, id
    ),
    to_reduce AS (
      SELECT id, 
             CASE 
               WHEN running_total - quantity < NEW.quantity THEN quantity
               WHEN running_total - NEW.quantity >= 0 THEN NEW.quantity - (running_total - quantity)
               ELSE 0
             END as reduce_qty
      FROM available_stock
      WHERE running_total > NEW.quantity - quantity
    )
    UPDATE public.inventory 
    SET quantity = quantity - tr.reduce_qty
    FROM to_reduce tr
    WHERE inventory.id = tr.id AND tr.reduce_qty > 0;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_stock_movement
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW EXECUTE PROCEDURE public.handle_stock_movement();

-- Insertar categorías y subcategorías de ejemplo
INSERT INTO public.categories (name, description) VALUES
('Alimentos', 'Productos alimenticios'),
('Bebidas', 'Bebidas alcohólicas y no alcohólicas'),
('Limpieza', 'Productos de limpieza y hogar'),
('Cuidado Personal', 'Productos de higiene y cuidado personal');

INSERT INTO public.subcategories (category_id, name, description) VALUES
((SELECT id FROM public.categories WHERE name = 'Alimentos'), 'Lácteos', 'Leche, quesos, yogures'),
((SELECT id FROM public.categories WHERE name = 'Alimentos'), 'Carnes', 'Carnes rojas, pollo, pescado'),
((SELECT id FROM public.categories WHERE name = 'Alimentos'), 'Frutas y Verduras', 'Productos frescos'),
((SELECT id FROM public.categories WHERE name = 'Bebidas'), 'Gaseosas', 'Bebidas gaseosas'),
((SELECT id FROM public.categories WHERE name = 'Bebidas'), 'Aguas', 'Aguas minerales y saborizadas');
