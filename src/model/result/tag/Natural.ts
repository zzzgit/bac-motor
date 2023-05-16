import Tag from "./Tag"

/**
 * Natural constains two conditions: 8 or 9.
 */
class Natural extends Tag {
	score: number

	combinaiton: number[] = []

	constructor(score: number) {
		super()
		this.score = score
	}
}

export default Natural
