Based on my analysis of the PRD, system-workflow-user-flows, and the actual database schema, here are the **confusions and clashing requirements** I've identified:

---

## 🚨 Critical Issues

### 1. **Room Assignment Redundancy** 
**Clash:** Room is assigned in TWO places with conflicting purposes:

| Source | Room Assignment Location |
|--------|------------------------|
| `classes` table | `room_id` column |
| `class_schedules` table | `room_id` column |

**Confusion:**
- **PRD says:** "Ops assigns each CLASS_SCHEDULE to a ROOM"
- **Schema reality:** `classes` also has `room_id` (nullable)
- **Workflow says:** "Ops creates a CLASS_SCHEDULE and assigns a ROOM"

**Problem:** Which room assignment is the source of truth?
- If a class has a default room in `classes.room_id`, can individual schedules override it?
- If `classes.room_id` is nullable, should schedules always have rooms?
- Room conflict prevention logic becomes ambiguous.

---

### 2. **Time Slots Confusion**
**Clash:** Two different time slot definitions exist:

| Table | Time Slot Field | Purpose |
|-------|----------------|---------|
| `users` | `availability_slots` (JSON) | Coach's general availability |
| `class_schedules` | `start_time` + `end_time` (datetime) | Actual scheduled sessions |

**Confusion:**
- **Workflow says:** "Ops filters USERS (Coaches) by preferred_levels and **availability_slots**"
- **Reality:** `availability_slots` is JSON with undefined structure
- **Problem:** How do you map a coach's `availability_slots` (e.g., "Monday 2-4pm") to actual `class_schedules` datetime values?
- No clear relationship or validation between the two.

---

### 3. **Coach Rate Ambiguity**
**Clash:** Coach pay can be calculated from TWO sources:

| Source | Rate Field |
|--------|-----------|
| `users` | `hourly_rate` (decimal) |
| `packages` | `coach_rate_per_session` (decimal) |

**Confusion:**
- **PRD says:** "Total Pay = (Number of Delivered Sessions) × (Coach Hourly Rate)"
- **Schema reality:** Both `users.hourly_rate` AND `packages.coach_rate_per_session` exist
- **Problem:** Which rate should be used for payroll?
  - If a coach teaches different packages with different rates, which one wins?
  - If both exist, is it per-coach or per-package rate?

---

## ⚠️ Medium Priority Issues

### 4. **Mode/Delivery Inconsistency**
| Table | Mode Field | Possible Values |
|-------|-----------|----------------|
| `classes` | `mode` | (string, no enum) |
| `rooms` | `mode` | default 'physical', with `platform`, `account_email` |

**Confusion:**
- `classes.mode` determines delivery method for the class
- `rooms.mode` determines if room is physical or virtual
- **Problem:** Can you have a physical class in a virtual room? Vice versa?
- No validation ensures consistency between `classes.mode` and `rooms.mode`.

---

### 5. **Sessions Per Month vs Schedules**
| Table | Field | Purpose |
|-------|-------|---------|
| `classes` | `sessions_per_month` (int, nullable) | Expected sessions |
| `class_schedules` | (actual records) | Actual scheduled sessions |

**Confusion:**
- `classes.sessions_per_month` is a "planned" number
- `class_schedules` contains the actual sessions
- **Problem:** What if `class_schedules` count ≠ `sessions_per_month`?
  - Should billing be based on `sessions_per_month` or actual schedules?
  - No reconciliation logic defined.

---

### 6. **Day/Time in Classes vs Schedules**
| Table | Fields | Type |
|-------|--------|------|
| `classes` | `day`, `start_time`, `end_time` | Day (string), Time (time) |
| `class_schedules` | `start_time`, `end_time` | Datetime |

**Confusion:**
- `classes` stores recurring schedule: `day="Monday"`, `start_time="14:00:00"`, `end_time="15:00:00"`
- `class_schedules` stores specific instances: `start_time="2026-02-10 14:00:00"`
- **Problem:** Are `class_schedules` auto-generated from `classes` day/time pattern?
  - If yes, how often? Monthly? Quarterly?
  - If manual, why have `classes.day` and `classes.start_time` at all?

---

## 📋 Summary Table

| Issue | Severity | Affected Tables | Impact |
|-------|----------|-----------------|--------|
| Room Assignment Redundancy | 🔴 Critical | `classes`, `class_schedules` | Room conflicts, unclear assignment flow |
| Time Slots Confusion | 🔴 Critical | `users`, `class_schedules` | Coach matching, scheduling logic |
| Coach Rate Ambiguity | 🟡 Medium | `users`, `packages` | Payroll calculation errors |
| Mode/Delivery Inconsistency | 🟡 Medium | `classes`, `rooms` | Physical/virtual class conflicts |
| Sessions Per Month vs Schedules | 🟡 Medium | `classes`, `class_schedules` | Billing discrepancies |
| Day/Time Pattern vs Instances | 🟡 Medium | `classes`, `class_schedules` | Schedule generation unclear |

---
        
            
toolName: todo_write
            
status: success
          
Todos updated: 6 items
          
## 💡 Recommendations

### For Critical Issues:

**1. Room Assignment - Choose ONE approach:**
- **Option A:** Remove `classes.room_id`, only use `class_schedules.room_id` (supports dynamic room changes)
- **Option B:** Keep `classes.room_id` as default, allow `class_schedules` to override with nullable
- **Option C:** Remove `class_schedules.room_id`, all schedules inherit from `classes.room_id`

**2. Time Slots - Define structure:**
```json
// Suggested structure for users.availability_slots
{
  "Monday": ["14:00-16:00", "16:00-18:00"],
  "Wednesday": ["10:00-12:00"],
  "Friday": ["14:00-16:00"]
}
```
Add validation when creating schedules to check against coach's availability.

**3. Coach Rate - Pick ONE source:**
- **Option A:** Use `users.hourly_rate` only, remove `packages.coach_rate_per_session`
- **Option B:** Use `packages.coach_rate_per_session` (per package), remove `users.hourly_rate`
- **Option C:** Both exist, with `packages.coach_rate_per_session` as override

---

### For Medium Issues:

**4. Mode Validation:**
Add constraint: `classes.mode` must match `rooms.mode` when `classes.room_id` is set.

**5. Sessions Per Month:**
Either:
- Remove `sessions_per_month` (use actual `class_schedules` count)
- Add validation to ensure `class_schedules` count matches `sessions_per_month`

**6. Schedule Generation:**
Clarify: Are `class_schedules` auto-generated from `classes.day/time` pattern?
- If yes: Add a scheduler/job to generate them monthly
- If no: Remove `classes.day`, `classes.start_time`, `classes.end_time`

---

## ❓ Questions to Answer

1. Can a coach teach the same class in different rooms on different weeks?
2. Should coach pay vary by package or be fixed per coach?
3. How are `class_schedules` created - manual entry or auto-generated?
4. What's the JSON structure expected for `users.availability_slots`?
5. Should `classes.mode` and `rooms.mode` always match?
6. Is `sessions_per_month` a billing target or just a reference?

Would you like me to implement any of these fixes or explore a specific issue further?
