import PouchDB from 'pouchdb'

const localDB = new PouchDB('mmt-ss2017')
const remoteDB = new PouchDB('https://couchdb.5k20.com/mmt-ss2017', {
    auth: {
        username: 'ipopovic',
        password: 'test'
    }
})

// localDB
//     .sync(remoteDB, {
//         live: true,
//         retry: true
//     })

export default class Store {
    /**
     * @param {!string} name Database name
     * @param {function()} [callback] Called when the Store is ready
     */
    constructor(name, callback) {
        localDB
            .sync(remoteDB, {
                live: true,
                retry: true
            })
        /**
         * Read the local ItemList from localStorage.
         *
         * @returns {ItemList} Current array of todos
         */
        this.getStore = () => {
            return localDB.allDocs({
                include_docs: true
            }).then((allDoc) => {
                const todos = allDoc.rows.map((todo) => {
                    return todo.doc
                })
                return todos
            })
        }

        if (callback) {
            callback()
        }
    }

    /**
     * Find items with properties matching those on query.
     *
     * @param {ItemQuery} query Query to match
     * @param {function(ItemList)} callback Called when the query is done
     *
     * @example
     * db.find({completed: true}, data => {
	 *	 // data shall contain items whose completed properties are true
	 * })
     */
    find(query, callback) {
        this.getStore().then((todos) => {
            //find function from store.js
            let k
            const filteredTodos = todos.filter((todo) => {
                for (k in query) {
                    if (query[k] !== todo[k]) {
                        return false
                    }
                }
                return true
            })
            callback(filteredTodos)
        })
    }


    /**
     * Update an item in the Store.
     *
     * @param {ItemUpdate} update Record with an id and a property to update
     * @param {function()} [callback] Called when partialRecord is applied
     */
    update(update, callback) {
        this.getStore().then((todos) => {
            let updateTodo = todos.find(todo => todo._id === update.id.toString())
            Object.assign(updateTodo, update)

            localDB.put(updateTodo).then(callback())
        })
    }

    /**
     * Insert an item into the Store.
     *
     * @param {Item} item Item to insert
     * @param {function()} [callback] Called when item is inserted
     */
    insert(item, callback) {
        localDB.put({
            _id: item.id.toString(),
            id: item.id,
            title: item.title,
            completed: item.completed,
        }).then(callback)
    }

    /**
     * Remove items from the Store based on a query.
     *
     * @param {ItemQuery} query Query matching the items to remove
     * @param {function(ItemList)|function()} [callback] Called when records matching query are removed
     */
    remove(query, callback) {
        const removeTodos = (todos) => {
            localDB.bulkDocs(todos.map(todo => ({
                _id: todo._id,
                _rev: todo._rev,
                _deleted: true,
            }))).then(callback)
        }
        this.find(query, removeTodos)
    }

    /**
     * Count total, active, and completed todos.
     *
     * @param {function(number, number, number)} callback Called when the count is completed
     */
    count(callback) {
        this.getStore().then((todos) => {
            const total = todos.length
            let completed = 0
            todos.forEach((todo) => {
                completed += todo.completed
            })
            callback(total, total - completed, completed)
        })
    }
}
