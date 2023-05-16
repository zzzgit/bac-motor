import Tag from "./Tag"

/**
 * SuperSix constains two conditions: 2 cards and 3 cards.
 */
class SuperSix extends Tag {
	withCards: number = 2

	constructor(cardAmount: number) {
		super()
		this.withCards = cardAmount
	}
}

export default SuperSix
