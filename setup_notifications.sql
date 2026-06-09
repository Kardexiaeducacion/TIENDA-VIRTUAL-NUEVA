-- SISTEMA DE NOTIFICACIONES PARA CLOE

-- 1. Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    order_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 3. Habilitar seguridad de nivel de fila (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Políticas: Cada usuario solo ve sus propias notificaciones
CREATE POLICY "users_own_notifications" ON public.notifications
    FOR ALL
    USING (auth.uid() = user_id);

-- 5. Habilitar Realtime para la tabla (permite notificaciones en vivo)
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

SELECT 'Tabla notifications creada y configurada correctamente' as status;
