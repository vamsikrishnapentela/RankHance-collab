const crypto = require('crypto');
const axios = require('axios');

const secret = 'rankhance_webhook_secret_123';
const payload = JSON.stringify({
    event: 'payment.captured',
    payload: {
        payment: {
            entity: {
                id: 'pay_test_123',
                order_id: 'order_test_123',
                amount: 9900,
                status: 'captured'
            }
        }
    }
});

const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

async function testWebhook() {
    try {
        const response = await axios.post('http://localhost:5000/api/payment/webhook', payload, {
            headers: {
                'Content-Type': 'application/json',
                'x-razorpay-signature': signature
            }
        });
        console.log('Status Code:', response.status);
        console.log('Response Body:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testWebhook();
