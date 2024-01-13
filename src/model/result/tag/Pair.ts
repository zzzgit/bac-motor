import Tag from './Tag'

/**
 * Pairs has two parameters: score and cardId. score is the score of the pair, cardId is the id of the card.
 */
class Pair extends Tag{
	score: number = 0

	cardId: string = ''

	constructor(score: number, cardId: string){
		super()
		this.score = score
		this.cardId = cardId
	}
}

export default Pair
