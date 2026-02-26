-- Seed Data for Testing

USE auth_multitenant_JWT;

-- Insert Test Tenant
INSERT INTO tenants (id, name, slug, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Tenant One', 'tenant1', 'active'),
('550e8400-e29b-41d4-a716-446655440001', 'Tenant Two', 'tenant2', 'active');

-- Insert Test Roles
INSERT INTO roles (id, tenant_id, name) VALUES
('650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'admin'),
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'user'),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'admin'),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'user');

-- Insert Test Permissions
INSERT INTO permissions (id, name, description) VALUES
('750e8400-e29b-41d4-a716-446655440000', 'users.read', 'Read users'),
('750e8400-e29b-41d4-a716-446655440001', 'users.write', 'Create/Update users'),
('750e8400-e29b-41d4-a716-446655440002', 'users.delete', 'Delete users');

-- Assign Permissions to Admin Role
INSERT INTO role_permissions (role_id, permission_id) VALUES
('650e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440000'),
('650e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440001'),
('650e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440002');
