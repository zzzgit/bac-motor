import Tag from "./Tag"


class SuperSix extends Tag {
	withCards: number = 2

	constructor(cardAmount: number) {
		super()
		this.withCards = cardAmount
	}
}

export default SuperSix
