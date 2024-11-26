# Telegram Message Sender API

A Flask-based API for sending Telegram messages using your Telegram account via Telethon.

## Setup

1. Get your Telegram API credentials:
   - Go to https://my.telegram.org/
   - Log in with your phone number
   - Go to 'API development tools'
   - Create a new application
   - Save your `api_id` and `api_hash`

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the project root and add your credentials:
   ```
   TELEGRAM_API_ID=your_api_id_here
   TELEGRAM_API_HASH=your_api_hash_here
   TELEGRAM_PHONE_NUMBER=your_phone_number_here  # Format: +1234567890
   ```

## Running the Application

```bash
python app.py
```

On first run, you'll be prompted to enter the verification code sent to your Telegram account.

The server will start on `http://localhost:5000`

## API Endpoints

### Send Message
- **URL**: `/send_message`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "phone_number": "+1234567890",
    "message": "Your message here"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Message sent successfully"
  }
  ```

### Health Check
- **URL**: `/health`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "healthy",
    "message": "Service is running"
  }
  ```

## Important Notes
- The phone number should be in international format (e.g., +1234567890)
- On first run, you'll need to authenticate with Telegram
- The session will be saved locally in a file called `session_name.session`
- Keep your `api_id` and `api_hash` secret

## Error Handling
The API returns appropriate error messages and status codes when:
- Required fields are missing
- API credentials are not configured
- Message sending fails
- Authentication fails
