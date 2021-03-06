const assert = require('chai').assert;
const helper = require('./testHelper');
const Promise = require('bluebird');

describe('expire', function() {

  this.timeout(10000);

  let boss;

  // sanitizing each test run for expiration events
  beforeEach(function(finished){
    helper.start({expireCheckInterval:500})
      .then(dabauce => {
        boss = dabauce;
        finished();
      });
  });

  afterEach(function(finished) {
    boss.stop().then(() => finished());
  });

  it('should expire a job', function(finished){
    this.timeout(5000);

    let jobName = 'i-take-too-long';
    let jobId = null;

    boss.publish({name: jobName, options: {expireIn:'1 second'}})
      .then(id => jobId = id)
      .then(() => boss.fetch(jobName))
      .then(() => Promise.delay(2000))
      .then(() => boss.fetchCompleted(jobName))
      .then(job => {
        assert.equal(jobId, job.data.request.id);
        assert.equal('expired', job.data.state);
        finished();
      });

    });

});
