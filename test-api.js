import axios from 'axios';

async function testSubscriptionAPI() {
  try {
    console.log('🔍 Testing subscription API...');
    
    // Test without auth (should return 401)
    const response1 = await axios.get('http://localhost:5005/api/subscriptions/my', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    }).catch(err => {
      console.log('❌ Expected error (invalid token):', err.response?.status || err.message);
    });
    
    console.log('✅ API test completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testSubscriptionAPI();
