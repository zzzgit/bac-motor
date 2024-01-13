import { Hand, Card } from 'cardation'
import EngineError from '../../error/EngineError'

/**
 * The Gamer class represents the competitor in the game. It could be either the Punto or the Banco.
 * It is the base class for PuntoGamer and BancoGamer.
 */
class Gamer{
	private _hand: Hand = new Hand()

	getPoint(): number{
		return this.getHand().getPoint()
	}

	getHand(): Hand{
		return this._hand
	}

	getLastCard(): Card{
		if (!this.getHand().getLength()){
			throw new EngineError(
				'[Role][getLastCard]: there\'s no last card because the hand is empty!'
			)
		}
		return this.getHand().getLastCard() as Card
	}

	acceptCard(card: Card): void{
		this._hand.pushCard(card)
	}
}

export default Gamer
