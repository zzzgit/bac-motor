enum Result {
	BancoWins = "_BankerWins",
	PuntoWins = "_PlayerWins",
	Tie = "_Tie",
}


class HandResult {
	static BancoWins = new HandResult(1)

	static PuntoWins = new HandResult(-1)

	static Tie = new HandResult(0)


	static isOpposite(foo: HandResult, bar: HandResult):boolean {
		return foo._result != bar._result
	}

	static isIdentical(foo: HandResult, bar: HandResult):boolean {
		return foo._result == bar._result
	}


	static getOpposite(foo: HandResult):HandResult {
		if (foo._result == Result.BancoWins) {
			return HandResult.PuntoWins
		}
		if (foo._result == Result.PuntoWins) {
			return HandResult.BancoWins
		}
		return foo
	}

	private _result: Result

	// 0 tie， 1 banco wins， -1 punto wins
	constructor(code:number) {
		if (code === 0) {
			this._result = Result.Tie
		} else if (code === 1) {
			this._result = Result.BancoWins
		} else {
			this._result = Result.PuntoWins
		}
	}
}

export default HandResult
