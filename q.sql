UPDATE "Event"
SET "startsAt" = NOW() + interval '7 days' + (random() * interval '60 days'),
    "endsAt"   = NOW() + interval '7 days' + (random() * interval '60 days') + interval '3 hours';

SELECT title, "startsAt" FROM "Event" ORDER BY "startsAt" ASC LIMIT 10;
