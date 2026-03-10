alter table public.cars
add column discounted_price integer null;

alter table public.cars
add constraint cars_discounted_price_check
check (
  discounted_price is null
  or (discounted_price >= 0 and discounted_price <= price)
);
