export default class Card {
    constructor(data, cardTemplate, handleCardDelete, handleCardOpen) {
        this._cardTemplate = cardTemplate
        this._cardId = data.cardId
        this._cardLink = data.cardLink
        this._cardTitle = data.cardTitle
        this._cardImage = data.cardImage
        this._cardHall = data.cardHall
        this._cardDate = data.cardDate
        this._handleCardDelete = handleCardDelete
        this._handleCardOpen = handleCardOpen
        this._handleCardEdit = handleCardEdit
    }

    _getTemplate() {
        return document
            .querySelector(this._cardTemplate)
            .cloneNode(true)
            .children[0]
    }

    generate() {
        this._cardElement = this._getTemplate()
        this._cardImage = this._cardElement.querySelector(".session__image")
        this._buttonDelete = this._cardElement.querySelector(".session__delete")
        this._buttonEdit = this._cardElement.querySelector(".session__edit")
        this._buttonToOrder = this._cardElement.querySelector(".session__button")

        this._cardImage.src = this._cardLink
        this._cardImage.alt = this._cardTitle
        this._cardElement.querySelector(".sessions__title").textContent = this._cardTitle
        this._cardElement.querySelector(".sessions__hall").textContent = this._cardHall
        this._cardElement.querySelector(".sessions__date").textContent = this._cardDate

        this._setEventListeners()

        return this._cardElement
    }

    _setEventListeners() {
        this._buttonDelete.addEventListener('click', () => {
            this._deleteCard()
        })

        this._buttonToOrder.addEventListener('click', () => {
            this._openCard()
        })

        this._buttonEdit.addEventListener('click', () => {
            this._editCard()
        })
    }

    _deleteCard() {
        this._handleCardDelete(this._cardId)
        this._cardElement.remove()
        this._cardElement = null
    }

    delete() {
        this._cardElement.remove()
        this._cardElement = null
    }

    _openCard() {
        this._handleCardOpen(this._cardId)
    }

    _editCard() {
        this._handleCardEdit(this.cardId)
    }

}