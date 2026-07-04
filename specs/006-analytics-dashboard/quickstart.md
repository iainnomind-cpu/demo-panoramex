# Quickstart Validation: Analytics Dashboard

This guide outlines how to manually validate the Analytics Dashboard functionality once implemented.

## Prerequisites
- The Supabase database must be seeded with mock data or have existing data from previous manual testing (prospects, reservations, messages, surveys).
- The `00005_analytics_views.sql` migration must be applied.

## Validation Scenarios

### Scenario 1: Real-time KPIs and Funnel
1. Navigate to the "Analytics" tab in the Panoramex CRM frontend.
2. Observe the KPI cards at the top (Leads Today, In Pipeline, etc.).
3. Open a separate tab or use the API to create a new prospect via the WhatsApp webhook.
4. Return to the Analytics tab.
5. **Expected Outcome**: The "Leads Today" and "In Pipeline" KPIs should increment immediately (or upon refresh/real-time update), and the "Nuevo" stage in the Funnel chart should increase by 1.

### Scenario 2: Parameterized Reports (Agent Performance)
1. On the Analytics dashboard, locate the Agent Performance report.
2. Select a date range (e.g., "This Month").
3. **Expected Outcome**: The table/chart displays accurate counts of assigned leads and conversions per agent for that timeframe.
4. Assign a new lead to Agent X and mark it as "Reservado".
5. Refresh the report.
6. **Expected Outcome**: Agent X's conversions and assigned leads should increase by 1.

### Scenario 3: Meta API Consumption
1. Locate the "Meta Consumption" panel on the dashboard.
2. Note the "Current Usage" vs "Limit" numbers.
3. Send a message to the bot or dispatch a campaign.
4. **Expected Outcome**: The "Current Usage" counter increases, and the progress bar updates accordingly. If it exceeds 80% of the limit, a warning indicator (e.g., yellow/red color) should be visible.

### Scenario 4: Export Functionality
1. Click the "Export to PDF" button on the dashboard.
2. **Expected Outcome**: A PDF file is downloaded to your local machine containing the visible charts and tables.
3. Click the "Export to Excel" button.
4. **Expected Outcome**: An `.xlsx` or `.csv` file is downloaded containing the raw aggregated data used to build the charts.
