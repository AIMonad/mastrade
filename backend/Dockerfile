FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt flask-cors gunicorn flask-sqlalchemy

# Copy the entire backend folder into the container
COPY . .

RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]

# IMPORTANT: The path 'app.app:app' means:
# Look in the FOLDER 'app', find the FILE 'app.py', and find the VARIABLE 'app'
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app.app:app"]