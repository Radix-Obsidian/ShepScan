// Test file with intentional FAKE secrets for testing ShepScan
// DO NOT USE THESE - THEY ARE FAKE TEST VALUES FOR PATTERN MATCHING

module.exports = {
    // Fake AWS credentials (test pattern)
    aws: {
        accessKeyId: 'AKIAFAKETEST1234567',
        secretAccessKey: 'FAKE_SECRET_KEY_FOR_SHEPSCAN_TESTING_1234567890',
    },
    
    // Fake Stripe key (pattern test)
    stripe: {
        secretKey: 'sk_test_FAKE_SHEPSCAN_TEST_KEY',
    },
    
    // Fake database URL
    database: {
        url: 'postgresql://testuser:testpassword@localhost:5432/testdb',
    },
    
    // Fake JWT secret
    jwt_secret: 'fake-jwt-secret-for-shepscan-testing',
    
    // Fake Google API key (pattern test)
    googleApiKey: 'AIzaFAKE_SHEPSCAN_TEST_KEY_12345',
    
    // Fake Slack token (pattern test)
    slackToken: 'xoxb-fake-shepscan-test-token-12345',
};
