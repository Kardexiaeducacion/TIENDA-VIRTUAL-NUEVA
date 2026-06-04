-- 1. Tabla de Páginas Personalizadas
CREATE TABLE public.custom_pages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text UNIQUE NOT NULL,
    title text NOT NULL,
    content text,
    image_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

-- Políticas para custom_pages
CREATE POLICY "Permitir lectura publica de paginas" ON public.custom_pages FOR SELECT USING (true);
CREATE POLICY "Permitir insertar paginas" ON public.custom_pages FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizar paginas" ON public.custom_pages FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminar paginas" ON public.custom_pages FOR DELETE USING (true);

-- Insertar las 4 páginas solicitadas
INSERT INTO public.custom_pages (slug, title, content) VALUES 
('historia', 'Nuestra Historia', 'Aquí va la historia de la empresa...'),
('sustentabilidad', 'Sustentabilidad', 'Nuestros esfuerzos de sustentabilidad...'),
('envios', 'Envíos', 'Información sobre envíos gratis y de paga...'),
('devoluciones', 'Devoluciones', 'Política de devoluciones...');


-- 2. Tabla de Sucursales Físicas
CREATE TABLE public.physical_stores (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    address text NOT NULL,
    map_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.physical_stores ENABLE ROW LEVEL SECURITY;

-- Políticas para physical_stores
CREATE POLICY "Permitir lectura publica de sucursales" ON public.physical_stores FOR SELECT USING (true);
CREATE POLICY "Permitir insertar sucursales" ON public.physical_stores FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizar sucursales" ON public.physical_stores FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminar sucursales" ON public.physical_stores FOR DELETE USING (true);

-- Notificar recarga de caché a Supabase
NOTIFY pgrst, 'reload schema';
