# @rineex/authentication-method-passwordless

## 0.0.1

### Patch Changes

- Replace passwordless-session-created event with challenge-verified event. This
  ([#33](https://github.com/rineex/core/pull/33)) refactoring improves domain
  model accuracy by emitting challenge-verified events when challenges are
  verified, rather than session-created events.
