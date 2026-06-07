-- Feature adoption vs retention.
-- Example: users who saw the recommendation in their first session, did they retain better at D14?

WITH first_session AS (
    SELECT
        user_id,
        MIN(occurred_at) AS first_event_at
    FROM events
    WHERE user_id IS NOT NULL
    GROUP BY user_id
),
ai_rec_first_session AS (
    SELECT DISTINCT e.user_id
    FROM events e
    JOIN first_session fs ON fs.user_id = e.user_id
    WHERE e.name = 'ai_recommendation_viewed'
      AND e.occurred_at < fs.first_event_at + INTERVAL '24 hours'
),
returned_d14 AS (
    SELECT DISTINCT e.user_id
    FROM events e
    JOIN users u ON u.id = e.user_id
    WHERE e.occurred_at >= u.signup_at + INTERVAL '14 days'
      AND e.occurred_at <  u.signup_at + INTERVAL '15 days'
)
SELECT
    CASE WHEN a.user_id IS NOT NULL THEN 'Saw rec on day 0' ELSE 'Did not' END  AS segment,
    COUNT(DISTINCT u.id)                                                        AS users,
    COUNT(DISTINCT r.user_id)                                                   AS returned_d14,
    ROUND(100.0 * COUNT(DISTINCT r.user_id) / NULLIF(COUNT(DISTINCT u.id), 0), 1) AS d14_retention_pct
FROM users u
LEFT JOIN ai_rec_first_session a ON a.user_id = u.id
LEFT JOIN returned_d14          r ON r.user_id = u.id
GROUP BY segment
ORDER BY segment DESC;
