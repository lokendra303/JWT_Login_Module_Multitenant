-- Quick Insert Tenant for Testing

USE auth_multitenant_JWT;

-- Insert tenant1
INSERT INTO tenants (id, name, slug, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Tenant One', 'tenant1', 'active');

-- Verify
SELECT * FROM tenants;
