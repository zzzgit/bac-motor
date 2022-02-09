import Tag from "./Tag"


class Natural extends Tag {
	score: number

	combinaiton: number[] = []

	constructor(score: number) {
		super()
		this.score = score
	}
}

export default Natural
