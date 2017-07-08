'use strict'
const co = require('co')
const expect = require('expect.js')

const describe = require('mocha').describe
const it = require('mocha').it

const Pool = require('../')

const wait = time => new Promise((resolve) => setTimeout(resolve, time))

describe('idle timeout', () => {
  it('should timeout and remove the client', (done) => {
    const pool = new Pool({ idleTimeout: 10 })
    pool.query('SELECT NOW()')
    pool.on('remove', () => {
      expect(pool.idleCount).to.equal(0)
      expect(pool.totalCount).to.equal(0)
      done()
    })
  })

  it('can remove idle clients and recreate them', co.wrap(function * () {
    const pool = new Pool({ idleTimeout: 1 })
    const results = []
    for (var i = 0; i < 20; i++) {
      let query = pool.query('SELECT NOW()')
      expect(pool.idleCount).to.equal(0)
      expect(pool.totalCount).to.equal(1)
      results.push(yield query)
      yield wait(2)
      expect(pool.idleCount).to.equal(0)
      expect(pool.totalCount).to.equal(0)
    }
    expect(results).to.have.length(20)
  }))
})
