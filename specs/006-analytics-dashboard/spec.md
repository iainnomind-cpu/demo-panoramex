# Feature Specification: Analytics Dashboard

**Feature Branch**: `006-analytics-dashboard`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Construir el dashboard de analíticas, consolidando datos reales de todos los módulos anteriores (ya no series simuladas de Recharts). - KPIs en tiempo real (leads hoy, en pipeline, reservas, conversiones), embudo de ventas, reporte de conversión por tour, por canal de origen, por agente (leads asignados/atendidos/convertidos/tiempo de respuesta), tasa de calificación del bot vs. leads que pasaron a humano. - Resultados agregados de la encuesta de satisfacción. - Panel de consumo: interacciones del mes vs. el paquete contratado con Meta (para anticipar si se va a exceder el límite mensual). - Exportación a PDF y Excel, histórico de 12 meses."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-time KPI and Funnel Monitoring (Priority: P1)

As a manager or administrator, I want to view real-time KPIs and a sales funnel based on live data from all CRM modules, so I can immediately understand the current state of leads, pipeline, and conversions without manual calculation.

**Why this priority**: Core value of an analytics dashboard is to replace mocked data with actionable real-time insights for decision-making.

**Independent Test**: Can be fully tested by verifying that creating a new lead, advancing it in the pipeline, and converting it to a reservation updates the dashboard KPIs (Leads Today, In Pipeline, Reservations, Conversions) and Funnel instantly.

**Acceptance Scenarios**:

1. **Given** I navigate to the Analytics Dashboard, **When** the page loads, **Then** I see the current day's real KPIs reflecting live Supabase data.
2. **Given** I am viewing the dashboard, **When** a new prospect is created via WhatsApp, **Then** the "Leads Today" counter increments in real-time.

---

### User Story 2 - Agent and Channel Conversion Reports (Priority: P2)

As a manager, I want to analyze conversion rates broken down by agent, by tour, and by origin channel, so I can identify top performers and optimize marketing/sales strategies.

**Why this priority**: Essential for operational efficiency and marketing ROI tracking.

**Independent Test**: Can be fully tested by viewing the Agent Performance and Origin Channel charts and ensuring they accurately reflect historical conversion data.

**Acceptance Scenarios**:

1. **Given** the dashboard is loaded, **When** I view the Agent Report, **Then** I see metrics for each agent including leads assigned, leads attended, leads converted, and average response time.
2. **Given** the dashboard is loaded, **When** I filter by "Tour" or "Channel", **Then** the conversion charts update to show accurately aggregated data for the selected dimension.

---

### User Story 3 - Bot Qualification and Survey Aggregation (Priority: P2)

As a manager, I want to see the AI Bot qualification rate versus human handoff rate, along with aggregated results from post-tour satisfaction surveys, so I can evaluate the effectiveness of automation and customer satisfaction.

**Why this priority**: Crucial for evaluating the ROI of the AI Bot and the quality of the tours.

**Independent Test**: Can be fully tested by verifying that survey rating averages and bot handoff rates match the raw data in the `messages`, `prospects`, and `satisfaction_surveys` tables.

**Acceptance Scenarios**:

1. **Given** the dashboard is loaded, **When** I view the Bot Performance section, **Then** I see the percentage of leads qualified entirely by the bot vs. those handed off to human agents.
2. **Given** the dashboard is loaded, **When** I view the Satisfaction module, **Then** I see aggregated survey ratings (e.g., average stars, breakdown of 1, 3, 5-star ratings) over the selected period.

---

### User Story 4 - Meta API Consumption Panel & Export (Priority: P3)

As an administrator, I want to track monthly WhatsApp API interactions against our contracted package limit, and export reports to PDF/Excel, so I can manage costs and share historical data (up to 12 months) with stakeholders.

**Why this priority**: Important for cost management and external reporting, but secondary to operational insights.

**Independent Test**: Can be fully tested by downloading a PDF/Excel report and verifying the data matches the 12-month historical view.

**Acceptance Scenarios**:

1. **Given** the dashboard is loaded, **When** I view the Consumption Panel, **Then** I see the current month's WhatsApp message count compared to a configured monthly limit limit.
2. **Given** I am viewing the dashboard, **When** I click "Export to PDF" or "Export to Excel", **Then** a file is generated containing the dashboard data for the selected historical period.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-SEC-001**: System MUST enable Row Level Security (RLS) for all new Supabase tables immediately (if new tables are needed for analytics, though likely using existing tables).
- **FR-SEC-002**: System MUST NOT expose API keys in frontend code; all data fetching and aggregations MUST happen via Vercel serverless functions or Supabase Rpc/Views.
- **FR-ANA-001**: System MUST aggregate and display Real-Time KPIs: Leads Today, Leads in Pipeline, Total Reservations, Total Conversions.
- **FR-ANA-002**: System MUST visualize a Sales Funnel based on prospect status transitions.
- **FR-ANA-003**: System MUST provide conversion reports grouped by Tour Variant, Origin Channel, and Assigned Agent.
- **FR-ANA-004**: System MUST calculate and display Agent performance metrics: Leads Assigned, Leads Attended, Conversions, and Average Response Time.
- **FR-ANA-005**: System MUST calculate and display the Bot Qualification Rate (Leads closed/qualified by bot) vs. Human Handoff Rate.
- **FR-ANA-006**: System MUST aggregate and visualize Satisfaction Survey results from the `satisfaction_surveys` table.
- **FR-ANA-007**: System MUST display a Meta Consumption Panel comparing current month's interactions against a configurable limit.
- **FR-ANA-008**: System MUST support exporting the dashboard data (up to 12 months history) to PDF and Excel formats.

### Key Entities

- **Analytics Dashboard (View)**: Aggregates data from `prospects`, `reservations`, `messages`, `campaign_sends`, and `satisfaction_surveys`.
- **System Settings**: Stores the configured Meta API monthly limit for the consumption panel.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The dashboard loads real data for a 30-day period in under 2 seconds.
- **SC-002**: Real-time KPIs update within 3 seconds of a relevant database change (e.g., via Supabase Realtime).
- **SC-003**: Exported PDF/Excel files contain accurate data matching the on-screen charts and download in under 5 seconds.
- **SC-004**: Meta consumption metrics accurately reflect the total sum of `messages` and `campaign_sends` for the current month.

## Assumptions

- Users viewing the dashboard have the appropriate permissions (all agents see all data, based on previous project constraints).
- The "Meta API contracted package limit" is a value that can be configured by an admin in the UI or environment variables. By default, it will use a placeholder limit (e.g., 10,000) if not explicitly set.
- Exports to Excel/PDF will be generated client-side using libraries like `xlsx` and `jspdf`/`html2canvas` to avoid heavy server-side processing, given the 12-month data constraint is manageable in-browser.
- "Average Response Time" for agents can be calculated by measuring the time delta between a prospect's message and the agent's first reply in the `messages` table.
