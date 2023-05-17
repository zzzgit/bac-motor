import {Hand, Card} from "cardation"
import EngineError from "../../error/EngineError"
import SuperSix from "../mun/SuperSix"
import HandResult from "./HandResult"
import Config from "../config/Config"
import Banco from "../mun/Banco"
import Punto from "../mun/Punto"
import Free from "../mun/Free"
import Bet from "../bet/Bet"
import Mun from "../mun/Mun"
import Tie from "../mun/Tie"
import Tag from "./tag/Tag"
import BancoPair_tag from "./tag/BancoPair"
import PuntoPair_tag from "./tag/PuntoPair"
import BancoNatural_tag from "./tag/BancoNatural"
import PuntoNatural_tag from "./tag/PuntoNatural"
import SuperSix_tag from "./tag/SuperSix"

/**
 * HandOutcome is the result of a hand.
 */
class HandOutcome {
	/**
	 * Figure out the payout of the game. This static method is invoked by the engine to calculate the payout of a bet, and then assign the result to the outcome object.
	 * @param {Bet} bet
	 * @param {HandOutcome} outcome
	 * @param {Config} config
	 * @return {number} payout
	 */
	static getPayout(bet: Bet, outcome: HandOutcome, config: Config): number {
		const {gameRules, payoutTable} = config
		if (!gameRules || !payoutTable) {
			throw new EngineError(`[HandOutcome][getPayout]: gameRules and payoutTable must be configured!`)
		}
		const mun: Mun = bet.getMun()
		const wager = bet.getWager()
		if (mun instanceof Free) {
			return 0
		} else if (mun instanceof Banco) {
			if (outcome.result === HandResult.BancoWins) {
				if (!gameRules.isNoCommision) {
					return wager + wager * payoutTable.banco.traditional
				}
				if (outcome.bancoHand.getPoint() === 6) {
					return wager + wager * payoutTable.banco.nocommission.six
				} else {
					return wager + wager * payoutTable.banco.nocommission.normal
				}
			} else if (outcome.result === HandResult.PuntoWins) {
				return 0
			}
			return wager
		} else if (mun instanceof Punto) {
			if (outcome.result === HandResult.PuntoWins) {
				return wager + wager * payoutTable.punto
			} else if (outcome.result === HandResult.BancoWins) {
				return 0
			}
			return wager
		} else if (mun instanceof Tie) {
			if (outcome.result === HandResult.Tie) {
				return wager + wager * payoutTable.tie
			} else {
				return 0
			}
		} else if (mun instanceof SuperSix) {
			if (outcome.result === HandResult.BancoWins && outcome.bancoHand.getPoint() === 6) {
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

	result: HandResult

	tagArray: Tag[] = []

	puntoHand: Hand

	bancoHand: Hand


	constructor(result: HandResult, wager: number, payout: number, bCardArray: Card[], pCardArray: Card[], shoeIndex: number, hindex:number) {
		this.result = result
		this._wager = wager
		this._payout = payout
		this.bancoHand = new Hand(bCardArray)
		this.puntoHand = new Hand(pCardArray)
		this._shoeIndex = shoeIndex
		this.handIndex = hindex
		this._addTags()
	}

	private _addTags():void {
		const {bancoHand, puntoHand} = this
		const bancoArray = bancoHand.getDuplicatedCardArray()
		const puntoArray = puntoHand.getDuplicatedCardArray()
		// pair
		if (bancoArray[0].getRank() == bancoArray[1].getRank()) {
			this._addTag(new BancoPair_tag(bancoArray[0].getPoint(), bancoArray[0].getCardId()))
		}
		if (puntoArray[0].getRank() == puntoArray[1].getRank()) {
			this._addTag(new PuntoPair_tag(puntoArray[0].getPoint(), puntoArray[0].getCardId()))
		}
		// natural
		if (bancoArray.length === 2 && bancoHand.getPoint() > 7) {
			this._addTag(new BancoNatural_tag(bancoHand.getPoint()))
		}
		if (puntoArray.length === 2 && puntoHand.getPoint() > 7) {
			this._addTag(new PuntoNatural_tag(puntoHand.getPoint()))
		}
		// super six
		if (this.result == HandResult.BancoWins) {
			if (bancoHand.getPoint() === 6) {
				this._addTag(new SuperSix_tag(bancoArray.length))
			}
		}
	}

	setPreviousHandOutcome(handcomeout: HandOutcome):void {
		this._prevHandOutcome = handcomeout
		handcomeout.setNextHandOutcome(this)
	}

	getPreviousHandOutcome(): HandOutcome | undefined {
		return this._prevHandOutcome
	}

	setWager(wager: number):void {
		this._wager = wager
	}

	setPayout(payout: number):void {
		this._payout = payout
	}

	setNextHandOutcome(handcomeout: HandOutcome):void {
		this._nextHandOutcome = handcomeout
	}

	getNextHandOutcome(): HandOutcome | undefined {
		return this._nextHandOutcome
	}

	getPayout():number {
		return this._payout
	}

	getWager():number {
		return this._wager
	}

	private _addTag(tag: Tag):void {
		this.tagArray.push(tag)
	}

	getShoeIndex():number {
		return this._shoeIndex
	}
}

export default HandOutcome
