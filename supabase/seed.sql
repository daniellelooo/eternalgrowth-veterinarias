insert into clinic_settings (id, name, phone, whatsapp, address, email, description)
values (1, 'Veterinaria Demo', '604 000 0000', '573000000000',
        'Cra. 43A #10-10, Medellín', 'contacto@veterinaria.local',
        'Clínica veterinaria en Medellín: consulta general, vacunación y desparasitación.');

insert into services (name, description, duration_minutes, price_cop, sort_order) values
 ('Consulta general', 'Valoración completa de tu mascota', 30, 60000, 1),
 ('Vacunación', 'Aplicación de vacunas con registro de refuerzos', 20, 45000, 2),
 ('Desparasitación', 'Control de parásitos internos y externos', 20, 35000, 3),
 ('Baño y peluquería', 'Baño medicado o estético', 60, 50000, 4);

-- Lun-Vie 8:00-18:00, Sáb 8:00-14:00 (weekday 0=domingo)
insert into business_hours (weekday, open_time, close_time) values
 (1,'08:00','18:00'),(2,'08:00','18:00'),(3,'08:00','18:00'),
 (4,'08:00','18:00'),(5,'08:00','18:00'),(6,'08:00','14:00');

-- Datos demo: dueño con mascota y vacuna próxima a vencer
insert into owners (id, full_name, phone, email, last_visit_at) values
 ('11111111-1111-1111-1111-111111111111','Carolina Restrepo','3001234567','caro@example.com', now() - interval '200 days');
insert into pets (id, owner_id, name, species, breed) values
 ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','Rocky','perro','Beagle');
insert into health_records (pet_id, type, product, applied_at, next_due_at) values
 ('22222222-2222-2222-2222-222222222222','vacuna','Rabia', current_date - 350, current_date + 15),
 ('22222222-2222-2222-2222-222222222222','desparasitacion','Triple', current_date - 80, current_date + 10);
