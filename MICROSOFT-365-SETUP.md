# adi Workwear — Microsoft 365 implementation

## Required architecture

- Microsoft Entra ID authenticates internal users.
- The signed-in email is matched to the active user record.
- SharePoint Lists store shared orders, users, products, price history and audit events.
- A server-side API (recommended: Azure Functions with managed identity) enforces permissions. Do not enforce roles only in browser code.
- Power Automate sends approval emails and includes a deep link to the relevant approval record.

## Roles and access

| Role | Access |
|---|---|
| MD | Employee form and MD approvals for their assigned adi company |
| Workwear Manager | Manage Orders, Admin, Workwear Approvals |
| Workwear Admin | Manage Orders only |
| System Admin | System Admin, all approval stages, Manage Orders, Admin, approve on behalf and audited deletion |

The employee share link is a separate form-only route. It must not display management navigation.

## Approval workflow

1. Employee submits an order.
2. Status becomes `Awaiting MD approval`.
3. Power Automate emails the MD assigned to the selected adi company.
4. The MD approves or declines. Declines require a reason.
5. MD approval changes status to `Awaiting workwear approval`.
6. Power Automate notifies active Workwear Managers.
7. A Workwear Manager approves or declines. Declines require a reason.
8. Workwear approval changes status to `Fully approved`, ready to order.
9. System Admin may approve either stage on behalf of the assigned approver. The audit record must identify the acting user.
10. System Admin may delete an order only after supplying a reason. The order snapshot remains in the deletion audit.

## SharePoint Lists

### WorkwearUsers
- Title (name)
- Email (unique)
- Role: MD / Workwear Manager / Workwear Admin / System Admin
- CompanyId
- Active
- CreatedBy, CreatedAt, ModifiedBy, ModifiedAt

### Orders
Retain all existing order fields plus:
- Status
- MdApprovalRequestedAt
- MdApprovedAt, MdApprovedBy
- WorkwearApprovalRequestedAt
- WorkwearApprovedAt, WorkwearApprovedBy
- DeclinedAt, DeclinedBy, DeclinedStage, DeclineReason
- CancelledAt, CancelledBy, CancellationReason
- NotificationStatus
- Version

### ApprovalAudit
- OrderId
- Stage
- Action
- ActingUserEmail
- ActingUserName
- OnBehalfOf
- Reason
- Timestamp
- PreviousStatus
- NewStatus

### DeletedOrderAudit
- OrderId
- OrderSnapshotJson
- DeletedByEmail
- DeletedByName
- Reason
- Timestamp

## Power Automate flows

### MD approval notification
Trigger when an order enters `Awaiting MD approval`.
Look up the order company, find its active MD, send an email containing the secure approvals deep link, and update notification status/sent time.

### Workwear approval notification
Trigger when an order enters `Awaiting workwear approval`.
Email all active Workwear Managers with the secure workwear-approval deep link.

### Resend
A protected API action creates a new notification request. Log every resend and update the last-sent timestamp.

## Details required to connect the application

- Microsoft tenant ID
- Entra application/client ID
- Approved production and local redirect URLs
- SharePoint site URL
- SharePoint site/list identifiers
- Azure Function/API URL
- Confirmation of the System Admin email
- Power Automate connection owner/service account

## Security requirements

- Validate Entra access tokens server-side.
- Authorise every read/write/delete action server-side against WorkwearUsers.
- MD queries must be restricted to their assigned company.
- Use managed identity and least-privilege `Sites.Selected` access.
- Never store administrative roles, secrets or deletion authority in localStorage.
- Keep immutable approval and deletion audit entries.
