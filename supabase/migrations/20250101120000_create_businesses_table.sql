-- Crear tabla de negocios
CREATE TABLE IF NOT EXISTS businesses (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  logo VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);

-- Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver sus propios negocios
CREATE POLICY "Users can view their own businesses"
  ON businesses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios solo pueden insertar sus propios negocios
CREATE POLICY "Users can insert their own businesses"
  ON businesses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden actualizar sus propios negocios
CREATE POLICY "Users can update their own businesses"
  ON businesses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Los usuarios solo pueden eliminar sus propios negocios
CREATE POLICY "Users can delete their own businesses"
  ON businesses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_businesses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente updated_at
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_businesses_updated_at();
