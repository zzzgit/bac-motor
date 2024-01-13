import { BlackMarkerCard, Card, Shoe } from 'cardation'
import IBaccaratShoe from './IBaccaratShoe'
import EngineError from '../../error/EngineError'

/**
 * Baccarat shoe.
 * @todo single thread
 * @todo initialization of the shoe currently is not in this class
 */
class BaccaratShoe extends Shoe implements IBaccaratShoe{
	private _isBurnt: boolean = false

	private _index: number = -1

	private increaseShoeIndex(): void{
		this._index++
	}

	/**
	 * Detect if the shoe is a Baccarat shoe. Currently alway return true.
	 * @todo need to implement this method
	 * @return {boolean} true if the shoe is burnt.
	 */
	detect(): boolean{
		return true
	}

	/**
	 * Burn a shoe.
	 * @return {Card[]} the burnt cards
	 */
	burn(): Card[]{
		if (this._isBurnt){
			throw new EngineError(
				'[BaccaratShoe][burn]: a shoe could not burn more than once!'
			)
		}
		this._isBurnt = true
		const [firstCard] = this.deal()
		const score = firstCard.getPoint() || 10
		const burntCards = this.deal(score)
		burntCards.unshift(firstCard)
		return burntCards
	}

	/**
	 * Push customised cards to the shoe, rather than a normal deck(s).
	 * @param {Card[]} cards the cards to be pushed
	 */
	pushCustomised(...cards: Card[]): void{
		this.pushCard(...cards)
	}

	/**
	 * Insert a black card to the shoe.
	 * @param {number} place the index from where to insert the black card.
	 */
	insertBlackCard(place: number): void{
		this.insertCard(place, blackCard)
	}

	getShoeIndex(): number{
		return this._index
	}

	/**
	 * Reset the shoe index to -1. Currently there's no need to reset the shoe index.
	 */
	resetShoeIndex(): void{
		this._index = -1
	}

	shuffle(): void{
		super.shuffle()
	}

	/**
	 * increase GameIndex and reset state
	 */
	reBorn(): void{
		this.increaseShoeIndex()
		this._isBurnt = false
	}
}

const blackCard = new BlackMarkerCard()

export default BaccaratShoe
