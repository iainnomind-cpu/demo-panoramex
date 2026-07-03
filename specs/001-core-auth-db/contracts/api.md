# Interface Contracts: API & Serverless

## Backend Endpoints (Vercel Serverless Functions)

### 1. `POST /api/admin/reassign-prospect`
- **Description**: Reassigns a prospect to a different agent.
- **Auth Required**: Valid Supabase JWT. User must have `role === 'admin'`.
- **Request Body**:
  ```json
  {
    "prospect_id": "uuid",
    "new_agent_id": "uuid"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Prospect reassigned successfully"
  }
  ```
- **Side Effects**: Logs action to `audit_log`.

### 2. `POST /api/admin/system-status`
- **Description**: Pauses or activates the CRM system.
- **Auth Required**: Valid Supabase JWT. User must have `role === 'admin'`.
- **Request Body**:
  ```json
  {
    "status": "active" | "paused"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "new_status": "paused"
  }
  ```
- **Side Effects**: Logs action to `audit_log`. Updates `org_settings`.
