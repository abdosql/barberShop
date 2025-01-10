#!/bin/sh

while true; do
    echo "----------------------------------------"
    echo "[$(date)] Starting daily clean appointments task"
    
    cd /var/www/html
    
    if [ -f "bin/console" ]; then
        echo "Executing command..."
        php bin/console app:clean:appointments --verbose --env=dev
        
        RESULT=$?
        if [ $RESULT -eq 0 ]; then
            echo "[$(date)] Command executed successfully"
        else
            echo "[$(date)] Command failed with exit code $RESULT"
        fi
    else
        echo "ERROR: bin/console not found in $(pwd)!"
    fi
    
    echo "[$(date)] Sleeping for 24 hours..."
    echo "----------------------------------------"
    sleep 86400
done 