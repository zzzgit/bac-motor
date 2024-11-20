import Settler from './Settler'

class TieSettler extends Settler{

	getPayout(wager: number): number{
		return wager * 8
	}

}

export default TieSettler
