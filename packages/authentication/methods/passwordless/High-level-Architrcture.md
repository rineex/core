+--------------------------+ | Application Service Layer|
+--------------------------+ | IssuePasswordlessService | |
------------------------ | | Responsibilities: | | - Orchestrates aggregate |
| - Uses ports | | - Returns Result | +-----------+--------------+ | v
+-------------------------------+ | PasswordlessChallengeAggregate|
+-------------------------------+ | Properties: | | - id | | - channel | | -
destination | | - secret | | - status | | - issuedAt / expiresAt | | Methods: |
| - issue() | | - verify() | | - isExpired() | +-----------+-------------------+
| v +-------------------+ +--------------------+ | Ports: | | Value Objects |
+-------------------+ +--------------------+ | -
PasswordlessChallengeRepositoryPort | - PasswordlessChallengeId | | -
PasswordlessIdGeneratorPort | - PasswordlessChannel | | - PasswordlessClockPort
| - ChallengeDestination | | - PasswordlessChannelPort (channel) | -
ChallengeSecret | | | - PasswordlessChallengeStatus | +-------------------+
+--------------------+ | v +----------------------+ | Infrastructure Layer |
+----------------------+ | - DB Repository | | - Clock Adapter | | - Channel
Adapter | | (Email, SMS, Push, Auth App) | +----------------------+
