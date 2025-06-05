import requests
import unittest
import json
import sys
from datetime import datetime

# Backend API URL
BACKEND_URL = "https://eb7c655d-c436-4c07-8a6a-f9b221aaf927.preview.emergentagent.com/api"

class OlimpiadAPITester(unittest.TestCase):
    def setUp(self):
        self.base_url = BACKEND_URL
        self.test_olimpiad_id = None
        self.test_feature_id = None
        
    def test_01_get_all_olimpiads(self):
        """Test GET /api/olimpiads endpoint"""
        print("\n🔍 Testing GET /api/olimpiads...")
        response = requests.get(f"{self.base_url}/olimpiads")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        print(f"✅ Success - Found {len(data)} olimpiads")
        
        # Save the first olimpiad ID for later tests if available
        if data:
            self.test_olimpiad_id = data[0]['id']
            print(f"📝 Using olimpiad ID: {self.test_olimpiad_id} for future tests")
    
    def test_02_filter_olimpiads_by_status(self):
        """Test GET /api/olimpiads?status=upcoming endpoint"""
        print("\n🔍 Testing GET /api/olimpiads?status=upcoming...")
        response = requests.get(f"{self.base_url}/olimpiads?status=upcoming")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        
        # Verify all returned olimpiads have the correct status
        for olimpiad in data:
            self.assertEqual(olimpiad['status'], 'upcoming')
        
        print(f"✅ Success - Found {len(data)} upcoming olimpiads")
    
    def test_03_search_olimpiads(self):
        """Test GET /api/olimpiads?search=math endpoint"""
        print("\n🔍 Testing GET /api/olimpiads?search=math...")
        response = requests.get(f"{self.base_url}/olimpiads?search=math")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        
        # Verify search results contain the search term in name or subject
        for olimpiad in data:
            self.assertTrue(
                'math' in olimpiad['name'].lower() or 
                'math' in olimpiad['subject'].lower()
            )
        
        print(f"✅ Success - Found {len(data)} olimpiads matching 'math'")
    
    def test_04_get_olimpiads_by_status(self):
        """Test GET /api/olimpiads/by-status/ongoing endpoint"""
        print("\n🔍 Testing GET /api/olimpiads/by-status/ongoing...")
        response = requests.get(f"{self.base_url}/olimpiads/by-status/ongoing")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        
        # Verify all returned olimpiads have the correct status
        for olimpiad in data:
            self.assertEqual(olimpiad['status'], 'ongoing')
        
        print(f"✅ Success - Found {len(data)} ongoing olimpiads")
    
    def test_05_get_specific_olimpiad(self):
        """Test GET /api/olimpiads/{olimpiad_id} endpoint"""
        if not self.test_olimpiad_id:
            print("\n⚠️ Skipping test_get_specific_olimpiad - No olimpiad ID available")
            return
            
        print(f"\n🔍 Testing GET /api/olimpiads/{self.test_olimpiad_id}...")
        response = requests.get(f"{self.base_url}/olimpiads/{self.test_olimpiad_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['id'], self.test_olimpiad_id)
        print("✅ Success - Retrieved specific olimpiad")
    
    def test_06_get_dynamic_features(self):
        """Test GET /api/features endpoint"""
        print("\n🔍 Testing GET /api/features...")
        response = requests.get(f"{self.base_url}/features")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        
        # Save a feature ID for later tests if available
        if data:
            self.test_feature_id = data[0]['id']
            print(f"📝 Using feature ID: {self.test_feature_id} for future tests")
            
        print(f"✅ Success - Found {len(data)} dynamic features")
    
    def test_07_create_olimpiad(self):
        """Test POST /api/olimpiads endpoint"""
        print("\n🔍 Testing POST /api/olimpiads...")
        
        # Create test data
        test_data = {
            "name": f"Test Olimpiad {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "subject": "Test Subject",
            "level": "Intermediate",
            "status": "upcoming",
            "avatar": "https://example.com/test-avatar.jpg",
            "dates": [
                {
                    "text": "Registration",
                    "date": "2025-03-01"
                },
                {
                    "text": "Competition",
                    "date": "2025-04-01"
                }
            ]
        }
        
        response = requests.post(f"{self.base_url}/olimpiads", json=test_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['name'], test_data['name'])
        self.assertEqual(data['subject'], test_data['subject'])
        self.assertEqual(data['level'], test_data['level'])
        self.assertEqual(data['status'], test_data['status'])
        
        # Save the created olimpiad ID for update and delete tests
        self.test_olimpiad_id = data['id']
        print(f"✅ Success - Created olimpiad with ID: {self.test_olimpiad_id}")
    
    def test_08_update_olimpiad(self):
        """Test PUT /api/olimpiads/{olimpiad_id} endpoint"""
        if not self.test_olimpiad_id:
            print("\n⚠️ Skipping test_update_olimpiad - No olimpiad ID available")
            return
            
        print(f"\n🔍 Testing PUT /api/olimpiads/{self.test_olimpiad_id}...")
        
        # Update data
        update_data = {
            "name": f"Updated Test Olimpiad {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "status": "register_opened"
        }
        
        response = requests.put(f"{self.base_url}/olimpiads/{self.test_olimpiad_id}", json=update_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['name'], update_data['name'])
        self.assertEqual(data['status'], update_data['status'])
        print("✅ Success - Updated olimpiad")
    
    def test_09_create_dynamic_feature(self):
        """Test POST /api/features endpoint"""
        print("\n🔍 Testing POST /api/features...")
        
        # Create test feature
        test_feature = {
            "name": f"Test Feature {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "type": "text"
        }
        
        response = requests.post(f"{self.base_url}/features", json=test_feature)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['name'], test_feature['name'])
        self.assertEqual(data['type'], test_feature['type'])
        
        # Save the created feature ID for delete test
        self.test_feature_id = data['id']
        print(f"✅ Success - Created feature with ID: {self.test_feature_id}")
        
        # Verify the feature was added to existing olimpiads
        if self.test_olimpiad_id:
            response = requests.get(f"{self.base_url}/olimpiads/{self.test_olimpiad_id}")
            olimpiad_data = response.json()
            self.assertIn(self.test_feature_id, olimpiad_data['dynamic_features'])
            print("✅ Success - Feature was added to existing olimpiad")
    
    def test_10_delete_dynamic_feature(self):
        """Test DELETE /api/features/{feature_id} endpoint"""
        if not self.test_feature_id:
            print("\n⚠️ Skipping test_delete_dynamic_feature - No feature ID available")
            return
            
        print(f"\n🔍 Testing DELETE /api/features/{self.test_feature_id}...")
        response = requests.delete(f"{self.base_url}/features/{self.test_feature_id}")
        self.assertEqual(response.status_code, 200)
        print("✅ Success - Deleted feature")
        
        # Verify the feature was removed
        response = requests.get(f"{self.base_url}/features")
        features = response.json()
        feature_ids = [f['id'] for f in features]
        self.assertNotIn(self.test_feature_id, feature_ids)
        print("✅ Success - Feature was removed from the list")
    
    def test_11_delete_olimpiad(self):
        """Test DELETE /api/olimpiads/{olimpiad_id} endpoint"""
        if not self.test_olimpiad_id:
            print("\n⚠️ Skipping test_delete_olimpiad - No olimpiad ID available")
            return
            
        print(f"\n🔍 Testing DELETE /api/olimpiads/{self.test_olimpiad_id}...")
        response = requests.delete(f"{self.base_url}/olimpiads/{self.test_olimpiad_id}")
        self.assertEqual(response.status_code, 200)
        print("✅ Success - Deleted olimpiad")
        
        # Verify the olimpiad was removed
        response = requests.get(f"{self.base_url}/olimpiads/{self.test_olimpiad_id}")
        self.assertEqual(response.status_code, 404)
        print("✅ Success - Olimpiad was removed and returns 404")

if __name__ == "__main__":
    # Run the tests in order
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
