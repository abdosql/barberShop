from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from telethon import TelegramClient, events, Button
import asyncio
import nest_asyncio
from datetime import datetime

# Enable nested event loops
nest_asyncio.apply()

# Load environment variables
load_dotenv()

app = Flask(__name__)
client = None
loop = None

# Get Telegram credentials from environment variables
API_ID = os.getenv('TELEGRAM_API_ID')
API_HASH = os.getenv('TELEGRAM_API_HASH')
PHONE_NUMBER = os.getenv('TELEGRAM_PHONE_NUMBER')
BARBERSHOP_NAME = os.getenv('BARBERSHOP_NAME')
BARBERSHOP_MAPS_LINK = os.getenv('BARBERSHOP_MAPS_LINK')
BARBERSHOP_PHONE = os.getenv('BARBERSHOP_PHONE')

# Validate all required environment variables
required_env_vars = {
    'TELEGRAM_API_ID': API_ID,
    'TELEGRAM_API_HASH': API_HASH,
    'TELEGRAM_PHONE_NUMBER': PHONE_NUMBER,
    'BARBERSHOP_NAME': BARBERSHOP_NAME,
    'BARBERSHOP_MAPS_LINK': BARBERSHOP_MAPS_LINK,
    'BARBERSHOP_PHONE': BARBERSHOP_PHONE
}

missing_vars = [var for var, value in required_env_vars.items() if not value]
if missing_vars:
    raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

# Message templates for different languages
MESSAGE_TEMPLATES = {
    'en': {
        'appointment_confirmation': "📅 *Appointment Confirmation*",
        'dear': "Dear",
        'details': "✨ *Details:*",
        'time': "🕐",
        'service': "💇‍♂️",
        'barber': "💈",
        'find_us': "📍 *Find us:*",
        'contact': "📞 *Contact:*",
        'arrive_early': "_Please arrive 5 minutes early._",
        'best_regards': "Best regards,"
    },
    'fr': {
        'appointment_confirmation': "📅 *Confirmation de Rendez-vous*",
        'dear': "Cher(e)",
        'details': "✨ *Détails:*",
        'time': "🕐",
        'service': "💇‍♂️",
        'barber': "💈",
        'find_us': "📍 *Retrouvez-nous:*",
        'contact': "📞 *Contact:*",
        'arrive_early': "_Merci d'arriver 5 minutes en avance._",
        'best_regards': "Cordialement,"
    },
    'darija': {
        'appointment_confirmation': "📅 *تأكيد الموعد*",
        'dear': "سلام",
        'details': "✨ *التفاصيل:*",
        'time': "🕐",
        'service': "💇‍♂️",
        'barber': "💈",
        'find_us': "📍 *فين تلانا:*",
        'contact': "📞 *للاتصال:*",
        'arrive_early': "_الله يجازيك بخير تجي 5 دقايق قبل الموعد_",
        'best_regards': "مع تحياتي,"
    }
}

def create_appointment_message(customer_name, service, date_time, barber_name, language='en'):
    """Create a formatted appointment confirmation message in specified language"""
    # Default to English if language not supported
    lang = language.lower() if language.lower() in MESSAGE_TEMPLATES else 'en'
    msg = MESSAGE_TEMPLATES[lang]
    
    # Create highlighted link sections
    maps_link = f"[🔗 {BARBERSHOP_NAME}]({BARBERSHOP_MAPS_LINK})"
    phone_link = f"`{BARBERSHOP_PHONE}`"
    
    message = f"""{msg['appointment_confirmation']}

{msg['dear']} *{customer_name}*,

{msg['details']}
• {msg['time']} {date_time}
• {msg['service']} {service}
• {msg['barber']} {barber_name}

{msg['find_us']} 
{maps_link}
{msg['contact']} 
{phone_link}

{msg['arrive_early']}

{msg['best_regards']}
{BARBERSHOP_NAME}"""
    
    return message

async def get_code():
    """Async function to get the verification code"""
    print("\n⚠️ Waiting for verification code...")
    # Wait for a code file to appear
    code_file = '/app/sessions/auth_code.txt'
    while not os.path.exists(code_file):
        await asyncio.sleep(1)
    
    with open(code_file, 'r') as f:
        code = f.read().strip()
    
    # Remove the code file after reading
    os.remove(code_file)
    return code

def init_telegram():
    """Initialize Telegram client and connect"""
    global client, loop
    
    try:
        # Create event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Initialize client with a session file in the mounted volume
        session_file = '/app/sessions/barbershop_session'
        client = TelegramClient(session_file, int(API_ID), API_HASH)
        
        async def connect_client():
            await client.connect()
            
            if not await client.is_user_authorized():
                print(f"\n🔄 Starting authentication for {PHONE_NUMBER}")
                await client.send_code_request(PHONE_NUMBER)
                
                # Create a marker file to indicate we're waiting for code
                with open('/app/sessions/waiting_for_code', 'w') as f:
                    f.write('1')
                
                code = await get_code()
                try:
                    await client.sign_in(PHONE_NUMBER, code)
                    # Remove the marker file after successful authentication
                    if os.path.exists('/app/sessions/waiting_for_code'):
                        os.remove('/app/sessions/waiting_for_code')
                except Exception as e:
                    print(f"Error during sign in: {str(e)}")
                    return False
            return True

        success = loop.run_until_complete(connect_client())
        
        if success:
            print("✅ Telegram client initialized successfully!")
            return True
        else:
            print("❌ Failed to initialize Telegram client")
            return False
            
    except Exception as e:
        print(f"❌ Failed to initialize Telegram client: {str(e)}")
        return False

# Root endpoint
@app.route('/')
def root():
    return jsonify({
        'status': 'online',
        'message': 'Barbershop Appointment API is running',
        'endpoints': {
            'health': '/health',
            'send_appointment': '/send_appointment_confirmation'
        }
    })

@app.route('/send_appointment_confirmation', methods=['POST'])
def send_appointment_confirmation():
    global client, loop
    
    # Check if client is connected
    if not client or not client.is_connected():
        try:
            init_telegram()
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Failed to initialize Telegram client: {str(e)}'
            }), 500
    
    try:
        data = request.get_json()
        required_fields = ['phone_number', 'customer_name', 'service', 'date_time', 'barber_name']
        
        if not data or not all(field in data for field in required_fields):
            return jsonify({
                'status': 'error',
                'message': f'Missing required fields. Required: {", ".join(required_fields)}'
            }), 400

        # Get language from request, default to English
        language = data.get('language', 'en')

        # Format the date_time if it's a string
        try:
            if isinstance(data['date_time'], str):
                date_obj = datetime.strptime(data['date_time'], '%Y-%m-%d %H:%M')
                if language == 'fr':
                    # French date format
                    formatted_date = date_obj.strftime('%A %d %B %Y à %H:%M')
                elif language == 'darija':
                    # Darija date format (similar to English but with different time separator)
                    formatted_date = date_obj.strftime('%A, %d %B %Y - %H:%M')
                else:
                    # English date format
                    formatted_date = date_obj.strftime('%A, %B %d, %Y at %I:%M %p')
            else:
                formatted_date = data['date_time']
        except ValueError:
            formatted_date = data['date_time']

        # Create the appointment message
        message = create_appointment_message(
            customer_name=data['customer_name'],
            service=data['service'],
            date_time=formatted_date,
            barber_name=data['barber_name'],
            language=language
        )

        async def send():
            try:
                phone_number = data['phone_number']
                if not phone_number.startswith('+'):
                    phone_number = '+' + phone_number

                await client.send_message(
                    phone_number,
                    message,
                    parse_mode='md',
                    link_preview=True
                )

            except Exception as e:
                print(f"Error in send: {str(e)}")
                raise e

        loop.run_until_complete(send())

        return jsonify({
            'status': 'success',
            'message': 'Appointment confirmation sent successfully'
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to send confirmation: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Service is running'
    })

if __name__ == '__main__':
    print("Initializing Telegram client...")
    if init_telegram():
        print("Starting Flask server...")
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        print("Failed to initialize Telegram client. Exiting...")
        exit(1)
