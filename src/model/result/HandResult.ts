enum Result {
	BankerWins = "_BankerWins",
	PlayerWins = "_PlayerWins",
	Tie = "_Tie",
}


class HandResult {
	static BankerWins = new HandResult(1)

	static PlayerWins = new HandResult(-1)

	static Tie = new HandResult(0)


	static isOpposite(foo: HandResult, bar: HandResult):boolean {
		return foo._result != bar._result
	}

	static isIdentical(foo: HandResult, bar: HandResult):boolean {
		return foo._result == bar._result
	}


	static getOpposite(foo: HandResult):HandResult {
		if (foo._result == Result.BankerWins) {
			return HandResult.PlayerWins
		}
		if (foo._result == Result.PlayerWins) {
			return HandResult.BankerWins
		}
		return foo
	}

	private _result: Result

	// 0 tie， 1 banker wins， -1 player wins
	constructor(code:number) {
		if (code === 0) {
			this._result = Result.Tie
		} else if (code === 1) {
			this._result = Result.BankerWins
		} else {
			this._result = Result.PlayerWins
		}
	}
}

export default HandResult
