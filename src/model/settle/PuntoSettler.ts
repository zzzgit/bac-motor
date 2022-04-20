import Settler from "./Settler"

class PuntoSettler extends Settler {
	getPayout(wager: number): number {
		return wager
	}
}

export default PuntoSettler
