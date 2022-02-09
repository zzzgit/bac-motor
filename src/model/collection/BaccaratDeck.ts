import {Card, Deck, CardFactory, Heart, Diamond, Spade, Club} from "cardation"

const heart = new Heart()
const diamond = new Diamond()
const spade = new Spade()
const club = new Club()

class BaccaratDeck extends Deck {
	private _isInitialized = false

	private _addCard(card: Card): void {
		const protectModel = Object.freeze || Object.seal // 前者不能修改，後者可以
		this.pushCard(protectModel(card))
	}

	constructor() {
		super()
		this.getOrCreatArray()
	}

	// 直接在此處洗牌，如何？ 為了避免數組中的對象遭到污染，每次都重新生成？w
	getOrCreatArray(): Card[] {
		if (this._isInitialized) {
			return this.getDuplicatedCardArray()
		}
		this._isInitialized = true
		const deckArray = this.getDuplicatedCardArray()
		if (deckArray.length) {
			return [...deckArray]
		}
		this._addCard(CardFactory.createAceCard(heart, 1))
		this._addCard(CardFactory.createAceCard(diamond, 1))
		this._addCard(CardFactory.createAceCard(spade, 1))
		this._addCard(CardFactory.createAceCard(club, 1))
		for (let i = 2; i < 11; i++) {
			// if (i < 6 || i > 6) {
			const score = i % 10
			this._addCard(CardFactory.createNumberCard(heart, i, score))
			this._addCard(CardFactory.createNumberCard(diamond, i, score))
			this._addCard(CardFactory.createNumberCard(spade, i, score))
			this._addCard(CardFactory.createNumberCard(club, i, score))
			// }
		}
		for (let i = 11; i < 14; i++) {
			this._addCard(CardFactory.createFaceCard(heart, i, 0))
			this._addCard(CardFactory.createFaceCard(diamond, i, 0))
			this._addCard(CardFactory.createFaceCard(spade, i, 0))
			this._addCard(CardFactory.createFaceCard(club, i, 0))
		}
		return this.getDuplicatedCardArray()
	}

	// 改成拋異常
	detect(): boolean {
		let result = this.getDuplicatedCardArray.length === 52
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
