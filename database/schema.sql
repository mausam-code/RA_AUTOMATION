-- ============================================================================
-- DFFEMS RECRUITMENT & MANPOWER LIFECYCLE AUTOMATION
-- PRODUCTION POSTGRESQL DATABASE SCHEMA
-- ============================================================================
-- Compatible with PostgreSQL 14, 15, 16+
-- Includes UUID generation, JSONB support, indexing, and role-based access control.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. USERS & ROLES TABLE (RBAC)
-- ----------------------------------------------------------------------------
CREATE TYPE staff_role_enum AS ENUM (
    'SUPER_ADMIN',
    'OPERATIONS_MANAGER',
    'INTAKE_OFFICER',
    'PRO_OFFICER',
    'ACCOUNTANT',
    'MARKETING_PERSONNEL'
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role staff_role_enum NOT NULL DEFAULT 'INTAKE_OFFICER',
    phone_number VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ----------------------------------------------------------------------------
-- 2. OVERSEAS COMPANY DEMANDS & PRE-PERMISSIONS (LOTS)
-- ----------------------------------------------------------------------------
CREATE TYPE demand_status_enum AS ENUM (
    'pre_permission_pending',
    'pre_permission_approved',
    'interviewing',
    'interview_completed',
    'visa_processing',
    'approved',
    'ticketed',
    'audited'
);

CREATE TABLE IF NOT EXISTS company_demands (
    id VARCHAR(64) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    country_flag VARCHAR(10) NOT NULL DEFAULT '🌐',
    lot_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quota_requested INT NOT NULL,
    quota_approved INT NOT NULL DEFAULT 0,
    salary NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'AED',
    food_and_accommodation VARCHAR(100) NOT NULL DEFAULT 'Provided by Company',
    contract_period_years INT NOT NULL DEFAULT 2,
    status demand_status_enum NOT NULL DEFAULT 'pre_permission_pending',
    pre_permission_number VARCHAR(100),
    pre_permission_date DATE,
    
    -- Newspaper Ad Metadata stored as JSONB
    newspaper_ad JSONB DEFAULT '{
        "newspaperName": "Kantipur Daily",
        "publicationDate": "",
        "pageNumber": "07",
        "clippingRef": "",
        "isSubmittedToDffems": false
    }'::jsonb,
    
    -- Interview Venue Metadata stored as JSONB
    interview_venue JSONB DEFAULT '{
        "hallName": "Agency Grand Hall",
        "streetAddress": "Ring Road, Basundhara",
        "city": "Kathmandu",
        "interviewDates": [],
        "timeSlots": "09:00 AM - 05:00 PM",
        "isSubmittedToDffems": false
    }'::jsonb,

    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_demands_lot_number ON company_demands(lot_number);
CREATE INDEX idx_demands_status ON company_demands(status);

-- ----------------------------------------------------------------------------
-- 3. CANDIDATES & PASSPORT OCR BIOMETRICS
-- ----------------------------------------------------------------------------
CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE orientation_status_enum AS ENUM ('N/A', 'Pending', 'Done', 'Resubmission_Required');
CREATE TYPE medical_status_enum AS ENUM ('N/A', 'Pending', 'Fit', 'Unfit', 'Resubmission_Required');
CREATE TYPE dffems_approval_enum AS ENUM ('Pending', 'Approved', 'Rejected', 'Resubmission_Required');
CREATE TYPE vsa_status_enum AS ENUM ('not_started', 'in_process', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS candidates (
    id VARCHAR(64) PRIMARY KEY,
    lot_id VARCHAR(64) NOT NULL REFERENCES company_demands(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    
    -- Passport & Identification
    passport_number VARCHAR(50) NOT NULL UNIQUE,
    citizenship_number VARCHAR(50),
    national_id_number VARCHAR(50),
    surname VARCHAR(100),
    given_names VARCHAR(150),
    full_name VARCHAR(255) NOT NULL,
    gender gender_enum NOT NULL DEFAULT 'MALE',
    dob DATE,
    nationality VARCHAR(100) DEFAULT 'Nepalese',
    place_of_birth VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    issuing_authority VARCHAR(150) DEFAULT 'Department of Passports, Nepal',
    permanent_address TEXT,
    district VARCHAR(100),
    raw_mrz TEXT,

    -- Contact & Professional
    photo_url TEXT,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    trade VARCHAR(100) NOT NULL,
    experience_years INT DEFAULT 0,
    education VARCHAR(100),
    skills TEXT[],

    -- Intake & Documents
    cv_generated BOOLEAN DEFAULT false,
    dossier_merged BOOLEAN DEFAULT false,

    -- Interview Phase
    interview_status VARCHAR(50) DEFAULT 'pending',
    interview_date DATE,
    interview_score INT,
    interview_remarks TEXT,

    -- DFFEMS Government Integration Status
    dffems_user_created BOOLEAN DEFAULT false,
    dffems_user_id VARCHAR(100),
    dffems_interview_entry_done BOOLEAN DEFAULT false,
    dffems_interview_entry_date TIMESTAMPTZ,

    -- Visa (VSA) & Manage List
    vsa_status vsa_status_enum DEFAULT 'not_started',
    vsa_approved_by VARCHAR(150),
    vsa_notes TEXT,
    in_manage_list BOOLEAN DEFAULT false,
    manage_list_date TIMESTAMPTZ,

    -- Medical & Orientation
    orientation_status orientation_status_enum DEFAULT 'Pending',
    orientation_notes TEXT,
    medical_status medical_status_enum DEFAULT 'Pending',
    medical_center_name VARCHAR(150),
    medical_report_date DATE,
    medical_notes TEXT,

    -- Final Labor Approval (Shram Swikriti)
    dffems_approval_status dffems_approval_enum DEFAULT 'Pending',
    dffems_approval_date TIMESTAMPTZ,
    approval_fiscal_year VARCHAR(30) DEFAULT '2026/2027',
    labor_permit_number VARCHAR(100),

    -- Flight Schedule (JSONB)
    flight_schedule JSONB DEFAULT '{
        "isTicketed": false,
        "flightDate": null,
        "airline": null,
        "flightNumber": null,
        "pnr": null,
        "departureAirport": "KTM (Tribhuvan Int Airport)",
        "destinationAirport": null
    }'::jsonb,

    -- Accounting Ledger per candidate
    accounting JSONB DEFAULT '{
        "officeCharge": 100000,
        "governmentFees": 15000,
        "candidatePaid": 0,
        "balanceDue": 115000,
        "paymentStatus": "unpaid",
        "lastPaymentDate": null,
        "paymentReceiptNo": null,
        "paymentMode": "ConnectIPS"
    }'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidates_lot_id ON candidates(lot_id);
CREATE INDEX idx_candidates_passport ON candidates(passport_number);
CREATE INDEX idx_candidates_approval ON candidates(dffems_approval_status);
CREATE INDEX idx_candidates_medical ON candidates(medical_status);

-- ----------------------------------------------------------------------------
-- 4. OFFICE EXPENSES & ACCOUNTING LEDGER
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS office_expenses (
    id VARCHAR(64) PRIMARY KEY,
    lot_id VARCHAR(64) REFERENCES company_demands(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('debit', 'credit')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    invoice_no VARCHAR(100),
    paid_to VARCHAR(150),
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_lot ON office_expenses(lot_id);
CREATE INDEX idx_expenses_date ON office_expenses(date);

-- ----------------------------------------------------------------------------
-- 5. AUDIT LOGS (Traceability & Compliance)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    staff_name VARCHAR(150) NOT NULL,
    staff_role VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    details TEXT
);

CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_staff_role ON audit_logs(staff_role);

-- ----------------------------------------------------------------------------
-- 6. WHATSAPP BOT & AUTOMATION DISPATCH LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    msg_group VARCHAR(50) NOT NULL, -- 'staff_group' or 'management_group'
    sender VARCHAR(150) NOT NULL,
    sender_role VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    actionable JSONB,
    attachments JSONB
);

CREATE INDEX idx_whatsapp_timestamp ON whatsapp_messages(timestamp DESC);

-- ----------------------------------------------------------------------------
-- 7. SEED INITIAL USERS FOR USER ROLE DEMO
-- ----------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, role, phone_number)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@dffems-agency.com', 'bcrypt_hash_placeholder', 'Super Admin', 'SUPER_ADMIN', '+977-9801000000'),
    ('22222222-2222-2222-2222-222222222222', 'sanjay@dffems-agency.com', 'bcrypt_hash_placeholder', 'Sanjay Subedi', 'OPERATIONS_MANAGER', '+977-9801000001'),
    ('33333333-3333-3333-3333-333333333333', 'pooja@dffems-agency.com', 'bcrypt_hash_placeholder', 'Pooja Koirala', 'INTAKE_OFFICER', '+977-9801000002'),
    ('44444444-4444-4444-4444-444444444444', 'birendra@dffems-agency.com', 'bcrypt_hash_placeholder', 'Birendra Shrestha', 'PRO_OFFICER', '+977-9801000003'),
    ('55555555-5555-5555-5555-555555555555', 'rita@dffems-agency.com', 'bcrypt_hash_placeholder', 'Rita Adhikari', 'ACCOUNTANT', '+977-9801000004')
ON CONFLICT (email) DO NOTHING;
