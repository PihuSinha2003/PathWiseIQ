-- Funnel: landing > signup > plan > recommendation > first task done.
-- Counts distinct users (anonymous + identified) that reached each stage.

WITH stages AS (
    SELECT
        e.name                                                          AS event_name,
        COALESCE(CAST(e.user_id AS VARCHAR), e.anonymous_id)            AS actor_id
    FROM events e
    WHERE e.name IN (
        'landing_viewed',
        'signup_completed',
        'plan_created',
        'ai_recommendation_viewed',
        'task_completed'
    )
),
stage_users AS (
    SELECT event_name, COUNT(DISTINCT actor_id) AS users
    FROM stages
    GROUP BY event_name
),
ordered AS (
    SELECT 1 AS stage_order, 'Landing viewed'         AS stage, users FROM stage_users WHERE event_name = 'landing_viewed'
    UNION ALL
    SELECT 2, 'Signup completed',         users FROM stage_users WHERE event_name = 'signup_completed'
    UNION ALL
    SELECT 3, 'Plan created',             users FROM stage_users WHERE event_name = 'plan_created'
    UNION ALL
    SELECT 4, 'AI recommendation viewed', users FROM stage_users WHERE event_name = 'ai_recommendation_viewed'
    UNION ALL
    SELECT 5, 'First task completed',     users FROM stage_users WHERE event_name = 'task_completed'
)
SELECT
    stage_order,
    stage,
    users,
    ROUND(100.0 * users
        / NULLIF(FIRST_VALUE(users) OVER (ORDER BY stage_order), 0), 1) AS cumulative_cvr_pct,
    ROUND(100.0 * users
        / NULLIF(LAG(users) OVER (ORDER BY stage_order), 0), 1)         AS step_cvr_pct
FROM ordered
ORDER BY stage_order;
