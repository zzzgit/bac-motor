import { Card, Hand } from 'cardation'
import EngineError from '../../error/EngineError'
import SuperSix from '../mun/SuperSix'
import HandResult from './HandResult'
import Config from '../config/Config'
import Banco from '../mun/Banco'
import Punto from '../mun/Punto'
import Free from '../mun/Free'
import Bet from '../bet/Bet'
import Mun from '../mun/Mun'
import Tie from '../mun/Tie'
import Tag from './tag/Tag'

/**
 * HandOutcome is the result of a hand.
 * @todo the wager and payout should be a class, implementing the logic of multi-mun and multi-bet.
 */
class HandOutcome{

	/**
	 * Figure out the payout of the game. This static method is invoked by the engine to calculate the payout of a bet, and then assign the result to the outcome object.
	 * @param {Bet} bet
	 * @param {HandOutcome} outcome
	 * @param {Config} config
	 * @return {number} payout
	 */
	static getPayout(bet: Bet, outcome: HandOutcome, config: Config): number{
		const { gameRules, payoutTable } = config
		if (!gameRules || !payoutTable){
			throw new EngineError('[HandOutcome][getPayout]: gameRules and payoutTable must be configured!')
		}
		const mun: Mun = bet.getMun()
		const wager = bet.getWager()
		if (mun instanceof Free){
			return 0
		} else if (mun instanceof Banco){
			if (outcome.result === HandResult.BancoWins){
				if (!gameRules.isNoCommision){
					return wager + wager * payoutTable.banco.traditional
				}
				if (outcome.bancoHand.getPoint() === 6){
					return wager + wager * payoutTable.banco.nocommission.six
				}
				return wager + wager * payoutTable.banco.nocommission.normal
			} else if (outcome.result === HandResult.PuntoWins){
				return 0
			}
			return wager
		} else if (mun instanceof Punto){
			if (outcome.result === HandResult.PuntoWins){
				return wager + wager * payoutTable.punto
			} else if (outcome.result === HandResult.BancoWins){
				return 0
			}
			return wager
		} else if (mun instanceof Tie){
			if (outcome.result === HandResult.Tie){
				return wager + wager * payoutTable.tie
			}
			return 0
		} else if (mun instanceof SuperSix){
			if (
				outcome.result === HandResult.BancoWins && outcome.bancoHand.getPoint() === 6
			){
				return wager + wager * payoutTable.superSix.two
			}
			return 0
		}
		return wager
	}

	private _shoeIndex: number

	private _payout: number

	handIndex: number

	private _prevHandOutcome: HandOutcome | undefined

	private _nextHandOutcome: HandOutcome | undefined

	private _wager: number

	private _pair: boolean = false

	private _natural: boolean = false

	private _superSix: boolean = false

	private _puntoPair: boolean = false

	private _bancoPair: boolean = false

	private _puntoNatural: boolean = false

	private _bancoNatural: boolean = false

	result: HandResult

	tagArray: Tag[] = []

	puntoHand: Hand

	bancoHand: Hand

	constructor(result: HandResult,
		wager: number,
		payout: number,
		bCardArray: Card[],
		pCardArray: Card[],
		shoeIndex: number,
		hindex: number){
		this.result = result
		this._wager = wager
		this._payout = payout
		this.bancoHand = new Hand(bCardArray)
		this.puntoHand = new Hand(pCardArray)
		this._shoeIndex = shoeIndex
		this.handIndex = hindex
		this._addTags()
	}

	get hasPair(): boolean{
		return this._pair
	}

	get hasNatural(): boolean{
		return this._natural
	}

	get hasSuperSix(): boolean{
		return this._superSix
	}

	get hasPuntoPair(): boolean{
		return this._puntoPair
	}

	get hasBancoPair(): boolean{
		return this._bancoPair
	}

	get hasPuntoNatural(): boolean{
		return this._puntoNatural
	}

	get hasBancoNatural(): boolean{
		return this._bancoNatural
	}

	private _addTags(): void{
		const { bancoHand, puntoHand } = this
		const bancoArray = bancoHand.getDuplicatedCardArray()
		const puntoArray = puntoHand.getDuplicatedCardArray()
		// pair
		if (bancoArray[0].getRank() == bancoArray[1].getRank()){
			this._pair = true
			this._bancoPair = true
		}
		if (puntoArray[0].getRank() == puntoArray[1].getRank()){
			this._pair = true
			this._puntoPair = true
		}
		// natural
		if (bancoArray.length === 2 && bancoHand.getPoint() > 7){
			this._natural = true
			this._bancoNatural = true
		}
		if (puntoArray.length === 2 && puntoHand.getPoint() > 7){
			this._natural = true
			this._puntoNatural = true
		}
		// super six
		if (this.result == HandResult.BancoWins){
			if (bancoHand.getPoint() === 6){
				this._superSix = true
			}
		}
	}

	setPreviousHandOutcome(handcomeout: HandOutcome): void{
		this._prevHandOutcome = handcomeout
		handcomeout.setNextHandOutcome(this)
	}

	getPreviousHandOutcome(): HandOutcome | undefined{
		return this._prevHandOutcome
	}

	setWager(wager: number): void{
		this._wager = wager
	}

	setPayout(payout: number): void{
		this._payout = payout
	}

	setNextHandOutcome(handcomeout: HandOutcome): void{
		this._nextHandOutcome = handcomeout
	}

	getNextHandOutcome(): HandOutcome | undefined{
		return this._nextHandOutcome
	}

	getPayout(): number{
		return this._payout
	}

	getWager(): number{
		return this._wager
	}

	// private _addTag(tag: Tag): void{
	// 	this.tagArray.push(tag)
	// }

	getShoeIndex(): number{
		return this._shoeIndex
	}

}

export default HandOutcome
