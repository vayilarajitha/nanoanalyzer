-- NanoAnalyzer - Supabase PostgreSQL Database Schema & Security Policies
-- Cloud-Native PostgreSQL Database Definition for Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    full_name TEXT,
    username TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    profile_image TEXT DEFAULT 'assets/images/avatar-default.png',
    avatar_url TEXT DEFAULT 'assets/images/avatar-default.png',
    role TEXT DEFAULT 'researcher',
    institution TEXT DEFAULT 'Biomedical Nanotechnology Lab',
    bio TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for auto-updating updated_at timestamp on users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 2. NANOPARTICLE DATASETS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.nanoparticle_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    dataset_name TEXT,
    name TEXT,
    nanoparticle_size NUMERIC(10, 2) DEFAULT 45.00,
    size_nm NUMERIC(10, 2) DEFAULT 45.00,
    material TEXT DEFAULT 'Polymeric',
    core_material TEXT DEFAULT 'Polymeric',
    shape TEXT DEFAULT 'Spherical',
    nanoparticle_type TEXT DEFAULT 'Polymeric',
    charge NUMERIC(10, 2) DEFAULT 20.00,
    surface_charge_mv NUMERIC(10, 2) DEFAULT 20.00,
    concentration NUMERIC(10, 2) DEFAULT 50.00,
    cell_type TEXT DEFAULT 'HeLa',
    uptake_efficiency_percent NUMERIC(10, 2) DEFAULT 85.00,
    toxicity_score NUMERIC(10, 2) DEFAULT 12.00,
    notes TEXT DEFAULT NULL,
    uploaded_file TEXT,
    record_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Backwards compatibility view for 'datasets'
CREATE OR REPLACE VIEW public.datasets AS
SELECT 
    id, user_id, 
    COALESCE(dataset_name, name, 'Nanoparticle Dataset') AS dataset_name,
    COALESCE(name, dataset_name, 'Nanoparticle Dataset') AS name,
    COALESCE(nanoparticle_size, size_nm, 45.00) AS nanoparticle_size,
    COALESCE(size_nm, nanoparticle_size, 45.00) AS size_nm,
    COALESCE(material, core_material, 'Polymeric') AS material,
    COALESCE(core_material, material, 'Polymeric') AS core_material,
    COALESCE(shape, nanoparticle_type, 'Spherical') AS shape,
    COALESCE(nanoparticle_type, shape, 'Polymeric') AS nanoparticle_type,
    COALESCE(charge, surface_charge_mv, 20.00) AS charge,
    COALESCE(surface_charge_mv, charge, 20.00) AS surface_charge_mv,
    concentration, cell_type, uptake_efficiency_percent, toxicity_score, notes, uploaded_file, record_count, created_at
FROM public.nanoparticle_datasets;

-- ==========================================
-- 3. ANALYSIS RESULTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES public.nanoparticle_datasets(id) ON DELETE SET NULL,
    analysis_name TEXT DEFAULT 'Uptake Simulation Run',
    nanoparticle_type TEXT DEFAULT 'Polymeric',
    core_material TEXT DEFAULT 'Gold (Au)',
    size_nm NUMERIC(10, 2) DEFAULT 45.00,
    shape TEXT DEFAULT 'Spherical',
    surface_charge_mv NUMERIC(10, 2) DEFAULT 20.00,
    zeta_potential NUMERIC(10, 2) DEFAULT 20.00,
    cell_type TEXT DEFAULT 'HeLa',
    exposure_time_h NUMERIC(10, 2) DEFAULT 6.00,
    concentration_ug_ml NUMERIC(10, 2) DEFAULT 50.00,
    uptake_percentage NUMERIC(10, 2) DEFAULT 0.00,
    predicted_uptake_percent NUMERIC(10, 2) DEFAULT 0.00,
    diffusion_score NUMERIC(10, 2) DEFAULT 0.00,
    drug_release_rate NUMERIC(10, 2) DEFAULT 0.00,
    predicted_toxicity_index NUMERIC(10, 2) DEFAULT 0.00,
    delivery_efficiency_score NUMERIC(10, 2) DEFAULT 0.00,
    confidence_score NUMERIC(10, 2) DEFAULT 95.00,
    primary_mechanism TEXT,
    prediction_result JSONB,
    recommendations TEXT,
    deterministic_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Backwards compatibility view for 'predictions'
CREATE OR REPLACE VIEW public.predictions AS
SELECT 
    id, user_id, dataset_id, analysis_name, nanoparticle_type, core_material, size_nm, shape,
    surface_charge_mv, zeta_potential, cell_type, exposure_time_h, concentration_ug_ml,
    COALESCE(predicted_uptake_percent, uptake_percentage, 0.00) AS predicted_uptake_percent,
    COALESCE(uptake_percentage, predicted_uptake_percent, 0.00) AS uptake_percentage,
    diffusion_score, drug_release_rate, predicted_toxicity_index, delivery_efficiency_score,
    confidence_score, primary_mechanism, prediction_result, recommendations, deterministic_hash, created_at
FROM public.analysis_results;

-- ==========================================
-- 4. EXPERIMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    nanoparticle_type TEXT DEFAULT 'Polymeric',
    core_material TEXT DEFAULT 'Gold (Au)',
    particle_size_nm NUMERIC(10, 2) DEFAULT 45.00,
    target_cell_line TEXT DEFAULT 'HeLa',
    status TEXT DEFAULT 'In Progress',
    results_json JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. HISTORY TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    activity TEXT NOT NULL,
    result_id UUID REFERENCES public.analysis_results(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 7. OTP CODES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    code VARCHAR(10),
    otp_code VARCHAR(10),
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 8. CHATBOT LOGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.chatbot_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    intent TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 9. SYSTEM LOGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT DEFAULT '127.0.0.1',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nanoparticle_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on nanoparticle_datasets" ON public.nanoparticle_datasets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on analysis_results" ON public.analysis_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on experiments" ON public.experiments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on history" ON public.history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on otp_codes" ON public.otp_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on chatbot_logs" ON public.chatbot_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on system_logs" ON public.system_logs FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- SEED DATA
-- ==========================================
INSERT INTO public.users (id, name, full_name, username, email, password_hash, role, institution)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dr. Sarah Jenkins', 'Dr. Sarah Jenkins', 'admin', 'admin@nanoanalyzer.io', '$2y$10$wTqSg1eE/.hV9Z5Xm0P87.uO1LpT9nJ3N/1Jg0J/qN3T.c5f6F7GW', 'admin', 'Center for Nanomedicine'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Dr. Alex Vance', 'Dr. Alex Vance', 'researcher', 'alex@nanoanalyzer.io', '$2y$10$wTqSg1eE/.hV9Z5Xm0P87.uO1LpT9nJ3N/1Jg0J/qN3T.c5f6F7GW', 'researcher', 'Nanobio Institute')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.nanoparticle_datasets (id, user_id, dataset_name, name, nanoparticle_type, core_material, surface_charge_mv, charge, size_nm, nanoparticle_size, cell_type, uptake_efficiency_percent, toxicity_score, notes)
VALUES 
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Gold Nano-Spheres HeLa Study', 'Gold Nano-Spheres HeLa Study', 'Polymeric', 'Gold (Au)', 24.5, 24.5, 45.0, 45.0, 'HeLa', 88.4, 12.1, 'Optimal receptor-mediated endocytosis observed at 45nm size.'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Silica Mesoporous Macrophage Target', 'Silica Mesoporous Macrophage Target', 'Inorganic', 'Silica (SiO2)', -18.2, -18.2, 80.0, 80.0, 'Macrophage', 64.2, 18.5, 'Slightly higher phagocytosis rate due to negative surface charge.'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'PLGA Doxorubicin Delivery HEK293', 'PLGA Doxorubicin Delivery HEK293', 'Lipid-based', 'PLGA Polymer', 15.0, 15.0, 50.0, 50.0, 'HEK293', 82.0, 8.4, 'High drug encapsulation efficiency with low cytotoxicity.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.analysis_results (id, user_id, analysis_name, nanoparticle_type, core_material, size_nm, surface_charge_mv, zeta_potential, cell_type, exposure_time_h, concentration_ug_ml, predicted_uptake_percent, uptake_percentage, predicted_toxicity_index, delivery_efficiency_score, confidence_score, primary_mechanism, deterministic_hash, recommendations)
VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'AuNP Target HeLa Analysis', 'Polymeric', 'Gold (Au)', 45.0, 25.0, 25.0, 'HeLa', 6.0, 50.0, 89.6, 89.6, 11.2, 94.2, 96.5, 'Clathrin-Mediated Endocytosis', 'a1b2c3d4e5f6', 'Particle diameter of 45nm matches the theoretical optimal thermodynamic size for cellular membrane wrapping.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.experiments (id, user_id, title, description, nanoparticle_type, core_material, particle_size_nm, target_cell_line, status)
VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'In-vitro Gold Nanoparticle Kinetic Uptake', 'Measuring time-course internalisation in cervical carcinoma cell line (HeLa) using ICP-MS and confocal microscopy.', 'Polymeric', 'Gold (Au)', 45.0, 'HeLa', 'Completed')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notifications (id, user_id, title, message, type, is_read)
VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Welcome to NanoAnalyzer', 'Your cloud-native Supabase simulation environment is configured and ready.', 'success', false)
ON CONFLICT (id) DO NOTHING;
