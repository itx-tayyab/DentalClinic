-- Additive role for clinic staff who may view patient appointments.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'DOCTOR';
