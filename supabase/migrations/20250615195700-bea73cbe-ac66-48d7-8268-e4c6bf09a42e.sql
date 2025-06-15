
-- Crear tabla para registrar ventas canceladas
CREATE TABLE public.sale_cancellations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  cancelled_by UUID NOT NULL REFERENCES auth.users(id),
  cancellation_reason TEXT,
  original_total NUMERIC NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_role TEXT NOT NULL, -- para saber con qué rol se canceló
  notes TEXT
);

-- Crear índices para mejorar performance
CREATE INDEX idx_sale_cancellations_sale_id ON public.sale_cancellations(sale_id);
CREATE INDEX idx_sale_cancellations_cancelled_by ON public.sale_cancellations(cancelled_by);
CREATE INDEX idx_sale_cancellations_cancelled_at ON public.sale_cancellations(cancelled_at);

-- Habilitar RLS
ALTER TABLE public.sale_cancellations ENABLE ROW LEVEL SECURITY;

-- Política RLS para ver cancelaciones
CREATE POLICY "Users with sales roles can view sale cancellations" 
  ON public.sale_cancellations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'manager', 'cashier')
    )
  );

-- Política RLS para crear cancelaciones
CREATE POLICY "Users with sales roles can create sale cancellations" 
  ON public.sale_cancellations 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'manager', 'cashier')
    )
  );
