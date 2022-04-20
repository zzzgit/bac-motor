import {Hand, Card} from "cardation"
import EngineError from "../../error/EngineError"


class Gamer {
	private _hand: Hand = new Hand()


	getPoint():number {
		return this.getHand().getPoint()
	}

	getHand():Hand {
		return this._hand
	}

	getLastCard():Card {
		if (!this.getHand().getDuplicatedCardArray().length) {
			throw new EngineError(`[Role][getLastCard]: there's no last card because the hand is empty!`)
		}
		return this.getHand().getLastCard() as Card
	}

	acceptCard(card:Card) :void {
		this._hand.pushCard(card)
	}
}

export default Gamer
