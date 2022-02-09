import HandOutcome from "../result/HandOutcome"
import Mun from "../mun/Mun"
import Banker from "../mun/Banker"
import HandResult from "../result/HandResult"
import Player from "../mun/Player"
import EngineError from "../../error/EngineError"


// 添加index，以免重複使用，或者只能設置一次outcome
class Bet {
	private readonly _amount: number

	private _mun: Mun

	private _outcome: HandOutcome | undefined

	private _prev: Bet | undefined = undefined

	constructor(mun: Mun, wager: number) {
		this._mun = mun
		this._amount = wager
	}

	getWager(): number {
		return this._amount
	}

	getMun(): Mun {
		return this._mun
	}

	getOutcome(): HandOutcome |undefined {
		return this._outcome
	}

	// 僅用於測試
	getStr():string {
		const mun: Mun = this.getMun()
		const houtcome: HandOutcome = this.getOutcome() as HandOutcome
		let result = ''
		let sign = 0
		if (mun instanceof Banker) {
			result = "B	"
			if (houtcome.result === HandResult.BankerWins) {
				sign = 1
			} else if (houtcome.result === HandResult.PlayerWins) {
				sign = -1
			}
		} else if (mun instanceof Player) {
			result = "P	"
			if (houtcome.result === HandResult.PlayerWins) {
				sign = 1
			} else if (houtcome.result === HandResult.BankerWins) {
				sign = -1
			}
		}
		if (sign === 0) {
			result += "0"
		} else {
			result += `${ sign < 0 ? '-' : '+'}${this.getWager()}`
		}
		return result
	}

	setOutcome(value: HandOutcome):void {
		this._outcome = value
	}

	getPreviousBet() : Bet | undefined {
		return this._prev
	}

	setPreviousBet(prev: Bet):void {
		this._prev = prev
	}

	// 僅用於測試
	gotWon(): boolean {
		const hcomeout: HandOutcome = this.getOutcome() as HandOutcome
		if (!hcomeout) {
			throw new EngineError(`[Bet][gotWon]: hcomeout could not be undefined!`)
		}
		let result = false
		const mun: Mun = this.getMun()
		if (mun instanceof Banker) {
			if (hcomeout.result === HandResult.BankerWins) {
				result = true
			} else if (hcomeout.result === HandResult.PlayerWins) {
				result = false
			}
		} else if (mun instanceof Player) {
			if (hcomeout.result === HandResult.PlayerWins) {
				result = true
			} else if (hcomeout.result === HandResult.BankerWins) {
				result = false
			}
		}
		return result
	}

	// 僅用於測試
	gotTie(): boolean {
		if (this.getOutcome()?.result === HandResult.Tie) {
			return true
		}
		return false
	}
}

export default Bet
