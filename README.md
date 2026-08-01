# Bar Ops v0.8.2

Employee portal activation schema repair built on v0.8.0.

After deployment, run:

```bash
npm run db:migrate
npm run db:verify
```

This applies `008_employee_updated_at.sql`, which adds the timestamp required by employee activation and employee editing.


## v0.8.2 shift synchronization
Production schedule writes are now server-confirmed and the workspace waits for PostgreSQL bootstrap before interaction.
