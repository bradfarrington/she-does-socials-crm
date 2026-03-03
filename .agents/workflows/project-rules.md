---
description: Core project rules and conventions for She Does Socials CRM
---

## Data Storage

**All data must be stored in the Supabase database.** Never use localStorage, in-memory demo data, or file-based storage for any data that the user creates or manages. If a feature currently uses demo/mock data, it must be migrated to use a proper database table and API endpoint.

This applies to everything: clients, invoices, packages, posts, settings, and any future features.
