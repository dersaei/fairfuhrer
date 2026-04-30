# Pin Directus image to a specific version for stability
FROM directus/directus:11.17.3

WORKDIR /directus

EXPOSE 8055

# Non-sensitive defaults; all secrets configured via Render Environment Variables:
# SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, PUBLIC_URL,
# DATABASE_URL, STORAGE_DRIVER, STORAGE_SUPABASE_*, etc.
ENV PORT=8055 DB_CLIENT=pg
