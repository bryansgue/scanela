-- Agregar columna custom_slug a la tabla menus
ALTER TABLE menus ADD COLUMN custom_slug TEXT UNIQUE;

-- Crear índice para búsquedas rápidas de slug
CREATE INDEX idx_menus_custom_slug ON menus(custom_slug);
