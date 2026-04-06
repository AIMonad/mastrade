#!/bin/sh

# Wait for dependencies if necessary (e.g., database)
# For SQLite, this is usually not needed, but for other DBs you might add:
# while ! nc -z db 5432; do
#   echo "Waiting for database..."
#   sleep 2
# done

# Run the Flask CLI command to create the database tables
echo "Creating database tables..."
python -m flask --app main.py create-db
echo "Database tables setup complete."

# Execute the CMD passed to the container (which is likely gunicorn)
exec "$@"
