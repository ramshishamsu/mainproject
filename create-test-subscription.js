import mongoose from 'mongoose';
import User from './models/User.js';
import Plan from './models/Plan.js';
import Subscription from './models/Subscription.js';

const createTestSubscription = async () => {
  try {
    console.log('🔍 Creating test subscription...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-management');
    console.log('✅ Connected to MongoDB');
    
    // Get a user
    const user = await User.findOne({ email: 'ramshida@example.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ Found user:', user._id);
    
    // Get a plan
    const plan = await Plan.findOne();
    if (!plan) {
      console.log('❌ No plans found. Creating a test plan...');
      const testPlan = new Plan({
        name: 'Premium Plan',
        description: 'Full access to all features',
        price: 999,
        duration: 30,
        features: [
          'Personal Training',
          'Nutrition Plans',
          'Workout Programs',
          'Priority Support'
        ]
      });
      await testPlan.save();
      console.log('✅ Test plan created:', testPlan._id);
      var planId = testPlan._id;
    } else {
      console.log('✅ Found plan:', plan._id);
      var planId = plan._id;
    }
    
    // Create subscription
    const subscription = new Subscription({
      userId: user._id,
      planId: planId,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paymentId: 'test_payment_' + Date.now(),
      amount: 999
    });
    
    await subscription.save();
    console.log('✅ Test subscription created:', subscription._id);
    
    // Test the API response
    const populatedSubscription = await Subscription.findOne({
      userId: user._id,
      status: 'active'
    }).populate('planId');
    
    console.log('✅ API Response Test:', JSON.stringify(populatedSubscription, null, 2));
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createTestSubscription();
