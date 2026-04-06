# Use a Python base image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
# Use --prefix to ensure pip installs into the correct site-packages directory
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code, including the entrypoint script
COPY . .

# Make the entrypoint script executable
RUN chmod +x entrypoint.sh

# Set the entrypoint script to run when the container starts
# This script will first create the DB tables, then execute the CMD
ENTRYPOINT ["./entrypoint.sh"]

# Define the command to run your application (gunicorn in this case)
# This will be passed to the entrypoint.sh script using 'exec "$@"'
# Note: The port 5000 is used in your current CMD. Ensure this matches your application's expected port.
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5000", "app.Main:app"]
