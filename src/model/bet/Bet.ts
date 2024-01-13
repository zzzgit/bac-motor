import HandOutcome from '../result/HandOutcome'
import Mun from '../mun/Mun'
import Banco from '../mun/Banco'
import HandResult from '../result/HandResult'
import Punto from '../mun/Punto'
import EngineError from '../../error/EngineError'

/**
 * Bet class. Currently not in use
 * @todo Add index, otherwise only can set outcome once(disposable).
 */
class Bet{
	private readonly _amount: number

	private _mun: Mun

	private _outcome: HandOutcome | undefined

	private _prev: Bet | undefined = undefined

	constructor(mun: Mun, wager: number){
		this._mun = mun
		this._amount = wager
	}

	getWager(): number{
		return this._amount
	}

	getMun(): Mun{
		return this._mun
	}

	getOutcome(): HandOutcome | undefined{
		return this._outcome
	}

	/**
	 * Get string representation of this bet. Inner use only.
	 * @return {string} string representation of this bet
	 */
	getStr(): string{
		const mun: Mun = this.getMun()
		const houtcome: HandOutcome = this.getOutcome() as HandOutcome
		let result = ''
		let sign = 0
		if (mun instanceof Banco){
			result = 'B'
			if (houtcome.result === HandResult.BancoWins){
				sign = 1
			} else if (houtcome.result === HandResult.PuntoWins){
				sign = -1
			}
		} else if (mun instanceof Punto){
			result = 'P'
			if (houtcome.result === HandResult.PuntoWins){
				sign = 1
			} else if (houtcome.result === HandResult.BancoWins){
				sign = -1
			}
		}
		if (sign === 0){
			result += '0'
		} else {
			result += `${sign < 0 ? '-' : '+'}${this.getWager()}`
		}
		return result
	}

	setOutcome(value: HandOutcome): void{
		this._outcome = value
	}

	getPreviousBet(): Bet | undefined{
		return this._prev
	}

	setPreviousBet(prev: Bet): void{
		this._prev = prev
	}

	// 僅用於測試
	/**
	 * Whether got won. Inner use only.
	 * @return {boolean} true if got won, otherwise false
	 */
	gotWon(): boolean{
		const hcomeout: HandOutcome = this.getOutcome() as HandOutcome
		if (!hcomeout){
			throw new EngineError('[Bet][gotWon]: hcomeout could not be undefined!')
		}
		let result = false
		const mun: Mun = this.getMun()
		if (mun instanceof Banco){
			if (hcomeout.result === HandResult.BancoWins){
				result = true
			} else if (hcomeout.result === HandResult.PuntoWins){
				result = false
			}
		} else if (mun instanceof Punto){
			if (hcomeout.result === HandResult.PuntoWins){
				result = true
			} else if (hcomeout.result === HandResult.BancoWins){
				result = false
			}
		}
		return result
	}

	/**
	 * Whether got tie. Inner use only.
	 * @return {boolean} true if got tie, otherwise false
	 */
	gotTie(): boolean{
		if (this.getOutcome()?.result === HandResult.Tie){
			return true
		}
		return false
	}
}

export default Bet
