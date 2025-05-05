#!/bin/bash

# this is helper script to test if the render build is working or not 

# Function to clean up the network and specific containers on exit
cleanup() {
  echo "Cleaning up..."

  # Remove the network if it exists
  if docker network inspect temp_network &>/dev/null; then
    echo "Removing network temp_network..."
    docker network rm temp_network
  fi

  # Stop and remove specific containers if they exist
  if docker ps -a --filter "name=postgres-container" --format '{{.Names}}' | grep -q '^postgres-container$'; then
    echo "Stopping and removing postgres container..."
    docker stop postgres-container
    docker rm postgres-container
  fi

  if docker ps -a --filter "name=quick-start-full" --format '{{.Names}}' | grep -q '^quick-start-full$'; then
    echo "Stopping and removing application container..."
    docker stop quick-start-full
    docker rm quick-start-full
  fi

  exit 0
}

# Trap Ctrl+C (SIGINT) to call the cleanup function
trap cleanup SIGINT

# Check if the network already exists, otherwise create it
if ! docker network inspect temp_network &>/dev/null; then
  echo "Creating network temp_network..."
  docker network create temp_network
else
  echo "Network temp_network already exists."
fi

# Start the PostgreSQL container
echo "Starting PostgreSQL container..."
docker run -d --name postgres-container --network temp_network \
    -e POSTGRES_USER=opensource \
    -e POSTGRES_PASSWORD=sourceopen \
    -e POSTGRES_DB=fasoshop \
    -p 5432:5432 \
    postgres:latest

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."

RETRY_COUNT=0
MAX_RETRIES=5

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if docker exec postgres-container pg_isready -U opensource &>/dev/null; then
    echo "PostgreSQL is ready."
    break
  else
    echo "PostgreSQL is not ready yet. Waiting..."
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT + 1))
  fi
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
  echo "Timeout waiting for PostgreSQL. Exiting..."
  cleanup
fi


# Check if the fasoshop database exists, create it if not
echo "Checking if database fasoshop exists..."
DB_EXISTENCE=$(docker exec postgres-container psql -U opensource -tAc "SELECT 1 FROM pg_database WHERE datname='fasoshop';")
if [ "$DB_EXISTENCE" != "1" ]; then
  echo "Database fasoshop does not exist. Creating it..."
  docker exec postgres-container psql -U opensource -c "CREATE DATABASE fasoshop;"
else
  echo "Database fasoshop already exists."
fi

# Check if PostgreSQL is really ready and fasoshop exists
echo "Checking PostgreSQL readiness for fasoshop..."

RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if docker exec postgres-container pg_isready -U opensource -d fasoshop &>/dev/null; then
    echo "PostgreSQL and fasoshop database are ready."
    break
  else
    echo "PostgreSQL or fasoshop is not fully ready. Waiting..."
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT + 1))
  fi
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
  echo "Timeout waiting for PostgreSQL and fasoshop. Exiting..."
  cleanup
fi


# Start the application container
echo "Starting application container..."
docker run -d --name quick-start-full --network temp_network \
    -e DATABASE_URL="postgresql://opensource:sourceopen@postgres-container:5432/fasoshop" \
    -e PORT="3000" \
    -e UI_PORT="5173" \
    -p 3000:3000 -p 5173:5173 \
    quick-start-full:latest

# Keep the script running and handle signals
while true; do
  sleep 1
done
