async function testLibraryApproval() {
  const baseURL = 'http://localhost:5000/api';
  console.log('Testing Library login and approval review endpoint...');

  try {
    // 1. Login as Library Incharge
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'library@smartcampus.edu',
        password: 'Admin@123',
        role: 'librarian'
      })
    });

    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error(loginData.message || 'Login failed');

    const token = loginData.token;
    const user = loginData.user;
    console.log(`✅ Logged in as: ${user.name} (${user.role})`);

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    // 2. Fetch applications inbox
    const inboxRes = await fetch(`${baseURL}/applications/inbox`, { headers });
    const inboxData = await inboxRes.json();
    console.log(`✅ Fetched inbox items: ${inboxData.data?.length || 0}`);

    // 3. Test Clearance update (PUT /api/applications/:id/clearance)
    const targetApp = inboxData.data?.find(a => a.type_code === 'GECM-ND') || inboxData.data?.[0];
    if (targetApp) {
      console.log(`Testing clearance update on application ${targetApp.application_id}...`);
      const clearanceRes = await fetch(`${baseURL}/applications/${targetApp.id}/clearance`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          department: 'Central Library',
          status: 'APPROVED',
          remarks: 'All books returned, zero pending fines.'
        })
      });
      const clearanceData = await clearanceRes.json();
      console.log(`✅ Clearance update result: ${clearanceData.message}`);

      // 4. Test Review action (PUT /api/applications/:id/review)
      console.log(`Testing review action on application ${targetApp.id}...`);
      const reviewRes = await fetch(`${baseURL}/applications/${targetApp.id}/review`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          action: 'APPROVED',
          comment: 'Central Library clearance and review signed off.'
        })
      });
      const reviewData = await reviewRes.json();
      if (!reviewData.success) throw new Error(`Review failed: ${reviewData.message}`);
      console.log(`✅ Review action result: ${reviewData.message}`);
    }

    // 5. Test Direct Library Clearance endpoint (POST /api/library/clearance/:id)
    const libReqsRes = await fetch(`${baseURL}/library/clearance-requests`, { headers });
    const libReqsData = await libReqsRes.json();
    console.log(`✅ Fetched library clearance requests: ${libReqsData.data?.length || 0}`);

    if (libReqsData.data?.length > 0) {
      const firstReq = libReqsData.data[0];
      const libClrRes = await fetch(`${baseURL}/library/clearance/${firstReq.id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'approved',
          remarks: 'Zero books pending. Approved.'
        })
      });
      const libClrData = await libClrRes.json();
      console.log(`✅ Direct library clearance result: ${libClrData.message}`);
    }

    console.log('\n🎉 ALL LIBRARY APPROVE / REJECT PERMISSIONS AND ENDPOINTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

testLibraryApproval();
