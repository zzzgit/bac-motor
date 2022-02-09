import {Hand, Card} from "cardation"
import EngineError from "../../error/EngineError"
import SuperSix from "../mun/SuperSix"
import HandResult from "./HandResult"
import Config from "../config/Config"
import Banker from "../mun/Banker"
import Player from "../mun/Player"
import Free from "../mun/Free"
import Bet from "../bet/Bet"
import Mun from "../mun/Mun"
import Tie from "../mun/Tie"
import Tag from "./tag/Tag"


class HandOutcome {
	static getPayout(bet: Bet, outcome: HandOutcome, config: Config): number {
		const {gameRules, payoutTable} = config
		if (!gameRules || !payoutTable) {
			throw new EngineError(`[HandOutcome][getPayout]: gameRules and payoutTable must be configured!`)
		}
		const mun: Mun = bet.getMun()
		const wager = bet.getWager()
		if (mun instanceof Free) {
			return 0
		} else if (mun instanceof Banker) {
			if (outcome.result === HandResult.BankerWins) {
				if (!gameRules.isNoCommision) {
					return wager + wager * payoutTable.banker.traditional
				}
				if (outcome.bankerHand.getScore() === 6) {
					return wager + wager * payoutTable.banker.nocommission.six
				} else {
					return wager + wager * payoutTable.banker.nocommission.normal
				}
			} else if (outcome.result === HandResult.PlayerWins) {
				return 0
			}
			return wager
		} else if (mun instanceof Player) {
			if (outcome.result === HandResult.PlayerWins) {
				return wager + wager * payoutTable.player
			} else if (outcome.result === HandResult.BankerWins) {
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
			if (outcome.result === HandResult.BankerWins && outcome.bankerHand.getScore() === 6) {
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

	playerHand: Hand

	bankerHand: Hand


	constructor(result: HandResult, wager: number, payout: number, bCardArray: Card[], pCardArray: Card[], shoeIndex: number, hindex:number) {
		this.result = result
		this._wager = wager
		this._payout = payout
		this.bankerHand = new Hand(bCardArray)
		this.playerHand = new Hand(pCardArray)
		this._shoeIndex = shoeIndex
		this.handIndex = hindex
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

	addTag(tag: Tag):void {
		this.tagArray.push(tag)
	}

	getShoeIndex():number {
		return this._shoeIndex
	}
}

export default HandOutcome
