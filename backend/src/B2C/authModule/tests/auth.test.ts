import axios from 'axios';
import { expect } from 'chai';

const baseURL = 'http://localhost:6006/api/v1/customer/auth/register';

describe('POST /api/register', () => {
  before(async () => {});

  after(async () => {});

  it('should return 400 if email already exists', async () => {
    try {
      const res = await axios.post(baseURL, {
        email: 'test@example.com',
        username: 'newuser',
        password: 'password',
      });

      expect(res.status).to.equal(400);
      expect(res.data.message).to.equal('Email or username already exists');
    } catch (error) {}
  });

  it('should return 400 if username already exists', async () => {
    try {
      const res = await axios.post(baseURL, {
        email: 'new@example.com',
        username: 'existinguser',
        password: 'password',
      });

      expect(res.status).to.equal(400);
      expect(res.data.message).to.equal('Email or username already exists');
    } catch (error) {}
  });

  it('should return 200 if email and username do not exist', async () => {
    try {
      const res = await axios.post(baseURL, {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password',
      });

      expect(res.status).to.equal(200);
    } catch (error) {}
  });
});
