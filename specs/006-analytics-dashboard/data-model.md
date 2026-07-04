# Data Model: Analytics Dashboard

The dashboard relies on existing tables but introduces new Views and RPCs (Stored Procedures) to aggregate data efficiently.

## Existing Tables Used
- `prospects`: For leads, pipeline status, conversions, agent assignments, and origin channels.
- `reservations`: For confirmed tours and revenue tracking.
- `messages`: For calculating average response time and Meta API consumption.
- `campaign_sends`: For Meta API consumption.
- `satisfaction_surveys`: For survey results.
- `agents`: For agent performance reports.

## New Database Views (Real-time Aggregations)

### `view_analytics_kpis`
Provides instant real-time counters.
- `leads_today` (int): Count of prospects created today.
- `leads_in_pipeline` (int): Count of prospects in 'Nuevo', 'En Seguimiento', 'Cotizado'.
- `total_reservations` (int): Count of reservations with status 'confirmed'.
- `total_conversions` (int): Count of prospects in 'Reservado' or 'Convertido'.

### `view_analytics_funnel`
- `status` (text): Prospect status.
- `count` (int): Number of prospects in that status.

### `view_analytics_bot_performance`
- `total_leads` (int)
- `bot_qualified` (int): Leads that never reached a human agent (or status 'Convertido' without agent).
- `human_handoff` (int): Leads assigned to an agent.

### `view_analytics_surveys`
- `average_rating` (numeric)
- `rating_1_count` (int)
- `rating_3_count` (int)
- `rating_5_count` (int)

### `view_analytics_consumption`
- `current_month_messages` (int): Count of rows in `messages` for current month.
- `current_month_campaigns` (int): Count of rows in `campaign_sends` for current month.
- `total_interactions` (int): Sum of both.

## New RPCs (Parameterized Aggregations)

### `get_conversions_by_tour(start_date text, end_date text)`
Returns:
- `tour_name` (text)
- `conversion_count` (int)

### `get_conversions_by_channel(start_date text, end_date text)`
Returns:
- `channel` (text)
- `lead_count` (int)
- `conversion_count` (int)

### `get_agent_performance(start_date text, end_date text)`
Returns:
- `agent_id` (uuid)
- `agent_name` (text)
- `leads_assigned` (int)
- `leads_attended` (int)
- `conversions` (int)
- `avg_response_time_minutes` (numeric)

## Application Settings
- We will add a simple `system_settings` table (or use environment variables on frontend) to store `meta_monthly_limit` (integer).
