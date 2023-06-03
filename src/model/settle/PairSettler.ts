import Settler from "./Settler"

class PairSettler extends Settler {
	getPayout(wager: number): number {
		return wager * 11
	}
}

export default PairSettler
