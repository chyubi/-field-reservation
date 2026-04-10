create table if not exists reservations (
    id uuid primary key,
    field_type varchar(1) not null,
    reservation_date date not null,
    time_slot varchar(20) not null,
    user_name varchar(30) not null,
    club_name varchar(50) not null,
    contact varchar(20) not null,
    password_hash varchar(255) not null,
    created_at timestamptz not null
);

create unique index if not exists uq_reservations_field_date_slot
    on reservations (field_type, reservation_date, time_slot);
