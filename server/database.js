import Datastore from 'nedb'
import constants from './lib/constants'
import _get from 'lodash/get'

const { hostname, httpPort } = constants

function createDatabasePromise( action ) {
  return new Promise(( resolve, reject ) => {
    action((err, result) => {
      if(err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

export default function( onReady ) {
  const db = new Datastore({ filename: `db/BlockChat_node_${ hostname }_${ httpPort }.db`, autoload: true })
  db.ensureIndex({ fieldName: 'data.hash' })

  function setOption(key, value = true, remove = false) {
    return createDatabasePromise(cb => {
      // Use the appropriate modifiers for arrays or simple values
      const modifier = Array.isArray(value) ? (remove ? '$pull' : '$addToSet') : (remove ? '$unset' : '$set')
      // If there are many values, $each is needed to push (or pull) from the options array.
      const useValue = Array.isArray(value) ? (value.length > 1) ? { $each: value } : value[0] : value
      db.update({ _id: '_nodeOptions' }, { [ modifier ] : { [ key ]: useValue }}, { upsert: true }, cb)
    })
  }

  function getOption(key) {
    return createDatabasePromise(cb => {
      db.findOne({ _id: '_nodeOptions' }, { [ key ]: 1, _id: 0 }, ( err, doc ) => cb(err, _get(doc, 'key')))
    })
  }

  function add( type = 'Block', data = {} ) {
    return createDatabasePromise(cb => {
      let useData = { type, data }

      if(Array.isArray(data)) {
        useData = data.map(d => ({ type, data: d }))
      }

      db.insert(useData, cb)
    })
  }

  function remove(value, key = 'type') {
    return createDatabasePromise(cb => {
      const useKey = key === 'type' ? key : `data.${ key }`
      const useQuery = value === 'all' ? {} : { [ useKey ]: value }
      db.remove(useQuery, { multi: true }, cb)
    })
  }

  function get( value, key = 'type' ) {
    return createDatabasePromise(cb => {
      const useKey = key === 'type' ? key : `data.${ key }`
      db.find({ [ useKey ]: value }, { data: 1, _id: 0 }, ( err, docs ) => {
        cb(err, docs.map(doc => _get(doc, 'data', doc)))
      })
    })
  }

  function getLatest( value, key = 'type') {
    return createDatabasePromise(cb => {
      const useKey = key === 'type' ? key : `data.${ key }`
      db
        .findOne({ [ useKey ]: value }, { data: 1, _id: 0 })
        .sort({ 'data.index': -1 })
        .exec(( err, doc ) => cb(err, _get(doc, 'data', doc)))
    })
  }

  const dbInterface = {
    add,
    remove,
    get,
    getLatest,
    setOption,
    getOption,
    db
  }

  onReady(dbInterface)
}