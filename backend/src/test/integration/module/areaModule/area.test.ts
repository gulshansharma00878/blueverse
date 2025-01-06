import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../../../index';
import { createAdminToken, createAdminUser } from '../../utils/userCreation';
import { Region } from '../../../../models/region';
import { State } from '../../../../models/state';
import { City } from '../../../../models/city';
import { OEM } from '../../../../models/oem';
const { expect } = chai;
let adminToken = '';
let region: any = {};
let state: any = {};
let city: any = {};
let oem: any = {};

chai.use(chaiHttp);

describe('Area Module', async () => {
  before(async () => {
    const { user } = await createAdminUser();
    adminToken = await createAdminToken(user);
    region = await Region.create({ name: 'Testing Region' });
    state = await State.create({
      name: 'Testing State',
      regionId: region.regionId,
    });
    city = await City.create({ name: 'Testing City', stateId: state.stateId });
    oem = await OEM.create({ name: 'Testing OEM' });
    return;
  });
  describe('/GET state list', () => {
    it('it should GET state list', (done) => {
      chai
        .request(server)
        .get('/api/v1/area/state/list')
        .set('Authorization', adminToken)
        .end((err, res) => {
          if (err) done(err);
          expect(res).status(200);
          expect(res.body).be.a('object');
          expect(res.body.data).be.a('array');
          done();
        });
    });
  });
  describe('/GET region list', () => {
    it('it should GET region list', (done) => {
      chai
        .request(server)
        .get('/api/v1/area/region/list')
        .set('Authorization', adminToken)
        .end((err, res) => {
          if (err) done(err);
          expect(res).status(200);
          expect(res.body).be.a('object');
          expect(res.body.data).be.a('array');
          done();
        });
    });
  });
  describe('/GET city list', () => {
    it('it should GET city list', (done) => {
      chai
        .request(server)
        .get('/api/v1/area/city/list')
        .set('Authorization', adminToken)
        .end((err, res) => {
          if (err) done(err);
          expect(res).status(200);
          expect(res.body).be.a('object');
          expect(res.body.data).be.a('array');
          done();
        });
    });
  });
  describe('/GET outlet list', () => {
    it('it should GET outlet list', (done) => {
      chai
        .request(server)
        .get('/api/v1/area/outlet/list')
        .set('Authorization', adminToken)
        .end((err, res) => {
          if (err) done(err);
          expect(res).status(200);
          expect(res.body).be.a('object');
          expect(res.body.data).be.a('array');
          done();
        });
    });
  });
  describe('/GET oem list', () => {
    it('it should GET oem list', (done) => {
      chai
        .request(server)
        .get('/api/v1/area/oem/list')
        .set('Authorization', adminToken)
        .end((err, res) => {
          if (err) done(err);
          expect(res).status(200);
          expect(res.body).be.a('object');
          expect(res.body.data).be.a('array');
          done();
        });
    });
  });
  describe('/POST create oem', () => {
    it('it should create oem', (done) => {
      const oemName =
        `${Date.now()}-${Math.floor(Math.random() * 100)}` + 'Testing OEM';
      chai
        .request(server)
        .post('/api/v1/area/oem/create')
        .set('Authorization', adminToken)
        .send({ name: oemName })
        .end((err, res) => {
          if (err) done(err);
          expect(res).status(200);
          expect(res.body).be.a('object');
          expect(res.body.data).be.a('object');
          expect(res.body.data.name).equals(oemName);
          done();
        });
    });
  });
  describe('/POST create region', () => {
    it('it should create region', (done) => {
      const regionName =
        `${Date.now()}-${Math.floor(Math.random() * 100)}` + 'Testing Region';
      chai
        .request(server)
        .post('/api/v1/area/region/create')
        .set('Authorization', adminToken)
        .send({ name: regionName })
        .end((err, res) => {
          if (err) done(err);
          expect(res).status(200);
          expect(res.body).be.a('object');
          expect(res.body.data).be.a('object');
          expect(res.body.data.name).equals(regionName);
          done();
        });
    });
  });
  describe('/POST create state', () => {
    it('it should create state', (done) => {
      const stateName =
        `${Date.now()}-${Math.floor(Math.random() * 100)}` + 'Testing State';
      chai
        .request(server)
        .post('/api/v1/area/state/create')
        .set('Authorization', adminToken)
        .send({ name: stateName, regionId: region.regionId })
        .end((err, res) => {
          if (err) done(err);
          expect(res).status(200);
          expect(res.body).be.a('object');
          expect(res.body.data).be.a('object');
          expect(res.body.data.name).equals(stateName);
          done();
        });
    });
  });
  describe('/POST create city', () => {
    it('it should create city', (done) => {
      const cityName =
        `${Date.now()}-${Math.floor(Math.random() * 100)}` + 'Testing City';
      chai
        .request(server)
        .post('/api/v1/area/city/create')
        .set('Authorization', adminToken)
        .send({
          name: cityName,
          regionId: region.regionId,
          stateId: state.stateId,
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).status(200);
          expect(res.body).be.a('object');
          expect(res.body.data).be.a('object');
          expect(res.body.data.name).equals(cityName);
          done();
        });
    });
  });
  describe('/PUT update city', () => {
    it('it should update city', (done) => {
      const cityName =
        `${Date.now()}-${Math.floor(Math.random() * 100)}` +
        'Update Testing City';
      chai
        .request(server)
        .put(`/api/v1/area/city/update/${city.cityId}`)
        .set('Authorization', adminToken)
        .send({
          name: cityName,
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).status(200);
          expect(res.body).be.a('object');
          expect(res.body.error).equals(false);
          done();
        });
    });
  });
  describe('/PUT update state', () => {
    it('it should update state', (done) => {
      const stateName =
        `${Date.now()}-${Math.floor(Math.random() * 100)}` +
        'Update Testing State';
      chai
        .request(server)
        .put(`/api/v1/area/state/update/${state.stateId}`)
        .set('Authorization', adminToken)
        .send({
          name: stateName,
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).status(200);
          expect(res.body).be.a('object');
          expect(res.body.error).equals(false);
          done();
        });
    });
  });
  describe('/PUT update oem', () => {
    it('it should update oem', (done) => {
      const oemName =
        `${Date.now()}-${Math.floor(Math.random() * 100)}` +
        'Update Testing OEM';
      chai
        .request(server)
        .put(`/api/v1/area/oem/update/${oem.oemId}`)
        .set('Authorization', adminToken)
        .send({
          name: oemName,
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res).status(200);
          expect(res.body).be.a('object');
          expect(res.body.error).equals(false);
          done();
        });
    });
  });
});
