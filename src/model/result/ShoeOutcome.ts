
import {BeadRoad, BigRoad} from "marga"
import HandOutcome from "./HandOutcome"

// eslint-disable-next-line @typescript-eslint/no-type-alias
type StatisticInfo = {
	banco: number
	punto: number
	tie: number
	total: number
}

/**
 * ShoeOutcome is the outcome of a shoe.
 */
class ShoeOutcome {
	private _shoeIndex: number

	private _prevShoeOutcome: ShoeOutcome | undefined

	private _lastHandOutcome: HandOutcome

	private _firstHandOutcome: HandOutcome | undefined

	private _beadRoad: BeadRoad

	private _bigRoad: BigRoad

	private _gameComeoutMap: Map<string | number, HandOutcome> = new Map < string | number, HandOutcome>()

	_handAmount: number

	private _statistics: StatisticInfo = {
		banco: 0,
		punto: 0,
		tie: 0,
		total: 0,
	}

	constructor(shoeIndex: number, lastHandComeout: HandOutcome, handAmount: number) {
		this._shoeIndex = shoeIndex
		this._lastHandOutcome = lastHandComeout
		this._handAmount = handAmount
		this._beadRoad = new BeadRoad(shoeIndex)
		this._bigRoad = new BigRoad(shoeIndex)
	}

	setPreviousShoeOutcome(handcomeout: ShoeOutcome): void {
		this._prevShoeOutcome = handcomeout
	}

	getPreviousShoeOutcome(): ShoeOutcome | undefined {
		return this._prevShoeOutcome
	}

	getShoeIndex(): number {
		return this._shoeIndex
	}

	getLastHandOutcome():HandOutcome {
		return this._lastHandOutcome
	}

	getStatisticInfo() : StatisticInfo {
		return this._statistics
	}

	setOutcomeMap(hcomeoutMap: Map<string | number, HandOutcome>):void {
		this._gameComeoutMap = hcomeoutMap
	}

	getOutcomeMap(): Map<string | number, HandOutcome> {
		return this._gameComeoutMap
	}

	setStatisticInfo(banco:number, punto: number, tie: number) : void {
		this._statistics = {
			banco: banco,
			punto: punto,
			tie: tie,
			total: banco + punto + tie,
		}
	}

	setFirstHandOutcome(firstcomeout: HandOutcome) :void {
		this._firstHandOutcome = firstcomeout
	}

	getFirstHandOutcome(): HandOutcome | undefined {
		return this._firstHandOutcome
	}

	setBeadRoad(beadRoad: BeadRoad):void {
		this._beadRoad = beadRoad
	}

	getBeadRoad():BeadRoad {
		return this._beadRoad
	}

	setBigRoad(road: BigRoad):void {
		this._bigRoad = road
	}

	getBigRoad():BigRoad {
		return this._bigRoad
	}
}

export default ShoeOutcome
