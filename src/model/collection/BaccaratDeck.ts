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

	// 直接在此處洗牌，如何？ 為了避免數組中的對象遭到污染，每次都重新生成？
	getOrCreatArray(): Card[] {
		if (this._isInitialized) {
			return this.getDuplicatedCardArray()
		}
		this._isInitialized = true
		const deckArray = this.getDuplicatedCardArray()
		// 什麼情況下會走這裡？測試用例中的自定義deck? (此處邏輯需要優化，如果直接push自定義deck，需要另外調用一個函數，而且先要檢查，是否已經初始化過，如果已經初始化，拒絕自定義邏輯，兩種邏輯相互排斥)
		if (deckArray.length) {
			return [...deckArray]
		}
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
