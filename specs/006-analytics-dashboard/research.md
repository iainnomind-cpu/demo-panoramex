# Research: Analytics Dashboard Aggregation

## Problem Statement
The analytics dashboard needs to display real-time KPIs, sales funnel, conversion reports (by tour, channel, agent), bot qualification rate, survey results, and Meta API consumption. Doing these complex aggregations (joining `prospects`, `messages`, `reservations`, `campaign_sends`, `satisfaction_surveys`) on the client side with Recharts would require downloading massive amounts of data, slowing down the frontend and risking memory issues.

## Decision: Supabase RPCs (Stored Procedures) and Database Views
We will use PostgreSQL database views and RPCs (Remote Procedure Calls) in Supabase to perform all heavy lifting and aggregations directly in the database. The frontend will call these RPCs or query these views to get pre-aggregated, ready-to-chart data for Recharts.

### Rationale
- **Performance**: Pushing computation to the database drastically reduces payload sizes and client CPU usage.
- **Real-time**: Standard views or RPCs query live data, satisfying the "real-time KPIs" requirement without needing complex background syncing for materialized views. (Materialized views require manual or triggered refreshes, which might introduce staleness. For a CRM of this scale, standard views/RPCs with proper indexing are sufficient and truly real-time).
- **Simplicity**: Keeps the React frontend thin. `useQuery` or Zustand can just fetch the aggregated arrays.

### Alternatives Considered
- **Materialized Views**: Great for performance, but require a refresh strategy (e.g., pg_cron or triggers). Given the requirement for "real-time KPIs", standard views or RPCs are preferred unless performance degrades, in which case we can convert them to materialized views later.
- **Client-side aggregation**: Rejected due to payload size constraints and performance.
- **Vercel Serverless Functions**: We could do the aggregation in a Node.js endpoint, but doing it in SQL via Supabase RPCs is much faster as it avoids multiple round-trips to the DB.

### Technical Approach
We will create a new migration (`00005_analytics_views.sql`) containing:
1. `view_kpis`: Simple view for Leads Today, In Pipeline, Reservations, Conversions.
2. `view_funnel`: View grouping prospects by status.
3. `rpc_conversion_by_tour(start_date, end_date)`: RPC returning conversion rates grouped by tour.
4. `rpc_conversion_by_agent(start_date, end_date)`: RPC returning metrics per agent.
5. `view_bot_performance`: View for bot vs human handoff rates.
6. `view_survey_results`: View for average rating and distribution.
7. `view_meta_consumption`: View for current month's messages + campaign sends.
