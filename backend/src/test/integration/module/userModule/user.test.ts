import chai, { use } from 'chai';
import chaiHttp from 'chai-http';
import server from '../../../../index';
import {
  createAdminToken,
  createAdminUser,
  deleteUser,
} from '../../utils/userCreation';
const { expect } = chai;
let adminToken = '';
let userDetails: any = {};
chai.use(chaiHttp);

describe('User Module', () => {
  before(async () => {
    userDetails = await createAdminUser();
    adminToken = await createAdminToken(userDetails.user);
    return;
  });
  describe('/POST Login ', () => {
    it('it should login the user', (done) => {
      const { user, password } = userDetails;
      const result = chai
        .request(server)
        .post('/api/v1/user/authenticate')
        .send({
          email: user.dataValues.email,
          password: password,
          app: 'ADMIN',
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).status(200);
          expect(res.body).be.a('object');
          done();
        });
    });
  });
  describe('/POST forgot password ', () => {
    it('it should send the request to forget the password', (done) => {
      const { user, password } = userDetails;
      const result = chai
        .request(server)
        .post('/api/v1/user/password/forgot')
        .send({
          email: user.dataValues.email,
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).status(200);
          expect(res.body).be.a('object');
          done();
        });
    });
  });
  describe('/PUT update password', () => {
    it('it should update the user password', (done) => {
      const { user, password } = userDetails;
      const result = chai
        .request(server)
        .put('/api/v1/user/password/update')
        .set('Authorization', adminToken)
        .send({
          old_password: password,
          new_password: `${Date.now()}-${Math.floor(Math.random() * 100)}`,
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).status(200);
          expect(res.body).be.a('object');
          done();
        });
    });
  });
  describe('/PUT update profile', () => {
    it('it should update the user profile', (done) => {
      const { user, password } = userDetails;
      const result = chai
        .request(server)
        .put('/api/v1/user/profile/update')
        .set('Authorization', adminToken)
        .send({
          phone: `${Math.floor(Math.random() * 10000000000)}`,
          address: `${'addresdds' + '' + Math.random()}`,
          profile_img: `${'image' + '' + Math.random()}`,
          username: `${'username' + '' + Math.random()}`,
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).status(200);
          expect(res.body).be.a('object');
          done();
        });
    });
  });
  after(async () => {
    const result = await deleteUser(userDetails.user.dataValues.userId);
    return;
  });
});
