import Realm from 'realm'
import {
  BlockSchema,
  DataSchema,
  TransactionSchema,
  MessageSchema,
  NodeSchema
} from './lib/dbSchema'

import constants from './lib/constants'
import _get from 'lodash/get'
import reduce from 'lodash/reduce'

const { hostname, httpPort } = constants

function createDatabasePromise( action ) {
  return new Promise(( resolve, reject ) => {
    try {
      const result = action()
      resolve(result)
    } catch( e ) {
      reject(e)
    }
  })
}

export default function( onReady ) {

  Realm.open({
    path: `realms/BlockChat_node_${ hostname }_${ httpPort }.realm`,
    schema: [ NodeSchema, BlockSchema, DataSchema, TransactionSchema, MessageSchema ],
    schemaVersion: 3,
    deleteRealmIfMigrationNeeded: true // Maybe only in development?
  }).then(realm => {

    function add( type, data ) {
      return createDatabasePromise(() => {
        return realm.write(() => {
          realm.create(type, data)
        })
      })
    }

    function remove( thingsToRemove ) {
      return createDatabasePromise(() => {
        return realm.write(() => {
          realm.delete(thingsToRemove)
        })
      })
    }

    function get( type ) {
      return realm.objects(type)
    }

    function write( action ) {
      return createDatabasePromise(() => realm.write(() => action(realm)))
    }

    function normalizeObject( obj ) {
      return reduce(obj, ( plainObj, val, key ) => {
        let newVal = val
        const constructorName = _get(val, 'constructor.name', '')

        if( constructorName === 'RealmObject' ) {
          newVal = normalizeObject(val)
        } else if( constructorName === 'List' ) {
          newVal = Array.from(val).map(i => normalizeObject(i))
        }

        plainObj[ key ] = newVal
        return plainObj
      }, {})
    }

    const dbInterface = {
      add,
      remove,
      get,
      write,
      normalizeObject
    }

    onReady(dbInterface)
  })
}