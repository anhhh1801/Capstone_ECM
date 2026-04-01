# Project Entity Relationship Diagram

This diagram is based on the JPA entities in the backend module.

```mermaid
erDiagram
    ROLE {
        bigint id PK
        string name UK
    }

    USER {
        bigint id PK
        string first_name
        string last_name
        string email UK
        string personal_email UK
        string password
        string phone_number
        date date_of_birth
        string avatar_img
        datetime created_date
        boolean is_locked
        boolean is_enabled
        bigint role_id FK
        bigint created_by_teacher_id FK
    }

    CENTER {
        bigint id PK
        string name
        string phone_number
        string description
        datetime created_date
        datetime archived_at
        string avatar_img
        bigint manager_id FK
    }

    SUBJECT {
        bigint id PK
        string name
        string description
        bigint center_id FK
    }

    GRADE {
        bigint id PK
        string name
        string description
        int from_age
        int to_age
        bigint center_id FK
    }

    SCHOLARSHIP {
        bigint id PK
        string name
        float discount_percentage
    }

    COURSE {
        bigint id PK
        string name
        string description
        date start_date
        date end_date
        string status
        string invitation_status
        bigint subject_id FK
        bigint grade_id FK
        bigint center_id FK
        bigint teacher_id FK
        bigint pending_teacher_id FK
    }

    ENROLLMENT {
        bigint id PK
        bigint student_id FK
        bigint course_id FK
        bigint scholarship_id FK
        date enrollment_date
        float progress_score
        float test_score
        float final_score
        string performance
    }

    CLASSROOM {
        bigint id PK
        int seat
        string location
        date last_maintain_date
        bigint center_id FK
    }

    CLASS_SLOT {
        bigint id PK
        string day_of_week
        date start_date
        date end_date
        time start_time
        time end_time
        boolean is_recurring
        bigint center_id FK
        bigint course_id FK
        bigint classroom_id FK
    }

    CLASS_SESSION {
        bigint id PK
        bigint course_id FK
        date date
        time start_time
        time end_time
        string status
        string note
    }

    ATTENDANCE {
        bigint id PK
        bigint enrollment_id FK
        bigint session_id FK
        bigint class_slot_id FK
        date date
        string status
        boolean is_present
        string note
    }

    ASSIGNMENT {
        bigint id PK
        string title
        string description
        datetime due_date
        string file_url
        string file_name
        datetime created_date
        bigint course_id FK
        bigint class_session_id FK
    }

    ASSIGNMENT_SUBMISSION {
        bigint id PK
        bigint assignment_id FK
        bigint student_id FK
        string file_url
        string file_name
        datetime submitted_at
        float score
        string feedback
        string status
    }

    MATERIAL {
        bigint id PK
        string file_name
        string file_url
        string file_type
        datetime uploaded_date
        bigint course_id FK
        bigint class_session_id FK
    }

    VERIFICATION_TOKEN {
        bigint id PK
        string token
        datetime expiry_date
        bigint user_id FK
    }

    STUDENT_CENTERS {
        bigint student_id FK
        bigint center_id FK
    }

    ROLE ||--o{ USER : assigns
    USER ||--o{ USER : creates
    USER ||--o{ CENTER : manages
    CENTER ||--o{ SUBJECT : offers
    CENTER ||--o{ GRADE : defines
    CENTER ||--o{ COURSE : hosts
    CENTER ||--o{ CLASSROOM : contains
    CENTER ||--o{ CLASS_SLOT : schedules
    SUBJECT ||--o{ COURSE : categorizes
    GRADE ||--o{ COURSE : targets
    USER ||--o{ COURSE : teaches
    USER ||--o{ COURSE : invited_to
    USER ||--o{ ENROLLMENT : enrolls
    COURSE ||--o{ ENROLLMENT : has
    SCHOLARSHIP ||--o{ ENROLLMENT : applies
    COURSE ||--o{ CLASS_SESSION : runs
    COURSE ||--o{ CLASS_SLOT : defines
    CLASSROOM ||--o{ CLASS_SLOT : uses
    ENROLLMENT ||--o{ ATTENDANCE : tracks
    CLASS_SESSION ||--o{ ATTENDANCE : records
    CLASS_SLOT ||--o{ ATTENDANCE : occurs_in
    COURSE ||--o{ ASSIGNMENT : contains
    CLASS_SESSION ||--o{ ASSIGNMENT : includes
    ASSIGNMENT ||--o{ ASSIGNMENT_SUBMISSION : receives
    USER ||--o{ ASSIGNMENT_SUBMISSION : submits
    COURSE ||--o{ MATERIAL : stores
    CLASS_SESSION ||--o{ MATERIAL : references
    USER ||--o| VERIFICATION_TOKEN : owns
    USER ||--o{ STUDENT_CENTERS : connects
    CENTER ||--o{ STUDENT_CENTERS : connects
```

Notes:

- `Enrollment` is the junction entity between `User` in the student role and `Course`, and it also stores scores and scholarship usage.
- `student_centers` is the join table behind the many-to-many relationship between students and centers.
- `ClassSlot` is the recurring schedule rule, while `ClassSession` is a concrete lesson instance on a specific date.
- `Attendance` links an enrolled student to either a generated `ClassSession`, a `ClassSlot`, or both depending on workflow.
- `ClassSlot` also has element-collection support tables for recurring weekdays and excluded dates: `class_slot_days` and `class_slot_excluded_dates`. They are not modeled as standalone entities here.
*** End Patch