#!/bin/sh

while true; do
    echo "----------------------------------------"
    echo "[$(date)] Starting weekly clean inactive users task"
    
    cd /var/www/html
    
    if [ -f "bin/console" ]; then
        echo "Executing command..."
        php bin/console app:clean-inactive-users --verbose --env=dev
        
        RESULT=$?
        if [ $RESULT -eq 0 ]; then
            echo "[$(date)] Command executed successfully"
        else
            echo "[$(date)] Command failed with exit code $RESULT"
        fi
    else
        echo "ERROR: bin/console not found in $(pwd)!"
    fi
    
    echo "[$(date)] Sleeping for 1 week..."
    echo "----------------------------------------"
    sleep 2592000
done 