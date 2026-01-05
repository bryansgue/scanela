-- Eliminar tabla anterior si existe
DROP TABLE IF EXISTS menu_slugs CASCADE;

-- Crear tabla menu_slugs para guardar slugs personalizados (VERSIÓN CORREGIDA)
CREATE TABLE menu_slugs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, slug)
);

-- Crear índices para búsquedas rápidas
CREATE INDEX idx_menu_slugs_slug ON menu_slugs(slug);
CREATE INDEX idx_menu_slugs_business_id ON menu_slugs(business_id);
CREATE INDEX idx_menu_slugs_user_id ON menu_slugs(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE menu_slugs ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios solo ven sus propios slugs
CREATE POLICY "Users can view their own slugs" 
  ON menu_slugs FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Usuarios solo pueden insertar/actualizar sus propios slugs
CREATE POLICY "Users can manage their own slugs" 
  ON menu_slugs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own slugs" 
  ON menu_slugs FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy: Usuarios solo pueden eliminar sus propios slugs
CREATE POLICY "Users can delete their own slugs" 
  ON menu_slugs FOR DELETE 
  USING (auth.uid() = user_id);

-- Policy anónima: Permitir lectura pública del slug (para redirects)
CREATE POLICY "Anyone can view slugs for redirect" 
  ON menu_slugs FOR SELECT 
  USING (true);
