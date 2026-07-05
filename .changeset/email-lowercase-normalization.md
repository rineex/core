---
'@rineex/ddd': patch
---

Normalize `Email` value object to lowercase on construction.

- Uppercase and mixed-case inputs are stored as lowercase
- Emails differing only by case compare equal via `equals()`
