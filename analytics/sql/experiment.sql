-- Onboarding A/B test.
-- Primary metric: signup to first task completed (activation).

WITH bucketed AS (
    SELECT
        u.id                AS user_id,
        u.experiment_variant
    FROM users u
    WHERE u.experiment_variant IN ('A', 'B')
),
completed AS (
    SELECT DISTINCT user_id
    FROM events
    WHERE name = 'task_completed' AND user_id IS NOT NULL
),
joined AS (
    SELECT
        b.experiment_variant,
        b.user_id,
        CASE WHEN c.user_id IS NOT NULL THEN 1 ELSE 0 END AS activated
    FROM bucketed b
    LEFT JOIN completed c ON c.user_id = b.user_id
)
SELECT
    experiment_variant                                          AS variant,
    COUNT(*)                                                    AS users,
    SUM(activated)                                              AS activated_users,
    ROUND(100.0 * SUM(activated) / NULLIF(COUNT(*), 0), 1)      AS activation_cvr_pct
FROM joined
GROUP BY experiment_variant
ORDER BY experiment_variant;

-- Run the two proportion z test for a p-value in pandas or in the FastAPI service.
-- Plain SQL can't produce a clean significance number on its own.
