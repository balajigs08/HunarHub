const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Category = require('../models/Category');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let adminToken, customerToken, entrepreneurToken;
let categoryId, entrepreneurProfileId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), EntrepreneurProfile.deleteMany({})]);
}, 120000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// ===================== AUTH TESTS =====================
describe('Authentication', () => {
  test('should register a customer', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Customer', email: 'testcustomer@test.com',
      password: 'TestPass@123', phone: '9999999990', city: 'Delhi',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    customerToken = res.body.data.token;
  });

  test('should not register with duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Dup Customer', email: 'testcustomer@test.com', password: 'TestPass@123',
    });
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('should login customer', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'testcustomer@test.com', password: 'TestPass@123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
    customerToken = res.body.data.token;
  });

  test('should fail login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'testcustomer@test.com', password: 'WrongPassword',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('should register admin and login', async () => {
    const admin = await User.create({
      name: 'Test Admin', email: 'testadmin@test.com',
      password: 'Admin@12345', role: 'admin',
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'testadmin@test.com', password: 'Admin@12345',
    });
    expect(res.statusCode).toBe(200);
    adminToken = res.body.data.token;
  });

  test('should get authenticated user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe('testcustomer@test.com');
  });

  test('should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});

// ===================== CATEGORY TESTS =====================
describe('Categories', () => {
  test('should create category (admin)', async () => {
    const res = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Category', description: 'Test', icon: '🧪' });
    expect(res.statusCode).toBe(201);
    categoryId = res.body.data.category._id;
  });

  test('should get categories (public)', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.categories).toHaveLength(1);
  });

  test('should update category (admin)', async () => {
    const res = await request(app)
      .put(`/api/admin/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Category' });
    expect(res.statusCode).toBe(200);
  });

  test('should reject category creation by non-admin', async () => {
    const res = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Unauthorized', description: 'test', icon: '🚫' });
    expect(res.statusCode).toBe(403);
  });
});

// ===================== ENTREPRENEUR TESTS =====================
describe('Entrepreneur Registration & Approval', () => {
  test('should register as entrepreneur', async () => {
    const res = await request(app)
      .post('/api/auth/register/entrepreneur')
      .send({
        name: 'Test Entrepreneur', email: 'testent@test.com', password: 'TestPass@123',
        businessName: 'Test Business', categoryId, city: 'Mumbai',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.profile.verificationStatus).toBe('pending');
    entrepreneurToken = res.body.data.token;
    entrepreneurProfileId = res.body.data.profile._id;
  });

  test('should not appear in public list when pending', async () => {
    const res = await request(app).get('/api/entrepreneurs');
    expect(res.statusCode).toBe(200);
    const profiles = res.body.data;
    const found = profiles.find((p) => p._id === entrepreneurProfileId);
    expect(found).toBeUndefined();
  });

  test('should approve entrepreneur (admin)', async () => {
    const res = await request(app)
      .put(`/api/admin/entrepreneurs/${entrepreneurProfileId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.profile.verificationStatus).toBe('approved');
  });

  test('should not approve already-approved entrepreneur', async () => {
    const res = await request(app)
      .put(`/api/admin/entrepreneurs/${entrepreneurProfileId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(400);
  });

  test('should appear in public list when approved', async () => {
    const res = await request(app).get('/api/entrepreneurs');
    expect(res.statusCode).toBe(200);
    const profiles = res.body.data;
    const found = profiles.find((p) => p._id === entrepreneurProfileId);
    expect(found).toBeDefined();
  });
});

// ===================== PRODUCT TESTS =====================
describe('Product Management', () => {
  let productId;

  test('should create product (entrepreneur)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${entrepreneurToken}`)
      .send({
        name: 'Test Handmade Product', description: 'A beautiful handmade product',
        category: categoryId, price: 500, stock: 10, condition: 'handmade', location: 'Mumbai',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.product.name).toBe('Test Handmade Product');
    productId = res.body.data.product._id;
  });

  test('should not create product (customer)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Unauthorized', price: 100, stock: 5 });
    expect(res.statusCode).toBe(403);
  });

  test('should get products (public)', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  test('should update product (entrepreneur)', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${entrepreneurToken}`)
      .send({ price: 600, stock: 8 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.product.price).toBe(600);
  });

  test('should delete product (entrepreneur)', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${entrepreneurToken}`);
    expect(res.statusCode).toBe(200);
  });
});

// ===================== ADMIN DASHBOARD TESTS =====================
describe('Admin Dashboard', () => {
  test('should get admin dashboard stats', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.stats).toBeDefined();
    expect(res.body.data.stats.totalUsers).toBeGreaterThanOrEqual(0);
  });

  test('should reject non-admin from admin dashboard', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(403);
  });
});
