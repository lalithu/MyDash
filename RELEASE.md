# MyDash 0.10.2

This release adds a first-install welcome page, clearer account/privacy links, accessible recovery messages, and validation for incomplete schedule times. Screenshot extraction produces a draft that users review and edit before saving; it is not a promise of complete or exact extraction.

## Verified

- Clean separate installation opens the welcome page automatically.
- Empty account setup does not inherit an existing session; sign-in mode switches correctly.
- A manual demo class saves locally without an account and persists after reopening.
- Full, Busy-only, and Hidden schedule sharing were checked between two accounts.
- Friend removal, new request, UI acceptance, and reconnection passed.
- Non-friend schedule reads returned no rows; anonymous reads were blocked; a cross-user update was rejected with HTTP 403.
- On-device image import completed after Chrome downloaded its local model. It found five blocks from a six-course test image. Users must review and correct drafts.
- Focused automated regression and syntax checks pass. Mocked auth tests cover email-confirmation feedback and local sign-out.

## Scope of verification

A clean new account registration/email-confirmation round trip was not repeated in the isolated installation. This test did not audit every database policy or load-test campus-scale usage. On-device AI depends on Chrome model availability, hardware, settings, and disk space.

## Package

```sh
python3 scripts/package.py /tmp/MyDash-0.10.2.zip
```

The upload ZIP excludes tests, development fixtures, screenshots, and documentation. Store images under `docs/assets` show the shipped welcome and schedule-editor pages using fictional local demo data; no real grades, tokens, account emails, or friend schedules are displayed.
