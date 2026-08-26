CREATE OR REPLACE FUNCTION public.calculate_trial_start_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    day_num int;
    month_name text;
    month_num int;
    year_num int;
    hour_num int;
    minute_num int;
    schedule_lower text;
    date_match text[];
    result_date timestamptz;
BEGIN
    IF NEW.preferred_schedule IS NULL OR NEW.preferred_schedule = '' THEN
        RETURN NEW;
    END IF;

    IF NEW.trial_start_at IS NOT NULL AND (OLD IS NULL OR OLD.preferred_schedule = NEW.preferred_schedule) THEN
        RETURN NEW;
    END IF;

    schedule_lower := lower(NEW.preferred_schedule);

    SELECT regexp_matches(schedule_lower, '(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)', 'i')
    INTO date_match;

    IF date_match IS NULL THEN
        RETURN NEW;
    END IF;

    day_num := date_match[1]::int;
    month_name := date_match[2];

    month_num := CASE month_name
        WHEN 'enero' THEN 1 WHEN 'febrero' THEN 2 WHEN 'marzo' THEN 3
        WHEN 'abril' THEN 4 WHEN 'mayo' THEN 5 WHEN 'junio' THEN 6
        WHEN 'julio' THEN 7 WHEN 'agosto' THEN 8 WHEN 'septiembre' THEN 9
        WHEN 'octubre' THEN 10 WHEN 'noviembre' THEN 11 WHEN 'diciembre' THEN 12
    END;

    year_num := EXTRACT(YEAR FROM now() AT TIME ZONE 'America/Tijuana')::int;
    IF month_num < EXTRACT(MONTH FROM now() AT TIME ZONE 'America/Tijuana')::int THEN
        year_num := year_num + 1;
    END IF;

    hour_num := 19;
    minute_num := 30;

    BEGIN
        result_date := make_timestamptz(year_num, month_num, day_num, hour_num, minute_num, 0, 'America/Tijuana');

        IF result_date < now() THEN
            NEW.trial_start_at := NULL;
        ELSE
            NEW.trial_start_at := result_date;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NEW.trial_start_at := NULL;
    END;

    RETURN NEW;
END;
$$;