import {Hand, Shoe} from "cardation"

const samael = require('samael')


class RecycleShoe extends Shoe {
	collect(hand: Hand, shouldShuffle: boolean = false): void {
		const fristcard = hand.getFirstCard()
		if (shouldShuffle && fristcard && this.getDuplicatedCardArray().length > 20) {
			const action = fristcard.getCardPoint() % 4
			// this.insertCard(0, ...hand.getDuplicatedCardArray())
			if (action === 1) {
				const randomPlace = samael.randomInt(0, this.getDuplicatedCardArray().length - 1)
				this.insertCard(randomPlace, ...hand.getDuplicatedCardArray())
			} else {
				this.pushCard(...hand.getDuplicatedCardArray())
			}
		} else {
			this.pushCard(...hand.getDuplicatedCardArray())
		}
		hand.clear()
	}
}

export default RecycleShoe
