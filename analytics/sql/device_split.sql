-- Mobile vs desktop funnel.

WITH landings AS (
    SELECT
        anonymous_id,
        properties ->> 'device' AS device
    FROM events
    WHERE name = 'landing_viewed'
),
signups AS (
    SELECT DISTINCT u.id AS user_id, u.device
    FROM users u
),
tasks AS (
    SELECT DISTINCT user_id FROM events WHERE name = 'task_completed'
),
landing_by_device AS (
    SELECT device, COUNT(DISTINCT anonymous_id) AS landings FROM landings GROUP BY device
),
signup_by_device AS (
    SELECT device, COUNT(*) AS signups FROM signups GROUP BY device
),
active_by_device AS (
    SELECT u.device, COUNT(*) AS activated
    FROM users u JOIN tasks t ON t.user_id = u.id
    GROUP BY u.device
)
SELECT
    l.device,
    l.landings,
    COALESCE(s.signups, 0)                                                        AS signups,
    COALESCE(a.activated, 0)                                                      AS activated,
    ROUND(100.0 * COALESCE(s.signups, 0)   / NULLIF(l.landings, 0), 1)             AS landing_to_signup_pct,
    ROUND(100.0 * COALESCE(a.activated, 0) / NULLIF(s.signups, 0), 1)              AS signup_to_activation_pct
FROM landing_by_device l
LEFT JOIN signup_by_device s ON s.device = l.device
LEFT JOIN active_by_device a ON a.device = l.device
ORDER BY l.landings DESC;
