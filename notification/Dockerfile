# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create sessions directory with proper permissions
RUN mkdir -p /app/sessions && \
    chmod -R 777 /app && \
    chmod -R 777 /app/sessions

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY app.py .
COPY provide_code.py .
COPY .env .

# Ensure permissions are set after copying files
RUN chmod -R 777 /app

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.py
ENV FLASK_ENV=development

# Expose port
EXPOSE 5000

# Command to run the application
CMD ["python", "app.py"] 