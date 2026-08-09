select version, name, array_length(statements, 1) as statement_count
from supabase_migrations.schema_migrations
order by version;
