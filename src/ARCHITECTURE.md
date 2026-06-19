# Source architecture

The application follows a layered feature structure:

1. `app` and `components` render the UI and collect user input.
2. `actions.ts` and route handlers form the application boundary.
3. `service.ts` coordinates business rules and use cases.
4. `repository.ts` owns database and external persistence access.
5. `schema.ts` and `types.ts` define validation contracts and types.

Dependencies should point inward in that order. Pages must not access Supabase,
repositories, or business rules directly.

Shared infrastructure belongs in `lib`; feature-specific behavior stays inside
its feature directory.
