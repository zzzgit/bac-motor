import Settler from "./Settler"

class PlayerSettler extends Settler {
	getPayout(wager: number): number {
		return wager
	}
}

export default PlayerSettler
