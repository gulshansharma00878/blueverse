import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../../index';
import { createCustomer } from './utils/customerCreation';

const { expect } = chai;

chai.use(chaiHttp);

describe('Vehicle Module Endpoints', () => {
  let userDetails: any = {};
  let vehicleId: any;

  before(async () => {
    userDetails = await createCustomer();
    return;
  });

  //   after(async () => {
  //     const result = await deleteUser(userDetails.user.dataValues.userId);
  //     return;
  //   });

  it('should create a new vehicle', (done) => {
    const payload :any = {
      hsrpNumber: 'HR1234',
      manufacturer: 'Toyota',
      vehicleModel: 'Corolla',
      imageUrl: 'http://example.com/image.jpg',
    };

    // Check if all keys in the payload object are strings
    for (const key in payload) {
      expect(typeof payload[key]).to.equal('string');
    }

    chai
      .request(server)
      .post('/api/v1/customer/vehicle/')
      .set('Authorization', userDetails.token)
      .send(payload)
      .end((err, res) => {
        if (err) done(err);
        expect(res).to.have.status(200);
        expect(res.body.data.vehicleData).to.have.property('vehicleId');
        vehicleId = res.body.data.vehicleData.vehicleId;
        expect(res.body)
          .to.have.property('message')
          .equal('Vehicle Created Successfully');
        done();
      });
  });

  it('should update an existing vehicle', (done) => {
    const payload = {
      hsrpNumber: 'HR5678',
      manufacturer: 'Honda',
      vehicleModel: 'City',
      imageUrl: 'http://example.com/updated-image.jpg',
    };

    chai
      .request(server)
      .put(`/api/v1/customer/vehicle/${vehicleId}`)
      .set('Authorization', userDetails.token)
      .send(payload)
      .end((err, res) => {
        if (err) done(err);
        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property('message')
          .equal('Vehicle Updated Successfully');
        done();
      });
  });

  it('should retrieve a specific vehicle by vehicleId', (done) => {
    chai
      .request(server)
      .get(`/api/v1/customer/vehicle/${vehicleId}`)
      .set('Authorization', userDetails.token)
      .end((err, res) => {
        if (err) done(err);
        expect(res).to.have.status(200);
        expect(res.body.data).to.have.property('vehicleData');
        expect(res.body)
          .to.have.property('message')
          .equal('Vehicle Details Fetched Successfully');
        done();
      });
  });

  it('should retrieve all vehicles', (done) => {
    chai
      .request(server)
      .get('/api/v1/customer/vehicle')
      .set('Authorization', userDetails.token)
      .end((err, res) => {
        if (err) done(err);
        expect(res).to.have.status(200);
        expect(res.body.data).to.have.property('vehicleData');
        expect(res.body)
          .to.have.property('message')
          .equal('Vehicle Details Fetched Successfully');
        done();
      });
  });

  it('should delete an existing vehicle', (done) => {
    chai
      .request(server)
      .delete(`/api/v1/customer/vehicle/${vehicleId}`)
      .set('Authorization', userDetails.token)
      .end((err, res) => {
        if (err) done(err);
        expect(res).to.have.status(200);
        expect(res.body)
          .to.have.property('message')
          .equal('Vehicle Deleted Successfully');
        done();
      });
  });
});
