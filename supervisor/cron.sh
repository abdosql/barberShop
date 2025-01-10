#!/bin/sh

while true; do
    echo "----------------------------------------"
    echo "[$(date)] Starting clean appointments task"
    
    cd /var/www/html
    
    if [ -f "bin/console" ]; then
        echo "Executing command..."
        # Run with error display enabled and full verbosity
        PHP_INI_SCAN_DIR=/usr/local/etc/php/conf.d php \
            -d display_errors=1 \
            -d error_reporting=E_ALL \
            bin/console app:clean:appointments --verbose --env=dev
        
        RESULT=$?
        if [ $RESULT -eq 0 ]; then
            echo "[$(date)] Command executed successfully"
        else
            echo "[$(date)] Command failed with exit code $RESULT"
            # Show PHP error log if available
            if [ -f /var/log/php_errors.log ]; then
                echo "PHP Error Log:"
                cat /var/log/php_errors.log
            fi
        fi
    else
        echo "ERROR: bin/console not found in $(pwd)!"
        ls -la
    fi
    
    echo "[$(date)] Sleeping for 10 seconds..."
    echo "----------------------------------------"
    sleep 10
done 