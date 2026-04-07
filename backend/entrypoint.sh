#!/bin/sh

echo "Creating database tables..."
# Point to the app variable inside the app folder
python -m flask --app app/app.py create-db
echo "Database tables setup complete."

exec "$@"