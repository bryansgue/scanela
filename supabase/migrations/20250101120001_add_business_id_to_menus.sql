-- Agregar columna business_id a la tabla menus
-- Esta columna referencia a qué negocio pertenece el menú

ALTER TABLE menus 
ADD COLUMN IF NOT EXISTS business_id BIGINT REFERENCES businesses(id) ON DELETE CASCADE;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_menus_business_id ON menus(business_id);
