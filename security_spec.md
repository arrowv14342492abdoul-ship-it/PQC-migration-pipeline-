# Security Specification & Threat Model (Firestore ABAC)

## 1. Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created or written if `request.auth.uid == userId`.
2. **Project Ownership Invariant**: A saved project at `/users/{userId}/projects/{projectId}` strictly requires that the authenticated user matches `{userId}` and `incoming().userId == request.auth.uid`.
3. **Immutability Invariant**: Identity keys (`uid`, `userId`) and audit log timestamps are immutable once committed.
4. **Denial-of-Wallet Invariant**: All text, code, and serialization inputs are strictly bounded with `.size()` constraints preventing document bloat or storage exhaustion.
5. **No Blanket Reads**: No global query scraping is permitted. Only authenticated owners can read their corresponding documents and subcollections.

## 2. The Dirty Dozen Payloads (Adversarial Test Cases)

1. **PAYLOAD-01 (Unauthenticated User Profile Injection)**:
   - Target: `/users/victim_user_123`
   - Actor: `Unauthenticated (null)`
   - Expected: `PERMISSION_DENIED`

2. **PAYLOAD-02 (Identity Spoofing - Impersonating Another User's Profile)**:
   - Target: `/users/victim_user_123`
   - Actor: `attacker_456`
   - Data: `{"uid": "victim_user_123", "email": "attacker@evil.com"}`
   - Expected: `PERMISSION_DENIED`

3. **PAYLOAD-03 (Ghost Field / Shadow Key Pollution)**:
   - Target: `/users/user_abc`
   - Actor: `user_abc`
   - Data: `{"uid": "user_abc", "email": "alice@gov.us", "role": "SUPER_ADMIN", "isAdmin": true}`
   - Expected: `PERMISSION_DENIED`

4. **PAYLOAD-04 (Cross-Tenant Project Injection)**:
   - Target: `/users/alice/projects/proj_999`
   - Actor: `bob`
   - Data: `{"userId": "bob", "projectName": "Malicious Exfil", "code": "..."}`
   - Expected: `PERMISSION_DENIED`

5. **PAYLOAD-05 (Owner UID Mismatch in Subcollection Write)**:
   - Target: `/users/alice/projects/proj_001`
   - Actor: `alice`
   - Data: `{"userId": "charlie", "projectName": "Spoofed Ownership", "code": "print(1)"}`
   - Expected: `PERMISSION_DENIED`

6. **PAYLOAD-06 (Denial-of-Wallet Payload Overflow - Huge Project Name)**:
   - Target: `/users/alice/projects/proj_002`
   - Actor: `alice`
   - Data: `{"userId": "alice", "projectName": "A".repeat(5000), "code": "..."}`
   - Expected: `PERMISSION_DENIED`

7. **PAYLOAD-07 (Invalid Path Injection - Nonce ID Poisoning)**:
   - Target: `/users/alice/projects/proj!@#$%^&*()_+`
   - Actor: `alice`
   - Expected: `PERMISSION_DENIED`

8. **PAYLOAD-08 (Unauthorized Foreign Audit Log Deletion)**:
   - Target: `/auditLogs/log_001`
   - Actor: `attacker`
   - Operation: `DELETE`
   - Expected: `PERMISSION_DENIED`

9. **PAYLOAD-09 (Audit Log Mutation - Rewriting History)**:
   - Target: `/auditLogs/log_001`
   - Actor: `any`
   - Operation: `UPDATE`
   - Expected: `PERMISSION_DENIED`

10. **PAYLOAD-10 (Global Collection Scraping Without Scope)**:
    - Target: `/users`
    - Actor: `alice`
    - Operation: `LIST` without identity bounds
    - Expected: `PERMISSION_DENIED`

11. **PAYLOAD-11 (Timestamp Falsification - Client Tampering)**:
    - Target: `/users/alice/projects/proj_003`
    - Actor: `alice`
    - Data: `{"userId": "alice", "projectName": "PQC Test", "code": "...", "createdAt": "1970-01-01T00:00:00Z"}`
    - Expected: `PERMISSION_DENIED`

12. **PAYLOAD-12 (Malicious Code Blob Exceeding 250KB Limit)**:
    - Target: `/users/alice/projects/proj_004`
    - Actor: `alice`
    - Data: `{"userId": "alice", "projectName": "Massive Payload", "code": "X".repeat(300000)}`
    - Expected: `PERMISSION_DENIED`
