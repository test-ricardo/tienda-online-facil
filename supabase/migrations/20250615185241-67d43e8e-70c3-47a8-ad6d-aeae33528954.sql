
-- Agregar la columna `updated_at` a la tabla `sales`
ALTER TABLE public.sales 
ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Para mantenerla actualizada en cada cambio, agregamos un trigger:
CREATE OR REPLACE FUNCTION public.set_sales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_sales_updated_at_trigger ON public.sales;

CREATE TRIGGER set_sales_updated_at_trigger
BEFORE UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.set_sales_updated_at();
