const DB_NAME = "MisCuentasDB";
const DB_VERSION = 1;

let db;

function abrirDB(){
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            if(!database.objectStoreNames.contains("gastos")){
                database.createObjectStore("gastos", {keyPath: "id", autoIncrement: true});
            }

            if(!database.objectStoreNames.contains("ingresos")){
                database.createObjectStore("ingresos", {keyPath: "id", autoIncrement: true});
            }

            if(!database.objectStoreNames.contains("categorias")){
                database.createObjectStore("categorias", {keyPath: "id", autoIncrement: true});
            }

            if(!database.objectStoreNames.contains("metas")){
                database.createObjectStore("metas", {keyPath: "id", autoIncrement: true});
            }

            if(!database.objectStoreNames.contains("perfil")){
                database.createObjectStore("perfil", {keyPath: "id"});
            }
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function guardarDato(storeName, dato){
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.add(dato);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function obtenerTodos(storeName){
    return new Promise ((resolve, reject) => {
        const transaction =db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function eliminarDato(storeName, id){
    return new Promise ((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function modificarDato(storeName, dato){
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put(dato);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}


abrirDB().then(() => {
    if (typeof init === 'function') init();
});