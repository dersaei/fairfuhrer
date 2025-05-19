# Pin Directus image to a specific version for stability

FROM directus/directus:11.7.2

# Working directory (Directus defaults to /directus)

WORKDIR /directus

# Expose the port Directus listens on

EXPOSE 8055

# Default environment variables (override in Render dashboard)

# Only set non-sensitive defaults here; all other configs via Render UI

ENV PORT=8055 DB\_CLIENT=pg

# Note: Configure the following in Render → Environment Variables:

# DB\_HOST, DB\_PORT, DB\_DATABASE, DB\_USER, DB\_PASSWORD,

# SECRET, ADMIN\_EMAIL, ADMIN\_PASSWORD, PUBLIC\_URL,

# STORAGE\_DRIVER, STORAGE\_SUPABASE\_\*, etc.

# Do not override ENTRYPOINT or CMD;

# the base image provides:

# ENTRYPOINT \["directus"]

# CMD \["start"]
