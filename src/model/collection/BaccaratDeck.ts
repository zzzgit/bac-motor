import {Card, Deck, CardFactory, Heart, Diamond, Spade, Club} from "cardation"

const heart = new Heart()
const diamond = new Diamond()
const spade = new Spade()
const club = new Club()

const protectModel = Object.freeze || Object.seal // 前者不能修改，後者可以

/**
 * Baccarat Deck. I will be initialised, right after construction, with 52 cards, no joker.
 */
class BaccaratDeck extends Deck {
	private _isInitialized = false

	/**
	 * Add card to the deck. The card will be frozen.
	 * @todo confider add this method in Deck class
	 * @param {Card} card
	 */
	private _addCard(card: Card): void {
		this.pushCard(protectModel(card))
	}

	constructor() {
		super()
		this.getOrCreatArray()
	}

	/**
	 * The Array of cards in the deck. If the deck is not initialized, it will be initialized.
	 * @todo confider shuffle here
	 * @return {Card[]} The Array of cards in the deck.
	 */
	getOrCreatArray(): Card[] {
		if (this._isInitialized) {
			return this.getDuplicatedCardArray()
		}
		this._isInitialized = true
		for (const suit of [heart, diamond, spade, club]) {
			this._addCard(CardFactory.createAceCard(suit, 1))
			for (let i = 2; i < 10; i++) {
				this._addCard(CardFactory.createNumberCard(suit, i, i))
			}
			this._addCard(CardFactory.createNumberCard(suit, 10, 0))
			for (let i = 11; i < 14; i++) {
				this._addCard(CardFactory.createFaceCard(suit, i, 0))
			}
		}
		protectModel(this.getCardArray())
		return this.getDuplicatedCardArray()
	}

	/**
	 * Detect if the deck is a Baccarat deck(52 cards, no joker). Currently not in use.
	 * @todo confider throw error here if the test is failed
	 * @return {boolean} true if the deck is a Baccarat deck
	 */
	detect(): boolean {
		let result = this.getLength() === 52
		result = result && this.includes(CardFactory.createAceCard(heart, 1)) &&
			this.includes(CardFactory.createAceCard(diamond, 1)) &&
			this.includes(CardFactory.createAceCard(spade, 1)) &&
			this.includes(CardFactory.createAceCard(club, 1))
		if (!result) {
			return result
		}
		for (let i = 11; i < 14; i++) {
			result = result && this.includes(CardFactory.createFaceCard(heart, i, 0)) &&
				this.includes(CardFactory.createFaceCard(diamond, i, 0)) &&
				this.includes(CardFactory.createFaceCard(spade, i, 0)) &&
				this.includes(CardFactory.createFaceCard(club, i, 0))
		}
		if (!result) {
			return result
		}
		for (let i = 11; i < 14; i++) {
			result = result && this.includes(CardFactory.createFaceCard(heart, i, 0)) &&
				this.includes(CardFactory.createFaceCard(diamond, i, 0)) &&
				this.includes(CardFactory.createFaceCard(spade, i, 0)) &&
				this.includes(CardFactory.createFaceCard(club, i, 0))
		}
		return result
	}
}

export default BaccaratDeck
