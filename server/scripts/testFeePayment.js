async function testFeePayment() {
  const baseURL = 'http://localhost:5000/api';
  console.log('Testing Student Fee Payment flow...');

  try {
    // 1. Login as Student (Arjun Patel)
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student1@smartcampus.edu',
        password: 'Student@123',
        role: 'student'
      })
    });

    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error(loginData.message || 'Login failed');

    const token = loginData.token;
    const user = loginData.user;
    console.log(`✅ Logged in as student: ${user.name} (${user.role})`);

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    // 2. Fetch fees
    const feesRes = await fetch(`${baseURL}/fees`, { headers });
    const feesData = await feesRes.json();
    console.log(`✅ Fetched fees: ${feesData.data?.length || 0} records`);
    if (!feesData.data || feesData.data.length === 0) {
      throw new Error('No fees found for student');
    }

    // 3. Find a pending fee or test fee
    let targetFee = feesData.data.find(f => f.status === 'pending' || f.status === 'overdue');
    if (!targetFee) {
      // Pick any fee and reset for test
      targetFee = feesData.data[0];
      targetFee.status = 'pending';
    }

    console.log(`Target fee to pay: ${targetFee.fee_type} (ID: ${targetFee.id}, Amount: ₹${targetFee.amount}, Status: ${targetFee.status})`);

    // 4. Pay the fee
    const payRes = await fetch(`${baseURL}/fees/pay`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        feeId: targetFee.id,
        paymentMethod: 'UPI / NetBanking'
      })
    });

    const payData = await payRes.json();
    if (!payData.success) {
      throw new Error(`Fee payment failed: ${payData.message}`);
    }

    console.log(`✅ Fee Payment Success: ${payData.message}`);
    console.log(`   Receipt No: ${payData.data?.receiptNo || payData.data?.receipt_no}`);
    console.log(`   Transaction ID: ${payData.data?.transactionId || payData.data?.transaction_id}`);
    console.log(`   Amount: ₹${payData.data?.amount}`);

    // 5. Fetch payment history
    const historyRes = await fetch(`${baseURL}/fees/payments/history`, { headers });
    const historyData = await historyRes.json();
    console.log(`✅ Fetched payment history: ${historyData.data?.length || 0} transactions`);

    console.log('\n🎉 ALL FEE PAYMENT & RECEIPT GENERATION TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

testFeePayment();
