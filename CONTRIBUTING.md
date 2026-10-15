# Contributing to MyDash

Open an issue with the problem, expected behavior, Chrome version, and reproduction steps. Remove grades, emails, tokens, and other private data from attachments.

For a change, create a branch, keep the scope focused, run the three Node tests in the README, and manually reload the extension and Canvas. Explain what changed and how you checked it. Use your own test accounts. Never weaken database access rules to make a test pass.

This checkout contains compiled browser assets. If original build source becomes available, changes should move there. Database migrations are not included yet; do not assume a fresh Supabase project can run the social features without additional setup.
