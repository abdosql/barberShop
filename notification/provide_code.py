import os
import time

def provide_auth_code():
    sessions_dir = '/app/sessions'
    waiting_file = os.path.join(sessions_dir, 'waiting_for_code')
    
    # Wait for the marker file
    while not os.path.exists(waiting_file):
        print("Waiting for authentication to start...")
        time.sleep(1)
    
    # Get the code from user
    code = input("Enter the Telegram verification code: ").strip()
    
    # Write the code to a file
    with open(os.path.join(sessions_dir, 'auth_code.txt'), 'w') as f:
        f.write(code)
    
    print("Code provided successfully!")

if __name__ == '__main__':
    provide_auth_code() 