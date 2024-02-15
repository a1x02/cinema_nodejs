export default class Api {
    constructor(options) {
        this._baseUrl = options.baseUrl
        this._headers = options.headers
    }

    _getResponseInfo(response) {
        if (response.ok) {
            return response.json()
        }
        return Promise.reject(`Произошла ошибка: ${response.status}`)
    }

    getAll() {
        return Promise.all([this._getInitialCards()])
    }

    _getInitialCards() {
        return fetch(`${this._baseUrl}/cards`, {
            headers: this._headers
        })
            .then(this._getResponseInfo)
    }

    addNewSession(formItems) {
        return fetch(`${this._baseUrl}/cards`, {
            method: 'POST',
            headers: this._headers,
            body: JSON.stringify({
                name: formItems.name,
                link: formItems.description
            })
        })
            .then(this._getResponseInfo)
    }

    deleteSession(itemId) {
        return fetch(`${this._baseUrl}/cards/${itemId}`, {
            method: 'DELETE',
            headers: this._headers
        })
            .then(this._getResponseInfo)
    }

    patchSessionInfo({name, link, }) {

    }
}