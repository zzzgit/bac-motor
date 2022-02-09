import Tag from "./Tag"


class Pair extends Tag {
	score: number = 0

	cardId: string = ""

	constructor(score: number, cardId: string) {
		super()
		this.score = score
		this.cardId = cardId
	}
}

export default Pair
