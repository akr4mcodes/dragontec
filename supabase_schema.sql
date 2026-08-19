-- ==============================================================================
-- DRAGONTEC STORE — SUPABASE POSTGRESQL DATABASE SCHEMA & SECURITY POLICIES
-- ==============================================================================
-- Instructions:
-- 1. Rendez-vous sur votre tableau de bord Supabase : https://supabase.com/dashboard
-- 2. Sélectionnez votre projet -> Ouvrez l'onglet "SQL Editor"
-- 3. Cliquez sur "New query", collez l'intégralité de ce script et cliquez sur "Run".
-- ==============================================================================

-- 1. ACTIVER L'EXTENSION UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLE DES PRODUITS (products)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 10 CHECK (stock >= 0),
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABLE DES COMMANDES (orders)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    wilaya TEXT NOT NULL,
    full_address TEXT NOT NULL,
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('yalidine', 'domicile')),
    delivery_price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_price >= 0),
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_price >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration automatique au cas où la table orders existait déjà auparavant :
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS wilaya TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS full_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_price NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_price NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Index pour accélérer les filtres et recherches (compatible Admin Dashboard)
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);

-- ==============================================================================
-- 4. TABLE DES LIGNES DE COMMANDES (order_items)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_slug TEXT NOT NULL,
    product_name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ==============================================================================
-- 5. SÉCURITÉ & ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si existantes pour éviter les conflits
DROP POLICY IF EXISTS "Public read active products" ON public.products;
DROP POLICY IF EXISTS "Anon insert order" ON public.orders;
DROP POLICY IF EXISTS "Anon insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Admin manage products" ON public.products;
DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;
DROP POLICY IF EXISTS "Admin manage order_items" ON public.order_items;

-- Produits : Lecture publique pour les articles actifs
CREATE POLICY "Public read active products" 
ON public.products FOR SELECT 
TO anon, authenticated 
USING (is_active = true);

-- Commandes : Les clients peuvent insérer une nouvelle commande
CREATE POLICY "Anon insert order" 
ON public.orders FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Articles de commandes : Insertion autorisée
CREATE POLICY "Anon insert order items" 
ON public.order_items FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Administrateurs : Accès total en lecture/écriture pour les utilisateurs connectés
CREATE POLICY "Admin manage products" 
ON public.products FOR ALL 
TO authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Admin manage orders" 
ON public.orders FOR ALL 
TO authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Admin manage order_items" 
ON public.order_items FOR ALL 
TO authenticated 
USING (true) WITH CHECK (true);

-- ==============================================================================
-- 6. FONCTION SÉCURISÉE RPC : submit_checkout_order (Anti-Fraude de Prix)
-- ==============================================================================
-- Cette fonction garantit que le prix provient du catalogue officiel PostgreSQL,
-- empêchant ainsi toute tentative de falsification de prix côté navigateur.
CREATE OR REPLACE FUNCTION public.submit_checkout_order(
    p_first_name TEXT,
    p_last_name TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_wilaya TEXT,
    p_full_address TEXT,
    p_delivery_method TEXT,
    p_product_slug TEXT,
    p_quantity INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_product products%ROWTYPE;
    v_delivery_price NUMERIC(10, 2);
    v_subtotal NUMERIC(10, 2);
    v_total_price NUMERIC(10, 2);
    v_order_id UUID;
    v_order_number TEXT;
BEGIN
    -- 1. Validation de la méthode de livraison
    IF p_delivery_method = 'yalidine' THEN
        v_delivery_price := 500.00;
    ELSIF p_delivery_method = 'domicile' THEN
        v_delivery_price := 800.00;
    ELSE
        RAISE EXCEPTION 'Méthode de livraison invalide: %', p_delivery_method;
    END IF;

    -- 2. Recherche du prix officiel dans la base
    SELECT * INTO v_product 
    FROM public.products 
    WHERE slug = p_product_slug AND is_active = true 
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Produit introuvable ou indisponible: %', p_product_slug;
    END IF;

    -- 3. Calcul sécurisé du sous-total et du montant total
    v_subtotal := v_product.price * p_quantity;
    v_total_price := v_subtotal + v_delivery_price;

    -- 4. Génération d'un numéro de commande lisible (ex: DT-20260817-8492)
    v_order_number := 'DT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    -- 5. Insertion de la commande
    INSERT INTO public.orders (
        order_number, first_name, last_name, phone, email,
        wilaya, full_address, delivery_method, delivery_price,
        subtotal, total_price, status
    ) VALUES (
        v_order_number, p_first_name, p_last_name, p_phone, p_email,
        p_wilaya, p_full_address, p_delivery_method, v_delivery_price,
        v_subtotal, v_total_price, 'pending'
    ) RETURNING id INTO v_order_id;

    -- 6. Insertion de l'article de commande
    INSERT INTO public.order_items (
        order_id, product_id, product_slug, product_name,
        unit_price, quantity, subtotal
    ) VALUES (
        v_order_id, v_product.id, v_product.slug, v_product.name,
        v_product.price, p_quantity, v_subtotal
    );

    -- 7. Retourner le résultat de confirmation
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'subtotal', v_subtotal,
        'delivery_price', v_delivery_price,
        'total_price', v_total_price,
        'product_name', v_product.name
    );
END;
$$;

-- Autoriser le rôle anon et authenticated à appeler la fonction RPC
GRANT EXECUTE ON FUNCTION public.submit_checkout_order TO anon, authenticated;

-- ==============================================================================
-- 7. SEED DATA : LES 20 ORDINATEURS PORTABLES DU CATALOGUE DRAGONTEC
-- ==============================================================================
INSERT INTO public.products (slug, name, price, stock, image_url, category)
VALUES
('tilted-blade-stealth', 'Tilted Blade Stealth', 66000, 5, 'laptops/blade-stealth-13-2019-2.png', 'pro'),
('lenovo-ideapad-slim-3', 'Lenovo IdeaPad Slim 3', 59000, 5, 'laptops/lonovoideapad-removebg-preview.png', 'pro budget'),
('macbook-air-13', 'MacBook Air 13', 33000, 5, 'laptops/macbookair2012-removebg-preview.png', 'macbook budget'),
('apple-macbook-pro-13-2020', 'Apple MacBook Pro 13" (2020)', 65000, 5, 'laptops/Apple_MacBook_Pro_13_inch_2020_Space_Gray_1000_0001-removebg-preview.png', 'macbook pro'),
('lenovo-thinkbook-14-v14-10eme-generation', 'Lenovo ThinkBook 14 / V14 (10ème Génération)', 69000, 5, 'laptops/11-removebg-preview.png', 'pro'),
('hp-elitebook-745-g6-amd-ryzen-5', 'HP EliteBook 745 G6 (AMD Ryzen 5)', 62000, 5, 'laptops/hpeb3333-removebg-preview.png', 'pro budget'),
('asus-expertbook-p2-p2451fa', 'ASUS ExpertBook P2 (P2451FA)', 58000, 5, 'laptops/asus01.png', 'pro budget'),
('dell-latitude-7410-carbon-edition-10eme-generation', 'Dell Latitude 7410 (Carbon Edition - 10ème Génération)', 65000, 5, 'laptops/Dell-Latitude01-removebg-preview.png', 'pro'),
('apple-macbook-air-13-retina-2019', 'Apple MacBook Air 13" Retina (2019)', 55000, 5, 'laptops/macbook-air-13-retina-dorado-2019-reacondicionado-removebg-preview.png', 'macbook budget'),
('dell-latitude-15-6-13eme-generation', 'Dell Latitude 15.6" (13ème Génération)', 110000, 5, 'laptops/delllatitude335-removebg-preview.png', 'pro'),
('acer-chromebook-14-tactile-11eme-generation', 'Acer Chromebook 14" Tactile (11ème Génération)', 65000, 5, 'laptops/aserchromebook01.png', 'pro'),
('dell-latitude-14-intel-core-i7-8eme-generation', 'Dell Latitude 14" (Intel Core i7 8ème Génération)', 65000, 5, 'laptops/dellvpro01.png', 'pro'),
('apple-macbook-pro-15-6-16-2019-intel-core-i9', 'Apple MacBook Pro 15.6" / 16" (2019 - Intel Core i9)', 118000, 5, 'laptops/macbook19.01.png', 'macbook pro'),
('lenovo-legion-15-6-gaming', 'Lenovo Legion 15.6" Gaming', 64000, 5, 'laptops/legion01.png', 'gaming pro'),
('dell-latitude-14-13eme-generation', 'Dell Latitude 14" (13ème Génération)', 99000, 5, 'laptops/dell-13gen1.png', 'pro'),
('asus-zenbook-intel-core-i7-8eme-generation-screenpad', 'ASUS ZenBook (Intel Core i7 8ème Génération - ScreenPad)', 130000, 5, 'laptops/asuszenbook1.png', 'pro gaming'),
('lenovo-v15-ada-amd-ryzen-5', 'Lenovo V15-ADA (AMD Ryzen 5)', 72000, 5, 'laptops/lenovov1.png', 'pro'),
('acer-nitro-5-v15-gaming-intel-core-i7-13eme-generation-rtx-4050', 'Acer Nitro 5 / V15 Gaming (Intel Core i7 13ème Génération - RTX 4050)', 165000, 5, 'laptops/asernitro1.png', 'gaming pro'),
('asus-rog-flow-z13-gz301ze-intel-core-i9-12eme-generation', 'ASUS ROG Flow Z13 (GZ301ZE - Intel Core i9 12ème Génération)', 145000, 5, 'laptops/asusrog.png', 'gaming pro'),
('msi-cyborg-15-a12v-intel-core-i5-12eme-generation', 'MSI Cyborg 15 A12V (Intel Core i5 12ème Génération)', 250000, 5, 'laptops/msicy1.png', 'gaming pro')
ON CONFLICT (slug) DO UPDATE 
SET price = EXCLUDED.price, name = EXCLUDED.name, image_url = EXCLUDED.image_url;

-- ==============================================================================
-- 8. EXTENSION & SCHÉMA POUR LES WEBHOOKS (ZAPIER / MAKE AUTOMATION)
-- ==============================================================================
-- Active l'extension pg_net requise pour les requêtes HTTP asynchrones
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

-- Initialisation du schéma interne Supabase (résout l'erreur "schema supabase_functions does not exist")
CREATE SCHEMA IF NOT EXISTS supabase_functions;
GRANT USAGE ON SCHEMA supabase_functions TO postgres, anon, authenticated, service_role;

-- Fonction requise par l'interface Dashboard Webhooks de Supabase (résout l'erreur 42883)
CREATE OR REPLACE FUNCTION supabase_functions.http_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public, pg_temp
AS $$
DECLARE
    v_request_id bigint;
    v_url text := TG_ARGV[0];
    v_method text := TG_ARGV[1];
    v_headers jsonb := COALESCE(TG_ARGV[2]::jsonb, '{"Content-Type":"application/json"}'::jsonb);
    v_params jsonb := COALESCE(TG_ARGV[3]::jsonb, '{}'::jsonb);
    v_timeout integer := COALESCE(TG_ARGV[4]::integer, 5000);
    v_body jsonb;
BEGIN
    IF v_method = 'POST' OR v_method = 'PUT' OR v_method = 'PATCH' THEN
        v_body := jsonb_build_object(
            'type', TG_OP,
            'table', TG_TABLE_NAME,
            'schema', TG_TABLE_SCHEMA,
            'record', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW) END,
            'old_record', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD) END
        );

        SELECT net.http_post(
            url := v_url,
            headers := v_headers,
            body := v_body,
            timeout_milliseconds := v_timeout
        ) INTO v_request_id;
    ELSIF v_method = 'GET' THEN
        SELECT net.http_get(
            url := v_url,
            headers := v_headers,
            timeout_milliseconds := v_timeout
        ) INTO v_request_id;
    ELSIF v_method = 'DELETE' THEN
        SELECT net.http_delete(
            url := v_url,
            headers := v_headers,
            timeout_milliseconds := v_timeout
        ) INTO v_request_id;
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'supabase_functions.http_request error: %', SQLERRM;
        RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION supabase_functions.http_request() TO postgres, anon, authenticated, service_role;


-- ==============================================================================
-- 9. TRIGGER WEBHOOK AUTOMATIQUE (ZAPIER / MAKE) POUR LES NOUVELLES COMMANDES
-- ==============================================================================
-- Cette fonction s'exécute automatiquement à chaque nouvelle commande (INSERT sur orders)
-- et envoie immédiatement un payload JSON complet à votre URL Zapier / Make.
CREATE OR REPLACE FUNCTION public.notify_zapier_make_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    -- Webhook Zapier configuré
    v_webhook_url TEXT := 'https://hooks.zapier.com/hooks/catch/26834906/4tmmk3p/';
    v_payload JSONB;
BEGIN
    IF v_webhook_url IS NULL OR v_webhook_url = '' THEN
        RETURN NEW;
    END IF;

    -- Construction du JSON envoyé à Zapier / Make
    v_payload := jsonb_build_object(
        'event', 'NEW_ORDER',
        'order_id', NEW.id,
        'order_number', NEW.order_number,
        'customer', jsonb_build_object(
            'first_name', NEW.first_name,
            'last_name', NEW.last_name,
            'full_name', NEW.first_name || ' ' || NEW.last_name,
            'phone', NEW.phone,
            'email', NEW.email,
            'wilaya', NEW.wilaya,
            'full_address', NEW.full_address
        ),
        'delivery', jsonb_build_object(
            'method', NEW.delivery_method,
            'price', NEW.delivery_price
        ),
        'pricing', jsonb_build_object(
            'subtotal', NEW.subtotal,
            'total_price', NEW.total_price
        ),
        'status', NEW.status,
        'created_at', NEW.created_at
    );

    -- Envoi HTTP POST asynchrone (non-bloquant) via pg_net
    PERFORM net.http_post(
        url := v_webhook_url,
        body := v_payload,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'User-Agent', 'DragonTec-Supabase-Webhook/1.0'
        )
    );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur de réseau, la commande client reste validée sans bloquer
        RAISE WARNING 'DragonTec Webhook error: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Créer ou remplacer le déclencheur
DROP TRIGGER IF EXISTS trg_notify_order_webhook ON public.orders;

CREATE TRIGGER trg_notify_order_webhook
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_zapier_make_order();

