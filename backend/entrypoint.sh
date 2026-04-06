#!/bin/sh

# Wait for dependencies if necessary (e.g., database)
# If you were using a separate DB container, you might add a wait loop here.
# For SQLite, this is usually not needed.

# Run the Flask CLI command to create the database tables
echo "Creating database tables..."
# Use 'python -m flask' to ensure 'flask' command is found
# --app app/Main.py tells Flask where to find the app instance
python -m flask --app app/main.py create-db
echo "Database tables setup complete."

# Execute the CMD passed to the container (e.g., gunicorn)
# 'exec "$@"' passes the CMD arguments to this script
exec "$@"
