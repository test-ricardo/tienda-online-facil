
-- Crear tabla de clientes primero
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  document_type TEXT, -- 'cedula', 'ruc', 'passport'
  document_number TEXT,
  credit_limit NUMERIC NOT NULL DEFAULT 0,
  current_balance NUMERIC NOT NULL DEFAULT 0, -- positivo = favor del cliente, negativo = deuda
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de ventas con todas las columnas necesarias
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT,
  customer_email TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer', 'account', 'mixed')),
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'partial')),
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  pending_amount NUMERIC NOT NULL DEFAULT 0,
  sale_status TEXT NOT NULL DEFAULT 'completed',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Crear tabla de items de venta
CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  combo_id UUID REFERENCES public.product_combos(id),
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de movimientos de cuenta de cliente
CREATE TABLE public.customer_account_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL, -- 'sale', 'payment', 'adjustment', 'credit'
  amount NUMERIC NOT NULL, -- positivo = a favor del cliente, negativo = deuda
  balance_after NUMERIC NOT NULL,
  reference_id UUID, -- puede ser sale_id u otro
  description TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de pagos de venta (para ventas con múltiples métodos de pago)
CREATE TABLE public.sale_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer', 'account')),
  amount NUMERIC NOT NULL DEFAULT 0,
  reference TEXT, -- número de transacción, voucher, etc.
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices para mejorar performance
CREATE INDEX idx_customers_customer_code ON public.customers(customer_code);
CREATE INDEX idx_customers_document_number ON public.customers(document_number);
CREATE INDEX idx_sales_created_at ON public.sales(created_at);
CREATE INDEX idx_sales_created_by ON public.sales(created_by);
CREATE INDEX idx_sales_sale_number ON public.sales(sale_number);
CREATE INDEX idx_sales_customer_id ON public.sales(customer_id);
CREATE INDEX idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON public.sale_items(product_id);
CREATE INDEX idx_customer_account_movements_customer_id ON public.customer_account_movements(customer_id);
CREATE INDEX idx_customer_account_movements_created_at ON public.customer_account_movements(created_at);
CREATE INDEX idx_sale_payments_sale_id ON public.sale_payments(sale_id);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_account_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clientes
CREATE POLICY "Users with sales roles can view customers" 
  ON public.customers 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'manager', 'cashier')
    )
  );

CREATE POLICY "Users with sales roles can manage customers" 
  ON public.customers 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'manager', 'cashier')
    )
  );

-- Políticas RLS para ventas
CREATE POLICY "Users with sales roles can view sales" 
  ON public.sales 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'manager', 'cashier')
    )
  );

CREATE POLICY "Users with sales roles can create sales" 
  ON public.sales 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'manager', 'cashier')
    )
  );

CREATE POLICY "Users with sales roles can update sales" 
  ON public.sales 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'manager', 'cashier')
    )
  );

-- Políticas RLS para items de venta
CREATE POLICY "Users with sales roles can view sale items" 
  ON public.sale_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'manager', 'cashier')
    )
  );

CREATE POLICY "Users with sales roles can create sale items" 
  ON public.sale_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'manager', 'cashier')
    )
  );

-- Políticas RLS para movimientos de cuenta
CREATE POLICY "Users with sales roles can view customer movements" 
  ON public.customer_account_movements 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'manager', 'cashier')
    )
  );

CREATE POLICY "Users with sales roles can create customer movements" 
  ON public.customer_account_movements 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'manager', 'cashier')
    )
  );

-- Políticas RLS para pagos de venta
CREATE POLICY "Users with sales roles can view sale payments" 
  ON public.sale_payments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'manager', 'cashier')
    )
  );

CREATE POLICY "Users with sales roles can create sale payments" 
  ON public.sale_payments 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'manager', 'cashier')
    )
  );

-- Función para generar número de venta automático
CREATE OR REPLACE FUNCTION public.generate_sale_number()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $function$
  SELECT 'VT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
         LPAD((
           SELECT COALESCE(MAX(CAST(SPLIT_PART(sale_number, '-', 3) AS INTEGER)), 0) + 1
           FROM public.sales 
           WHERE sale_number LIKE 'VT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%'
         )::TEXT, 4, '0')
$function$;

-- Función para generar código de cliente automático
CREATE OR REPLACE FUNCTION public.generate_customer_code()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $function$
  SELECT 'CLI-' || LPAD((
    SELECT COALESCE(MAX(CAST(SUBSTRING(customer_code FROM 5) AS INTEGER)), 0) + 1
    FROM public.customers 
    WHERE customer_code ~ '^CLI-[0-9]+$'
  )::TEXT, 6, '0')
$function$;

-- Función para verificar si un cliente puede comprar a cuenta
CREATE OR REPLACE FUNCTION public.can_customer_buy_on_account(
  customer_id UUID, 
  sale_amount NUMERIC
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $function$
  SELECT 
    CASE 
      WHEN c.current_balance >= 0 THEN true -- Cliente con saldo a favor puede comprar
      WHEN (c.current_balance * -1) + sale_amount <= c.credit_limit THEN true -- Dentro del límite de crédito
      ELSE false
    END
  FROM public.customers c
  WHERE c.id = customer_id AND c.is_active = true
$function$;

-- Función para actualizar balance del cliente
CREATE OR REPLACE FUNCTION public.update_customer_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
DECLARE
  new_balance NUMERIC;
BEGIN
  -- Calcular nuevo balance
  SELECT COALESCE(current_balance, 0) + NEW.amount INTO new_balance
  FROM public.customers 
  WHERE id = NEW.customer_id;
  
  -- Actualizar balance del cliente
  UPDATE public.customers 
  SET current_balance = new_balance,
      updated_at = now()
  WHERE id = NEW.customer_id;
  
  -- Actualizar balance_after en el movimiento
  NEW.balance_after := new_balance;
  
  RETURN NEW;
END;
$function$;

-- Trigger para actualizar balance automáticamente
CREATE TRIGGER trigger_update_customer_balance
  BEFORE INSERT ON public.customer_account_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customer_balance();

-- Función para procesar ventas con clientes
CREATE OR REPLACE FUNCTION public.process_sale_with_customer()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
DECLARE
  sale_record public.sales%ROWTYPE;
BEGIN
  -- Obtener información de la venta
  SELECT * INTO sale_record FROM public.sales WHERE id = NEW.sale_id;
  
  -- Crear movimiento de stock para productos vendidos
  IF NEW.product_id IS NOT NULL THEN
    INSERT INTO public.stock_movements (
      product_id, 
      movement_type, 
      quantity, 
      reference_id, 
      created_by, 
      notes
    ) VALUES (
      NEW.product_id,
      'sale',
      NEW.quantity,
      NEW.sale_id,
      sale_record.created_by,
      'Venta: ' || NEW.item_name || ' - ' || COALESCE(sale_record.sale_number, 'S/N')
    );
  END IF;
  
  -- Si la venta es a cuenta y hay un cliente, crear movimiento de cuenta
  IF sale_record.customer_id IS NOT NULL AND sale_record.payment_method = 'account' THEN
    INSERT INTO public.customer_account_movements (
      customer_id,
      movement_type,
      amount,
      reference_id,
      description,
      created_by
    ) VALUES (
      sale_record.customer_id,
      'sale',
      -sale_record.total_amount, -- Negativo porque es deuda del cliente
      sale_record.id,
      'Venta a cuenta - ' || sale_record.sale_number,
      sale_record.created_by
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Trigger para procesar ventas automáticamente
CREATE TRIGGER trigger_process_sale
  AFTER INSERT ON public.sale_items
  FOR EACH ROW
  EXECUTE FUNCTION public.process_sale_with_customer();

-- Función para obtener resumen de cuenta del cliente
CREATE OR REPLACE FUNCTION public.get_customer_account_summary(customer_id UUID)
RETURNS TABLE (
  total_sales NUMERIC,
  total_payments NUMERIC,
  current_balance NUMERIC,
  credit_limit NUMERIC,
  available_credit NUMERIC
)
LANGUAGE sql
STABLE
AS $function$
  SELECT 
    COALESCE(ABS(SUM(CASE WHEN movement_type = 'sale' THEN amount ELSE 0 END)), 0) as total_sales,
    COALESCE(SUM(CASE WHEN movement_type = 'payment' THEN amount ELSE 0 END), 0) as total_payments,
    c.current_balance,
    c.credit_limit,
    CASE 
      WHEN c.current_balance >= 0 THEN c.credit_limit + c.current_balance
      ELSE c.credit_limit + c.current_balance
    END as available_credit
  FROM public.customers c
  LEFT JOIN public.customer_account_movements cam ON c.id = cam.customer_id
  WHERE c.id = customer_id
  GROUP BY c.current_balance, c.credit_limit
$function$;
