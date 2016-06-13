var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../app');
var should = chai.should();
var User = require('./userModel');
var lib = require('../lib/lib');
var requiredFields = lib.models.getRequiredFields(User);

chai.use(chaiHttp);

describe("Users", function(){
    it("Should list all users on /api/users GET", function(done) {
        chai.request(server)
            .get('/api/users')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.forEach(function(user) {
                    lib.tests.testRequiredFields(user, requiredFields);
                });
                done();
            });
    });

    it("Should list a single user on /api/users/<id> GET", function(done) {
        chai.request(server)
            .get('/api/users')
            .end(function(err, res) {
                chai.request(server)
                .get('/api/users/' + res.body[0]._id)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    lib.tests.testRequiredFields(res.body, requiredFields);
                    done();
                });
            });
    });

    it("Should save a new user on /api/users POST", function(done) {
        chai.request(server)
        .post('/api/users')
        .send({username: "username", email: "email@email.com", password: "123456", role: "standard"})
        .end(function(err, res) {
            res.should.have.status(200);
            res.should.be.json;
            res.should.be.a('object');
            lib.tests.testRequiredFields(res.body, requiredFields);
            done();
        });
    });

    it("Should change a user password on /api/user/<id> POST", function(done) {
        chai.request(server)
        .get('/api/users')
        .end(function(err, res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            chai.request(server)
            .post('/api/users/' + res.body[0]._id)
            .send({action: 'changePassword', newPassword: "thisIsAPassword"})
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.should.be.a('object');
                res.body.password.should.to.equal("thisIsAPassword");
                done();
            });
        });
    });

    it("Should update a user points balance on /api/user/<id> POST", function(done) {
        var pointsToUpdate = 3;
        var initialPoints;
        chai.request(server)
        .get('/api/users')
        .end(function(err, res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            res.body[0].should.have.property('totalPoints');
            initialPoints = res.body[0].totalPoints;
            chai.request(server)
            .post('/api/users/' + res.body[0]._id)
            .send({action: 'updatePoints', points: pointsToUpdate})
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.should.be.a('object');
                res.body.totalPoints.should.to.equal(initialPoints + pointsToUpdate);
                done();
            });
        });
    });

    it("Should delete a user on api/users/<id> DELETE", function(done) {
        var totalUsers = 0;
        var deletedId;
        chai.request(server)
        .get('/api/users')
        .end(function(err, res) {
            totalUsers = res.body.length;
            deletedId = res.body[totalUsers - 1]._id;
            chai.request(server)
            .delete('/api/users/' + deletedId)
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body._id.should.to.equal(deletedId);
                chai.request(server)
                .get('/api/users')
                .end(function(err, res) {
                    res.body.length.should.to.equal(totalUsers - 1);
                    done();
                });
            });
        });
    });
});
