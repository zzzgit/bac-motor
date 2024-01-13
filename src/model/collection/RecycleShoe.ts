import { Hand, Shoe } from 'cardation'
import * as samael from 'samael'

/**
 * A recycable shoe is a shoe that can be recycled.
 */
class RecycleShoe extends Shoe{
	/**
	 * Collect the cards from the dealt hand and put them back to the shoe.
	 * @param {Hand} hand the hand to collect
	 * @param {boolean} shouldShuffle whether to shuffle while collection
	 */
	collect(hand: Hand, shouldShuffle: boolean = false): void{
		const cardArray = hand.getDuplicatedCardArray()
		const fristcard = hand.getFirstCard()
		if (shouldShuffle && fristcard && this.getLength() > 20){
			const action = fristcard.getRank() % 4
			if (action === 1){
				const randomPlace = samael.range(0, this.getLength() - 1)
				this.insertCard(randomPlace, ...cardArray)
			} else {
				this.pushCard(...cardArray)
			}
		} else {
			this.pushCard(...cardArray)
		}
		hand.clear()
	}
}

export default RecycleShoe
