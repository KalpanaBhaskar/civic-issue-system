-- ===============================
-- BASIC QUERIES
-- ===============================

-- 1. View all issues
SELECT * FROM issues;

-- 2. View all users
SELECT * FROM users;

-- 3. View all feedback
SELECT * FROM feedback;

-- 4. Show resolved issues
SELECT * FROM issues WHERE status = 'RESOLVED';

-- 5. Show high severity issues
SELECT * FROM issues WHERE severity = 'HIGH';

-- 6. Show issues under review
SELECT * FROM issues WHERE status = 'UNDER_REVIEW';


-- ===============================
-- SORTING & COUNT
-- ===============================

-- 7. Latest issues first
SELECT * FROM issues ORDER BY created_at DESC;

-- 8. Oldest issues first
SELECT * FROM issues ORDER BY created_at ASC;

-- 9. Count total issues
SELECT COUNT(*) FROM issues;

-- 10. Count resolved issues
SELECT COUNT(*) FROM issues WHERE status = 'RESOLVED';


-- ===============================
-- GROUP BY / ANALYTICS
-- ===============================

-- 11. Issues per category
SELECT category, COUNT(*) 
FROM issues 
GROUP BY category;

-- 12. Issues per severity
SELECT severity, COUNT(*) 
FROM issues 
GROUP BY severity;

-- 13. Issues per status
SELECT status, COUNT(*) 
FROM issues 
GROUP BY status;


-- ===============================
-- JOIN QUERIES
-- ===============================

-- 14. Join issues with feedback
SELECT i.id, i.description, f.rating, f.comment
FROM issues i
JOIN feedback f ON i.id = f.issue_id;

-- 15. Issues with rating > 4
SELECT i.description, f.rating
FROM issues i
JOIN feedback f ON i.id = f.issue_id
WHERE f.rating > 4;

-- 16. Count feedback per issue
SELECT issue_id, COUNT(*) 
FROM feedback 
GROUP BY issue_id;


-- ===============================
-- ADVANCED QUERIES
-- ===============================

-- 17. Average rating
SELECT AVG(rating) FROM feedback;

-- 18. Issues without feedback
SELECT * FROM issues
WHERE id NOT IN (SELECT issue_id FROM feedback);

-- 19. Duplicate issues
SELECT * FROM issues
WHERE duplicate_of IS NOT NULL;

-- 20. Top 5 recent issues
SELECT * FROM issues
ORDER BY created_at DESC
LIMIT 5;

-- 21. Most common category
SELECT category, COUNT(*) AS total
FROM issues
GROUP BY category
ORDER BY total DESC
LIMIT 1;

-- 22. Issues in location range
SELECT * FROM issues
WHERE latitude BETWEEN 10 AND 20
AND longitude BETWEEN 70 AND 80;

-- 23. Average resolution time
SELECT AVG(resolved_at - created_at) 
FROM issues
WHERE status = 'RESOLVED';

-- 24. Admin users
SELECT * FROM users
WHERE role = 'ADMIN';

-- 25. High severity unresolved issues
SELECT * FROM issues
WHERE severity = 'HIGH'
AND status != 'RESOLVED';

-- ===============================
-- RELATIONAL DESIGN & NORMALIZATION
-- ===============================

-- 26. Issues with above-average severity count (Subquery)
SELECT category, COUNT(*) as issue_count
FROM issues
WHERE severity = 'HIGH'
GROUP BY category
HAVING COUNT(*) > (SELECT AVG(severity_count) FROM (SELECT COUNT(*) as severity_count FROM issues WHERE severity = 'HIGH' GROUP BY category) as sub);

-- 27. Check functional dependency: Category determining severity
SELECT category, COUNT(DISTINCT severity) as severity_distinct_count
FROM issues
GROUP BY category;

-- 28. Verify candidate key for duplicates (Normalization check)
SELECT latitude, longitude, category, description, COUNT(*) as cnt
FROM issues
GROUP BY latitude, longitude, category, description
HAVING COUNT(*) > 1;

-- 29. BCNF violation check (SessionId dependency)
SELECT sessionId, COUNT(*) as cnt
FROM issues
GROUP BY sessionId
HAVING COUNT(*) > 1;

-- 30. Self-join to find potential duplicate pairs
SELECT i1.id as issue1_id, i2.id as issue2_id, i1.description, i2.description
FROM issues i1
JOIN issues i2 ON i1.category = i2.category
WHERE i1.id < i2.id AND i1.description = i2.description;

-- ===============================
-- VIEWS & DATA DEFINITION
-- ===============================

-- 31. View creation for admin dashboard
CREATE OR REPLACE VIEW v_admin_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM issues) as total_issues,
    (SELECT COUNT(*) FROM feedback) as total_feedback,
    (SELECT AVG(rating) FROM feedback) as avg_rating;

-- 32. View with check option for data integrity
CREATE OR REPLACE VIEW v_high_severity_issues AS
SELECT * FROM issues WHERE severity = 'HIGH'
WITH CHECK OPTION;

-- 33. Updatable view for status changes
CREATE OR REPLACE VIEW v_issue_status_update AS
SELECT id, category, description, status, severity
FROM issues
WHERE status IN ('UNDER_REVIEW', 'IN_PROGRESS');

-- 34. Date truncation for monthly trends
SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as issues_count
FROM issues
GROUP BY month
ORDER BY month DESC;

-- ===============================
-- ADVANCED ANALYTICS (WINDOW FUNCTIONS & CTE)
-- ===============================

-- 35. Rank categories by total issues (Window Function)
SELECT category, COUNT(*) as total, RANK() OVER (ORDER BY COUNT(*) DESC) as category_rank
FROM issues
GROUP BY category;

-- 36. Row number for issues within each status
SELECT id, category, status, created_at,
       ROW_NUMBER() OVER (PARTITION BY status ORDER BY created_at DESC) as issue_order
FROM issues;

-- 37. CTE for resolution time analysis
WITH resolution_times AS (
    SELECT id, EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600 as hours_to_resolve
    FROM issues
    WHERE status = 'RESOLVED' AND resolved_at IS NOT NULL
)
SELECT AVG(hours_to_resolve) as avg_hours, MAX(hours_to_resolve) as max_hours
FROM resolution_times;

-- 38. LAG/LEAD for status sequence comparison
SELECT id, created_at, status,
       LAG(status, 1) OVER (ORDER BY created_at) as prev_status
FROM issues
ORDER BY created_at;

-- 39. JSON aggregation for issue feedback
SELECT i.id, i.description,
       JSON_AGG(JSON_BUILD_OBJECT('rating', f.rating, 'comment', f.comment)) as feedback_details
FROM issues i
LEFT JOIN feedback f ON i.id = f.issue_id
GROUP BY i.id, i.description;

-- 40. Boolean aggregation for status tracking
SELECT category,
       BOOL_OR(status = 'RESOLVED') as has_resolved,
       BOOL_AND(status = 'RESOLVED') as all_resolved
FROM issues
GROUP BY category;

-- ===============================
-- TRANSACTIONS & CONCURRENCY
-- ===============================

-- 41. Atomic update using FOR UPDATE (Locking)
BEGIN;
SELECT id, status FROM issues WHERE id = 'some-uuid' FOR UPDATE;
UPDATE issues SET status = 'IN_PROGRESS' WHERE id = 'some-uuid';
COMMIT;

-- 42. Transaction Savepoint for partial rollback
BEGIN;
INSERT INTO issues (id, category, description) VALUES ('uuid-1', 'ROAD', 'Pothole');
SAVEPOINT sp1;
INSERT INTO feedback (issue_id, rating) VALUES ('uuid-1', 5);
-- ROLLBACK TO sp1; (if needed)
COMMIT;

-- 43. Isolation level setting (Serializability)
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
SELECT COUNT(*) FROM issues WHERE status = 'UNDER_REVIEW';
COMMIT;

-- 44. Lock timeout configuration
SET lock_timeout = '5s';
SELECT * FROM issues WHERE status = 'UNDER_REVIEW' FOR UPDATE NOWAIT;

-- 45. Simple transaction rollback demonstration
BEGIN;
DELETE FROM issues WHERE status = 'RESOLVED';
ROLLBACK;

-- ===============================
-- SYSTEM & OPTIMIZATION
-- ===============================

-- 46. Query plan analysis
EXPLAIN ANALYZE
SELECT * FROM issues WHERE category = 'ROAD' AND severity = 'HIGH';

-- 47. Check for unique constraint violations (Integrity)
SELECT id, COUNT(*) 
FROM issues 
GROUP BY id 
HAVING COUNT(*) > 1;

-- 48. Full-text search for descriptions
SELECT id, description 
FROM issues 
WHERE to_tsvector('english', description) @@ plainto_tsquery('pothole');

-- 49. Aggregate with GROUPING SETS (Multi-dimensional)
SELECT category, severity, COUNT(*) as total
FROM issues
GROUP BY GROUPING SETS ((category), (severity), ());

-- 50. Final comprehensive summary
SELECT 
    COUNT(*) as total_issues,
    COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved,
    COUNT(*) FILTER (WHERE severity = 'HIGH') as high_severity,
    ROUND(AVG(rating)::numeric, 2) as avg_system_rating
FROM issues i
LEFT JOIN feedback f ON i.id = f.issue_id;