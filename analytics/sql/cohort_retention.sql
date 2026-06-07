-- Weekly signup cohorts vs retention on day 1, 2, 7, 14, 30.
-- Each cell is the % of that cohort that fired any event on day N.

WITH cohorts AS (
    SELECT
        u.id                                            AS user_id,
        DATE_TRUNC('week', u.signup_at)::DATE           AS cohort_week,
        u.signup_at
    FROM users u
),
days_active AS (
    SELECT
        c.user_id,
        c.cohort_week,
        EXTRACT(DAY FROM (e.occurred_at - c.signup_at))::INT AS day_offset
    FROM cohorts c
    JOIN events e ON e.user_id = c.user_id
    GROUP BY c.user_id, c.cohort_week, day_offset
),
cohort_size AS (
    SELECT cohort_week, COUNT(*) AS users FROM cohorts GROUP BY cohort_week
)
SELECT
    cs.cohort_week,
    cs.users                                                                         AS cohort_size,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN da.day_offset =  1 THEN da.user_id END) / cs.users, 1) AS d1,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN da.day_offset =  2 THEN da.user_id END) / cs.users, 1) AS d2,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN da.day_offset =  7 THEN da.user_id END) / cs.users, 1) AS d7,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN da.day_offset = 14 THEN da.user_id END) / cs.users, 1) AS d14,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN da.day_offset = 30 THEN da.user_id END) / cs.users, 1) AS d30
FROM cohort_size cs
LEFT JOIN days_active da USING (cohort_week)
GROUP BY cs.cohort_week, cs.users
ORDER BY cs.cohort_week;
